import { Entity } from "./Entity";

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

	constructor(id: number) {
		super(alienShip, id);
		this.score = 500;
	}

	destroy() {
		clearInterval(this.shootInterval);
		super.destroy();
	}
}
