"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Asteroid = void 0;
class Asteroid {
    constructor(id, scale, speed, angle, style) {
        this.score = 10;
        this.split = true;
        this.splitCount = 0;
        this.id = id;
        this.scale = scale;
        this.speed = speed;
        this.angle = angle;
        this.style = style;
        this.splitCount = Math.log(Math.pow(1 / scale, 2)) / Math.log(2);
    }
    canSplit() {
        return this.splitCount < Asteroid.maxSplit - 0.0001;
    }
    splitEntity(location) {
        const newScale = Math.sqrt(Math.pow(this.scale, 2) / 2);
        const splitAngle = 0.02 + (Math.random() * Math.PI) / 3;
        const asteroid = {
            id: 0,
            startPoint: location,
            theta: this.angle,
            moveEntity: [0, 0],
            speed: this.speed,
            scale: newScale,
            style: this.style,
        };
        const asteroids = [asteroid, Object.assign({}, asteroid)];
        asteroids[0].theta += splitAngle;
        asteroids[1].theta -= splitAngle;
        return asteroids;
    }
}
exports.Asteroid = Asteroid;
Asteroid.maxSplit = 2;
