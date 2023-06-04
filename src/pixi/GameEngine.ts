import { Application, IApplicationOptions } from "pixi.js";
import { Asteroid } from "./Asteroid";
import { Entity } from "./Entity";
import { Ship } from "./Ship";
import { AlienShip } from "./AlienShip";

export class GameEngine {
	static shots: Entity[] = [];
	static alienShots: Entity[] = [];
	app: Application<HTMLCanvasElement>;
	style: CSSStyleDeclaration;
	lives: number = 3;
	score: number = 0;
	private asteroids: Asteroid[];
	private ship: Ship | null = null;
	private startScreenInterval: NodeJS.Timer | undefined;
	private playGameInterval: NodeJS.Timer | undefined;
	private launchShipTimeout: NodeJS.Timeout | undefined;
	private lastFrameTime: number | null = null;
	private livesChangedCB: Function | null = null;
	private scoreChangedCB: Function | null = null;
	private generateAsteroidInterval: number = 1000;
	private lowerTimeInterval: number = 10_000;
	private alienShips: AlienShip[] = [];

	constructor(options: Partial<IApplicationOptions>) {
		this.app = new Application<HTMLCanvasElement>(options);
		Entity.stage = this.app.stage;
		this.style = this.app.view.style;
		this.asteroids = [];
		document.body.appendChild(this.app.view);
		window.addEventListener("keydown", (e) => this.onKeydownEvent(e));
		window.addEventListener("keyup", (e) => this.onKeyupEvent(e));
		requestAnimationFrame((currentTime) => this.tick(currentTime));
		this.playStartScreen();
	}

	onKeydownEvent(e: KeyboardEvent) {
		if (e.repeat) return;
		if (this.ship) {
			this.ship.onKeydownEvent(e.key);
		}
	}

	onKeyupEvent(e: KeyboardEvent) {
		if (e.repeat) return;
		if (this.ship) {
			this.ship.onKeyupEvent(e.key);
		}
	}

	setLivesChangedCB(cb: Function) {
		this.livesChangedCB = cb;
	}

