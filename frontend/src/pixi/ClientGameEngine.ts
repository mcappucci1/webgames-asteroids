import { TickerCallback } from "pixi.js";
import { CanvasEngine } from "./CanvasEngine";
import { MessageData } from "../common/Message";
import { Asteroid } from "./Asteroid";
import { Entity } from "./Entity";
import { AlienShip } from "./AlienShip";
import { Shot } from "./Shot";
import { Ship } from "./Ship";

export class ClientGameEngine {
	static singleton: ClientGameEngine = new ClientGameEngine();
	static updateCB: TickerCallback<null> = (dt: number) => this.singleton.update(dt);
	private asteroids: Array<Asteroid> = [];
	private alienShips: Array<AlienShip> = [];
	private alienShots: Array<Shot> = [];
	private ships: Array<Ship> = [];
	private shots: Array<Shot> = [];

	static start() {
		CanvasEngine.addTickerCB(ClientGameEngine.updateCB);
	}

	static stop() {
		CanvasEngine.removeTickerCB(ClientGameEngine.updateCB);
	}

	static addShot(speed: number, theta: number, position: Array<number>) {
		const shot = new Shot(0);
		shot.setAngle(theta);
		shot.setVelocity(speed);
		shot.setPosition(position[0], position[1]);
		ClientGameEngine.singleton.shots.push(shot);
		CanvasEngine.addChild(shot);
	}

	moveEntityArray(arr: Entity[], delta: number) {
		let i = 0;
		while (i < arr.length) {
			const entity = arr[i];
			entity.move(delta);
			if (this.entityOutOfBounds(entity)) {
				entity.destroy();
				arr.splice(i, 1);
			} else {
				++i;
			}
		}
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
		this.moveEntityArray(this.asteroids, dt);
		this.moveEntityArray(this.alienShips, dt);
		this.moveEntityArray(this.alienShots, dt);
		this.moveEntityArray(this.ships, dt);
		this.moveEntityArray(this.shots, dt);
		this.detectCollisionsForEntityArray(this.asteroids, [this.shots, this.alienShots]);
		this.detectCollisionsForEntityArray(this.alienShips, [this.shots]);
	}

	destroyEntity(arr: Entity[], i: number, addScore: boolean) {
		//if (addScore) this.score += arr[i].getScore();
		//if (this.scoreChangedCB) this.scoreChangedCB(this.score);
		if (arr[i] instanceof Asteroid) {
			const newAsteroids = (arr[i] as Asteroid).split();
			arr.push(...newAsteroids);
		}
		arr[i].explode();
		arr[i].destroy();
		arr.splice(i, 1);
	}

	detectCollisionsForEntityArray(targetArray: Entity[], collisionObjects: Entity[][]) {
		let i = 0;
		while (i < targetArray.length) {
			let destroy = false;
			for (const entityArr of collisionObjects) {
				let j = 0;
				while (j < entityArr.length) {
					if (targetArray[i].collision(entityArr[j])) {
						destroy = true;
						this.destroyEntity(entityArr, j, true);
						break;
					}
					++j;
				}
				if (destroy) break;
			}
			if (destroy) {
				this.destroyEntity(targetArray, i, true);
			} else {
				++i;
			}
		}
	}

	static handleMessage(msgData: MessageData) {
		const { type, data } = msgData.data;
		if (type === "asteroid") {
			const { startPoint, speed, theta, moveEntity, scale, style, id } = data;
			const asteroid = new Asteroid(scale, style, id);
			asteroid.setPosition(
				startPoint[0] * window.innerWidth + moveEntity[0] * asteroid.graphic.width,
				startPoint[1] * window.innerHeight + moveEntity[1] * asteroid.graphic.height
			);
			asteroid.setAngle(theta);
			asteroid.setVelocity(speed);
			ClientGameEngine.singleton.asteroids.push(asteroid);
			CanvasEngine.addChild(asteroid);
		} else if (type === "alienShip") {
			const { startPoint, speed, theta, moveEntity, id } = data;
			const alienShip = new AlienShip(id);
			alienShip.setPosition(
				startPoint[0] * window.innerWidth + moveEntity[0] * alienShip.graphic.width,
				startPoint[1] * window.innerHeight + moveEntity[1] * alienShip.graphic.height
			);
			alienShip.setAngle(theta);
			alienShip.setVelocity(speed);
			ClientGameEngine.singleton.alienShips.push(alienShip);
			CanvasEngine.addChild(alienShip);
		} else if (type === "alienShot") {
			const { theta, id, shipId } = data;
			// TODO: Handle no ship present
			const alienShip = ClientGameEngine.singleton.alienShips.find((ship) => ship.id === shipId);
			console.log(alienShip);
			if (alienShip == null || alienShip.graphic == null || alienShip.graphic.parent == null) return;
			const alienShot = new Shot(id);
			alienShot.setPosition(alienShip.graphic.x, alienShip.graphic.y);
			alienShot.setAngle(theta);
			alienShot.setVelocity(0.75);
			ClientGameEngine.singleton.alienShots.push(alienShot);
			CanvasEngine.addChild(alienShot);
		} else if (type === "ship") {
			const { action } = data;
			if (action === "keypress") {
				const { id, down, key } = data;
				const ship = this.singleton.ships.find((ship) => ship.id === id);
				if (down) {
					ship?.onKeydownEvent(key);
				} else {
					ship?.onKeyupEvent(key);
				}
			} else {
				const { position, speed, theta, moveEntity } = data;
				const ship = new Ship();
				ship.setPosition(
					0.5 * window.innerWidth + moveEntity[0] * ship.graphic.width,
					0.5 * window.innerHeight + moveEntity[1] * ship.graphic.height
				);
				ship.setAngle(theta);
				ship.setVelocity(speed);
				ship.addKeyPressListeners();
				ClientGameEngine.singleton.ships.push(ship);
				CanvasEngine.addChild(ship);
				console.log(data);
			}
		}
	}
}
