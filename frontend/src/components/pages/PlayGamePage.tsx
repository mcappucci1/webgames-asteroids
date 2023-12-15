import { useEffect } from "react";
import { IdleScreenEngine } from "../../pixi/IdleScreenEngine";
import { ClientGameEngine } from "../../pixi/ClientGameEngine";
import { WebSocketClient } from "../../api/WebSocketClient";
import { MessageData, MessageType } from "../../common/Message";

export const PlayGamePage = () => {
	useEffect(() => {
		WebSocketClient.addMessageHandler(MessageType.GAME_DATA, (data: MessageData) =>
			ClientGameEngine.handleMessage(data)
		);
		IdleScreenEngine.stop();
		ClientGameEngine.start();
	}, []);
	return <div>test</div>;
};
