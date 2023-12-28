import { PageOutline, PageProps } from "../utils/PageOutline";
import { StringInput } from "../utils/StringInput";
import { WebSocketClient } from "../../api/WebSocketClient";
import { useCallback, useEffect } from "react";
import { IdleScreenEngine } from "../../pixi/IdleScreenEngine";
import { Pages } from "../../common/Pages";
import { MessageData } from "../../common/Message";
import { ToastContainer, toast } from "react-toastify";
import { TOAST_DISAPPEAR_OPTIONS } from "../utils/Toastify";
import { STRING_LENGTH_LIMIT } from "../utils/Sanitize";
import "react-toastify/dist/ReactToastify.css";

export const SetNamePage = ({ setPage }: PageProps) => {
	useEffect(() => {
		IdleScreenEngine.start();
	}, []);

	const changePageCB = useCallback(
		(data: MessageData) => {
			if (data.data.success) {
				WebSocketClient.singleton!.name = data.data.data.name;
				setPage(Pages.HOME_PAGE);
			} else {
				toast.error("Failed to set name.", TOAST_DISAPPEAR_OPTIONS);
			}
		},
		[setPage]
	);

	const handleNameEntry = useCallback(
		(name: string) => {
			if (name.length === 0) {
				console.log("test");
				toast.error("Name must be non-empty.", TOAST_DISAPPEAR_OPTIONS);
				return;
			} else if (name.length > STRING_LENGTH_LIMIT) {
				toast.error(
					`Name must be at most ${STRING_LENGTH_LIMIT} characters (${name.length}/${STRING_LENGTH_LIMIT})`,
					TOAST_DISAPPEAR_OPTIONS
				);
				return;
			}
			WebSocketClient.submitClientName(name, changePageCB);
		},
		[changePageCB]
	);

	return (
		<PageOutline title="Asteroids">
			<ToastContainer />
			<div className="w-100 d-flex justify-content-center">
				<StringInput placeholder="Enter player name..." buttonText="submit" onSubmit={handleNameEntry} />
			</div>
		</PageOutline>
	);
};
