import { Entity } from "./Entity";

export class AlienShip implements Entity {
	public id: number;
	public score = 50;
	public split = false;
	private shotTimer: NodeJS.Timeout;

	constructor(id: number, shotCB: Function) {
		this.id = id;
		this.shotTimer = this.startFireTimer(shotCB);
	}

	startFireTimer(shotCB: Function): NodeJS.Timeout {
		return setInterval(() => shotCB(this.id), 500);
	}

	destroy() {
		clearInterval(this.shotTimer);
	}
}
