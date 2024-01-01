import { Asteroid } from "./Asteroid";
import { CanvasEngine } from "./CanvasEngine";
import { Entity } from "./Entity";
import { TickerCallback } from "pixi.js";

export class IdleScreenEngine {
	static singleton: IdleScreenEngine = new IdleScreenEngine();
	private static asteroidInterval: number = 20;
	private asteroids: Array<Asteroid> = [];
	private lastAsteroidCreation: number = 0;
	private started: boolean = false;
	static moveAsteroidsCB: TickerCallback<null> = (dt: number) => this.singleton.moveAsteroids(dt);

	generateAsteroid() {
		const asteroid = Asteroid.generateRandomAsteroid();
		const { startPoint, theta } = this.getRandomStart(asteroid);
		asteroid.setPosition(startPoint[0], startPoint[1]);
		asteroid.setAngle(theta);
		asteroid.setVelocity(0.5 + Math.random() ** 2 * 4);
		this.asteroids.push(asteroid);
		CanvasEngine.addChild(asteroid);
	}

	getRandomStart(entity: Entity) {
		let theta;
		let startPoint;
		const randNumForBorder = Math.random() * 4;
		const [width, height] = entity.getSize();
		// top
		if (randNumForBorder >= 3) {
			theta = Math.PI * Math.random();
			startPoint = [Math.random() * window.innerWidth, -height];
		}
		// right
		else if (randNumForBorder >= 2) {
			theta = Math.PI * Math.random() + Math.PI / 2;
			startPoint = [window.innerWidth + width, Math.random() * window.innerHeight];
		}
		// bottom
		else if (randNumForBorder >= 1) {
			theta = Math.PI * Math.random() + Math.PI;
			startPoint = [Math.random() * window.innerWidth, window.innerHeight + height];
		}
		// left
		else {
			theta = (1.5 * Math.PI + Math.PI * Math.random()) % (2 * Math.PI);
			startPoint = [-width, Math.random() * window.innerHeight];
		}
		return { startPoint, theta };
	}

	moveAsteroids(dt: number) {
		this.lastAsteroidCreation += dt;
		let i = 0;
		while (i < this.asteroids.length) {
			this.asteroids[i].move(dt);
			if (this.entityOutOfBounds(this.asteroids[i])) {
				this.asteroids.splice(i, 1);
			} else {
				++i;
			}
		}
		if (IdleScreenEngine.asteroidInterval < this.lastAsteroidCreation) {
			this.generateAsteroid();
			this.lastAsteroidCreation = 0;
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

	static start() {
		if (IdleScreenEngine.singleton.started) {
			return;
		}
		CanvasEngine.addTickerCB(IdleScreenEngine.moveAsteroidsCB);
		IdleScreenEngine.singleton.started = true;
	}

	static stop() {
		if (!IdleScreenEngine.singleton.started) {
			return;
		}
		CanvasEngine.removeTickerCB(IdleScreenEngine.moveAsteroidsCB);
		CanvasEngine.clear();
		IdleScreenEngine.singleton.started = false;
	}
}
