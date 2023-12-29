"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Controller = void 0;
const Client_1 = require("./Client");
const Game_1 = require("./Game");
class Controller {
    constructor() {
        this.games = new Map();
    }
    createClient(ws) {
        new Client_1.Client(ws, this);
    }
    createGame(data) {
        let name = undefined;
        try {
            name = data.data;
        }
        catch (ex) {
            console.error(ex);
        }
        if (name == null || this.games.has(name)) {
            return undefined;
        }
        const game = new Game_1.Game(name, this);
        this.games.set(name, game);
        return game;
    }
    removeGame(name) {
        if (this.games.has(name)) {
            this.games.delete(name);
        }
    }
    addClientToGame(gameName, client) {
        if (!this.games.has(gameName)) {
            return false;
        }
        const game = this.games.get(gameName);
        return game.addClient(client);
    }
}
exports.Controller = Controller;
