export type EntityData = {
	id: number;
	startPoint: Array<number>;
	theta: number;
	moveEntity: Array<number>;
	speed: number;
	scale?: number;
	style?: number;
	shipId?: number;
};

export type EntityGameData = {
	id: number;
	down: boolean;
	key: string;
	action: string;
};
