import React from 'react';
import {SceneFade} from '../components/SceneFade';
import {KineticLines} from '../components/KineticLines';

export const Scene2Problem: React.FC<{durationInFrames: number}> = ({durationInFrames}) => {
  return (
    <SceneFade durationInFrames={durationInFrames}>
      <KineticLines
        lines={['市場価値は、', '黙っていても', '上がらない。']}
        accentLineIndex={2}
        fontSize={80}
        staggerFrames={9}
      />
    </SceneFade>
  );
};
