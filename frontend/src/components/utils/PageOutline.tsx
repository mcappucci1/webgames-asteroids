import { Pages } from "../../common/Pages";
import "../../styles/PageOutline.css";

export interface PageProps {
	setPage: (page: Pages) => void;
}

interface PageOutlineProps {
	title: string;
	children: JSX.Element[] | JSX.Element;
}

export const PageOutline = ({ title, children }: PageOutlineProps) => {
	return (
		<div id="start-game-panel" className="mx-auto d-flex align-items-center">
			<div className="h-50">
				<div className="row mb-5">
					<div className="col-12 text-center">
						<h1 className="display-1">{title}</h1>
					</div>
				</div>
				{children}
			</div>
		</div>
	);
};
