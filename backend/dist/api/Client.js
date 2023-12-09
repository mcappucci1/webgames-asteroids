"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const Message_1 = require("./Message");
class Client {
    constructor(ws, controller) {
        this.ws = ws;
        this.controller = controller;
        this.initializeListeners();
    }
    parseMessage(buf) {
        return JSON.parse(buf.toString());
    }
    route(rawData) {
        const msg = this.parseMessage(rawData);
        const { msgType, data } = msg;
        if (msgType === Message_1.MessageType.SET_CLIENT_NAME) {
            this.name = data.data;
        }
        else if (msgType === Message_1.MessageType.CREATE_GAME) {
            this.controller.routeClientMessage(msg);
            const addClientData = {
                data: {
                    gameName: data.data,
                    client: this,
                },
            };
            const addClientMsg = new Message_1.Message(Message_1.MessageType.ADD_CLIENT_TO_GAME, addClientData);
            this.controller.routeClientMessage(addClientMsg);
        }
        else if (msgType === Message_1.MessageType.START_GAME) {
            this.game.start();
        }
    }
    setGame(game) {
        this.game = game;
    }
    sendMessage(data) {
        this.ws.send(JSON.stringify(data));
    }
    initializeListeners() {
        this.ws.on("message", (rawData) => this.route(rawData));
    }
}
exports.Client = Client;
