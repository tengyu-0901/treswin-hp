import React from 'react';
import {AbsoluteFill} from 'remotion';
import {TitleCall} from '../components/TitleCall';
import {TelopText} from '../components/TelopText';

const telopLines: {text: string; startFrame: number; durationInFrames: number}[] = [
	{text: '「頑張っているのに評価されない」', startFrame: 120, durationInFrames: 90},
	{text: 'その原因は、努力の"方向"かもしれません', startFrame: 210, durationInFrames: 90},
	{text: '結果につながる努力には共通点があります', startFrame: 330, durationInFrames: 90},
	{text: 'それは「何を」ではなく「誰のために」やるか', startFrame: 450, durationInFrames: 90},
	{text: '努力の量より、成果の質にフォーカスする', startFrame: 570, durationInFrames: 90},
	{text: 'TRESWINは、あなたの努力を成果に変える伴走者です', startFrame: 690, durationInFrames: 120},
];

export const Script2_HardWorkVsResults: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: '#000000'}}>
			<TitleCall
				title={'努力'}
				subtitle={'それは、成果につながっているか？'}
				startFrame={0}
				durationInFrames={100}
			/>
			{telopLines.map((line, index) => (
				<TelopText
					key={index}
					text={line.text}
					startFrame={line.startFrame}
					durationInFrames={line.durationInFrames}
				/>
			))}
		</AbsoluteFill>
	);
};
