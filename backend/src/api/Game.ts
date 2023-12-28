import { Client } from "./Client";
import { MessageType } from "./Message";
import { GameUtils } from "./GameUtils";
import { AlienShip } from "./AlienShip";
import { Ship } from "./Ship";
import { EntityGameData } from "./EntityData";

export class Game {
	static maxClients: number = 8;
	static maxId: number = 1000;

	private name: string;
	private started: boolean = false;
	private clients: Array<Client> = [];
	private generateAsteroidInterval: number = 1000;
	private alienShips: Array<AlienShip> = [];
	private alienId: number = 0;
	private asteroidId: number = 0;
	private alienShotId: number = 0;
	private ships: Array<Ship> = [];

	constructor(name: string) {
		this.name = name;
	}

	setShipData(data: EntityGameData) {
		for (const client of this.clients) {
			client.sendMessage(true, undefined, MessageType.GAME_DATA, { data });
		}
	}

	addClient(client: Client): boolean {
		if (this.clients.length === Game.maxClients || this.started) {
			return false;
		}
		this.clients.push(client);
		const responseData = { data: this.getInfo() };
		for (const client of this.clients) {
			client.sendMessage(true, undefined, MessageType.GAME_DATA, responseData);
		}
		return true;
	}

	generateAlienShip() {
		const alienShipData = GameUtils.generateRandomEntity();
		alienShipData.id = this.alienId;
		this.alienShips.push(new AlienShip(this.alienId, (shipId: number) => this.generateAlienShot(shipId)));
		this.alienId = ++this.alienId % Game.maxId;
		const alienShipMsg = {
			data: { type: "alienShip", data: alienShipData },
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
			data: {
				type: "alienShot",
				data: alienShotData,
			},
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
			data: { type: "asteroid", data: asteroidData },
		};
		for (const client of this.clients) {
			client.sendMessage(true, undefined, MessageType.GAME_DATA, data);
		}
	}

	generateClientShips() {
		const diff = 1 / (this.clients.length + 1);
		const data = {
			data: {
				speed: 10,
				position: [0, 1],
				theta: Math.PI / 4,
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
			client.sendMessage(true, undefined, MessageType.START_GAME, { data: {} });
		}

		this.generateClientShips();

		setInterval(() => {
			if (Math.random() < 0.05) {
				this.generateAlienShip();
			}
			this.generateAsteroids();
		}, this.generateAsteroidInterval);
	}

	getInfo() {
		return {
			name: this.name,
			clients: this.clients.map((client) => client.name),
		};
	}
}
