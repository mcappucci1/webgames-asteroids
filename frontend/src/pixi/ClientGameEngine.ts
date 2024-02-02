import { TickerCallback } from "pixi.js";
import { CanvasEngine } from "./CanvasEngine";
import { MessageData } from "../common/Message";
import { Asteroid } from "./Asteroid";
import { Entity } from "./Entity";
import { AlienShip } from "./AlienShip";
import { Shot } from "./Shot";
import { Ship } from "./Ship";
import { WebSocketClient } from "../api/WebSocketClient";

export const DELAY = 1500;
export const COUNTDOWN = 3;

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
	private started: boolean = false;

	static setSetLifeCB(cb: Function) {
		this.singleton.setLifeCB = cb;
	}

	static setScoreCB(cb: Function) {
		this.singleton.setScoreCB = cb;
	}

	static start() {
		if (ClientGameEngine.singleton.started) {
			return;
		}
		ClientGameEngine.singleton.started = true;
		CanvasEngine.addTickerCB(ClientGameEngine.updateCB);
	}

	static stop() {
		if (!ClientGameEngine.singleton.started) {
			return;
		}
		ClientGameEngine.singleton.started = false;
		CanvasEngine.removeTickerCB(ClientGameEngine.updateCB);
	}

	static addShot(speed: number, theta: number, position: Array<number>, color: number) {
		const shot = new Shot(0);
		shot.setAngle(theta);
		shot.setVelocity(speed);
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

	static clear() {
		for (const asteroid of this.singleton.asteroids) {
			asteroid.destroy();
		}
		this.singleton.asteroids = [];
		for (const alienShip of this.singleton.alienShips) {
			alienShip.destroy();
		}
		this.singleton.alienShips = [];
		for (const alienShot of this.singleton.alienShots) {
			alienShot.destroy();
		}
		this.singleton.alienShots = [];
		for (const ship of this.singleton.ships) {
			ship.destroy();
		}
		this.singleton.ships = [];
		for (const shot of this.singleton.shots) {
			shot.destroy();
		}
		this.singleton.shots = [];
		this.singleton.height = 0;
		this.singleton.width = 0;
		this.singleton.setLifeCB = undefined;
		this.singleton.setScoreCB = undefined;
		CanvasEngine.clear();
	}

	moveEntityArray(arr: Entity[], delta: number, removeOutOfBounds = true) {
		let i = 0;
		while (i < arr.length) {
			const entity = arr[i];
			entity.move(delta);
			if (removeOutOfBounds && this.entityOutOfBounds(entity)) {
				if (entity instanceof AlienShip || entity instanceof Asteroid) {
					WebSocketClient.signalDestroy(entity, false);
				}
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
		this.moveEntityArray(this.shots, dt);
		this.detectCollisionsForEntityArray(this.asteroids, [this.shots, this.alienShots]);
		this.detectCollisionsForEntityArray(this.alienShips, [this.shots, this.asteroids]);
		this.detectCollisionsForEntityArray(this.ships, [this.asteroids, this.alienShips, this.alienShots]);
	}

	destroyEntity(arr: Entity[], i: number) {
		if (!(arr[i] instanceof Ship) || arr[i].id === WebSocketClient.getClientId()) {
			WebSocketClient.signalDestroy(arr[i]);
		}
		arr[i].explode();
		arr[i].destroy();
		arr.splice(i, 1);
	}

	detectCollisionsForEntityArray(targetArray: Entity[], collisionObjects: Entity[][]) {
		let i = 0;
		while (i < targetArray.length) {
			if (targetArray[i] instanceof Ship && (targetArray[i] as Ship).indestructible) {
				++i;
				continue;
			}
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

	shipKeyPressHandler(data: any) {
		const { id, down, key } = data;
		const ship = this.ships.find((ship) => ship.id === id);
		if (ship == null) {
			return;
		}
		if (down) {
			ship?.onKeydownEvent(key);
		} else {
			ship?.onKeyupEvent(key);
		}
	}

	shipCreateHandler(data: any) {
		for (const shipData of data.ships) {
			const { position, theta, moveEntity, id, color } = shipData;
			const ship = new Ship(id);
			CanvasEngine.addChild(ship);
			ship.setPosition(
				position[0] * this.width + moveEntity[0] * ship.graphic.width,
				position[1] * this.height + moveEntity[1] * ship.graphic.height
			);
			ship.setColor(color);
			ship.setAngle(theta);
			ship.setRotation(theta);
			if (id === WebSocketClient.getClientId()) {
				ship.addKeyPressListeners();
			}
			this.ships.push(ship);
		}
	}

	shipHandler(data: any) {
		const { action } = data;
		if (action === "keypress") {
			this.shipKeyPressHandler(data);
		} else if (action === "createShips") {
			this.shipCreateHandler(data);
		} else if (action === "removeShip") {
			const i = this.ships.findIndex((ship) => ship.id === data.id);
			if (i === -1) {
				return;
			}
			this.ships[i].explode();
			this.ships[i].destroy();
			this.ships.splice(i, 1);
		} else if (action === "updateShips") {
			const { shipData } = data;
			for (const ship of this.ships) {
				const { x, y, rotation, vx, vy } = shipData[ship.id];
				ship.setPosition(x * this.width, y * this.height);
				ship.setVelocity2(vx * this.width, vy * this.height);
				ship.setRotation(rotation);
				console.log(Math.sqrt(Math.pow(vx * this.width, 2) + Math.pow(vy * this.height, 2)));
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
		} else if (type === "lives") {
			if (this.singleton.setLifeCB != null) {
				this.singleton.setLifeCB(data);
			}
		}
	}
}
