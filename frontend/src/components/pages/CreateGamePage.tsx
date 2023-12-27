import { PageOutline, PageProps } from "../utils/PageOutline";
import { StringInput } from "../utils/StringInput";
import { useCallback } from "react";
import { MessageData } from "../../common/Message";
import { WebSocketClient } from "../../api/WebSocketClient";
import { Pages } from "../../common/Pages";
import "../../styles/CreateGamePage.css";

export const CreateGamePage = ({ setPage }: PageProps) => {
	const handleNameEntry = useCallback(
		(name: string) => {
			const changePageCB = (data: MessageData) => {
				if (data.data.success) {
					// TODO: handle singleton closed
					WebSocketClient.singleton!.gameName = data.data.data;
					setPage(Pages.GAME_LOBBY);
				}
				// TODO: Add error handling for failed name
				else {
				}
			};
			WebSocketClient.createGame(name, changePageCB);
		},
		[setPage]
	);
	return (
		<PageOutline title="Create Game">
			<div className="w-100 d-flex justify-content-center">
				<StringInput placeholder="Enter game name..." buttonText="create" onSubmit={handleNameEntry} />
			</div>
		</PageOutline>
	);
};
