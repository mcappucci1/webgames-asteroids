import { Sprite, Spritesheet } from "pixi.js";

export class Ship {
	static spriteSheet: Spritesheet;
	static mass: number = 1000;
	static engineForce: number = 4;
	static dragCoefficient: number = 4;
	sprite: Sprite;
	velocity: number[] = [0, 0];

	constructor() {
		this.sprite = new Sprite(Ship.spriteSheet.textures["ship"]);
		this.sprite.anchor.set(0.5, 0.5);
		this.sprite.position.set(100, 100);
	}

	getNormalizedVeclocity() {
		return Math.sqrt(this.velocity[0] ** 2 + this.velocity[1] ** 2);
	}

	getVelocityTheta() {
		return Math.atan2(this.velocity[0], this.velocity[1]);
	}
}
