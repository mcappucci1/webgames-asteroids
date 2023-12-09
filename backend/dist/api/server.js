"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const ws_1 = require("ws");
const Router_1 = require("./Router");
const Message_1 = require("./Message");
class Server {
    constructor(port) {
        this.server = new ws_1.WebSocketServer({ port });
        this.router = new Router_1.Router();
        this.init();
    }
    init() {
        this.server.on("connection", (ws) => {
            const msg = new Message_1.Message(Message_1.MessageType.CREATE_CLIENT, { data: ws });
            this.router.route(msg);
        });
    }
}
exports.Server = Server;
