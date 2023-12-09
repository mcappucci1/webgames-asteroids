import { GameManager } from "./GameManager";
import { ClientManager } from "./ClientManager";
import { Client } from "./Client";
import { WebSocket } from "ws";
import { Message, MessageType } from "./Message";
import { Game } from "./Game";

export class Controller {
	private gameMgr: GameManager;
	private clientMgr: ClientManager;

	constructor() {
		this.gameMgr = new GameManager();
		this.clientMgr = new ClientManager();
	}

	createClient(ws: WebSocket) {
		const client = new Client(ws, this);
		this.clientMgr.add(client);
	}

	routeClientMessage(msg: Message) {
		const { msgType, data } = msg;
		if (msgType === MessageType.CREATE_GAME) {
			const game = new Game(data.data as string);
			this.gameMgr.add(game);
		} else if (msgType === MessageType.ADD_CLIENT_TO_GAME) {
			const { gameName, client } = data.data;
			this.gameMgr.addClientToGame(gameName, client);
		}
	}
}
