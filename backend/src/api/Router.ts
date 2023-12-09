import { Message, MessageType } from "./Message";
import { Controller } from "./Controller";
import { WebSocket } from "ws";

export class Router {
	private controller: Controller;

	constructor() {
		this.controller = new Controller();
	}

	route(msg: Message) {
		const { msgType, data } = msg;
		if (msgType === MessageType.CREATE_CLIENT) {
			this.controller.createClient(data.data as WebSocket);
		}
	}
}
