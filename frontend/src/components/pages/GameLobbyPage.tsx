import { PageOutline, PageProps } from "../utils/PageOutline";
import { WebSocketClient } from "../../api/WebSocketClient";
import { useEffect, useState, useCallback } from "react";
import { MessageData, MessageType } from "../../common/Message";
import { Pages } from "../../common/Pages";
import { Spinner } from "../utils/Spinner";
import { BackButton } from "../utils/BackButton";
import { toast, ToastContainer } from "react-toastify";
import { TOAST_DISAPPEAR_OPTIONS } from "../utils/Toastify";
import "../../styles/GameLobbyPage.css";

export const GameLobbyPage = ({ setPage }: PageProps) => {
	const [gameInfo, setGameInfo] = useState<any | undefined>(undefined);

	const handleLeaveGameCB = useCallback(
		(data: MessageData) => {
			if (data.data.success) {
				if (WebSocketClient.singleton != null) {
					WebSocketClient.singleton.gameName = undefined;
				}
				setPage(Pages.HOME_PAGE);
			} else {
				toast.error("Name must be non-empty.", TOAST_DISAPPEAR_OPTIONS);
			}
		},
		[setPage]
	);

	const handleStartGameCB = useCallback(
		(data: MessageData) => {
			if (data.data.success) {
				setPage(Pages.PLAY_GAME);
			} else {
				toast.error("Could not start game.", TOAST_DISAPPEAR_OPTIONS);
			}
		},
		[setPage]
	);

	const leaveGameCB = useCallback(() => {
		WebSocketClient.removeClientFromGame(handleLeaveGameCB);
	}, [handleLeaveGameCB]);

	const startGameCB = useCallback(() => {
		WebSocketClient.startGame(handleStartGameCB);
	}, [handleStartGameCB]);

	const getGameDataCB = useCallback((data: MessageData) => {
		if (data.data.success) {
			setGameInfo(data.data.data);
		} else {
		}
	}, []);

	useEffect(() => {
		if (gameInfo == null) {
			WebSocketClient.getGameInfo(getGameDataCB);
		}
		WebSocketClient.addMessageHandler(MessageType.START_GAME, handleStartGameCB);
	}, [gameInfo, setPage, getGameDataCB, handleStartGameCB]);

	return (
		<PageOutline title="Game Lobby">
			<ToastContainer />
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
							{gameInfo.clients.map((client: string, i: number) => (
								<li key={i} className="large-text">
									{client}
								</li>
							))}
						</ol>
					</div>
					<div className="mt-5 me-3 d-flex justify-content-between">
						<BackButton setPage={() => leaveGameCB()} />
						<button className="custom-button" onClick={startGameCB}>
							Start Game
						</button>
					</div>
				</div>
			)}
		</PageOutline>
	);
};
