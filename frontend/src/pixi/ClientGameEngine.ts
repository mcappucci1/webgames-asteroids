import { TickerCallback } from "pixi.js";
import { CanvasEngine } from "./CanvasEngine";
import { MessageData } from "../common/Message";
import { Asteroid } from "./Asteroid";
import { Entity } from "./Entity";

export class ClientGameEngine {
	static singleton: ClientGameEngine = new ClientGameEngine();
	static updateCB: TickerCallback<null> = (dt: number) => this.singleton.update(dt);
	private asteroids: Array<Asteroid> = [];

	static start() {
		CanvasEngine.addTickerCB(ClientGameEngine.updateCB);
	}

	static stop() {
		CanvasEngine.removeTickerCB(ClientGameEngine.updateCB);
	}

	entityOutOfBounds(entity: Entity) {
		const [x, y] = entity.getPosition();
		const [width, height] = entity.getSize();
		const [vx, vy] = entity.getVelocity();
		const pastLeft = x + width < 0 && vx <= 0;
		const pastRight = x > window.innerWidth + width && vx >= 0;
		const pastBottom = y + height < 0 && vy <= 0;
		const pastTop = y > window.innerHeight + height && vy >= 0;
		return pastLeft || pastRight || pastBottom || pastTop;
	}

	update(dt: number) {
		let i = 0;
		while (i < this.asteroids.length) {
			this.asteroids[i].move(dt);
			if (this.entityOutOfBounds(this.asteroids[i])) {
				this.asteroids.splice(i, 1);
			} else {
				++i;
			}
		}
	}

	static handleMessage(msgData: MessageData) {
		const { type, data } = msgData.data;
		if (type === "asteroid") {
			const { location, speed, angle, moveEntity } = data;
			const style = Math.floor(Math.random() * 3);
			const scale = Math.sqrt(1 / Math.pow(2, Math.floor(Math.random() * 3)));
			const asteroid = new Asteroid(scale, style);
			asteroid.setPosition(
				location[0] * window.innerWidth + moveEntity[0] * asteroid.graphic.width,
				location[1] * window.innerHeight + moveEntity[1] * asteroid.graphic.height
			);
			asteroid.setAngle(angle);
			asteroid.setVelocity(speed);
			ClientGameEngine.singleton.asteroids.push(asteroid);
			CanvasEngine.addChild(asteroid);
		}
		console.log(data);
	}
}
