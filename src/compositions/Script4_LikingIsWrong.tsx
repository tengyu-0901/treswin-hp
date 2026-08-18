// src/compositions/Script4_LikingIsWrong.tsx
// 台本4「『好きなことを仕事に』が間違ってる理由」（逆張り系・投稿順は最後を推奨）

import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {TelopText} from '../components/TelopText';
import {TitleCall} from '../components/TitleCall';

const FPS = 30;
const frame = (sec: number) => Math.round(sec * FPS);

const cuts = [
	{id: 1, startSec: 0, endSec: 3, text: '「好きなことを仕事に」ってアドバイス、\n実は危険です', style: 'hookRed' as const},
	{id: 2, startSec: 3, endSec: 12, text: '好きなことって、頑張らなくてもできることじゃなくて、\n「しんどくても続けられること」の方が近いんです。\nだから「好きなこと探し」でずっと迷子になる', style: 'calm' as const},
	{id: 3, startSec: 12, endSec: 20, text: 'ハレマでは「好きなこと」ではなく\n「続けられる条件」から逆算します', style: 'calm' as const},
	{id: 4, startSec: 20, endSec: 25, text: 'その考え方、プロフィールのLINEで\n無料で体験できます', style: 'cta' as const},
];

const TITLE_CALL_START = 25;
const TITLE_CALL_END = 28;

export const Script4_LikingIsWrong: React.FC = () => (
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
// 運用メモ：炎上リスクのある逆張り系。絵コンテ通り、投稿順は5本の中で最後に回すことを推奨。
