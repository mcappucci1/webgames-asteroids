import { Controller } from "./Controller";
import { WebSocket, RawData } from "ws";
import { Message, MessageType } from "./Message";
import { Game } from "./Game";

export class Client {
	private ws: WebSocket;
	private controller: Controller;
	private game: Game | undefined;
	public name: string | undefined;

	constructor(ws: WebSocket, controller: Controller) {
		this.ws = ws;
		this.controller = controller;
		this.initializeListeners();
	}

	parseMessage(buf: RawData): Message {
		return JSON.parse(buf.toString()) as Message;
	}

	route(rawData: RawData) {
		const msg = this.parseMessage(rawData);
		const { msgType, data } = msg;
		console.log(msg);
		if (msgType === MessageType.SET_CLIENT_NAME) {
			this.name = data.data;
			const responseData = { data: { success: true, error: null, data: { name: this.name } } };
			const response = new Message(MessageType.SET_CLIENT_NAME, responseData);
			// TODO: Handle failure
			this.sendMessage(response);
		} else if (msgType === MessageType.CREATE_GAME) {
			this.controller.routeClientMessage(msg);
			const addClientData = {
				data: {
					gameName: data.data,
					client: this,
				},
			};
			// TODO: Handle failure
			const addClientMsg = new Message(MessageType.ADD_CLIENT_TO_GAME, addClientData);
			this.controller.routeClientMessage(addClientMsg);
			const responseData = { data: { success: true, error: null, data: { name: data.data } } };
			const response = new Message(MessageType.CREATE_GAME, responseData);
			console.log(responseData);
			this.sendMessage(response);
		} else if (msgType === MessageType.ADD_CLIENT_TO_GAME) {
			data.data.client = this;
			console.log(data);
			this.controller.routeClientMessage(msg);
			console.log(this.game);
			const responseData = { data: { success: true, error: null, data: { gameName: data.data.gameName } } };
			const response = new Message(MessageType.ADD_CLIENT_TO_GAME, responseData);
			console.log(response);
			this.sendMessage(response);
		} else if (msgType === MessageType.START_GAME) {
			this.game!.start();
		} else if (msgType === MessageType.GET_GAME_INFO) {
			const gameData = this.game?.getInfo();
			const responseData = { data: { success: true, error: null, data: gameData } };
			const response = new Message(MessageType.GET_GAME_INFO, responseData);
			console.log(gameData);
			this.sendMessage(response);
		}
	}

	setGame(game: Game) {
		this.game = game;
	}

	sendMessage(data: object) {
		this.ws.send(JSON.stringify(data));
	}

	initializeListeners() {
		this.ws.on("message", (rawData: RawData) => this.route(rawData));
	}
}
