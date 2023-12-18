import { Message, MessageType } from "../common/Message";

export class WebSocketClient {
	static singleton: WebSocketClient = new WebSocketClient();
	private ws: WebSocket;
	private cbs: Map<MessageType, Array<Function>>;
	private ready: boolean = false;
	public name: string | undefined;
	public gameName: string | undefined;

	constructor() {
		this.ws = new WebSocket("ws://localhost:4000");
		this.cbs = new Map();
		this.initializeWsListeners();
	}

	initializeWsListeners() {
		this.ws.onopen = () => {
			this.ready = true;
		};
		this.ws.onmessage = (event: MessageEvent<any>) => {
			this.receivedMessage(event.data);
		};
		this.ws.onerror = () => {
			console.log("error");
		};
		this.ws.onclose = () => {
			this.ready = false;
		};
	}

	receivedMessage(msg: string) {
		const parsedMsg = JSON.parse(msg) as Message;
		const { msgType, data } = parsedMsg;
		if (this.cbs.has(msgType)) {
			const arr = this.cbs.get(msgType)!;
			for (const cb of arr) {
				cb(data);
			}
			//this.cbs.delete(msgType);
		}
	}

	static addMessageHandler(msgType: MessageType, cb: Function) {
		WebSocketClient.singleton.cbs.set(msgType, [cb]);
	}

	static submitClientName(name: string, cb: Function) {
		if (WebSocketClient.singleton == null) {
			const responseData = { data: { success: false, error: "Client not initialized" } };
			const response = new Message(MessageType.SET_CLIENT_NAME, responseData);
			cb(response);
			return;
		}
		if (!this.singleton.cbs.has(MessageType.SET_CLIENT_NAME)) {
			this.singleton.cbs.set(MessageType.SET_CLIENT_NAME, []);
		}
		this.singleton.cbs.get(MessageType.SET_CLIENT_NAME)!.push(cb);
		const msg = new Message(MessageType.SET_CLIENT_NAME, { data: name });
		this.singleton.ws.send(JSON.stringify(msg));
	}

	static createGame(name: string, cb: Function) {
		if (WebSocketClient.singleton == null) {
			const responseData = { data: { success: false, error: "Client not initialized" } };
			const response = new Message(MessageType.CREATE_GAME, responseData);
			cb(response);
			return;
		}
		if (!this.singleton.cbs.has(MessageType.CREATE_GAME)) {
			this.singleton.cbs.set(MessageType.CREATE_GAME, []);
		}
		this.singleton.cbs.get(MessageType.CREATE_GAME)!.push(cb);
		const msg = new Message(MessageType.CREATE_GAME, { data: name });
		this.singleton.ws.send(JSON.stringify(msg));
	}

	static joinGame(name: string, cb: Function) {
		if (WebSocketClient.singleton == null) {
			const responseData = { data: { success: false, error: "Client not initialized" } };
			const response = new Message(MessageType.ADD_CLIENT_TO_GAME, responseData);
			cb(response);
			return;
		} else if (!WebSocketClient.singleton.name) {
			const responseData = {
				data: {
					success: false,
					error: "Set client name",
				},
			};
			const response = new Message(MessageType.ADD_CLIENT_TO_GAME, responseData);
			cb(response);
			return;
		}
		if (!this.singleton.cbs.has(MessageType.ADD_CLIENT_TO_GAME)) {
			this.singleton.cbs.set(MessageType.ADD_CLIENT_TO_GAME, []);
		}
		this.singleton.cbs.get(MessageType.ADD_CLIENT_TO_GAME)!.push(cb);
		const msgData = {
			data: {
				gameName: name,
			},
		};
		const msg = new Message(MessageType.ADD_CLIENT_TO_GAME, msgData);
		this.singleton.ws.send(JSON.stringify(msg));
	}

	static getGameInfo(cb: Function) {
		if (!WebSocketClient.singleton.ready || WebSocketClient.singleton.gameName == null) {
			const responseData = { data: { success: false, error: "Client not initialized" } };
			const response = new Message(MessageType.GET_GAME_INFO, responseData);
			cb(response);
			return;
		}
		if (!this.singleton.cbs.has(MessageType.GET_GAME_INFO)) {
			this.singleton.cbs.set(MessageType.GET_GAME_INFO, []);
		}
		this.singleton.cbs.get(MessageType.GET_GAME_INFO)!.push(cb);
		const msg = new Message(MessageType.GET_GAME_INFO, { data: WebSocketClient.singleton.gameName });
		this.singleton.ws.send(JSON.stringify(msg));
	}

	static startGame() {
		const msg = new Message(MessageType.START_GAME, { data: {} });
		this.singleton.ws.send(JSON.stringify(msg));
	}

	static setShipKeyDown(down: boolean, key: string, id: number) {
		if (!WebSocketClient.singleton.ready || WebSocketClient.singleton.gameName == null) {
			return;
		}
		const gameData = {
			data: {
				type: "ship",
				down,
				key,
				id,
			},
		};
		const msg = new Message(MessageType.GAME_DATA, gameData);
		this.singleton.ws.send(JSON.stringify(msg));
	}
}
