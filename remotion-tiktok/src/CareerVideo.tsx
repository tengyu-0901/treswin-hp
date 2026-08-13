import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {BackgroundFX} from './components/BackgroundFX';
import {Scene1Hook} from './scenes/Scene1Hook';
import {Scene2Problem} from './scenes/Scene2Problem';
import {Scene3Brand} from './scenes/Scene3Brand';
import {Scene4Values} from './scenes/Scene4Values';
import {Scene5CTA} from './scenes/Scene5CTA';
import {COLORS} from './theme';

export const SCENES = [
  {Component: Scene1Hook, duration: 85},
  {Component: Scene2Problem, duration: 85},
  {Component: Scene3Brand, duration: 90},
  {Component: Scene4Values, duration: 130},
  {Component: Scene5CTA, duration: 60},
];

export const TOTAL_DURATION = SCENES.reduce((sum, s) => sum + s.duration, 0);

export const CareerVideo: React.FC = () => {
  let cursor = 0;

  return (
    <AbsoluteFill>
      <BackgroundFX />
      {SCENES.map(({Component, duration}, i) => {
        const from = cursor;
        cursor += duration;
        return (
          <Sequence key={i} from={from} durationInFrames={duration}>
            <Component durationInFrames={duration} />
          </Sequence>
        );
      })}
      <ProgressBar />
    </AbsoluteFill>
  );
};

const ProgressBar: React.FC = () => {
  return (
    <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center'}}>
      <div
        style={{
          marginTop: 26,
          width: '86%',
          height: 3,
          borderRadius: 2,
          background: 'rgba(255,255,255,0.12)',
          overflow: 'hidden',
        }}
      >
        <ProgressFill />
      </div>
    </AbsoluteFill>
  );
};

const ProgressFill: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = Math.min(1, frame / TOTAL_DURATION);
  return (
    <div
      style={{
        width: `${progress * 100}%`,
        height: '100%',
        background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.goldLL})`,
      }}
    />
  );
};
