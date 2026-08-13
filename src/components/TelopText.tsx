import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

export type TelopStyle =
	| 'hookRed'
	| 'checkbox'
	| 'calm'
	| 'cta'
	| 'compareLeft'
	| 'compareRight';

type TelopTextProps = {
	text: string;
	style: TelopStyle;
};

const marks: Partial<Record<TelopStyle, string>> = {
	compareLeft: '✕ ',
	compareRight: '◯ ',
};

export const TelopText: React.FC<TelopTextProps> = ({text, style}) => {
	const localFrame = useCurrentFrame();
	const opacity = interpolate(localFrame, [0, 8], [0, 1], {
		extrapolateRight: 'clamp',
	});
	const translateY = interpolate(localFrame, [0, 8], [10, 0], {
		extrapolateRight: 'clamp',
	});

	const baseStyle: React.CSSProperties = {
		fontFamily: '"Noto Sans JP", sans-serif',
		fontWeight: 700,
		textAlign: 'center',
		whiteSpace: 'pre-line',
		padding: '0 60px',
		opacity,
		transform: `translateY(${translateY}px)`,
	};

	const variants: Record<TelopStyle, React.CSSProperties> = {
		hookRed: {...baseStyle, fontSize: 64, color: '#FF3B30'},
		checkbox: {...baseStyle, fontSize: 48, color: '#FFFFFF', textAlign: 'left'},
		calm: {...baseStyle, fontSize: 44, color: '#E8C97A'}, // ブランドゴールド
		cta: {...baseStyle, fontSize: 52, color: '#FFFFFF'},
		compareLeft: {...baseStyle, fontSize: 48, color: '#FF3B30'},
		compareRight: {...baseStyle, fontSize: 48, color: '#E8C97A'},
	};

	return (
		<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
			<div style={variants[style]}>
				{marks[style] ? `${marks[style]}${text}` : text}
			</div>
		</AbsoluteFill>
	);
};
