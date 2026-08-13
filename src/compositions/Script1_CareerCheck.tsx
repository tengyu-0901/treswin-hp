// src/compositions/Script1_CareerCheck.tsx
// 台本1「キャリア迷子診断・3秒でわかる」

import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {TelopText} from '../components/TelopText';
import {TitleCall} from '../components/TitleCall';

const FPS = 30;
const frame = (sec: number) => Math.round(sec * FPS);

const cuts = [
	{id: 1, startSec: 0, endSec: 2, text: 'これ、3つ当てはまったらヤバいです', style: 'hookRed' as const},
	{id: 2, startSec: 2, endSec: 4, text: '☐ 転職サイトを毎日見てるのに応募はしない', style: 'checkbox' as const},
	{id: 3, startSec: 4, endSec: 6, text: '☐『今の仕事が嫌』は言えても『何がしたいか』は言えない', style: 'checkbox' as const},
	{id: 4, startSec: 6, endSec: 8, text: '☐『とりあえず頑張る』が口癖', style: 'checkbox' as const},
	{id: 5, startSec: 8, endSec: 13, text: 'これ、「やる気がない」んじゃなくて、\n迷いを言葉にする手順を知らないだけです', style: 'calm' as const},
	{id: 6, startSec: 13, endSec: 18, text: 'その手順、プロフィールに置いてます', style: 'cta' as const},
];

const TITLE_CALL_START = 18;
const TITLE_CALL_END = 21;

export const Script1_CareerCheck: React.FC = () => (
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

// Root.tsx登録用: durationInFrames={21 * 30}, fps={30}, width={1080}, height={1920}
