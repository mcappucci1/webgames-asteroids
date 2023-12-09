import { Game } from "./Game";
import { Client } from "./Client";

export class GameManager {
	private games: Array<Game> = [];

	add(game: Game) {
		this.games.push(game);
	}

	addClientToGame(gameName: string, client: Client) {
		const game = this.games.find((game) => game.name === gameName);
		if (game == null) {
			return;
		}
		game.addClient(client);
		client.setGame(game);
	}
}
