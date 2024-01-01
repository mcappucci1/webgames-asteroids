import { useEffect } from "react";
import { IdleScreenEngine } from "../../pixi/IdleScreenEngine";
import { ClientGameEngine } from "../../pixi/ClientGameEngine";
import { WebSocketClient } from "../../api/WebSocketClient";
import { MessageData, MessageType } from "../../common/Message";
import { Entity } from "../../pixi/Entity";
import "../../styles/PlayGamePage.css";

const { innerHeight, innerWidth } = window;
const boardSize = Math.min(innerHeight, innerWidth) * 0.9;

export const PlayGamePage = () => {
	useEffect(() => {
		IdleScreenEngine.stop();
		ClientGameEngine.start();
		ClientGameEngine.setBoardSize(boardSize, boardSize);
		ClientGameEngine.setBoardPosition((innerWidth - boardSize) / 2, (innerHeight - boardSize) / 2);
		Entity.screenMultiplier = boardSize / 1000;
		WebSocketClient.addMessageHandler(MessageType.GAME_DATA, (data: MessageData) =>
			ClientGameEngine.handleMessage(data)
		);
	}, []);

	return (
		<div className="bg-transparent w-100 h-100 d-flex justify-content-center align-items-center">
			<div
				id="game-board"
				className="bg-transparent"
				style={{ width: `${boardSize}px`, height: `${boardSize}px` }}
			></div>
		</div>
	);
};
