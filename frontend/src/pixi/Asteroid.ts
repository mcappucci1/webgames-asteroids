import { IPointData } from "pixi.js";
import { Entity } from "./Entity";

const graphicPoints: Array<Array<IPointData>> = [
	[
		{ x: 29, y: 3 },
		{ x: 51, y: 15 },
		{ x: 82, y: 0 },
		{ x: 105, y: 31 },
		{ x: 81, y: 44 },
		{ x: 105, y: 70 },
		{ x: 78, y: 108 },
		{ x: 41, y: 94 },
		{ x: 27, y: 109 },
		{ x: 0, y: 81 },
		{ x: 14, y: 55 },
		{ x: 1, y: 31 },
	],
	[
		{ x: 28, y: 0 },
		{ x: 65, y: 0 },
		{ x: 104, y: 27 },
		{ x: 103, y: 39 },
		{ x: 73, y: 52 },
		{ x: 107, y: 78 },
		{ x: 82, y: 102 },
		{ x: 64, y: 93 },
		{ x: 24, y: 103 },
		{ x: 0, y: 67 },
		{ x: 3, y: 26 },
		{ x: 43, y: 28 },
	],
	[
		{ x: 40, y: 0 },
		{ x: 81, y: 0 },
		{ x: 108, y: 39 },
		{ x: 108, y: 68 },
		{ x: 78, y: 105 },
		{ x: 57, y: 105 },
		{ x: 57, y: 66 },
		{ x: 29, y: 105 },
		{ x: 0, y: 64 },
		{ x: 28, y: 54 },
		{ x: 3, y: 38 },
	],
];

export class Asteroid extends Entity {
	private style: number;

	constructor(scale: number, style: number, id: number) {
		super(graphicPoints[style], id, undefined, undefined, scale);
		this.style = style;
		this.score = Math.round(scale ** 2 * 100);
	}

	static generateRandomAsteroid() {
		const scale = Math.sqrt(1 / Math.pow(2, Math.floor(Math.random() * 3)));
		const style = Math.floor(Math.random() * 3);
		return new Asteroid(scale, style, 0);
	}

	split() {
		if (this.graphic.scale.x === 0.5) {
			return [];
		}
		const newScale = Math.sqrt(this.graphic.scale.x ** 2 / 2);
		const splitAngle = 0.02 + (Math.random() * Math.PI) / 3;
		const asteroids = [new Asteroid(newScale, this.style, 0), new Asteroid(newScale, this.style, 0)];
		asteroids.forEach((asteroid, i) => {
			asteroid.setVelocity(this.getSpeed());
			asteroid.setAngle(this.theta + splitAngle * (i === 1 ? -1 : 1));
			asteroid.setPosition(this.graphic.x, this.graphic.y);
		});
		return asteroids;
	}
}
