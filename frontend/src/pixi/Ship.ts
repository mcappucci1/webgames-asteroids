import { IPointData } from "pixi.js";
import { Entity } from "./Entity";
import { ClientGameEngine } from "./ClientGameEngine";
import { WebSocketClient } from "../api/WebSocketClient";
import { Shot } from "./Shot";

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
	public indestructible: boolean = true;
	private shootInterval: NodeJS.Timer | undefined;
	private keyDownListener: (e: KeyboardEvent) => void;
	private keyUpListener: (e: KeyboardEvent) => void;

	constructor(id: number) {
		super(ship, id);
		this.keyDownListener = (e: KeyboardEvent) => this.sendMessage(e.key, e.repeat, true);
		this.keyUpListener = (e: KeyboardEvent) => this.sendMessage(e.key, e.repeat, false);
		setTimeout(() => (this.indestructible = false), 2000);
	}

	onKeydownEvent(key: string) {
		if (key === "ArrowUp") {
			this.enableThrust();
		} else if (key === "s") {
			this.startShoot();
		}
	}

	onKeyupEvent(key: string) {
		if (key === "ArrowUp") {
			this.disableThrust();
		} else if (key === "s") {
			this.endShoot();
		}
	}

	createShot() {
		ClientGameEngine.addShot(
			Shot.speed + this.getSpeed() * 20,
			this.theta,
			[this.graphic.x, this.graphic.y],
			this.graphic.tint as number
		);
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

	enableThrust() {
		super.redraw(shipMove);
	}

	disableThrust() {
		super.redraw(ship);
	}

	sendMessage(key: string, repeat: boolean, down: boolean) {
		if (repeat) {
			return;
		}
		const invalidKey =
			key !== "ArrowRight" && key !== "ArrowLeft" && key !== "ArrowDown" && key !== "ArrowUp" && key !== "s";
		if (invalidKey) {
			return;
		}
		WebSocketClient.setShipKeyPress(down, key, this.id);
	}

	addKeyPressListeners() {
		window.addEventListener("keydown", this.keyDownListener);
		window.addEventListener("keyup", this.keyUpListener);
	}

	destroy(): void {
		if (this.shootInterval) clearInterval(this.shootInterval);
		window.removeEventListener("keydown", this.keyDownListener);
		window.removeEventListener("keyup", this.keyUpListener);
		super.destroy();
	}
}
