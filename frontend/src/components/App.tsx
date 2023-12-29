import { useState, useEffect, useCallback } from "react";
import { Pages } from "../common/Pages";
import { CreateOrJoinPage } from "./pages/CreateOrJoinPage";
import { CreateGamePage } from "./pages/CreateGamePage";
import { JoinGamePage } from "./pages/JoinGamePage";
import { SetNamePage } from "./pages/SetNamePage";
import { GameLobbyPage } from "./pages/GameLobbyPage";
import { PlayGamePage } from "./pages/PlayGamePage";
import { MessageData } from "../common/Message";
import { WebSocketClient } from "../api/WebSocketClient";
import { toast } from "react-toastify";
import { TOAST_PERMANENT_OPTIONS } from "./utils/Toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/App.css";

export function App() {
	const [page, setPage] = useState<Pages>(Pages.SET_NAME_PAGE);

	const showErrorToast = useCallback((data: MessageData) => {
		if (!data.data.success) {
			console.log("test");
			toast.error("Cannot connect to backend. Refresh page.", TOAST_PERMANENT_OPTIONS);
		}
	}, []);

	useEffect(() => {
		WebSocketClient.initializeSingleton(showErrorToast);
	}, [showErrorToast]);

	let pageCmp = undefined;
	if (page === Pages.HOME_PAGE) {
		pageCmp = <CreateOrJoinPage setPage={setPage} />;
	} else if (page === Pages.JOIN_PAGE) {
		pageCmp = <JoinGamePage setPage={setPage} />;
	} else if (page === Pages.CREATE_PAGE) {
		pageCmp = <CreateGamePage setPage={setPage} />;
	} else if (page === Pages.SET_NAME_PAGE) {
		pageCmp = <SetNamePage setPage={setPage} />;
	} else if (page === Pages.GAME_LOBBY) {
		pageCmp = <GameLobbyPage setPage={setPage} />;
	} else if (page === Pages.PLAY_GAME) {
		pageCmp = <PlayGamePage />;
	}

	return (
		<div id="background" className="d-flex text-white">
			{pageCmp}
		</div>
	);
}