	setScoreChangedCB(cb: Function) {
		this.scoreChangedCB = cb;
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

	playStartScreen() {
		this.startScreenInterval = setInterval(() => {
			const asteroid = Asteroid.generateRandomAsteroid();
			const { startPoint, theta } = this.getRandomStart(asteroid);
			asteroid.setPosition(startPoint[0], startPoint[1]);
			asteroid.setAngle(theta);
			asteroid.setVelocity(0.03 + Math.random() ** 2 * 0.35);
			this.asteroids.push(asteroid);
		}, 200);
	}

	startGameInterval() {
		let numSecs = 0;
		this.playGameInterval = setInterval(() => {
			numSecs += this.generateAsteroidInterval;
			const asteroid = Asteroid.generateRandomAsteroid();
			const { startPoint, theta } = this.getRandomStart(asteroid);
			asteroid.setPosition(startPoint[0], startPoint[1]);
			asteroid.setAngle(theta);
			asteroid.setVelocity(0.03 + Math.random() ** 2 * 0.35);
			this.asteroids.push(asteroid);
			if (Math.random() < 0.15) {
				const alienShip = new AlienShip();
				const rand = this.getRandomStart(asteroid);
				alienShip.setPosition(rand.startPoint[0], rand.startPoint[1]);
				alienShip.setAngle(rand.theta);
				alienShip.setVelocity(0.03 + Math.random() ** 2 * 0.35);
				this.alienShips.push(alienShip);
			}
			if (numSecs >= this.lowerTimeInterval && this.generateAsteroidInterval > 300) {
				this.generateAsteroidInterval -= 50;
				clearInterval(this.playGameInterval);
				this.startGameInterval();
			}
		}, this.generateAsteroidInterval);
	}

	playGame() {
		if (this.startScreenInterval) {
			clearInterval(this.startScreenInterval);
		}
		for (const asteroid of this.asteroids) {
			asteroid.destroy();
		}
		this.asteroids = [];
		this.ship = new Ship();
		this.ship.start();
		this.startGameInterval();
	}

	resetGame() {
		this.lives = 3;
		this.score = 0;
		if (this.livesChangedCB) this.livesChangedCB(this.lives);
		if (this.scoreChangedCB) this.scoreChangedCB(this.score);
		this.asteroids.forEach((asteroid) => asteroid.destroy());
		this.asteroids = [];
		this.ship?.destroy();
		this.ship = null;
		if (this.startScreenInterval) clearInterval(this.startScreenInterval);
		if (this.playGameInterval) clearInterval(this.playGameInterval);
		if (this.launchShipTimeout) clearTimeout(this.launchShipTimeout);
		this.startScreenInterval = undefined;
		this.playGameInterval = undefined;
		this.launchShipTimeout = undefined;
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

	tick(currentTime: number) {
		if (this.lastFrameTime == null) {
			this.lastFrameTime = currentTime;
			requestAnimationFrame((time) => this.tick(time));
			return;
		}
		const delta = currentTime - this.lastFrameTime;
		let i = 0;
		while (i < this.asteroids.length) {
			const asteroid = this.asteroids[i];
			asteroid.move(delta);
			if (this.entityOutOfBounds(asteroid)) {
				asteroid.destroy();
				this.asteroids.splice(i, 1);
			} else {
				++i;
			}
		}
		i = 0;
		while (i < this.alienShips.length) {
			const alienShip = this.alienShips[i];
			alienShip.move(delta);
			if (this.entityOutOfBounds(alienShip)) {
				alienShip.destroy();
				this.alienShips.splice(i, 1);
			} else {
				++i;
			}
		}
		GameEngine.shots.forEach((shot) => {
			shot.move(delta);
		});
		GameEngine.alienShots.forEach((shot) => {
			shot.move(delta);
		});
		let x = 0;
		while (x < this.asteroids.length) {
			let destroy = false;
			let j = 0;
			while (j < GameEngine.shots.length) {
				if (this.asteroids[x].collision(GameEngine.shots[j])) {
					destroy = true;
					break;
				}
				++j;
			}
			if (destroy) {
				this.score += this.asteroids[x].getScore();
				if (this.scoreChangedCB) this.scoreChangedCB(this.score);
				const newAsteroids = this.asteroids[x].split();
				this.asteroids.push(...newAsteroids);
				this.asteroids[x].explode();
				this.asteroids[x].destroy();
				this.asteroids.splice(x, 1);
				GameEngine.shots[j].destroy();
				GameEngine.shots.splice(j, 1);
			} else {
				j = 0;
				while (j < GameEngine.alienShots.length) {
					if (this.asteroids[x].collision(GameEngine.alienShots[j])) {
						destroy = true;
						break;
					}
					++j;
				}
				if (destroy) {
					const newAsteroids = this.asteroids[x].split();
					this.asteroids.push(...newAsteroids);
					this.asteroids[x].explode();
					this.asteroids[x].destroy();
					this.asteroids.splice(x, 1);
					GameEngine.alienShots[j].destroy();
					GameEngine.alienShots.splice(j, 1);
				} else {
					++x;
				}
			}
		}
		x = 0;
		while (x < this.alienShips.length) {
			let destroy = false;
			let j = 0;
			while (j < GameEngine.shots.length) {
				if (this.alienShips[x].collision(GameEngine.shots[j])) {
					destroy = true;
					break;
				}
				++j;
			}
			if (destroy) {
				this.score += this.alienShips[x].getScore();
				if (this.scoreChangedCB) this.scoreChangedCB(this.score);
				this.alienShips[x].explode();
				this.alienShips[x].destroy();
				this.alienShips.splice(x, 1);
				GameEngine.shots[j].destroy();
				GameEngine.shots.splice(j, 1);
			} else {
				++x;
			}
		}
		if (this.ship) {
			this.ship.move(delta);
			if (!this.ship.indestructible) {
				let smash = false;
				for (let x = 0; x < this.asteroids.length && !smash; ++x) {
					if (this.ship!.collision(this.asteroids[x])) {
						this.score += this.asteroids[x].getScore();
						if (this.scoreChangedCB) this.scoreChangedCB(this.score);
						const newAsteroids = this.asteroids[x].split();
						this.asteroids.push(...newAsteroids);
						this.asteroids[x].explode();
						this.asteroids[x].destroy();
						this.asteroids.splice(x, 1);
						smash = true;
					}
				}
				for (let x = 0; x < this.alienShips.length && !smash; ++x) {
					if (this.ship!.collision(this.alienShips[x])) {
						this.score += this.alienShips[x].getScore();
						if (this.scoreChangedCB) this.scoreChangedCB(this.score);
						this.alienShips[x].explode();
						this.alienShips[x].destroy();
						this.alienShips.splice(x, 1);
						smash = true;
						break;
					}
				}
				for (let x = 0; x < GameEngine.alienShots.length && !smash; ++x) {
					if (this.ship!.collision(GameEngine.alienShots[x])) {
						GameEngine.alienShots.splice(x, 1);
						smash = true;
						break;
					}
				}
				if (smash) {
					this.ship.explode();
					this.ship.destroy();
					this.ship = null;
					clearInterval(this.playGameInterval);
					this.generateAsteroidInterval = 1000;
					this.launchShipTimeout = setTimeout(() => {
						this.startGameInterval();
						this.ship = new Ship();
						this.ship.start();
						this.launchShipTimeout = undefined;
					}, 2000);
					if (this.livesChangedCB) this.livesChangedCB(--this.lives);
				}
			}
		}
		this.lastFrameTime = currentTime;
		requestAnimationFrame((time) => this.tick(time));
	}
}
