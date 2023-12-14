import { PageOutline, PageProps } from "../utils/PageOutline";
import { CustomInput } from "../utils/CustomInput";
import { WebSocketClient } from "../../api/WebSocketClient";
import { useCallback, useEffect } from "react";
import { IdleScreenEngine } from "../../pixi/IdleScreenEngine";
import { Pages } from "../../common/Pages";
import { MessageData } from "../../common/Message";

export const SetNamePage = ({ setPage }: PageProps) => {
	useEffect(() => {
		IdleScreenEngine.start();
	}, []);
	const handleNameEntry = useCallback(
		(name: string) => {
			const changePageCB = (data: MessageData) => {
				if (data.data.success) {
					WebSocketClient.singleton.name = data.data.data.name;
					setPage(Pages.HOME_PAGE);
				}
				// TODO: Add error handling for failed name
				else {
				}
			};
			WebSocketClient.submitClientName(name, changePageCB);
		},
		[setPage]
	);
	return (
		<PageOutline title="Asteroids">
			<div className="w-100 d-flex justify-content-center">
				<CustomInput placeholder="Enter player name..." buttonText="submit" onSubmit={handleNameEntry} />
			</div>
		</PageOutline>
	);
};
