import { useEffect, useState, useCallback } from "react";
import { IdleScreenEngine } from "../../pixi/IdleScreenEngine";
import { ClientGameEngine } from "../../pixi/ClientGameEngine";
import { WebSocketClient } from "../../api/WebSocketClient";
import { MessageData, MessageType } from "../../common/Message";
import { Entity } from "../../pixi/Entity";
import { LifeBanner } from "../utils/LifeBanner";
import "../../styles/PlayGamePage.css";

const { innerHeight, innerWidth } = window;
const boardSize = Math.min(innerHeight, innerWidth) * 0.9;

export const PlayGamePage = () => {
	const [shipLives, setShipLives] = useState<any>({});
	const [score, setScore] = useState<number>(0);

	const setLivesCB = useCallback(
		(shipData: any) => {
			const { id, lives, color, name } = shipData;
			shipLives[id] = { lives, color, name };
			setShipLives({ ...shipLives });
		},
		[shipLives]
	);

	const setScoreCB = useCallback((score: number) => {
		setScore(score);
	}, []);

	useEffect(() => {
		ClientGameEngine.setSetLifeCB(setLivesCB);
		ClientGameEngine.setScoreCB(setScoreCB);
	}, [setLivesCB, setScoreCB]);

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
			>
				<div className="d-flex justify-content-between">
					<div>
						{Object.keys(shipLives).map((id: string) => {
							const { lives, name, color } = shipLives[id];
							return <LifeBanner lives={lives} name={name} color={color} />;
						})}
					</div>
					<div className="me-1">{score}</div>
				</div>
			</div>
		</div>
	);
};
