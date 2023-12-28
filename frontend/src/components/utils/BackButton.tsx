import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

interface BackButtonProps {
	setPage: () => void;
}

export const BackButton = ({ setPage }: BackButtonProps) => {
	return (
		<button className="custom-button mt-5" onClick={setPage}>
			<FontAwesomeIcon icon={faArrowLeft} /> Back
		</button>
	);
};
