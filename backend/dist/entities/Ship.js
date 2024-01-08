"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ship = void 0;
class Ship {
    constructor(id, name, lives = 3) {
        this.score = 0;
        this.split = false;
        this.id = id;
        this.name = name;
        this.lives = lives;
    }
}
exports.Ship = Ship;
