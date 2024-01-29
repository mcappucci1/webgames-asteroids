import { Client } from "./Client";
import { MessageType, MessageData } from "./Message";
import { GameUtils } from "../entities/GameUtils";
import { AlienShip } from "../entities/AlienShip";
import { Shot } from "../entities/Shot";
import { Asteroid } from "../entities/Asteroid";
import { Ship } from "../entities/Ship";
import { Controller } from "./Controller";

export class Game {
	static maxClients: number = 6;
	static maxId: number = 1000;
	static shipColors = [0x8888ff, 0xffff00, 0xff00ff, 0x00ffff, 0xff0000, 0x00ff00, 0x0000ff, 0xff8888];

	private controller: Controller;
	private name: string;
	private started: boolean = false;
	private clients: Array<Client> = [];
	private generateAsteroidInterval: number = 1000;
	private entityId: number = 0;
	private entityIds = new Map();
	private score: number = 0;
	private gameStartTimeout: NodeJS.Timeout | undefined;
	private gameInterval: NodeJS.Timeout | undefined;
	private liveShips = 0;

	constructor(name: string, controller: Controller) {
		this.name = name;
		this.controller = controller;
	}

	shipHandler(data: any) {
		for (const client of this.clients) {
			client.sendMessage(true, undefined, MessageType.GAME_DATA, data);
		}
	}

	destroyAsteroidHandler(entity: any, data: any) {
		const entities = entity.splitEntity(data.location);
		for (const entity of entities) {
			entity.id = this.entityId;
			const { style, scale, speed, theta } = entity;
			const asteroid = new Asteroid(this.entityId, scale!, speed, theta, style!);
			this.entityIds.set(this.entityId, asteroid);
			this.entityId = ++this.entityId % Game.maxId;
			const data = {
				type: "asteroid",
				data: entity,
			};
			for (const client of this.clients) {
				client.sendMessage(true, undefined, MessageType.GAME_DATA, data);
			}
		}
	}

	destroyShipHandler(entity: any, id: any) {
		entity.lives -= 1;
		const i = this.clients.findIndex((client) => client.getId() === id);
		this.updateLives(entity.id, entity.lives, this.clients[i].color, entity.name!);
		if (entity.lives > 0) {
			const ship = this.generateClientShip(this.clients[i], this.clients[i].color, [0.5, 1], entity.lives);
			const data = {
				type: "ship",
				data: {
					action: "createShips",
					ships: [ship],
				},
			};
			for (const client of this.clients) {
				client.sendMessage(true, undefined, MessageType.GAME_DATA, data);
			}
		} else {
			this.entityIds.delete(entity.id);
			--this.liveShips;
			if (this.liveShips === 0) {
				this.stop();
			}
		}
	}

	destroyHandler(data: any) {
		const { id, countScore } = data;
		const entity = this.entityIds.get(id);
		if (entity == null) {
			return;
		}
		this.entityIds.delete(id);
		if (entity instanceof AlienShip) {
			entity.destroy();
		}
		if (!countScore) {
			return;
		}
		this.score += entity.score;
		if (entity.split && entity.canSplit()) {
			this.destroyAsteroidHandler(entity, data);
		} else if (entity instanceof Ship) {
			this.destroyShipHandler(entity, id);
		}
		const msgData = {
			type: "score",
			data: this.score,
		};
		for (const client of this.clients) {
			client.sendMessage(true, undefined, MessageType.GAME_DATA, msgData);
		}
	}

	gameDataMsgHandler(data: MessageData) {
		const { type } = data.data;
		if (type === "ship") {
			this.shipHandler(data.data);
		} else if (type === "destroy") {
			this.destroyHandler(data.data);
		}
	}

	addClient(client: Client): boolean {
		if (this.clients.length === Game.maxClients || this.started) {
			return false;
		}
		client.setGame(this);
		this.clients.push(client);
		const responseData = this.getInfo();
		for (const client of this.clients) {
			client.sendMessage(true, undefined, MessageType.GET_GAME_INFO, responseData);
		}
		return true;
	}

	removeClient(client: Client): boolean {
		const i = this.clients.indexOf(client);
		if (i === -1) {
			return false;
		}
		this.clients.splice(i, 1);
		client.setGame(undefined);
		const responseData = this.getInfo();
		for (const client of this.clients) {
			client.sendMessage(true, undefined, MessageType.GET_GAME_INFO, responseData);
		}
		const data = {
			type: "ship",
			data: {
				action: "removeShip",
				id: client.getId(),
			},
		};
		for (const client of this.clients) {
			client.sendMessage(true, undefined, MessageType.GAME_DATA, data);
		}
		this.updateLives(client.getId(), 0, client.color, client.name!);
		if (this.clients.length === 0) {
			this.destroy();
		}
		return true;
	}

