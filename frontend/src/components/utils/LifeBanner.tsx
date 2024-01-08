interface LifeBannerProps {
	lives: number;
	name: string;
	color: number;
}

export const LifeBanner = ({ lives, name, color }: LifeBannerProps) => {
	return (
		<div className="mt-1 ms-1" style={{ color: `#${color.toString(16)}` }}>
			{name}'s lives: {lives}
		</div>
	);
};
