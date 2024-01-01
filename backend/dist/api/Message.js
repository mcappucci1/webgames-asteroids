"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageType = exports.Message = void 0;
class Message {
    constructor(msgType, data) {
        this.msgType = msgType;
        this.data = data;
    }
}
exports.Message = Message;
var MessageType;
(function (MessageType) {
    MessageType[MessageType["CREATE_CLIENT"] = 0] = "CREATE_CLIENT";
    MessageType[MessageType["SET_CLIENT_NAME"] = 1] = "SET_CLIENT_NAME";
    MessageType[MessageType["CREATE_GAME"] = 2] = "CREATE_GAME";
    MessageType[MessageType["ADD_CLIENT_TO_GAME"] = 3] = "ADD_CLIENT_TO_GAME";
    MessageType[MessageType["START_GAME"] = 4] = "START_GAME";
    MessageType[MessageType["GET_GAME_INFO"] = 5] = "GET_GAME_INFO";
    MessageType[MessageType["GAME_DATA"] = 6] = "GAME_DATA";
    MessageType[MessageType["CONNECTION_LOST"] = 7] = "CONNECTION_LOST";
    MessageType[MessageType["REMOVE_CLIENT_FROM_GAME"] = 8] = "REMOVE_CLIENT_FROM_GAME";
})(MessageType || (exports.MessageType = MessageType = {}));
