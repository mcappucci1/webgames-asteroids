import { WebSocket, WebSocketServer } from "ws";
import { Router } from "./Router";
import { Message, MessageType } from "./Message";

export class Server {
	private server: WebSocketServer;
	private router: Router;

	constructor(port: number) {
		this.server = new WebSocketServer({ port });
		this.router = new Router();
		this.init();
	}

	init(): void {
		this.server.on("connection", (ws: WebSocket) => {
			const msg = new Message(MessageType.CREATE_CLIENT, { data: ws });
			this.router.route(msg);
		});
	}
}
