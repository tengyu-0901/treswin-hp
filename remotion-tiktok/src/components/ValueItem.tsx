import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS} from '../theme';
import {sansFont, monoFont} from '../fonts';

export const ValueItem: React.FC<{
  index: number;
  label: string;
  startFrame: number;
}> = ({index, label, startFrame}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const localFrame = frame - startFrame;
  const progress = spring({
    fps,
    frame: localFrame,
    config: {damping: 18, mass: 0.7, stiffness: 150},
  });

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 26,
        width: 860,
        opacity: progress,
        transform: `translateX(${(1 - progress) * -60}px)`,
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: 74,
          height: 74,
          borderRadius: '50%',
          border: `2px solid ${COLORS.goldL}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: monoFont,
          fontSize: 30,
          color: COLORS.goldL,
        }}
      >
        {String(index).padStart(2, '0')}
      </div>
      <div
        style={{
          fontFamily: sansFont,
          fontWeight: 700,
          fontSize: 42,
          color: COLORS.white,
          lineHeight: 1.3,
        }}
      >
        {label}
      </div>
    </div>
  );
};
