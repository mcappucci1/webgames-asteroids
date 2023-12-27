import { PageOutline, PageProps } from "../utils/PageOutline";
import { StringInput } from "../utils/StringInput";
import { WebSocketClient } from "../../api/WebSocketClient";
import { useCallback, useEffect } from "react";
import { IdleScreenEngine } from "../../pixi/IdleScreenEngine";
import { Pages } from "../../common/Pages";
import { MessageData } from "../../common/Message";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MAX_NAME_LENGTH = 15;

export const SetNamePage = ({ setPage }: PageProps) => {
	useEffect(() => {
		IdleScreenEngine.start();
	}, []);

	const setErrorMessage = useCallback((errorMsg: string) => {
		toast.error(errorMsg, {
			position: "top-center",
			autoClose: 5000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			progress: undefined,
			theme: "dark",
		});
	}, []);

	const changePageCB = useCallback(
		(data: MessageData) => {
			if (data.data.success) {
				WebSocketClient.singleton!.name = data.data.data.name;
				setPage(Pages.HOME_PAGE);
			} else {
				setErrorMessage("Failed to set name.");
			}
		},
		[setPage, setErrorMessage]
	);

	const handleNameEntry = useCallback(
		(name: string) => {
			if (name.length === 0) {
				setErrorMessage("Name must be non-empty.");
				return;
			} else if (name.length > MAX_NAME_LENGTH) {
				setErrorMessage(`Name must be at most 15 characters (${name.length}/${MAX_NAME_LENGTH})`);
				return;
			}
			WebSocketClient.submitClientName(name, changePageCB);
		},
		[changePageCB, setErrorMessage]
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
