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
        var _a;
        const msg = this.parseMessage(rawData);
        const { msgType, data } = msg;
        console.log(msg);
        if (msgType === Message_1.MessageType.SET_CLIENT_NAME) {
            this.name = data.data;
            const responseData = { data: { success: true, error: null, data: { name: this.name } } };
            const response = new Message_1.Message(Message_1.MessageType.SET_CLIENT_NAME, responseData);
            // TODO: Handle failure
            this.sendMessage(response);
        }
        else if (msgType === Message_1.MessageType.CREATE_GAME) {
            this.controller.routeClientMessage(msg);
            const addClientData = {
                data: {
                    gameName: data.data,
                    client: this,
                },
            };
            // TODO: Handle failure
            const addClientMsg = new Message_1.Message(Message_1.MessageType.ADD_CLIENT_TO_GAME, addClientData);
            this.controller.routeClientMessage(addClientMsg);
            const responseData = { data: { success: true, error: null, data: { name: data.data } } };
            const response = new Message_1.Message(Message_1.MessageType.CREATE_GAME, responseData);
            console.log(responseData);
            this.sendMessage(response);
        }
        else if (msgType === Message_1.MessageType.ADD_CLIENT_TO_GAME) {
            data.data.client = this;
            console.log(data);
            this.controller.routeClientMessage(msg);
            console.log(this.game);
            const responseData = { data: { success: true, error: null, data: { gameName: data.data.gameName } } };
            const response = new Message_1.Message(Message_1.MessageType.ADD_CLIENT_TO_GAME, responseData);
            console.log(response);
            this.sendMessage(response);
        }
        else if (msgType === Message_1.MessageType.START_GAME) {
            this.game.start();
        }
        else if (msgType === Message_1.MessageType.GET_GAME_INFO) {
            const gameData = (_a = this.game) === null || _a === void 0 ? void 0 : _a.getInfo();
            const responseData = { data: { success: true, error: null, data: gameData } };
            const response = new Message_1.Message(Message_1.MessageType.GET_GAME_INFO, responseData);
            console.log(gameData);
            this.sendMessage(response);
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
