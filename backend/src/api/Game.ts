import { Client } from "./Client";
import { Message, MessageType } from "./Message";
import { GameUtils } from "./GameUtils";

export class Game {
	public name: string;
	private clients: Array<Client> = [];
	private generateAsteroidInterval: number = 1000;

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

	start() {
		this.clients.forEach((client) => {
			const msg = new Message(MessageType.START_GAME, { data: {} });
			client.sendMessage(msg);
		});
		setInterval(() => {
			const { startPoint, theta, moveEntity, speed } = GameUtils.generateRandomEntity();
			const data = {
				data: {
					type: "asteroid",
					data: {
						speed,
						moveEntity,
						location: startPoint,
						angle: theta,
					},
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
