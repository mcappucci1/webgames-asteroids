"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const Message_1 = require("./Message");
class Game {
    constructor(name) {
        this.clients = [];
        this.name = name;
    }
    addClient(client) {
        this.clients.push(client);
        const responseData = { data: { success: true, error: null, data: this.getInfo() } };
        for (const client of this.clients) {
            const response = new Message_1.Message(Message_1.MessageType.GET_GAME_INFO, responseData);
            client.sendMessage(response);
        }
    }
    start() {
        setInterval(() => {
            this.clients.forEach((client) => {
                console.log(client.name);
                client.sendMessage({ data: "test" });
            });
        }, 1000);
    }
    getInfo() {
        return {
            name: this.name,
            clients: this.clients.map((client) => client.name),
        };
    }
}
exports.Game = Game;
