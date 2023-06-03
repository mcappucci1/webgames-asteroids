import { IPointData } from "pixi.js";
import { Entity } from "./Entity";

const ship: Array<IPointData> = [
	{ x: 0, y: 0 },
	{ x: 39, y: 12 },
	{ x: 0, y: 24 },
];

const shipMove: Array<IPointData> = [
	{ x: 0, y: 0 },
	{ x: 39, y: 12 },
	{ x: 0, y: 24 },
	{ x: 0, y: 18 },
	{ x: -10, y: 12 },
	{ x: 0, y: 6 },
];

enum Direction {
	None,
	Left,
	Right,
	Both,
}

export class Ship extends Entity {
	static mass: number = 1000;
	static engineForce: number = 1.5;
	static dragCoefficient: number = 1;
	private thrusting: boolean = false;
	private direction: Direction;

	constructor() {
		super(ship);
		this.direction = Direction.None;
	}

	onKeydownEvent(key: string) {
		if (key === "ArrowRight") {
			this.direction = this.direction === Direction.Left ? Direction.Both : Direction.Right;
		} else if (key === "ArrowLeft") {
			this.direction = this.direction === Direction.Right ? Direction.Both : Direction.Left;
		} else if (key === "ArrowUp") {
			this.enableThrust();
		}
	}

	onKeyupEvent(key: string) {
		if (key === "ArrowRight") {
			this.direction = this.direction === Direction.Both ? Direction.Left : Direction.None;
		} else if (key === "ArrowLeft") {
			this.direction = this.direction === Direction.Both ? Direction.Right : Direction.None;
		} else if (key === "ArrowUp") {
			this.disableThrust();
		}
	}

	thrust(delta: number) {
		const forwardAcceleration = Ship.engineForce / Ship.mass;
		this.velocity[0] += forwardAcceleration * delta * Math.cos(this.graphic.rotation);
		this.velocity[1] += forwardAcceleration * delta * Math.sin(this.graphic.rotation);
	}

	enableThrust() {
		this.thrusting = true;
		super.redraw(shipMove);
	}

	disableThrust() {
		this.thrusting = false;
		super.redraw(ship);
	}

	move(delta: number) {
		if (this.direction === Direction.Left) {
			this.rotateClockwiseBy(-0.1);
		} else if (this.direction === Direction.Right) {
			this.rotateClockwiseBy(0.1);
		}
		if (this.thrusting) {
			const forwardAcceleration = Ship.engineForce / Ship.mass;
			this.velocity[0] += forwardAcceleration * delta * Math.cos(this.graphic.rotation);
			this.velocity[1] += forwardAcceleration * delta * Math.sin(this.graphic.rotation);
		}
		const f = Ship.dragCoefficient * Math.abs(this.velocity[0]);
		this.velocity[0] -= (f / Ship.mass) * delta * (this.velocity[0] < 0 ? -1 : 1);
		const fy = Ship.dragCoefficient * Math.abs(this.velocity[1]);
		this.velocity[1] -= (fy / Ship.mass) * delta * (this.velocity[1] < 0 ? -1 : 1);
		this.graphic.x += this.velocity[0] * delta;
		this.graphic.y += this.velocity[1] * delta;
		const bounds = this.graphic.getBounds();
		if (bounds.right < 0) {
			this.graphic.x = window.innerWidth + bounds.width / 4;
		} else if (bounds.bottom < 0) {
			this.graphic.y = window.innerHeight + bounds.height / 4;
		} else if (bounds.left > window.innerWidth) {
			this.graphic.x = -bounds.width / 4;
		} else if (bounds.top > window.innerHeight) {
			this.graphic.y = -bounds.height / 4;
		}
	}
}
