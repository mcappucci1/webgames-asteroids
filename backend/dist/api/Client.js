"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const Message_1 = require("./Message");
class Client {
    constructor(ws, controller) {
        this.id = Math.floor(Math.random() * Math.floor(Math.random() * Date.now()));
        this.ws = ws;
        this.controller = controller;
        this.initializeListeners();
        this.sendMessage(true, undefined, Message_1.MessageType.SET_CLIENT_ID, { id: this.id });
    }
    getId() {
        return this.id;
    }
    parseMessage(buf) {
        return JSON.parse(buf.toString());
    }
    setNameHandler(data) {
        this.name = data.data;
        const responseData = {
            name: this.name,
        };
        this.sendMessage(true, undefined, Message_1.MessageType.SET_CLIENT_NAME, responseData);
    }
    createGameHandler(data) {
        const game = this.controller.createGame(data);
        if (game == null) {
            this.sendMessage(false, "Game could not be created.", Message_1.MessageType.CREATE_GAME, undefined);
            return;
        }
        const success = this.controller.addClientToGame(data.data, this);
        if (!success) {
            this.sendMessage(false, "Game could not be created.", Message_1.MessageType.CREATE_GAME, undefined);
            return;
        }
        const responseData = { name: data.data };
        this.sendMessage(true, undefined, Message_1.MessageType.CREATE_GAME, responseData);
    }
    addSelfGameHandler(data) {
        let gameName = undefined;
        try {
            gameName = data.data.gameName;
        }
        catch (ex) {
            console.error(ex);
        }
        if (gameName == null) {
            this.sendMessage(false, "Failed to add client to game.", Message_1.MessageType.ADD_CLIENT_TO_GAME, undefined);
            return;
        }
        const success = this.controller.addClientToGame(gameName, this);
        if (!success) {
            this.sendMessage(false, "Failed to add client to game.", Message_1.MessageType.ADD_CLIENT_TO_GAME, undefined);
            return;
        }
        const responseData = { gameName: data.data.gameName };
        this.sendMessage(true, undefined, Message_1.MessageType.ADD_CLIENT_TO_GAME, responseData);
    }
    startGameHandler() {
        if (this.game == undefined) {
            this.sendMessage(false, "Failed to start game.", Message_1.MessageType.START_GAME, undefined);
            return;
        }
        this.game.start();
    }
    getGameInfoHandler() {
        if (this.game == null) {
            this.sendMessage(true, "Client has no game.", Message_1.MessageType.GET_GAME_INFO, undefined);
            return;
        }
        const gameData = this.game.getInfo();
        this.sendMessage(true, undefined, Message_1.MessageType.GET_GAME_INFO, gameData);
    }
    removeFromGameHandler() {
        if (this.game != undefined) {
            this.game.removeClient(this);
        }
        this.sendMessage(true, undefined, Message_1.MessageType.REMOVE_CLIENT_FROM_GAME, undefined);
    }
    route(rawData) {
        var _a;
        const msg = this.parseMessage(rawData);
        const { msgType, data } = msg;
        if (msgType === Message_1.MessageType.SET_CLIENT_NAME) {
            this.setNameHandler(data);
        }
        else if (msgType === Message_1.MessageType.CREATE_GAME) {
            this.createGameHandler(data);
        }
        else if (msgType === Message_1.MessageType.ADD_CLIENT_TO_GAME) {
            this.addSelfGameHandler(data);
        }
        else if (msgType === Message_1.MessageType.START_GAME) {
            this.startGameHandler();
        }
        else if (msgType === Message_1.MessageType.GET_GAME_INFO) {
            this.getGameInfoHandler();
        }
        else if (msgType === Message_1.MessageType.GAME_DATA) {
            (_a = this.game) === null || _a === void 0 ? void 0 : _a.gameDataMsgHandler(data);
        }
        else if (msgType === Message_1.MessageType.REMOVE_CLIENT_FROM_GAME) {
            this.removeFromGameHandler();
        }
    }
    setGame(game) {
        this.game = game;
    }
    sendMessage(success, error, type, data) {
        const msgData = {
            data: { success, error, data },
        };
        const response = new Message_1.Message(type, msgData);
        this.ws.send(JSON.stringify(response));
    }
    destroy() {
        if (this.game) {
            this.game.removeClient(this);
        }
    }
    initializeListeners() {
        this.ws.on("message", (rawData) => this.route(rawData));
        this.ws.on("error", () => this.destroy());
        this.ws.on("close", () => this.destroy());
    }
}
exports.Client = Client;
