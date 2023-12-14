import { Client } from "./Client";
import { Message, MessageType } from "./Message";

export class Game {
	public name: string;
	private clients: Array<Client> = [];

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
		setInterval(() => {
			this.clients.forEach((client) => {
				console.log(client.name);
				client.sendMessage({ data: "test" });
			});
		}, 1000);
	}

	getInfo() {
		return {
			name: this.name,
			clients: this.clients.map((client) => client.name),
		};
	}
}
