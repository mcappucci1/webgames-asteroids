import { Sprite, Spritesheet } from "pixi.js";

export enum Size {
	small = 3,
	medium = 2,
	large = 1,
}

export enum Style {
	style1 = "style1",
	style2 = "style2",
	style3 = "style3",
}

export class Asteroid {
	static spriteSheet: Spritesheet;
	size: Size;
	style: Style;
	speed: number;
	theta: number = 0;
	sprite: Sprite;

	constructor(size: Size, style: Style, speed: number) {
		this.size = size;
		this.style = style;
		this.speed = speed;
		this.sprite = new Sprite(Asteroid.spriteSheet.textures[style]);
		this.sprite.scale.set(1 / size);
	}

	setStartPoint(startPoint: number[], theta: number) {
		this.theta = theta;
		this.sprite.x = startPoint[0];
		this.sprite.y = startPoint[1];
	}
}
