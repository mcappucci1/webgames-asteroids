import { GameRenderer } from "../pixi/GameRenderer";
import "../styles/App.css";

const renderer = new GameRenderer({
	width: window.innerWidth,
	height: window.innerHeight,
	backgroundAlpha: 0,
});
renderer.style.position = "absolute";
renderer.style.top = "0";
setTimeout(() => renderer.playStartScreen(), 1000);

export function App() {
	return (
		<div
			id="background"
			className="d-flex text-white justify-content-center align-items-center"
		>
			<div id="start-game-panel">
				<h1 className="display-1">Asteroids</h1>
				<div className="d-flex justify-content-center">
					<button
						id="play-game"
						className="mx-auto bg-transparent text-white test"
					>
						<h2 className="animate-underline">Play Game</h2>
					</button>
				</div>
			</div>
		</div>
	);
}
