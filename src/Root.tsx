import React from 'react';
import {Composition} from 'remotion';
import {Script2_HardWorkVsResults} from './compositions/Script2_HardWorkVsResults';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="Script2-HardWorkVsResults"
				component={Script2_HardWorkVsResults}
				fps={30}
				width={1080}
				height={1920}
				durationInFrames={28 * 30}
			/>
		</>
	);
};
