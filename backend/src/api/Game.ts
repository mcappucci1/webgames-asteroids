import { Client } from "./Client";

export class Game {
	public name: string;
	private clients: Array<Client> = [];

	constructor(name: string) {
		this.name = name;
	}

	addClient(client: Client) {
		this.clients.push(client);
	}

	start() {
		setInterval(() => {
			this.clients.forEach((client) => {
				client.sendMessage({ data: "test" });
			});
		}, 1000);
	}
}
