import { Graphics, IPointData, ILineStyleOptions } from "pixi.js";
import { segmentIntersection } from "@pixi/math-extras";
import { CanvasEngine } from "./CanvasEngine";

const lineStyle: ILineStyleOptions = {
	width: 4,
	color: 0xc0ecff,
};

class CollisionBody extends Graphics {
	protected data: Array<IPointData>;
	protected treatAsPoint: boolean;

	constructor(graphicData: Array<IPointData>, treatAsPoint?: boolean) {
		super();
		this.lineStyle(lineStyle);
		this.drawPolygon(graphicData);
		this.pivot.set(this.width / 2, this.height / 2);
		this.data = graphicData;
		this.treatAsPoint = treatAsPoint === undefined ? false : treatAsPoint;
	}

	intersectsAABB(body: CollisionBody) {
		const boundsA = this.getBounds();
		const boundsB = body.getBounds();
		return !(
			boundsA.bottom < boundsB.top ||
			boundsA.top > boundsB.bottom ||
			boundsA.right < boundsB.left ||
			boundsA.left > boundsB.right
		);
	}

	intersectsShape(body: CollisionBody) {
		if (!this.vertexData || !body.vertexData) return false;
		const points1 = [];
		const points2 = [];
		for (let i = 0; i < this.vertexData.length; i += 2) {
			points1.push({ x: this.vertexData[i], y: this.vertexData[i + 1] });
		}
		for (let i = 0; i < body.vertexData.length; i += 2) {
			points2.push({ x: body.vertexData[i], y: body.vertexData[i + 1] });
		}
		for (let i = 0; i < points1.length; ++i) {
			const start1 = points1[i];
			const end1 = i === points1.length - 1 ? points1[0] : points1[i + 1];
			for (let j = 0; j < points2.length; ++j) {
				const start2 = points2[j];
				const end2 = j === points2.length - 1 ? points2[0] : points2[j + 1];
				const intersect = segmentIntersection(start1, end1, start2, end2);
				if (intersect && !isNaN(intersect.x)) {
					return true;
				}
			}
		}
		if (body.treatAsPoint) {
			return this.containsPoint(body.position);
		}
		return false;
	}
}

export class Entity {
	static screenMultiplier: number = 1;
	protected theta: number = 0;
	public graphic: CollisionBody;
	protected velocity: number[] = [0, 0];
	protected score: number = 0;
	protected explosive: boolean;
	public id: number;

	constructor(
		graphicData: Array<IPointData>,
		id: number,
		explosive?: boolean,
		treatAsPoint?: boolean,
		scale: number = 1
	) {
		this.graphic = new CollisionBody(graphicData, treatAsPoint);
		this.explosive = explosive === undefined ? true : explosive;
		this.id = id;
		this.graphic.scale.set(scale * Entity.screenMultiplier);
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

	getSpeed() {
		return Math.sqrt(Math.pow(this.velocity[0], 2) + Math.pow(this.velocity[1], 2));
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
		const normV = this.getSpeed();
		this.velocity = [normV * Math.cos(theta), normV * Math.sin(theta)];
	}

	setVelocity(speed: number) {
		speed *= Entity.screenMultiplier;
		this.velocity = [speed * Math.cos(this.theta), speed * Math.sin(this.theta)];
	}

	setRotation(rotation: number) {
		this.graphic.rotation = rotation;
		this.theta = rotation;
	}

	move(delta: number) {
		const x = this.graphic.x + this.velocity[0] * delta;
		const y = this.graphic.y + this.velocity[1] * delta;
		this.setPosition(x, y);
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
		this.graphic.destroy();
	}

	collision(body: Entity) {
		return this.graphic.intersectsAABB(body.graphic) && this.graphic.intersectsShape(body.graphic);
	}

	explode() {
		if (!this.explosive) return;
		const startTime = Date.now();
		const numDots = 4;
		const geoData = [
			{ x: 0, y: 0 },
			{ x: 1, y: 0 },
			{ x: 1, y: 1 },
			{ x: 0, y: 1 },
		];
		const points: Entity[] = [];
		let angle = -Math.PI / 3;
		for (let i = 0; i < numDots; ++i) {
			const dot = new Entity(geoData, 0);
			dot.setPosition(this.graphic.x, this.graphic.y);
			dot.setAngle(this.theta + angle);
			dot.setVelocity(0.025);
			points.push(dot);
			angle += (2 * Math.PI) / 9;
			CanvasEngine.addChild(dot);
		}
		let lastTime: number | undefined;
		const update = (time: number) => {
			if (lastTime == null) {
				lastTime = time;
				requestAnimationFrame((time) => update(time));
				return;
			}
			if (Date.now() - startTime >= 2000) {
				points.forEach((point) => point.destroy());
				return;
			}
			points.forEach((point) => {
				point.move(time - lastTime!);
			});
			lastTime = time;
			requestAnimationFrame((time) => update(time));
		};
		requestAnimationFrame((time) => update(time));
	}

	getScore() {
		return this.score;
	}
}
