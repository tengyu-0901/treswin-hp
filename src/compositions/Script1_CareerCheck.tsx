// src/compositions/Script1_CareerCheck.tsx
// 台本1「キャリア迷子診断・3秒でわかる」

import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {TelopText} from '../components/TelopText';
import {TitleCall} from '../components/TitleCall';

const FPS = 30;
const frame = (sec: number) => Math.round(sec * FPS);

const cuts = [
	{id: 1, startSec: 0.0, endSec: 2.8, text: 'これ、すべて当てはまったら危険です。', style: 'hookRed' as const},
	{id: 2, startSec: 3.9, endSec: 6.2, text: '☐ 転職サイトを毎日みてるのに応募はしない。', style: 'checkbox' as const},
	{id: 3, startSec: 7.3, endSec: 12.0, text: '☐「今の仕事が嫌だ」は言えても「何がしたいか」は言えない。', style: 'checkbox' as const},
	{id: 4, startSec: 13.0, endSec: 14.6, text: '☐「とりあえず頑張る」が口癖。', style: 'checkbox' as const},
	{id: 5, startSec: 15.5, endSec: 20.0, text: 'これ、やる気がないんじゃなくて、\n迷いをことばにする手順を知らないだけです。', style: 'calm' as const},
	{id: 6, startSec: 21.1, endSec: 23.4, text: 'その手順、コメント欄に置いてます。', style: 'cta' as const},
];

const TITLE_CALL_START = 23.4;
const TOTAL_DURATION = 883; // 29.44秒 × 30fps

export const Script1_CareerCheck: React.FC = () => (
	<AbsoluteFill style={{backgroundColor: '#111111'}}>
		<Audio src={staticFile('script1-narration.mp3')} />
		{cuts.map((cut) => (
			<Sequence key={cut.id} from={frame(cut.startSec)} durationInFrames={frame(cut.endSec - cut.startSec)}>
				<TelopText text={cut.text} style={cut.style} />
			</Sequence>
		))}
		<Sequence from={frame(TITLE_CALL_START)} durationInFrames={TOTAL_DURATION - frame(TITLE_CALL_START)}>
			<TitleCall />
		</Sequence>
	</AbsoluteFill>
);

// Root.tsx登録用: durationInFrames={883}, fps={30}, width={1080}, height={1920}