	generateAlienShip() {
		const alienShipData = GameUtils.generateRandomEntity();
		alienShipData.id = this.entityId;
		this.entityIds.set(
			this.entityId,
			new AlienShip(this.entityId, (shipId: number) => this.generateAlienShot(shipId))
		);
		this.entityId = ++this.entityId % Game.maxId;
		const alienShipMsg = {
			type: "alienShip",
			data: alienShipData,
		};
		for (const client of this.clients) {
			client.sendMessage(true, undefined, MessageType.GAME_DATA, alienShipMsg);
		}
	}

	generateAlienShot(shipId: number) {
		const alienShotData = GameUtils.generateRandomEntity();
		alienShotData.shipId = shipId;
		alienShotData.id = this.entityId;

		this.entityId = ++this.entityId % Game.maxId;

		const alienShotMsgData = {
			type: "alienShot",
			data: alienShotData,
		};

		for (const client of this.clients) {
			client.sendMessage(true, undefined, MessageType.GAME_DATA, alienShotMsgData);
		}
	}

	generateAsteroids() {
		const asteroidData = GameUtils.generateRandomAsteroid();
		asteroidData.id = this.entityId;
		const { style, scale, speed, theta } = asteroidData;
		const asteroid = new Asteroid(this.entityId, scale!, speed, theta, style!);
		this.entityIds.set(this.entityId, asteroid);
		this.entityId = ++this.entityId % Game.maxId;
		const data = {
			type: "asteroid",
			data: asteroidData,
		};
		for (const client of this.clients) {
			client.sendMessage(true, undefined, MessageType.GAME_DATA, data);
		}
	}

	updateLives(id: number, lives: number, color: number, name: string) {
		const livesData = { type: "lives", data: { id, lives, color, name } };
		for (const client of this.clients) {
			client.sendMessage(true, undefined, MessageType.GAME_DATA, livesData);
		}
	}

	generateClientShip(client: Client, color: number, position: number[], lives = 3) {
		const ship = {
			id: client.getId(),
			speed: 2,
			lives: lives,
			moveEntity: [0, 1],
			color: color,
			name: client.name,
			theta: (3 * Math.PI) / 2,
			position: position,
		};
		this.entityIds.set(client.getId(), new Ship(client.getId(), client.name!, lives));
		return ship;
	}

	generateClientShips() {
		const diff = 1 / (this.clients.length + 1);
		const ships = [];
		for (let i = 0; i < this.clients.length; ++i) {
			this.clients[i].color = Game.shipColors[i];
			ships.push(this.generateClientShip(this.clients[i], this.clients[i].color, [diff * (i + 1), 0.95]));
		}
		const data = {
			type: "ship",
			data: {
				action: "createShips",
				ships,
			},
		};
		for (const ship of ships) {
			this.updateLives(ship.id, ship.lives, ship.color, ship.name!);
		}
		for (const client of this.clients) {
			client.sendMessage(true, undefined, MessageType.GAME_DATA, data);
		}
	}

	start(delayMs = 0) {
		if (this.started) {
			return;
		}
		this.started = true;
		this.liveShips = this.clients.length;
		this.entityId = 0;
		this.entityIds = new Map();
		this.score = 0;

		for (const client of this.clients) {
			client.sendMessage(true, undefined, MessageType.START_GAME, undefined);
		}
		this.gameStartTimeout = setTimeout(() => {
			this.generateClientShips();

			this.gameInterval = setInterval(() => {
				if (Math.random() < 0.05) {
					this.generateAlienShip();
				}
				this.generateAsteroids();
			}, this.generateAsteroidInterval);
			this.gameStartTimeout = undefined;
		}, delayMs);
	}

	stop() {
		if (this.started) {
			const data = {
				score: this.score,
			};
			for (const client of this.clients) {
				client.sendMessage(true, undefined, MessageType.END_GAME, data);
			}
			for (const client of this.clients) {
				client;
			}
		}
		this.started = false;
		if (this.gameStartTimeout != null) {
			clearTimeout(this.gameStartTimeout);
			this.gameStartTimeout = undefined;
		}
		if (this.gameInterval != null) {
			clearInterval(this.gameInterval);
		}
		for (const entity of this.entityIds.values()) {
			if (entity instanceof AlienShip) {
				entity.destroy();
			}
		}
	}

	destroy() {
		if (this.gameStartTimeout != null) {
			clearTimeout(this.gameStartTimeout);
			this.gameStartTimeout = undefined;
		}
		if (this.gameInterval != null) {
			clearInterval(this.gameInterval);
		}
		for (const client of this.clients) {
			client.setGame(undefined);
		}
		for (const entity of this.entityIds.values()) {
			if (entity instanceof AlienShip) {
				entity.destroy();
			}
		}
		this.controller.removeGame(this.name);
	}

	getInfo() {
		return {
			name: this.name,
			clients: this.clients.map((client) => client.name),
		};
	}
}
