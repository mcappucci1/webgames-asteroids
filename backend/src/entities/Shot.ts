import { Entity } from "./Entity";

export class Shot implements Entity {
	public id: number;
	public score = 0;
	public split = false;
	public color = "#FFFFFF";

	constructor(id: number, color?: string) {
		this.id = id;
		this.color = color || this.color;
	}
}
