import { useState } from "react";
import "../../styles/StringInput.css";

interface StringInputProps {
	placeholder: string;
	buttonText: string;
	onSubmit: (str: string) => void;
}

export const StringInput = ({ placeholder, buttonText, onSubmit }: StringInputProps) => {
	const [value, setValue] = useState<string>("");
	return (
		<div className="d-inline-block">
			<div className="custom-input d-flex">
				<input placeholder={placeholder} value={value} type="text" onChange={(e) => setValue(e.target.value)} />
				<button className="px-3" onClick={() => onSubmit(value)}>
					{buttonText}
				</button>
			</div>
		</div>
	);
};
