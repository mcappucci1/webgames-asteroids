import { Controller } from "./Controller";
import { WebSocket, RawData } from "ws";
import { Message, MessageType, MessageData } from "./Message";
import { Game } from "./Game";

export class Client {
	private ws: WebSocket;
	private controller: Controller;
	private game: Game | undefined;
	private id: number;
	public name: string | undefined;
	public color: string = "";

	constructor(ws: WebSocket, controller: Controller) {
		this.id = Math.floor(Math.random() * Math.floor(Math.random() * Date.now()));
		this.ws = ws;
		this.controller = controller;
		this.initializeListeners();
		this.sendMessage(true, undefined, MessageType.SET_CLIENT_ID, { id: this.id });
	}

	getId() {
		return this.id;
	}

	parseMessage(buf: RawData): Message {
		return JSON.parse(buf.toString()) as Message;
	}

	setNameHandler(data: MessageData) {
		this.name = data.data;
		const responseData = {
			name: this.name,
		};
		this.sendMessage(true, undefined, MessageType.SET_CLIENT_NAME, responseData);
	}

	createGameHandler(data: MessageData) {
		const game = this.controller.createGame(data);
		if (game == null) {
			this.sendMessage(false, "Game could not be created.", MessageType.CREATE_GAME, undefined);
			return;
		}

		const success = this.controller.addClientToGame(data.data as string, this);

		if (!success) {
			this.sendMessage(false, "Game could not be created.", MessageType.CREATE_GAME, undefined);
			return;
		}

		const responseData = { name: data.data };
		this.sendMessage(true, undefined, MessageType.CREATE_GAME, responseData);
	}

	addSelfGameHandler(data: MessageData) {
		let gameName = undefined;
		try {
			gameName = data.data.gameName;
		} catch (ex) {
			console.error(ex);
		}

		if (gameName == null) {
			this.sendMessage(false, "Failed to add client to game.", MessageType.ADD_CLIENT_TO_GAME, undefined);
			return;
		}

		const success = this.controller.addClientToGame(gameName, this);

		if (!success) {
			this.sendMessage(false, "Failed to add client to game.", MessageType.ADD_CLIENT_TO_GAME, undefined);
			return;
		}

		const responseData = { gameName: data.data.gameName };
		this.sendMessage(true, undefined, MessageType.ADD_CLIENT_TO_GAME, responseData);
	}

	startGameHandler(data: any) {
		if (this.game == undefined) {
			this.sendMessage(false, "Failed to start game.", MessageType.START_GAME, undefined);
			return;
		}
		this.game.start(data.data.delayMs);
	}

	getGameInfoHandler() {
		if (this.game == null) {
			this.sendMessage(true, "Client has no game.", MessageType.GET_GAME_INFO, undefined);
			return;
		}
		const gameData = this.game.getInfo();
		this.sendMessage(true, undefined, MessageType.GET_GAME_INFO, gameData);
	}

	removeFromGameHandler() {
		if (this.game != undefined) {
			this.game.removeClient(this);
		}
		this.sendMessage(true, undefined, MessageType.REMOVE_CLIENT_FROM_GAME, undefined);
	}

	route(rawData: RawData) {
		const msg = this.parseMessage(rawData);
		const { msgType, data } = msg;
		if (msgType === MessageType.SET_CLIENT_NAME) {
			this.setNameHandler(data);
		} else if (msgType === MessageType.CREATE_GAME) {
			this.createGameHandler(data);
		} else if (msgType === MessageType.ADD_CLIENT_TO_GAME) {
			this.addSelfGameHandler(data);
		} else if (msgType === MessageType.START_GAME) {
			this.startGameHandler(data);
		} else if (msgType === MessageType.GET_GAME_INFO) {
			this.getGameInfoHandler();
		} else if (msgType === MessageType.GAME_DATA) {
			this.game?.gameDataMsgHandler(data);
		} else if (msgType === MessageType.REMOVE_CLIENT_FROM_GAME) {
			this.removeFromGameHandler();
		}
	}

	setGame(game: Game | undefined) {
		this.game = game;
	}

	sendMessage(success: boolean, error: string | undefined, type: MessageType, data: Object | undefined) {
		const msgData = {
			data: { success, error, data },
		};
		const response = new Message(type, msgData);
		this.ws.send(JSON.stringify(response));
	}

	destroy() {
		if (this.game) {
			this.game.removeClient(this);
		}
	}

	initializeListeners() {
		this.ws.on("message", (rawData: RawData) => this.route(rawData));
		this.ws.on("error", () => this.destroy());
		this.ws.on("close", () => this.destroy());
	}
}
