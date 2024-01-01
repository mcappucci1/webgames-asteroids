import { IPointData } from "pixi.js";
import { Entity } from "./Entity";
import { ClientGameEngine } from "./ClientGameEngine";
import { WebSocketClient } from "../api/WebSocketClient";

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
	static engineForce: number = 150;
	static dragCoefficient: number = 3;
	static maxSpeed: number = 7;
	public indestructible: boolean = false;
	private thrusting: boolean = false;
	private direction: Direction = Direction.None;
	private shootInterval: NodeJS.Timer | undefined;

	constructor() {
		super(ship, 0);
	}

	setVelocity(speed: number) {
		console.log(speed);
		super.setVelocity(speed);
	}

	onKeydownEvent(key: string) {
		if (key === "ArrowRight") {
			this.direction = this.direction === Direction.Left ? Direction.Both : Direction.Right;
		} else if (key === "ArrowLeft") {
			this.direction = this.direction === Direction.Right ? Direction.Both : Direction.Left;
		} else if (key === "ArrowUp") {
			this.enableThrust();
		} else if (key === "s") {
			this.startShoot();
		}
	}

	onKeyupEvent(key: string) {
		if (key === "ArrowRight") {
			this.direction = this.direction === Direction.Both ? Direction.Left : Direction.None;
		} else if (key === "ArrowLeft") {
			this.direction = this.direction === Direction.Both ? Direction.Right : Direction.None;
		} else if (key === "ArrowUp") {
			this.disableThrust();
		} else if (key === "s") {
			this.endShoot();
		}
	}

	createShot() {
		ClientGameEngine.addShot(this.theta, [this.graphic.x, this.graphic.y]);
	}

	startShoot() {
		if (this.shootInterval) clearInterval(this.shootInterval);
		this.createShot();
		this.shootInterval = setInterval(() => {
			this.createShot();
		}, 300);
	}

	endShoot() {
		if (this.shootInterval) clearInterval(this.shootInterval);
		this.shootInterval = undefined;
	}

	thrust(delta: number) {
		if (this.getSpeed() >= Ship.maxSpeed) {
			return;
		}
		const forwardAcceleration = (Ship.engineForce / Ship.mass) * Entity.screenMultiplier;
		this.velocity[0] += forwardAcceleration * delta * Math.cos(this.graphic.rotation);
		this.velocity[1] += forwardAcceleration * delta * Math.sin(this.graphic.rotation);
		const vel = this.getSpeed();
		if (vel > Ship.maxSpeed) {
			const factor = Ship.maxSpeed / vel;
			this.velocity[0] *= factor;
			this.velocity[1] *= factor;
		}
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
			this.rotateClockwiseBy(-0.075);
		} else if (this.direction === Direction.Right) {
			this.rotateClockwiseBy(0.075);
		}

		if (this.thrusting) {
			this.thrust(delta);
		}

		const f = Ship.dragCoefficient * Math.abs(this.velocity[0]);
		this.velocity[0] -= (f / Ship.mass) * delta * (this.velocity[0] < 0 ? -1 : 1);
		const fy = Ship.dragCoefficient * Math.abs(this.velocity[1]);
		this.velocity[1] -= (fy / Ship.mass) * delta * (this.velocity[1] < 0 ? -1 : 1);

		this.graphic.x += this.velocity[0] * delta;
		this.graphic.y += this.velocity[1] * delta;

		const bounds = this.graphic.getBounds();
		const [w, h] = ClientGameEngine.getSize();

		if (bounds.right < 0) {
			this.graphic.x = w + bounds.width / 4;
		} else if (bounds.bottom < 0) {
			this.graphic.y = h + bounds.height / 4;
		} else if (bounds.left > w) {
			this.graphic.x = -bounds.width / 4;
		} else if (bounds.top > h) {
			this.graphic.y = -bounds.height / 4;
		}
	}

	start() {
		this.indestructible = true;
		const [w, h] = ClientGameEngine.getSize();
		setTimeout(() => (this.indestructible = false), 1000);
		this.setPosition(w / 2, h);
		this.setRotation((3 * Math.PI) / 2);
		this.setAngle((3 * Math.PI) / 2);
		this.setVelocity(0.25);
	}

	sendMessage(key: string, down: boolean) {
		const invalidKey =
			key !== "ArrowRight" && key !== "ArrowLeft" && key !== "ArrowDown" && key !== "ArrowUp" && key !== "s";
		if (invalidKey) {
			return;
		}
		WebSocketClient.setShipKeyDown(down, key, this.id);
	}

	addKeyPressListeners() {
		window.addEventListener("keydown", (e: KeyboardEvent) => this.sendMessage(e.key, true));
		window.addEventListener("keyup", (e: KeyboardEvent) => this.sendMessage(e.key, false));
	}

	destroy(): void {
		if (this.shootInterval) clearInterval(this.shootInterval);
		super.destroy();
	}
}
