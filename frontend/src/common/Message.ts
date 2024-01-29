export class Message {
	public msgType: MessageType;
	public data: MessageData;

	constructor(msgType: MessageType, data: MessageData) {
		this.msgType = msgType;
		this.data = data;
	}
}

export enum MessageType {
	CREATE_CLIENT,
	SET_CLIENT_NAME,
	CREATE_GAME,
	ADD_CLIENT_TO_GAME,
	START_GAME,
	GET_GAME_INFO,
	GAME_DATA,
	CONNECTION_LOST,
	REMOVE_CLIENT_FROM_GAME,
	SET_CLIENT_ID,
	END_GAME,
}

export type MessageData = {
	data: any;
};
