import { Entity } from "./Entity";

export class Ship implements Entity {
	public id: number;
	public score = 0;
	public split = false;
	public lives: number;
	public name: string;

	constructor(id: number, name: string, lives = 3) {
		this.id = id;
		this.name = name;
		this.lives = lives;
	}
}
