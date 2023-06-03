import { GameEngine } from "../pixi/GameEngine";
import { StartGamePanel } from "./StartGamePanel";
import { GameBoard } from "./GameBoard";
import { useState, useEffect, useCallback } from "react";
import "../styles/App.css";

const renderer = new GameEngine({
	width: window.innerWidth,
	height: window.innerHeight,
	backgroundAlpha: 0,
	antialias: true,
});
renderer.style.position = "absolute";
renderer.style.top = "0";

export function App() {
	const [gameState, setGameState] = useState(0);
	const [score, setScore] = useState(0);
	const [lives, setLives] = useState(3);
	const startGame = () => {
		renderer.playGame();
		setGameState(1);
	};
	const updateLives = useCallback(
		(lives: number) => {
			if (lives === 0) {
				renderer.resetGame();
				setGameState(0);
				renderer.playStartScreen();
				return;
			}
			setLives(lives);
		},
		[setLives, setGameState]
	);
	useEffect(() => {
		renderer.setLivesChangedCB(updateLives);
		renderer.setScoreChangedCB(setScore);
	}, [updateLives, setScore]);
	return (
		<div id="background" className="d-flex text-white justify-content-center align-items-center">
			{gameState === 0 ? <StartGamePanel startGame={startGame} /> : <GameBoard lives={lives} score={0} />}
		</div>
	);
}
