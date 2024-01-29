import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faArrowLeft, faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { PageOutline, PageProps } from "../utils/PageOutline";
import { useEffect, useState } from "react";
import { DELAY, COUNTDOWN } from "../../pixi/ClientGameEngine";
import { Pages } from "../../common/Pages";
import "../../styles/InstructionsPage.css";
import { ToastContainer } from "react-toastify";

export const InstructionsPage = ({ setPage }: PageProps) => {
	const [count, setCount] = useState<number>(3);

	useEffect(() => {
		let i = COUNTDOWN;
		const interval = setInterval(() => {
			if (--i === 0) {
				clearInterval(interval);
				setPage(Pages.PLAY_GAME);
				return;
			}
			setCount(i);
		}, DELAY);
	}, [setPage]);

	return (
		<PageOutline title={count.toString()}>
			<ToastContainer />
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
		</PageOutline>
	);
};
