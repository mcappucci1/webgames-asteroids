import { Client } from "./Client";
import { Message, MessageType } from "./Message";
import { GameUtils } from "./GameUtils";
import { AlienShip } from "./AlienShip";

export class Game {
	static maxId: number = 1000;
	public name: string;
	private clients: Array<Client> = [];
	private generateAsteroidInterval: number = 1000;
	private alienShips: Array<AlienShip> = [];
	private alienId: number = 0;
	private asteroidId: number = 0;
	private alienShotId: number = 0;

	constructor(name: string) {
		this.name = name;
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

	start() {
		this.clients.forEach((client) => {
			const msg = new Message(MessageType.START_GAME, { data: {} });
			client.sendMessage(msg);
		});
		setInterval(() => {
			if (Math.random() < 0.05) {
				this.generateAlienShip();
			}
			const asteroidData = GameUtils.generateRandomAsteroid();
			asteroidData.id = this.asteroidId;
			this.asteroidId = ++this.asteroidId % Game.maxId;
			const data = {
				data: {
					type: "asteroid",
					data: asteroidData,
				},
			};
			this.clients.forEach((client) => {
				const msg = new Message(MessageType.GAME_DATA, data);
				client.sendMessage(msg);
			});
		}, this.generateAsteroidInterval);
	}

	getInfo() {
		return {
			name: this.name,
			clients: this.clients.map((client) => client.name),
		};
	}
}
