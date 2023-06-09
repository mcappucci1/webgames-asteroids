import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faArrowLeft, faArrowUp } from "@fortawesome/free-solid-svg-icons";
import "../styles/StartGamePanel.css";

interface StartGameProps {
	startGame: () => void;
}

export const StartGamePanel = ({ startGame }: StartGameProps) => {
	return (
		<div id="start-game-panel" className="mx-auto  d-flex align-items-center">
			<div className="h-50">
				<div className="">
					<div className="row mb-5">
						<div className="col-12 text-center">
							<h1 className="display-1">Hi Donald</h1>
						</div>
					</div>
					<div className="d-flex justify-content-center">
						<button id="play-game" className="mx-auto bg-transparent text-white" onClick={startGame}>
							<h2 className="animate-underline">Play Game</h2>
						</button>
					</div>
				</div>
				<div id="gap" className="row gap">
					<div className="col-12 d-flex justify-content-center">
						<div id="instructions-container" className="d-inline-block d-flex align-items-end">
							<div className="d-inline-block me-5">
								<div className="key-container mx-auto">
									<div className="key-text">S</div>
								</div>
								<div className="text-center">Shoot</div>
							</div>
							<div className="d-inline-block me-2">
								<div className="key-container mx-auto">
									<div className="key-text">
										<FontAwesomeIcon icon={faArrowLeft} />
									</div>
								</div>
								<div className="text-center">Left</div>
							</div>
							<div className="d-inline-block mb-5 me-2">
								<div className="key-container mx-auto">
									<div className="key-text">
										<FontAwesomeIcon icon={faArrowUp} />
									</div>
								</div>
								<div className="text-center">Up</div>
							</div>
							<div className="d-inline-block ">
								<div className="key-container mx-auto">
									<div className="key-text">
										<FontAwesomeIcon icon={faArrowRight} />
									</div>
								</div>
								<div className="text-center">Right</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
