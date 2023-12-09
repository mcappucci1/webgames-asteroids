"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientSocket = void 0;
class ClientSocket {
    constructor(ws, router) {
        this.ws = ws;
        this.router = router;
        this.initializeListeners();
        this.ws.send("test");
    }
    initializeListeners() {
        this.ws.on("message", (msg) => this.router.route(msg.toString()));
        this.ws.on("error", () => this.router.route("test"));
        this.ws.on("close", () => this.router.route("test"));
    }
}
exports.ClientSocket = ClientSocket;
