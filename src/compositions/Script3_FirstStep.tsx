// src/compositions/Script3_FirstStep.tsx
// 台本3「キャリアの迷いが消える最初の1歩」

import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {TelopText} from '../components/TelopText';
import {TitleCall} from '../components/TitleCall';

const FPS = 30;
const frame = (sec: number) => Math.round(sec * FPS);

const cuts = [
	{id: 1, startSec: 0, endSec: 3, text: '「何がしたいか分からない」を\n1分で整理します', style: 'hookRed' as const},
	{id: 2, startSec: 3, endSec: 10, text: '「好きなこと」を聞かれても出てこないのは普通です。\n脳は「好き」より「嫌なこと」の方が先に出てくるから', style: 'calm' as const},
	{id: 3, startSec: 10, endSec: 20, text: '嫌だった仕事・場面を5個書き出す\n①②③④⑤', style: 'checkbox' as const},
	{id: 4, startSec: 20, endSec: 27, text: 'これがハレマの12ステップの最初、ステップ1です', style: 'cta' as const},
];

const TITLE_CALL_START = 27;
const TITLE_CALL_END = 30;

export const Script3_FirstStep: React.FC = () => (
	<AbsoluteFill style={{backgroundColor: '#111111'}}>
		<Audio src={staticFile('bgm.mp3')} volume={0.25} />
		{cuts.map((cut) => (
			<Sequence key={cut.id} from={frame(cut.startSec)} durationInFrames={frame(cut.endSec - cut.startSec)}>
				<TelopText text={cut.text} style={cut.style} />
			</Sequence>
		))}
		<Sequence from={frame(TITLE_CALL_START)} durationInFrames={frame(TITLE_CALL_END - TITLE_CALL_START)}>
			<TitleCall />
		</Sequence>
	</AbsoluteFill>
);

// Root.tsx登録用: durationInFrames={30 * 30}, fps={30}, width={1080}, height={1920}
// 制作メモ：Cut3のノート書き込みアニメは今回シンプルなテキスト表示に簡略化。
// 凝った手書きアニメーションが必要な場合は別途アニメーション用ライブラリの検討が必要。
