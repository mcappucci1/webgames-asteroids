import { Application, IApplicationOptions, Assets } from "pixi.js";
import { Asteroid, Size, Style } from "./Asteroid";

export class GameRenderer {
	app: Application<HTMLCanvasElement>;
	style: CSSStyleDeclaration;
	private asteroids: Asteroid[];
	private startScreenInterval: NodeJS.Timer | null;

	constructor(options: Partial<IApplicationOptions>) {
		this.app = new Application<HTMLCanvasElement>(options);
		this.style = this.app.view.style;
		this.asteroids = [];
		this.startScreenInterval = null;
		Assets.load("/spritesheets/spritesheet.json").then(
			(spriteSheet) => (Asteroid.spriteSheet = spriteSheet)
		);
		document.body.appendChild(this.app.view);
		requestAnimationFrame(() => this.tick());
	}

	getRandomStart(entity: any) {
		let theta;
		let startPoint;
		const randNumForBorder = Math.random() * 4;
		// top
		if (randNumForBorder >= 3) {
			theta = Math.PI * Math.random();
			startPoint = [
				Math.random() * window.innerWidth,
				-entity.sprite.height,
			];
		}
		// right
		else if (randNumForBorder >= 2) {
			theta = Math.PI * Math.random() + Math.PI / 2;
			startPoint = [
				window.innerWidth,
				Math.random() * window.innerHeight,
			];
		}
		// bottom
		else if (randNumForBorder >= 1) {
			theta = Math.PI * Math.random() + Math.PI;
			startPoint = [
				Math.random() * window.innerWidth,
				window.innerHeight,
			];
		}
		// left
		else {
			theta = (1.5 * Math.PI + Math.PI * Math.random()) % (2 * Math.PI);
			startPoint = [
				-entity.sprite.width,
				Math.random() * window.innerHeight,
			];
		}
		return { startPoint, theta };
	}

	playStartScreen() {
		this.startScreenInterval = setInterval(() => {
			const randForSize = Math.random() * 3;
			let size = Size.small;
			if (randForSize > 2) size = Size.large;
			else if (randForSize > 1) size = Size.medium;

			const randForStyle = Math.random() * 3;
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
	}

	tick() {
		for (const asteroid of this.asteroids) {
			asteroid.sprite.x += asteroid.speed * Math.cos(asteroid.theta);
			asteroid.sprite.y += asteroid.speed * Math.sin(asteroid.theta);
		}
		requestAnimationFrame(() => this.tick());
	}
}
