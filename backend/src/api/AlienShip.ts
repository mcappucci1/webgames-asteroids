export class AlienShip {
	public id: number;
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
