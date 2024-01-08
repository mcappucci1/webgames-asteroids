import { Message, MessageType, MessageData } from "../common/Message";
import { ClientGameEngine } from "../pixi/ClientGameEngine";
import { Entity } from "../pixi/Entity";

export class WebSocketClient {
	static singleton: WebSocketClient | undefined = undefined;
	static maxRetryCount: number = 3;
	private retryCount: number = 0;
	private ws: WebSocket | undefined;
	private cbs: Map<MessageType, Function>;
	private ready: boolean = false;
	private id: number | undefined;
	public name: string | undefined;
	public gameName: string | undefined;

	constructor(cb: Function) {
		this.ws = undefined;
		this.cbs = new Map();
		this.cbs.set(MessageType.CONNECTION_LOST, cb);
		this.cbs.set(MessageType.SET_CLIENT_ID, (data: MessageData) => (this.id = data.data.data.id));
		this.initializeWebsocket();
	}

	static initializeSingleton(cb: Function) {
		this.singleton = new WebSocketClient(cb);
	}

	static getClientId() {
		return WebSocketClient.singleton?.id;
	}

	initializeWebsocket() {
		this.ws = new WebSocket(`ws://${window.location.hostname}:4000`);
		this.ws.onopen = () => (this.ready = true);
		this.ws.onmessage = (event: MessageEvent<any>) => this.receivedMessage(event.data);
		this.ws.onerror = (ex) => {
			this.ready = false;
			console.warn("Connecting to backend failed");
			console.error(ex);
			if (this.retryCount++ < WebSocketClient.maxRetryCount) {
				console.warn(`Connection retry: (${this.retryCount}/${WebSocketClient.maxRetryCount})`);
				this.initializeWebsocket();
			} else {
				const cb = this.cbs.get(MessageType.CONNECTION_LOST)!;
				cb({ data: { success: false, error: "Client connection error occurred" } });
			}
		};
		this.ws.onclose = () => {
			if (this.ready) {
				const cb = this.cbs.get(MessageType.CONNECTION_LOST)!;
				cb({ data: { success: false, error: "Client connection error occurred" } });
			}
			this.ready = false;
		};
	}

	receivedMessage(msg: string) {
		const parsedMsg = JSON.parse(msg) as Message;
		const { msgType, data } = parsedMsg;
		const cb = this.cbs.get(msgType);
		if (cb != null) {
			cb(data);
		}
	}

	static addMessageHandler(msgType: MessageType, cb: Function) {
		WebSocketClient.singleton?.cbs.set(msgType, cb);
	}

	static singletonReady() {
		return WebSocketClient.singleton != null && this.singleton?.ws != null && this.singleton.ready;
	}

	static immediateError(err: string, type: MessageType, cb: Function) {
		const responseData = { data: { success: false, error: err } };
		const response = new Message(type, responseData);
		setTimeout(() => cb(response), 0);
	}

	static sendMessage(type: MessageType, data: MessageData, cb?: Function) {
		if (cb != null) {
			this.singleton?.cbs.set(type, cb);
		}
		const msg = new Message(type, data);
		this.singleton?.ws?.send(JSON.stringify(msg));
	}

	static submitClientName(name: string, cb: Function) {
		if (!WebSocketClient.singletonReady()) {
			WebSocketClient.immediateError("Client not initialized", MessageType.SET_CLIENT_NAME, cb);
			return;
		}
		WebSocketClient.sendMessage(MessageType.SET_CLIENT_NAME, { data: name }, cb);
	}

	static removeClientFromGame(cb: Function) {
		if (!WebSocketClient.singletonReady() || this.singleton?.gameName == null) {
			WebSocketClient.immediateError("Cannot disconnect from game", MessageType.REMOVE_CLIENT_FROM_GAME, cb);
			return;
		}
		WebSocketClient.sendMessage(MessageType.REMOVE_CLIENT_FROM_GAME, { data: undefined }, cb);
	}

	static createGame(name: string, cb: Function) {
		if (!WebSocketClient.singletonReady()) {
			WebSocketClient.immediateError("Client not initialized", MessageType.CREATE_GAME, cb);
			return;
		}
		WebSocketClient.sendMessage(MessageType.CREATE_GAME, { data: name }, cb);
	}

	static joinGame(name: string, cb: Function) {
		if (!WebSocketClient.singletonReady()) {
			WebSocketClient.immediateError("Client not initialized", MessageType.ADD_CLIENT_TO_GAME, cb);
			return;
		} else if (!WebSocketClient.singleton?.name) {
			WebSocketClient.immediateError("Client name not set", MessageType.ADD_CLIENT_TO_GAME, cb);
			return;
		}
		WebSocketClient.sendMessage(MessageType.ADD_CLIENT_TO_GAME, { data: { gameName: name } }, cb);
	}

	static getGameInfo(cb: Function) {
		if (!WebSocketClient.singletonReady()) {
			WebSocketClient.immediateError("Client not initialized", MessageType.GET_GAME_INFO, cb);
			return;
		}
		this.singleton?.cbs.set(MessageType.GET_GAME_INFO, cb);
		WebSocketClient.sendMessage(MessageType.GET_GAME_INFO, { data: WebSocketClient.singleton?.gameName }, cb);
	}

	static startGame(cb: Function) {
		this.sendMessage(MessageType.START_GAME, { data: {} }, cb);
	}

	static setShipKeyDown(down: boolean, key: string, id: number) {
		if (!WebSocketClient.singletonReady()) {
			return;
		}
		const data = { data: { type: "ship", data: { action: "keypress", down, key, id } } };
		WebSocketClient.sendMessage(MessageType.GAME_DATA, data);
	}

	static signalDestory(entity: Entity) {
		if (!WebSocketClient.singletonReady()) {
			return;
		}
		const { id, graphic } = entity;
		const [width, height] = ClientGameEngine.getSize();
		const data = {
			data: {
				type: "destroy",
				id,
				location: [graphic.x / width, graphic.y / height],
			},
		};
		WebSocketClient.sendMessage(MessageType.GAME_DATA, data);
	}
}
