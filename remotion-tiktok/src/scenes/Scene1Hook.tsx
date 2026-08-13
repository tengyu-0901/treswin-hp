import React from 'react';
import {SceneFade} from '../components/SceneFade';
import {KineticLines} from '../components/KineticLines';

export const Scene1Hook: React.FC<{durationInFrames: number}> = ({durationInFrames}) => {
  return (
    <SceneFade durationInFrames={durationInFrames}>
      <KineticLines
        lines={['その働き方、', '5年後も', '続けられますか？']}
        accentLineIndex={2}
        fontSize={80}
        staggerFrames={9}
      />
    </SceneFade>
  );
};
