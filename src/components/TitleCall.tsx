import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

export type TitleCallProps = {
	title: string;
	subtitle?: string;
	startFrame?: number;
	durationInFrames?: number;
	accentColor?: string;
	textColor?: string;
};

export const TitleCall: React.FC<TitleCallProps> = ({
	title,
	subtitle,
	startFrame = 0,
	durationInFrames = 60,
	accentColor = '#e63946',
	textColor = '#ffffff',
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const localFrame = frame - startFrame;

	if (localFrame < 0 || localFrame > durationInFrames) {
		return null;
	}

	const scale = spring({
		frame: localFrame,
		fps,
		config: {damping: 12, mass: 0.6},
	});

	const exitStart = durationInFrames - 15;
	const opacity = interpolate(
		localFrame,
		[0, 8, exitStart, durationInFrames],
		[0, 1, 1, 0],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);

	return (
		<div
			style={{
				position: 'absolute',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				opacity,
				transform: `scale(${scale})`,
			}}
		>
			<div
				style={{
					width: 100,
					height: 6,
					backgroundColor: accentColor,
					marginBottom: 24,
				}}
			/>
			<span
				style={{
					fontSize: 88,
					fontWeight: 800,
					color: textColor,
					fontFamily: '"Noto Sans JP", sans-serif',
					textAlign: 'center',
					lineHeight: 1.3,
					whiteSpace: 'pre-wrap',
					padding: '0 60px',
				}}
			>
				{title}
			</span>
			{subtitle ? (
				<span
					style={{
						marginTop: 20,
						fontSize: 40,
						fontWeight: 600,
						color: accentColor,
						fontFamily: '"Noto Sans JP", sans-serif',
						textAlign: 'center',
					}}
				>
					{subtitle}
				</span>
			) : null}
		</div>
	);
};
