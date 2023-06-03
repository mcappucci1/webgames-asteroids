import { Application, IApplicationOptions } from "pixi.js";
import { Asteroid } from "./Asteroid";
import { Entity } from "./Entity";
import { Ship } from "./Ship";

export class GameEngine {
	app: Application<HTMLCanvasElement>;
	style: CSSStyleDeclaration;
	private asteroids: Asteroid[];
	private ship: Ship | null = null;
	private startScreenInterval: NodeJS.Timer | undefined;
	private playGameInterval: NodeJS.Timer | undefined;
	private forward: boolean = false;
	private left: boolean = false;
	private right: boolean = false;
	private lastFrameTime: number | null = null;

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
		if (e.key === "ArrowRight") {
			this.right = true;
		} else if (e.key === "ArrowLeft") {
			this.left = true;
		} else if (e.key === "ArrowUp") {
			this.forward = true;
			if (this.ship != null) {
				this.ship.enableThrust();
			}
		}
	}

	onKeyupEvent(e: KeyboardEvent) {
		if (e.repeat) return;
		if (e.key === "ArrowRight") {
			this.right = false;
		} else if (e.key === "ArrowLeft") {
			this.left = false;
		} else if (e.key === "ArrowUp") {
			this.forward = false;
			if (this.ship != null) {
				this.ship.disableThrust();
			}
		}
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

	playGame() {
		if (this.startScreenInterval) {
			clearInterval(this.startScreenInterval);
		}
		for (const asteroid of this.asteroids) {
			asteroid.destroy();
		}
		this.asteroids = [];
		this.ship = new Ship();
		this.ship.setPosition(window.innerWidth / 2, window.innerHeight);
		this.ship.setRotation((3 * Math.PI) / 2);
		this.ship.setAngle((3 * Math.PI) / 2);
		this.ship.setVelocity(0.5);
		this.playGameInterval = setInterval(() => {
			const asteroid = Asteroid.generateRandomAsteroid();
			const { startPoint, theta } = this.getRandomStart(asteroid);
			asteroid.setPosition(startPoint[0], startPoint[1]);
			asteroid.setAngle(theta);
			asteroid.setVelocity(0.03 + Math.random() ** 2 * 0.35);
			this.asteroids.push(asteroid);
		}, 1000);
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
		if (this.ship) {
			this.ship.move(delta);
			if (this.left && !this.right) {
				this.ship.rotateClockwiseBy(-0.1);
			} else if (this.right && !this.left) {
				this.ship.rotateClockwiseBy(0.1);
			}
			const smash = this.asteroids.reduce((acc, e) => acc || this.ship!.collision(e), false);
			console.log(smash);
			if (smash) {
				this.ship.graphic.makeRed();
			} else {
				this.ship.graphic.makeNormal();
			}
		}
		this.lastFrameTime = currentTime;
		requestAnimationFrame((time) => this.tick(time));
	}
}
