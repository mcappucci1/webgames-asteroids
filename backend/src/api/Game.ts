import { Client } from "./Client";
import { MessageType, MessageData } from "./Message";
import { GameUtils } from "./GameUtils";
import { AlienShip } from "./AlienShip";
import { Ship } from "./Ship";
import { EntityGameData } from "./EntityData";
import { Controller } from "./Controller";

export class Game {
	static maxClients: number = 8;
	static maxId: number = 1000;

	private controller: Controller;
	private name: string;
	private started: boolean = false;
	private clients: Array<Client> = [];
	private generateAsteroidInterval: number = 1000;
	private alienShips: Array<AlienShip> = [];
	private alienId: number = 0;
	private asteroidId: number = 0;
	private alienShotId: number = 0;
	private ships: Array<Ship> = [];

	constructor(name: string, controller: Controller) {
		this.name = name;
		this.controller = controller;
	}

	setShipData(data: MessageData) {
		for (const client of this.clients) {
			client.sendMessage(true, undefined, MessageType.GAME_DATA, data);
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
		if (this.clients.length === 0) {
			this.destroy();
		}
		return true;
	}

	generateAlienShip() {
		const alienShipData = GameUtils.generateRandomEntity();
		alienShipData.id = this.alienId;
		this.alienShips.push(new AlienShip(this.alienId, (shipId: number) => this.generateAlienShot(shipId)));
		this.alienId = ++this.alienId % Game.maxId;
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
		alienShotData.id = this.alienShotId;

		this.alienShotId = ++this.alienShotId % Game.maxId;

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
		asteroidData.id = this.asteroidId;
		this.asteroidId = ++this.asteroidId % Game.maxId;
		const data = {
			type: "asteroid",
			data: asteroidData,
		};
		for (const client of this.clients) {
			client.sendMessage(true, undefined, MessageType.GAME_DATA, data);
		}
	}

	generateClientShips() {
		const diff = 1 / (this.clients.length + 1);
		const data = {
			type: "ship",
			data: {
				speed: 10,
				position: [0, 1],
				theta: (3 * Math.PI) / 2,
				moveEntity: [0, 1],
				id: 0,
			},
		};

		for (let i = 0; i < this.clients.length; ++i) {
			this.ships.push(new Ship(i));
			data.data.position[0] = diff * (i + 1);
			data.data.id = i;
			this.clients[i].sendMessage(true, undefined, MessageType.GAME_DATA, data);
		}
	}

	start() {
		if (this.started) {
			return;
		}
		this.started = true;

		for (const client of this.clients) {
			client.sendMessage(true, undefined, MessageType.START_GAME, undefined);
		}

		this.generateClientShips();

		setInterval(() => {
			if (Math.random() < 0) {
				this.generateAlienShip();
			}
			this.generateAsteroids();
		}, this.generateAsteroidInterval);
	}

	destroy() {
		if (this.generateAsteroidInterval != null) {
			clearInterval(this.generateAsteroidInterval);
		}
		for (const client of this.clients) {
			client.setGame(undefined);
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
