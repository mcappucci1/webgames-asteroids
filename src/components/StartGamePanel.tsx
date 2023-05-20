import "../styles/StartGamePanel.css";

interface StartGameProps {
	startGame: () => void;
}

export const StartGamePanel = ({ startGame }: StartGameProps) => {
	return (
		<div id="start-game-panel">
			<h1 className="display-1">Asteroids</h1>
			<div className="d-flex justify-content-center">
				<button
					id="play-game"
					className="mx-auto bg-transparent text-white test"
					onClick={startGame}
				>
					<h2 className="animate-underline">Play Game</h2>
				</button>
			</div>
		</div>
	);
};
