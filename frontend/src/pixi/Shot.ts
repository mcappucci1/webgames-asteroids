import { Entity } from "./Entity";

const geoData = [
	{ x: 0, y: 0 },
	{ x: 6, y: 0 },
	{ x: 6, y: 6 },
	{ x: 0, y: 6 },
];

export class Shot extends Entity {
	static speed: number = 10;

	constructor(id: number) {
		super(geoData, id, false, true);
	}
}
