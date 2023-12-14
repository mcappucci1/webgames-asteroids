import { useState } from "react";
import "../../styles/CustomInput.css";

interface CustomInputProps {
	placeholder: string;
	buttonText: string;
	onSubmit: (str: string) => void;
}

export const CustomInput = ({ placeholder, buttonText, onSubmit }: CustomInputProps) => {
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
