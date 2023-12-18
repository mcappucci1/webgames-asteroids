import { Client } from "./Client";
import { Message, MessageType, MessageData } from "./Message";
import { GameUtils } from "./GameUtils";
import { AlienShip } from "./AlienShip";
import { Ship } from "./Ship";

export class Game {
	static maxId: number = 1000;
	public name: string;
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

	setShipData(data: MessageData) {
		const { type } = data.data;
		if (type === "ship") {
			const { id, down, key } = data.data;
			const msgData = {
				data: { type: "ship", data: { action: "keypress", id, down, key } },
			};
			console.log("test");
			console.log(msgData);
			this.clients.forEach((client) => {
				client.sendMessage(new Message(MessageType.GAME_DATA, msgData));
			});
		}
	}

	addClient(client: Client) {
		this.clients.push(client);
		const responseData = { data: { success: true, error: null, data: this.getInfo() } };
		for (const client of this.clients) {
			const response = new Message(MessageType.GET_GAME_INFO, responseData);
			client.sendMessage(response);
		}
	}

	generateAlienShip() {
		const alienShipData = GameUtils.generateRandomEntity();
		alienShipData.id = this.alienId;
		this.alienShips.push(new AlienShip(this.alienId, (shipId: number) => this.generateAlienShot(shipId)));
		this.alienId = ++this.alienId % Game.maxId;
		const alienShipMsg = {
			data: { type: "alienShip", data: alienShipData },
		};
		this.clients.forEach((client) => {
			const msg = new Message(MessageType.GAME_DATA, alienShipMsg);
			client.sendMessage(msg);
		});
	}

	generateAlienShot(shipId: number) {
		const alienShotData = GameUtils.generateRandomEntity() as any;
		alienShotData.shipId = shipId;
		alienShotData.id = this.alienShotId;
		this.alienShotId = ++this.alienShotId % Game.maxId;
		const alienShotMsg = {
			data: {
				type: "alienShot",
				data: alienShotData,
			},
		};
		this.clients.forEach((client) => {
			const msg = new Message(MessageType.GAME_DATA, alienShotMsg);
			client.sendMessage(msg);
		});
	}

	generateAsteroids() {
		const asteroidData = GameUtils.generateRandomAsteroid();
		asteroidData.id = this.asteroidId;
		this.asteroidId = ++this.asteroidId % Game.maxId;
		const data = {
			data: { type: "asteroid", data: asteroidData },
		};
		this.clients.forEach((client) => {
			const msg = new Message(MessageType.GAME_DATA, data);
			client.sendMessage(msg);
		});
	}

	generateClientShips() {
		const diff = 1 / (this.clients.length + 1);
		const data = {
			data: {
				type: "ship",
				data: { speed: 10, position: [0, 1], theta: Math.PI / 4, moveEntity: [0, 1], id: 0 },
			},
		};
		this.clients.forEach((client, i) => {
			this.ships.push(new Ship(i));
			data.data.data.position[0] = diff * (i + 1);
			data.data.data.id = i;
			const msg = new Message(MessageType.GAME_DATA, data);
			client.sendMessage(msg);
		});
	}

	start() {
		this.clients.forEach((client, i) => {
			const msg = new Message(MessageType.START_GAME, { data: {} });
			client.sendMessage(msg);
		});
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
