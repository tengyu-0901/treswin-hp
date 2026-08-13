import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';

// 5本の台本共通で使い回すタイトルコール
export const TitleCall: React.FC = () => (
	<AbsoluteFill
		style={{backgroundColor: '#0B1F3A', justifyContent: 'center', alignItems: 'center'}}
	>
		{/* ロゴ画像は public/logo.png に配置しておく */}
		<img src={staticFile('logo.png')} style={{width: 240}} />
		{/* 音声ファイルは1本だけ作って public/title-call.mp3 として使い回す */}
		<Audio src={staticFile('title-call.mp3')} />
	</AbsoluteFill>
);
