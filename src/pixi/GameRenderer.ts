import { Application, IApplicationOptions, Assets } from "pixi.js";
import { Asteroid, Size, Style } from "./Asteroid";
import { Ship } from "./Ship";

export class GameRenderer {
	app: Application<HTMLCanvasElement>;
	style: CSSStyleDeclaration;
	private asteroids: Asteroid[];
	private ship: Ship | null = null;
	private startScreenInterval: NodeJS.Timer | null = null;
	private playGameInterval: NodeJS.Timer | null = null;
	private forward: boolean = false;
	private left: boolean = false;
	private right: boolean = false;
	private lastFrameTime: number | null = null;

	constructor(options: Partial<IApplicationOptions>) {
		this.app = new Application<HTMLCanvasElement>(options);
		this.style = this.app.view.style;
		this.asteroids = [];
		Assets.load("/spritesheets/spritesheet.json").then((spriteSheet) => {
			Asteroid.spriteSheet = spriteSheet;
			Ship.spriteSheet = spriteSheet;
			this.playStartScreen();
		});
		document.body.appendChild(this.app.view);
		window.addEventListener("keydown", (e) => this.onKeydownEvent(e));
		window.addEventListener("keyup", (e) => this.onKeyupEvent(e));
		requestAnimationFrame((currentTime) => this.tick(currentTime));
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
				this.ship.sprite.texture = Ship.spriteSheet.textures["shipMove"];
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
				this.ship.sprite.texture = Ship.spriteSheet.textures["ship"];
			}
		}
	}

	getRandomStart(entity: any) {
		let theta;
		let startPoint;
		const randNumForBorder = Math.random() * 4;
		// top
		if (randNumForBorder >= 3) {
			theta = Math.PI * Math.random();
			startPoint = [Math.random() * window.innerWidth, -entity.sprite.height];
		}
		// right
		else if (randNumForBorder >= 2) {
			theta = Math.PI * Math.random() + Math.PI / 2;
			startPoint = [window.innerWidth, Math.random() * window.innerHeight];
		}
		// bottom
		else if (randNumForBorder >= 1) {
			theta = Math.PI * Math.random() + Math.PI;
			startPoint = [Math.random() * window.innerWidth, window.innerHeight];
		}
		// left
		else {
			theta = (1.5 * Math.PI + Math.PI * Math.random()) % (2 * Math.PI);
			startPoint = [-entity.sprite.width, Math.random() * window.innerHeight];
		}
		return { startPoint, theta };
	}

	playStartScreen() {
		this.startScreenInterval = setInterval(() => {
			const randForSize = Math.random() * 3;
			const randForStyle = Math.random() * 3;

			let size = Size.small;
			if (randForSize > 2) size = Size.large;
			else if (randForSize > 1) size = Size.medium;

			let style = Style.style1;
			if (randForStyle > 2) style = Style.style2;
			else if (randForStyle > 1) style = Style.style3;

			const multiplier = Math.random();
			const speed = 1.5 + multiplier ** 2 * 8.5;
			const asteroid = new Asteroid(size, style, speed);
			const { startPoint, theta } = this.getRandomStart(asteroid);
			asteroid.setStartPoint(startPoint, theta);

			this.app.stage.addChild(asteroid.sprite);
			this.asteroids.push(asteroid);
		}, 200);
	}

	playGame() {
		if (this.startScreenInterval) {
			clearInterval(this.startScreenInterval);
		}
		for (const asteroid of this.asteroids) {
			this.app.stage.removeChild(asteroid.sprite);
			asteroid.sprite.destroy();
		}
		this.asteroids = [];
		this.ship = new Ship();
		this.app.stage.addChild(this.ship.sprite);
	}

	tick(currentTime: number) {
		let i = 0;
		while (i < this.asteroids.length) {
			const { sprite, speed, theta } = this.asteroids[i];
			const sin = Math.sin(theta),
				cos = Math.cos(theta);
			sprite.x += speed * cos;
			sprite.y += speed * sin;
			const pastLeft = sprite.x + sprite.width < 0 && cos <= 0;
			const pastRight = sprite.x > window.innerWidth && cos >= 0;
			const pastBottom = sprite.y + sprite.height < 0 && sin <= 0;
			const pastTop = sprite.y > window.innerHeight && sin >= 0;
			if (pastLeft || pastRight || pastBottom || pastTop) {
				this.app.stage.removeChild(sprite);
				sprite.destroy();
				this.asteroids.splice(i, 1);
			} else {
				++i;
			}
		}
		if (this.lastFrameTime && this.ship) {
			const delta = currentTime - this.lastFrameTime;
			if (this.forward) {
				const forwardAcceleration = Ship.engineForce / Ship.mass;
				this.ship.velocity[0] += forwardAcceleration * delta * Math.cos(this.ship.sprite.rotation);
				this.ship.velocity[1] += forwardAcceleration * delta * Math.sin(this.ship.sprite.rotation);
			}
			const f = Ship.dragCoefficient * this.ship.velocity[0] ** 2;
			this.ship.velocity[0] -= (f / Ship.mass) * delta * (this.ship.velocity[0] < 0 ? -1 : 1);
			const fy = Ship.dragCoefficient * this.ship.velocity[1] ** 2;
			this.ship.velocity[1] -= (fy / Ship.mass) * delta * (this.ship.velocity[1] < 0 ? -1 : 1);
			this.ship.sprite.x += this.ship.velocity[0] * delta;
			this.ship.sprite.y += this.ship.velocity[1] * delta;
			if (this.left && !this.right) {
				this.ship.sprite.rotation = (this.ship.sprite.rotation - 0.1) % 360;
			} else if (this.right && !this.left) {
				this.ship.sprite.rotation = (this.ship.sprite.rotation + 0.1) % 360;
			}
		}
		this.lastFrameTime = currentTime;
		requestAnimationFrame((time) => this.tick(time));
	}
}
