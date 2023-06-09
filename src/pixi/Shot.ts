import { Entity } from "./Entity";

const geoData = [
	{ x: 0, y: 0 },
	{ x: 6, y: 0 },
	{ x: 6, y: 6 },
	{ x: 0, y: 6 },
];

export class Shot extends Entity {
	constructor() {
		super(geoData, false, true);
	}
}
