import { Entity } from "./Entity";

const geoData = [
	{ x: 0, y: 0 },
	{ x: 5, y: 0 },
	{ x: 5, y: 5 },
	{ x: 0, y: 5 },
];

export class Shot extends Entity {
	constructor() {
		super(geoData, false, true);
	}
}
