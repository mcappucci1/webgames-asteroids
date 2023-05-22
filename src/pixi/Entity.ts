import { Container, DisplayObject, Graphics, IPointData, ILineStyleOptions } from "pixi.js";

const lineStyle: ILineStyleOptions = {
	width: 4,
	color: 0xc0ecff,
};

export class Entity {
	static stage: Container<DisplayObject>;
	protected theta: number = 0;
	protected graphic: Graphics;
	protected velocity: number[] = [0, 0];

	constructor(graphicData: Array<IPointData>) {
		this.graphic = new Graphics();
		this.graphic.lineStyle(lineStyle);
		this.graphic.drawPolygon(graphicData);
		this.graphic.pivot.set(this.graphic.width / 2, this.graphic.height / 2);
		Entity.stage.addChild(this.graphic);
	}

	getNormalizedVelocity() {
		return Math.sqrt(this.velocity[0] ** 2 + this.velocity[1] ** 2);
	}

	getSize() {
		return [this.graphic.width, this.graphic.height];
	}

	getPosition() {
		return [this.graphic.x, this.graphic.y];
	}

	getVelocity() {
		return this.velocity.map((e) => e);
	}

	setScale(scale: number) {
		this.graphic.scale.set(scale);
	}

	setPosition(x: number, y: number) {
		this.graphic.x = x;
		this.graphic.y = y;
	}

	setAngle(theta: number) {
		this.theta = theta;
		const normV = this.getNormalizedVelocity();
		this.velocity = [normV * Math.cos(theta), normV * Math.sin(theta)];
	}

	setVelocity(speed: number) {
		this.velocity = [speed * Math.cos(this.theta), speed * Math.sin(this.theta)];
	}

	setRotation(rotation: number) {
		this.graphic.rotation = rotation;
	}

	move(delta: number) {
		this.setPosition(this.graphic.x + this.velocity[0] * delta, this.graphic.y + this.velocity[1] * delta);
	}

	rotateClockwiseBy(delta: number) {
		this.setRotation(this.graphic.rotation + delta);
	}

	redraw(graphicData: Array<IPointData>) {
		this.graphic.clear();
		this.graphic.lineStyle(lineStyle);
		this.graphic.drawPolygon(graphicData);
	}

	destroy() {
		Entity.stage.removeChild(this.graphic);
		this.graphic.destroy();
	}
}
