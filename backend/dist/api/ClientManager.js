"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientManager = void 0;
class ClientManager {
    constructor() {
        this.clients = [];
    }
    add(client) {
        this.clients.push(client);
    }
}
exports.ClientManager = ClientManager;
