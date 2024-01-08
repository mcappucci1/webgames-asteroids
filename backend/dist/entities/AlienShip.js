"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlienShip = void 0;
class AlienShip {
    constructor(id, shotCB) {
        this.score = 50;
        this.split = false;
        this.id = id;
        this.shotTimer = this.startFireTimer(shotCB);
    }
    startFireTimer(shotCB) {
        return setInterval(() => shotCB(this.id), 500);
    }
    destroy() {
        clearInterval(this.shotTimer);
    }
}
exports.AlienShip = AlienShip;
