import { Application, Graphics } from "pixi.js";
import "../styles/App.css";

function createPixiApp() {
	const pixiApp = new Application<HTMLCanvasElement>({
		width: window.innerWidth,
		height: window.innerHeight,
		view: document.getElementById("#renderer") as HTMLCanvasElement,
		backgroundAlpha: 0,
	});
	pixiApp.view.style.position = "absolute";
	pixiApp.view.style.top = "0";
	document.body.appendChild(pixiApp.view);
	const graphic = new Graphics();
	graphic.beginFill(0xffff00);
	graphic.lineStyle(5, 0xffff00);
	graphic.drawRect(0, 0, 100, 100);
	pixiApp.stage.addChild(graphic);
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
