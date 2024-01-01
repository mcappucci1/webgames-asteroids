"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const ws_1 = require("ws");
const Controller_1 = require("./Controller");
class Server {
    constructor(port) {
        this.server = new ws_1.WebSocketServer({ port });
        this.controller = new Controller_1.Controller();
        this.server.on("connection", (ws) => {
            this.controller.createClient(ws);
        });
    }
}
exports.Server = Server;
