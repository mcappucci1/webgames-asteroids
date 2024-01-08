"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Shot = void 0;
class Shot {
    constructor(id, color) {
        this.score = 0;
        this.split = false;
        this.color = "#FFFFFF";
        this.id = id;
        this.color = color || this.color;
    }
}
exports.Shot = Shot;
