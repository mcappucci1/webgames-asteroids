import { Client } from "./Client";
import { WebSocket } from "ws";
import { MessageData } from "./Message";
import { Game } from "./Game";

export class Controller {
	private games: Map<String, Game> = new Map<String, Game>();

	createClient(ws: WebSocket) {
		new Client(ws, this);
	}

	createGame(data: MessageData): Game | undefined {
		let name = undefined;
		try {
			name = data.data as string;
		} catch (ex) {
			console.error(ex);
		}

		if (name == null || this.games.has(name)) {
			return undefined;
		}

		const game = new Game(name);
		this.games.set(name, game);
		return game;
	}

	addClientToGame(gameName: string, client: Client): boolean {
		if (!this.games.has(gameName)) {
			return false;
		}
		const game = this.games.get(gameName)!;
		return game.addClient(client);
	}
}
