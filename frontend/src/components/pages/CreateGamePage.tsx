import { PageOutline, PageProps } from "../utils/PageOutline";
import { StringInput } from "../utils/StringInput";
import { useCallback } from "react";
import { MessageData } from "../../common/Message";
import { WebSocketClient } from "../../api/WebSocketClient";
import { BackButton } from "../utils/BackButton";
import { Pages } from "../../common/Pages";
import { ToastContainer, toast } from "react-toastify";
import { TOAST_DISAPPEAR_OPTIONS } from "../utils/Toastify";
import { STRING_LENGTH_LIMIT } from "../utils/Sanitize";
import "../../styles/CreateGamePage.css";

export const CreateGamePage = ({ setPage }: PageProps) => {
	const changePageCB = useCallback(
		(data: MessageData) => {
			if (data.data.success && WebSocketClient.singleton != null) {
				WebSocketClient.singleton.gameName = data.data.data;
				setPage(Pages.GAME_LOBBY);
			} else {
				toast.error("Failed to create game.", TOAST_DISAPPEAR_OPTIONS);
			}
		},
		[setPage]
	);

	const handleNameEntry = useCallback(
		(name: string) => {
			if (name.length === 0) {
				toast.error("Name must be non-empty.", TOAST_DISAPPEAR_OPTIONS);
				return;
			} else if (name.length > STRING_LENGTH_LIMIT) {
				toast.error(
					`Name must be at most ${STRING_LENGTH_LIMIT} characters (${name.length}/${STRING_LENGTH_LIMIT})`,
					TOAST_DISAPPEAR_OPTIONS
				);
				return;
			}
			WebSocketClient.createGame(name, changePageCB);
		},
		[changePageCB]
	);

	return (
		<PageOutline title="Create Game">
			<ToastContainer />
			<div className="w-100 d-flex justify-content-center">
				<StringInput placeholder="Enter game name..." buttonText="create" onSubmit={handleNameEntry} />
			</div>
			<BackButton setPage={() => setPage(Pages.HOME_PAGE)} />
		</PageOutline>
	);
};
