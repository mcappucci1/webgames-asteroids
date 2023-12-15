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
}

export type MessageData = {
	data: any;
};
