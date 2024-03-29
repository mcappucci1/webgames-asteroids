import { PageOutline, PageProps } from "../utils/PageOutline";
import { Pages } from "../../common/Pages";
import { BackButton } from "../utils/BackButton";
import { ToastContainer } from "react-toastify";

export const CreateOrJoinPage = ({ setPage }: PageProps) => {
	return (
		<PageOutline title="Asteroids">
			<ToastContainer />
			<div className="d-flex justify-content-center mb-3">
				<button
					id="play-game"
					className="mx-auto bg-transparent text-white"
					onClick={() => setPage(Pages.JOIN_PAGE)}
				>
					<h2 className="animate-underline">Join Game</h2>
				</button>
			</div>
			<div className="d-flex justify-content-center mb-3">
				<h3>- or -</h3>
			</div>
			<div className="d-flex justify-content-center">
				<button
					id="play-game"
					className="mx-auto bg-transparent text-white"
					onClick={() => setPage(Pages.CREATE_PAGE)}
				>
					<h2 className="animate-underline">Create Game</h2>
				</button>
			</div>
			<p className="mt-5 text-center">Play with up to six friends!</p>
			<BackButton className="mt-3" setPage={() => setPage(Pages.SET_NAME_PAGE)} />
		</PageOutline>
	);
};
