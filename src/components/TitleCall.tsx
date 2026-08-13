import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';

// 5本の台本共通で使い回すタイトルコール
export const TitleCall: React.FC = () => (
	<AbsoluteFill
		style={{backgroundColor: '#0B1F3A', justifyContent: 'center', alignItems: 'center'}}
	>
		<img
			src={staticFile('logo.jpg')}
			style={{width: 160, height: 160, borderRadius: 16, objectFit: 'cover'}}
		/>
		<div
			style={{
				marginTop: 24,
				fontSize: 56,
				fontWeight: 800,
				color: '#FFFFFF',
				fontFamily: '"Noto Sans JP", sans-serif',
				letterSpacing: 2,
			}}
		>
			ハレマ
		</div>
		{/* 音声ファイルは1本だけ作って public/title-call.mp3 として使い回す */}
		<Audio src={staticFile('title-call.mp3')} />
	</AbsoluteFill>
);
