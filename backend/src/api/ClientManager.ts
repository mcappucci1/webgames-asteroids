import { Client } from "./Client";

export class ClientManager {
	private clients: Array<Client> = [];

	add(client: Client) {
		this.clients.push(client);
	}
}
