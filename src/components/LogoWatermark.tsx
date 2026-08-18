import React from 'react';
import {AbsoluteFill, staticFile} from 'remotion';

// 各Cutの下部に常時表示する小さいロゴ（TitleCall以外の尺で使用）
export const LogoWatermark: React.FC = () => (
	<AbsoluteFill
		style={{
			justifyContent: 'flex-end',
			alignItems: 'flex-end',
			padding: '0 40px 56px 0',
			pointerEvents: 'none',
		}}
	>
		<img
			src={staticFile('logo.jpg')}
			style={{
				width: 64,
				height: 64,
				borderRadius: 12,
				objectFit: 'cover',
				opacity: 0.92,
				boxShadow: '0 2px 10px rgba(16,40,74,0.18)',
			}}
		/>
	</AbsoluteFill>
);
