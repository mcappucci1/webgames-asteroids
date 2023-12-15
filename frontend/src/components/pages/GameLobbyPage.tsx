import { PageOutline, PageProps } from "../utils/PageOutline";
import { WebSocketClient } from "../../api/WebSocketClient";
import { useEffect, useState, useCallback } from "react";
import { MessageData, MessageType } from "../../common/Message";
import { Pages } from "../../common/Pages";
import { Spinner } from "../utils/Spinner";
import "../../styles/GameLobbyPage.css";

export const GameLobbyPage = ({ setPage }: PageProps) => {
	const [gameInfo, setGameInfo] = useState<any | undefined>(undefined);
	const startGameCB = useCallback(() => {
		WebSocketClient.addMessageHandler(MessageType.GAME_DATA, () => setPage(Pages.PLAY_GAME));
		WebSocketClient.startGame();
	}, []);
	useEffect(() => {
		const getGameDataCB = (data: MessageData) => {
			// TODO: Handle failure
			setGameInfo(data.data.data);
		};
		if (gameInfo == null) {
			WebSocketClient.addMessageHandler(MessageType.START_GAME, () => setPage(Pages.PLAY_GAME));
			WebSocketClient.getGameInfo(getGameDataCB);
		}
	}, [gameInfo, setPage]);
	return (
		<PageOutline title="Game Lobby">
			{gameInfo == null ? (
				<div className="pt-5 d-flex justify-content-center">
					<Spinner />
				</div>
			) : (
				<div>
					<div className="ms-3 mt-4">
						<h2>
							<span className="bold">Game: </span>
							{gameInfo.name}
						</h2>
						<h2 className="bold mt-4">Players:</h2>
						<ol className="ms-3 mt-3">
							{gameInfo.clients.map((client: string) => (
								<li className="large-text">{client}</li>
							))}
						</ol>
					</div>
					<div className="mt-5 me-3 d-flex justify-content-end">
						<button className="custom-button" onClick={startGameCB}>
							Start Game
						</button>
					</div>
				</div>
			)}
		</PageOutline>
	);
};
