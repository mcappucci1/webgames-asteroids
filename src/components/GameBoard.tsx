import { useState } from "react";
import "../styles/GameBoard.css";

export const GameBoard = () => {
	const [score, setScore] = useState(0);
	const [lives, setLives] = useState(3);
	const lifeStrings = Array(lives).fill("/images/ship.png");
	return (
		<div id="game-board">
			<div id="game-info" className="pt-3 ps-5">
				<div>
					<h4>Score: {score}</h4>
				</div>
				<div id="lives-container">
					{lifeStrings.map((str, i) => (
						<img
							key={i}
							src={str}
							className="ship-image"
							alt="life"
						/>
					))}
				</div>
			</div>
		</div>
	);
};
