import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

interface BackButtonProps {
	setPage: () => void;
	className?: string;
}

export const BackButton = ({ setPage, className }: BackButtonProps) => {
	return (
		<button className={`custom-button ${className || ""}`} onClick={setPage}>
			<FontAwesomeIcon icon={faArrowLeft} /> Back
		</button>
	);
};
