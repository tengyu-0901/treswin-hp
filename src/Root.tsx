import React from 'react';
import {Composition} from 'remotion';
import {Script1_CareerCheck} from './compositions/Script1_CareerCheck';
import {Script2_HardWorkVsResults} from './compositions/Script2_HardWorkVsResults';
import {Script3_FirstStep} from './compositions/Script3_FirstStep';
import {Script4_LikingIsWrong} from './compositions/Script4_LikingIsWrong';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="Script1-CareerCheck"
				component={Script1_CareerCheck}
				fps={30}
				width={1080}
				height={1920}
				durationInFrames={21 * 30}
			/>
			<Composition
				id="Script2-HardWorkVsResults"
				component={Script2_HardWorkVsResults}
				fps={30}
				width={1080}
				height={1920}
				durationInFrames={28 * 30}
			/>
			<Composition
				id="Script3-FirstStep"
				component={Script3_FirstStep}
				fps={30}
				width={1080}
				height={1920}
				durationInFrames={30 * 30}
			/>
			<Composition
				id="Script4-LikingIsWrong"
				component={Script4_LikingIsWrong}
				fps={30}
				width={1080}
				height={1920}
				durationInFrames={28 * 30}
			/>
		</>
	);
};
