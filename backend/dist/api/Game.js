"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const Message_1 = require("./Message");
const GameUtils_1 = require("./GameUtils");
class Game {
    constructor(name) {
        this.clients = [];
        this.generateAsteroidInterval = 1000;
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
        this.clients.forEach((client) => {
            const msg = new Message_1.Message(Message_1.MessageType.START_GAME, { data: {} });
            client.sendMessage(msg);
        });
        setInterval(() => {
            const { startPoint, theta, moveEntity, speed } = GameUtils_1.GameUtils.generateRandomEntity();
            const data = {
                data: {
                    type: "asteroid",
                    data: {
                        speed,
                        moveEntity,
                        location: startPoint,
                        angle: theta,
                    },
                },
            };
            this.clients.forEach((client) => {
                const msg = new Message_1.Message(Message_1.MessageType.GAME_DATA, data);
                client.sendMessage(msg);
            });
        }, this.generateAsteroidInterval);
    }
    getInfo() {
        return {
            name: this.name,
            clients: this.clients.map((client) => client.name),
        };
    }
}
exports.Game = Game;
