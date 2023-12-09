"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
class Game {
    constructor(name) {
        this.clients = [];
        this.name = name;
    }
    addClient(client) {
        this.clients.push(client);
    }
    start() {
        setInterval(() => {
            this.clients.forEach((client) => {
                client.sendMessage({ data: "test" });
            });
        }, 1000);
    }
}
exports.Game = Game;
