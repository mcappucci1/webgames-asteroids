"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = void 0;
const Message_1 = require("./Message");
const Controller_1 = require("./Controller");
class Router {
    constructor() {
        this.controller = new Controller_1.Controller();
    }
    route(msg) {
        const { msgType, data } = msg;
        if (msgType === Message_1.MessageType.CREATE_CLIENT) {
            this.controller.createClient(data.data);
        }
    }
}
exports.Router = Router;
