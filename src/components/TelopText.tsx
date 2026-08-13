import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

export type TelopTextProps = {
	text: string;
	startFrame?: number;
	durationInFrames?: number;
	fontSize?: number;
	color?: string;
	backgroundColor?: string;
	top?: number | string;
};

export const TelopText: React.FC<TelopTextProps> = ({
	text,
	startFrame = 0,
	durationInFrames = 90,
	fontSize = 56,
	color = '#ffffff',
	backgroundColor = '#111111',
	top = '78%',
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const localFrame = frame - startFrame;

	if (localFrame < 0 || localFrame > durationInFrames) {
		return null;
	}

	const enter = spring({
		frame: localFrame,
		fps,
		config: {damping: 200},
	});

	const exitStart = durationInFrames - 15;
	const opacity = interpolate(
		localFrame,
		[0, 10, exitStart, durationInFrames],
		[0, 1, 1, 0],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);

	const translateX = interpolate(enter, [0, 1], [-40, 0]);

	return (
		<div
			style={{
				position: 'absolute',
				top,
				left: '50%',
				transform: `translate(-50%, 0) translateX(${translateX}px)`,
				opacity,
				padding: '16px 40px',
				backgroundColor,
				borderRadius: 12,
				maxWidth: '90%',
			}}
		>
			<span
				style={{
					fontSize,
					fontWeight: 700,
					color,
					fontFamily: '"Noto Sans JP", sans-serif',
					whiteSpace: 'pre-wrap',
					textAlign: 'center',
					display: 'block',
				}}
			>
				{text}
			</span>
		</div>
	);
};
