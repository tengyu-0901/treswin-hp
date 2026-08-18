// src/compositions/Script2_HardWorkVsResults.tsx
// 台本2「『頑張ってる人』と『空回りしてる人』の違い」

import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {TelopText} from '../components/TelopText';
import {TitleCall} from '../components/TitleCall';

const FPS = 30;
const frame = (sec: number) => Math.round(sec * FPS);

const cuts = [
	{id: 1, startSec: 0, endSec: 3, text: '同じ「頑張ってる」でも、\n結果が出る人と出ない人がいます', style: 'hookRed' as const},
	{id: 2, startSec: 3, endSec: 7, text: '空回り：とにかく資格を取る', style: 'compareLeft' as const},
	{id: 3, startSec: 7, endSec: 12, text: '結果が出る：何のために取るか決めてから動く', style: 'compareRight' as const},
	{id: 4, startSec: 12, endSec: 20, text: '差は才能じゃなくて、順番です', style: 'calm' as const},
	{id: 5, startSec: 20, endSec: 25, text: 'その順番、12ステップにしてあります', style: 'cta' as const},
];

const TITLE_CALL_START = 25;
const TITLE_CALL_END = 28;

export const Script2_HardWorkVsResults: React.FC = () => (
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

// Root.tsx登録用: durationInFrames={28 * 30}, fps={30}, width={1080}, height={1920}
