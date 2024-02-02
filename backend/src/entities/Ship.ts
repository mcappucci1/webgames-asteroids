import { Entity } from "./Entity";
import { Client } from "../api/Client";

enum Direction {
	None,
	Left,
	Right,
	Both,
}

export class Ship implements Entity {
	static mass: number = 1000;
	static engineForce: number = 0.0015;
	static dragCoefficient: number = 1.5;
	static rotateRate: number = 0.004;

	public id: number;
	public score = 0;
	public split = false;
	public lives: number;
	public name: string;
	public clients: Client[];
	private x: number = 0;
	private y: number = 0;
	private rotation: number = (3 * Math.PI) / 2;
	private vx: number = 0;
	private vy: number = -0.0002;
	private thrusting: boolean = false;
	private direction: Direction = Direction.None;

	constructor(id: number, name: string, clients: Client[], lives = 3) {
		this.id = id;
		this.name = name;
		this.clients = clients;
		this.lives = lives;
	}

	keypress(key: string, down: boolean) {
		if (down) {
			if (key === "ArrowRight") {
				this.direction = this.direction === Direction.Left ? Direction.Both : Direction.Right;
			} else if (key === "ArrowLeft") {
				this.direction = this.direction === Direction.Right ? Direction.Both : Direction.Left;
			} else if (key === "ArrowUp") {
				this.thrusting = true;
			}
		} else {
			if (key === "ArrowRight") {
				this.direction = this.direction === Direction.Both ? Direction.Left : Direction.None;
			} else if (key === "ArrowLeft") {
				this.direction = this.direction === Direction.Both ? Direction.Right : Direction.None;
			} else if (key === "ArrowUp") {
				this.thrusting = false;
			}
		}
	}

	thrust(delta: number) {
		const a = Ship.engineForce / Ship.mass;
		this.vx += a * delta * Math.cos(this.rotation);
		this.vy += a * delta * Math.sin(this.rotation);
	}

	updatePosition(delta: number) {
		if (this.direction === Direction.Left) {
			this.rotation -= Ship.rotateRate * delta;
		} else if (this.direction === Direction.Right) {
			this.rotation += Ship.rotateRate * delta;
		}

		if (this.thrusting) {
			this.thrust(delta);
		}

		const f = Ship.dragCoefficient * Math.abs(this.vx);
		this.vx -= (f / Ship.mass) * delta * (this.vx < 0 ? -1 : 1);
		const fy = Ship.dragCoefficient * Math.abs(this.vy);
		this.vy -= (fy / Ship.mass) * delta * (this.vy < 0 ? -1 : 1);

		this.x += this.vx * delta;
		this.y += this.vy * delta;

		if (this.x < -0.02) {
			this.x = 1.01;
		} else if (this.y < -0.02) {
			this.y = 1.01;
		} else if (this.x > 1.02) {
			this.x = -0.01;
		} else if (this.y > 1.02) {
			this.y = -0.01;
		}
	}

	getState() {
		return { x: this.x, y: this.y, rotation: this.rotation, vx: this.vx, vy: this.vy };
	}

	getSpeed() {
		return Math.sqrt(Math.pow(this.vx, 2) + Math.pow(this.vy, 2));
	}

	setPosition(x: number, y: number) {
		this.x = x;
		this.y = y;
	}
}
