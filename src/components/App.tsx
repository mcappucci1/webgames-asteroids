import { GameRenderer } from "../pixi/GameRenderer";
import "../styles/App.css";

function createPixiApp() {
	const renderer = new GameRenderer({
		width: window.innerWidth,
		height: window.innerHeight,
		backgroundAlpha: 0,
	});
	renderer.style.position = "absolute";
	renderer.style.top = "0";
}

export function App() {
	createPixiApp();
	return (
		<div
			id="background"
			className="d-flex text-white justify-content-center align-items-center"
		>
			<div className="">
				<h1 className="display-1">Asteroids</h1>
				<div className="d-flex justify-content-center">
					<button
						id="play-game"
						className="mx-auto bg-black text-white test"
					>
						<h2 className="animate-underline">Play Game</h2>
					</button>
				</div>
			</div>
		</div>
	);
}
