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
	private height: number = 0;
	private width: number = 0;
	private x: number = 0;
	private y: number = 0;

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

	static setBoardSize(height: number, width: number) {
		this.singleton.height = height;
		this.singleton.width = width;
		CanvasEngine.setCanvasSize(height, width);
	}

	static setBoardPosition(x: number, y: number) {
		this.singleton.x = x;
		this.singleton.y = y;
		CanvasEngine.setCanvasPosition(x, y);
	}

	static getSize(): number[] {
		return [ClientGameEngine.singleton.width, ClientGameEngine.singleton.height];
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
			const { id, down, key } = data;
			const ship = this.ships.find((ship) => ship.id === id);
			if (down) {
				ship?.onKeydownEvent(key);
			} else {
				ship?.onKeyupEvent(key);
			}
		} else {
			const { position, speed, theta, moveEntity } = data;
			const ship = new Ship();
			ship.setPosition(
				0.5 * this.width + moveEntity[0] * ship.graphic.width,
				0.5 * this.height + moveEntity[1] * ship.graphic.height
			);
			ship.setAngle(theta);
			ship.setVelocity(speed);
			console.log(ship.getVelocity());
			ship.addKeyPressListeners();
			ClientGameEngine.singleton.ships.push(ship);
			CanvasEngine.addChild(ship);
			console.log(data);
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
		}
	}
}
