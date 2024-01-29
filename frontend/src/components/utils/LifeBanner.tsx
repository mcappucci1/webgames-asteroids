interface LifeBannerProps {
	lives: number;
	name: string;
	color: string;
}

export const LifeBanner = ({ lives, name, color }: LifeBannerProps) => {
	return (
		<div className="mt-1 ms-1" style={{ color }}>
			{name}'s lives: {lives}
		</div>
	);
};
