import "../styles/App.css";

export function App() {
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
