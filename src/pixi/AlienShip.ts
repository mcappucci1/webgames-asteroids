import { Entity } from "./Entity";
import { Shot } from "./Shot";
import { GameEngine } from "./GameEngine";

const alienShip = [
	{ x: 0, y: 0 },
	{ x: 10, y: -13 },
	{ x: 20, y: -13 },
	{ x: 25, y: -20 },
	{ x: 35, y: -20 },
	{ x: 40, y: -13 },
	{ x: 50, y: -13 },
	{ x: 60, y: 0 },
	{ x: 50, y: 10 },
	{ x: 10, y: 10 },
];

export class AlienShip extends Entity {
	private shootInterval: NodeJS.Timer | undefined;

	constructor() {
		super(alienShip);
		this.shootInterval = setInterval(() => {
			const shot = new Shot();
			shot.setAngle(Math.PI * 2 * Math.random());
			shot.setVelocity(0.75);
			shot.setPosition(this.graphic.x, this.graphic.y);
			GameEngine.alienShots.push(shot);
		}, 1000);
		this.score = 500;
	}

	destroy() {
		clearInterval(this.shootInterval);
		super.destroy();
	}
}
