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
		if (msgType === MessageType.SET_CLIENT_NAME) {
			this.name = data.data;
		} else if (msgType === MessageType.CREATE_GAME) {
			this.controller.routeClientMessage(msg);
			const addClientData = {
				data: {
					gameName: data.data,
					client: this,
				},
			};
			const addClientMsg = new Message(MessageType.ADD_CLIENT_TO_GAME, addClientData);
			this.controller.routeClientMessage(addClientMsg);
		} else if (msgType === MessageType.START_GAME) {
			this.game!.start();
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
