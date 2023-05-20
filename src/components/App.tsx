import { GameRenderer } from "../pixi/GameRenderer";
import { StartGamePanel } from "./StartGamePanel";
import { GameBoard } from "./GameBoard";
import { useState } from "react";
import "../styles/App.css";

const renderer = new GameRenderer({
	width: window.innerWidth,
	height: window.innerHeight,
	backgroundAlpha: 0,
});
renderer.style.position = "absolute";
renderer.style.top = "0";

export function App() {
	const [gameState, setGameState] = useState(0);
	const startGame = () => {
		renderer.playGame();
		setGameState(1);
	};
	return (
		<div
			id="background"
			className="d-flex text-white justify-content-center align-items-center"
		>
			{gameState === 0 ? (
				<StartGamePanel startGame={startGame} />
			) : (
				<GameBoard />
			)}
		</div>
	);
}
