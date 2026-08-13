import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

export const SceneFade: React.FC<{
  durationInFrames: number;
  fadeIn?: number;
  fadeOut?: number;
  children: React.ReactNode;
}> = ({durationInFrames, fadeIn = 12, fadeOut = 12, children}) => {
  const frame = useCurrentFrame();

  const fadeInFactor =
    fadeIn > 0
      ? interpolate(frame, [0, fadeIn], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
      : 1;
  const fadeOutFactor =
    fadeOut > 0
      ? interpolate(frame, [durationInFrames - fadeOut, durationInFrames], [1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
      : 1;

  const opacity = Math.min(fadeInFactor, fadeOutFactor);

  return (
    <AbsoluteFill style={{opacity, justifyContent: 'center', alignItems: 'center'}}>
      {children}
    </AbsoluteFill>
  );
};
