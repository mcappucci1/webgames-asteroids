import { useState } from "react";
import { Pages } from "../common/Pages";
import { CreateOrJoinPage } from "./pages/CreateOrJoinPage";
import { ErrorPage } from "./pages/ErrorPage";
import { CreateGamePage } from "./pages/CreateGamePage";
import { JoinGamePage } from "./pages/JoinGamePage";
import { SetNamePage } from "./pages/SetNamePage";
import { GameLobbyPage } from "./pages/GameLobbyPage";
import "../styles/App.css";

export function App() {
	const [page, setPage] = useState<Pages>(Pages.SET_NAME_PAGE);
	let pageCmp = <ErrorPage />;
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
	}
	return (
		<div id="background" className="d-flex text-white">
			{pageCmp}
		</div>
	);
}
