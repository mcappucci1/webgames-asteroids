import { ToastOptions } from "react-toastify";

export const TOAST_DISAPPEAR_OPTIONS: ToastOptions<{}> = {
	position: "top-center",
	autoClose: 5000,
	hideProgressBar: false,
	closeOnClick: true,
	pauseOnHover: true,
	progress: undefined,
	theme: "dark",
};

export const TOAST_PERMANENT_OPTIONS: ToastOptions<{}> = {
	position: "top-center",
	closeOnClick: true,
	pauseOnHover: false,
	autoClose: false,
	hideProgressBar: true,
	theme: "dark",
	className: "top-z",
};
