import { WebSocket, WebSocketServer } from "ws";
import { Controller } from "./Controller";

export class Server {
	private server: WebSocketServer;
	private controller: Controller;

	constructor(port: number) {
		this.server = new WebSocketServer({ port });
		this.controller = new Controller();
		this.server.on("connection", (ws: WebSocket) => {
			this.controller.createClient(ws);
		});
	}
}
