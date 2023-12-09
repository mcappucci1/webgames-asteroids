"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = void 0;
class GameManager {
    constructor() {
        this.games = [];
    }
    add(game) {
        this.games.push(game);
    }
    addClientToGame(gameName, client) {
        const game = this.games.find((game) => game.name === gameName);
        if (game == null) {
            return;
        }
        game.addClient(client);
        client.setGame(game);
    }
}
exports.GameManager = GameManager;
