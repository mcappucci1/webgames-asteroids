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

export class Ship extends Entity {
	static mass: number = 1000;
	static engineForce: number = 4;
	static dragCoefficient: number = 40;
	private thrusting: boolean = false;

	constructor() {
		super(ship);
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
		if (this.thrusting) {
			const forwardAcceleration = Ship.engineForce / Ship.mass;
			this.velocity[0] += forwardAcceleration * delta * Math.cos(this.graphic.rotation);
			this.velocity[1] += forwardAcceleration * delta * Math.sin(this.graphic.rotation);
		}
		const f = Ship.dragCoefficient * this.velocity[0] ** 2;
		this.velocity[0] -= (f / Ship.mass) * delta * (this.velocity[0] < 0 ? -1 : 1);
		const fy = Ship.dragCoefficient * this.velocity[1] ** 2;
		this.velocity[1] -= (fy / Ship.mass) * delta * (this.velocity[1] < 0 ? -1 : 1);
		this.graphic.x += this.velocity[0] * delta;
		this.graphic.y += this.velocity[1] * delta;
	}
}
