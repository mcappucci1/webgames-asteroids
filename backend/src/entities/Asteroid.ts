import { Entity } from "./Entity";
import { EntityData } from "./EntityData";

export class Asteroid implements Entity {
	static maxSplit = 2;
	public id: number;
	public scale: number;
	public speed: number;
	public angle: number;
	public style: number;
	public score = 10;
	public split = true;
	public splitCount = 0;

	constructor(id: number, scale: number, speed: number, angle: number, style: number) {
		this.id = id;
		this.scale = scale;
		this.speed = speed;
		this.angle = angle;
		this.style = style;
		this.splitCount = Math.log(Math.pow(1 / scale, 2)) / Math.log(2);
	}

	canSplit() {
		return this.splitCount < Asteroid.maxSplit - 0.0001;
	}

	splitEntity(location: number[]): EntityData[] {
		const newScale = Math.sqrt(Math.pow(this.scale, 2) / 2);
		const splitAngle = 0.02 + (Math.random() * Math.PI) / 3;

		const asteroid = {
			id: 0,
			startPoint: location,
			theta: this.angle,
			moveEntity: [0, 0],
			speed: this.speed,
			scale: newScale,
			style: this.style,
		};

		const asteroids = [asteroid, { ...asteroid }];
		asteroids[0].theta += splitAngle;
		asteroids[1].theta -= splitAngle;

		return asteroids;
	}
}
