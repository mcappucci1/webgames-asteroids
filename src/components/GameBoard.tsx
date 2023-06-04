import "../styles/GameBoard.css";

interface Props {
	lives: number;
	score: number;
}

export const GameBoard = ({ lives, score }: Props) => {
	const lifeStrings = Array(lives).fill("/images/ship.png");
	return (
		<div id="game-board">
			<div id="game-info" className="pt-3 ps-5">
				<div>
					<h4>Score: {score}</h4>
				</div>
				<div id="lives-container">
					{lifeStrings.map((str, i) => (
						<img key={i} src={str} className="ship-image" alt="life" />
					))}
				</div>
			</div>
		</div>
	);
};
