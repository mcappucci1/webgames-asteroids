import { TickerCallback } from "pixi.js";
import { CanvasEngine } from "./CanvasEngine";
import { MessageData } from "../common/Message";
import { Asteroid } from "./Asteroid";
import { Entity } from "./Entity";
import { AlienShip } from "./AlienShip";
import { Shot } from "./Shot";
import { Ship } from "./Ship";
import { WebSocketClient } from "../api/WebSocketClient";

export class ClientGameEngine {
	static singleton: ClientGameEngine = new ClientGameEngine();
	static updateCB: TickerCallback<null> = (dt: number) => this.singleton.update(dt);

	private asteroids: Array<Asteroid> = [];
	private alienShips: Array<AlienShip> = [];
	private alienShots: Array<Shot> = [];
	private ships: Array<Ship> = [];
	private shots: Array<Shot> = [];
	private height: number = 0;
	private width: number = 0;
	private setLifeCB: Function | undefined;
	private setScoreCB: Function | undefined;

	static setSetLifeCB(cb: Function) {
		this.singleton.setLifeCB = cb;
	}

	static setScoreCB(cb: Function) {
		this.singleton.setScoreCB = cb;
	}

	static start() {
		CanvasEngine.addTickerCB(ClientGameEngine.updateCB);
	}

	static stop() {
		CanvasEngine.removeTickerCB(ClientGameEngine.updateCB);
	}

	static addShot(theta: number, position: Array<number>, color: number) {
		const shot = new Shot(0);
		shot.setAngle(theta);
		shot.setVelocity(Shot.speed);
		shot.setPosition(position[0], position[1]);
		shot.setColor(color);
		ClientGameEngine.singleton.shots.push(shot);
		CanvasEngine.addChild(shot);
	}

	static setBoardSize(height: number, width: number) {
		this.singleton.height = height;
		this.singleton.width = width;
		CanvasEngine.setCanvasSize(height, width);
	}

	static setBoardPosition(x: number, y: number) {
		CanvasEngine.setCanvasPosition(x, y);
	}

	static getSize(): number[] {
		return [ClientGameEngine.singleton.width, ClientGameEngine.singleton.height];
	}

	moveEntityArray(arr: Entity[], delta: number, removeOutOfBounds = true) {
		let i = 0;
		while (i < arr.length) {
			const entity = arr[i];
			entity.move(delta);
			if (removeOutOfBounds && this.entityOutOfBounds(entity)) {
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
		this.moveEntityArray(this.ships, dt, false);
		this.moveEntityArray(this.shots, dt);
		this.detectCollisionsForEntityArray(this.asteroids, [this.shots, this.alienShots]);
		this.detectCollisionsForEntityArray(this.alienShips, [this.shots]);
		this.detectCollisionsForEntityArray(this.ships, [this.asteroids, this.alienShips, this.alienShots]);
	}

	destroyEntity(arr: Entity[], i: number) {
		WebSocketClient.signalDestory(arr[i]);
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
						this.destroyEntity(entityArr, j);
						break;
					}
					++j;
				}
				if (destroy) break;
			}
			if (destroy) {
				this.destroyEntity(targetArray, i);
			} else {
				++i;
			}
		}
	}

	asteroidHandler(data: any) {
		const { startPoint, speed, theta, moveEntity, scale, style, id } = data;
		const asteroid = new Asteroid(scale, style, id);
		asteroid.setPosition(
			startPoint[0] * this.width + moveEntity[0] * asteroid.graphic.width,
			startPoint[1] * this.height + moveEntity[1] * asteroid.graphic.height
		);
		asteroid.setAngle(theta);
		asteroid.setVelocity(speed);
		this.asteroids.push(asteroid);
		CanvasEngine.addChild(asteroid);
	}

	alienShipHandler(data: any) {
		const { startPoint, speed, theta, moveEntity, id } = data;
		const alienShip = new AlienShip(id);
		alienShip.setPosition(
			startPoint[0] * this.width + moveEntity[0] * alienShip.graphic.width,
			startPoint[1] * this.height + moveEntity[1] * alienShip.graphic.height
		);
		alienShip.setAngle(theta);
		alienShip.setVelocity(speed);
		this.alienShips.push(alienShip);
		CanvasEngine.addChild(alienShip);
	}

	alienShotHandler(data: any) {
		const { theta, id, shipId } = data;
		const alienShip = ClientGameEngine.singleton.alienShips.find((ship) => ship.id === shipId);
		if (alienShip == null) {
			return;
		}
		const alienShot = new Shot(id);
		alienShot.setPosition(alienShip.graphic.x, alienShip.graphic.y);
		alienShot.setAngle(theta);
		alienShot.setVelocity(Shot.speed);
		ClientGameEngine.singleton.alienShots.push(alienShot);
		CanvasEngine.addChild(alienShot);
	}

	shipHandler(data: any) {
		const { action } = data;
		if (action === "keypress") {
			const { id, down, key, locationData } = data;
			const ship = this.ships.find((ship) => ship.id === id);
			if (ship == null) {
				return;
			}
			const { x, y, rotation, vx, vy } = locationData;
			ship.setPosition(x * this.width, y * this.height);
			ship.setVelocity2(vx, vy);
			ship.setRotation(rotation);
			if (down) {
				ship?.onKeydownEvent(key);
			} else {
				ship?.onKeyupEvent(key);
			}
		} else if (action === "createShips") {
			for (const shipData of data.ships) {
				const { position, speed, theta, moveEntity, id, color } = shipData;
				const ship = new Ship(id);
				ship.setPosition(
					position[0] * this.width + moveEntity[0] * ship.graphic.width,
					position[1] * this.height + moveEntity[1] * ship.graphic.height
				);
				ship.setColor(color);
				ship.setAngle(theta);
				ship.setRotation(theta);
				ship.setVelocity(speed);
				if (id === WebSocketClient.getClientId()) {
					ship.addKeyPressListeners();
				}
				this.ships.push(ship);
				if (this.setLifeCB != null) {
					this.setLifeCB(shipData);
				}
				CanvasEngine.addChild(ship);
			}
		}
	}

	static handleMessage(msgData: MessageData) {
		const { type, data } = msgData.data.data;
		if (type === "asteroid") {
			this.singleton.asteroidHandler(data);
		} else if (type === "alienShip") {
			this.singleton.alienShipHandler(data);
		} else if (type === "alienShot") {
			this.singleton.alienShotHandler(data);
		} else if (type === "ship") {
			this.singleton.shipHandler(data);
		} else if (type === "score") {
			if (this.singleton.setScoreCB != null) {
				this.singleton.setScoreCB(data);
			}
		}
	}
}
