"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Controller = void 0;
const GameManager_1 = require("./GameManager");
const ClientManager_1 = require("./ClientManager");
const Client_1 = require("./Client");
const Message_1 = require("./Message");
const Game_1 = require("./Game");
class Controller {
    constructor() {
        this.gameMgr = new GameManager_1.GameManager();
        this.clientMgr = new ClientManager_1.ClientManager();
    }
    createClient(ws) {
        const client = new Client_1.Client(ws, this);
        this.clientMgr.add(client);
    }
    routeClientMessage(msg) {
        const { msgType, data } = msg;
        if (msgType === Message_1.MessageType.CREATE_GAME) {
            const game = new Game_1.Game(data.data);
            this.gameMgr.add(game);
        }
        else if (msgType === Message_1.MessageType.ADD_CLIENT_TO_GAME) {
            const { gameName, client } = data.data;
            this.gameMgr.addClientToGame(gameName, client);
        }
    }
}
exports.Controller = Controller;
