import { PageOutline, PageProps } from "../utils/PageOutline";
import { StringInput } from "../utils/StringInput";
import { useCallback } from "react";
import { MessageData } from "../../common/Message";
import { WebSocketClient } from "../../api/WebSocketClient";
import { Pages } from "../../common/Pages";
import { BackButton } from "../utils/BackButton";
import { ToastContainer, toast } from "react-toastify";
import { TOAST_DISAPPEAR_OPTIONS } from "../utils/Toastify";
import "../../styles/CreateGamePage.css";

export const JoinGamePage = ({ setPage }: PageProps) => {
	const handleNameEntry = useCallback(
		(name: string) => {
			const changePageCB = (data: MessageData) => {
				if (data.data.success && WebSocketClient.singleton != null) {
					WebSocketClient.singleton.gameName = data.data.data;
					setPage(Pages.GAME_LOBBY);
				} else {
					toast.error("Failed to join game.", TOAST_DISAPPEAR_OPTIONS);
				}
			};
			WebSocketClient.joinGame(name, changePageCB);
		},
		[setPage]
	);

	return (
		<PageOutline title="Join Game">
			<ToastContainer />
			<div className="w-100 d-flex justify-content-center">
				<StringInput placeholder="Enter game name..." buttonText="join" onSubmit={handleNameEntry} />
			</div>
			<BackButton className="mt-5" setPage={() => setPage(Pages.HOME_PAGE)} />
		</PageOutline>
	);
};
