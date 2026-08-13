import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS} from '../theme';
import {serifFont} from '../fonts';

export const KineticLines: React.FC<{
  lines: string[];
  accentLineIndex?: number;
  staggerFrames?: number;
  fontSize?: number;
  startFrame?: number;
}> = ({lines, accentLineIndex, staggerFrames = 8, fontSize = 76, startFrame = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        padding: '0 90px',
        textAlign: 'center',
      }}
    >
      {lines.map((line, i) => {
        const localFrame = frame - startFrame - i * staggerFrames;
        const progress = spring({
          fps,
          frame: localFrame,
          config: {damping: 16, mass: 0.6, stiffness: 140},
        });
        const isAccent = i === accentLineIndex;

        return (
          <div
            key={i}
            style={{
              overflow: 'hidden',
              lineHeight: 1.28,
            }}
          >
            <div
              style={{
                fontFamily: serifFont,
                fontWeight: 900,
                fontSize,
                color: isAccent ? COLORS.goldL : COLORS.white,
                letterSpacing: '0.01em',
                transform: `translateY(${(1 - progress) * 44}px) scale(${0.9 + progress * 0.1})`,
                opacity: progress,
              }}
            >
              {line}
            </div>
          </div>
        );
      })}
    </div>
  );
};
