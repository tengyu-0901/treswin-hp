import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {SceneFade} from '../components/SceneFade';
import {KineticLines} from '../components/KineticLines';
import {COLORS} from '../theme';
import {monoFont} from '../fonts';

export const Scene3Brand: React.FC<{durationInFrames: number}> = ({durationInFrames}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const kickerProgress = spring({fps, frame, config: {damping: 20}});
  const lineWidth = interpolate(kickerProgress, [0, 1], [0, 46]);

  const wordmarkStart = 46;
  const wordmarkProgress = spring({
    fps,
    frame: frame - wordmarkStart,
    config: {damping: 16, mass: 0.6},
  });

  return (
    <SceneFade durationInFrames={durationInFrames}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40}}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            opacity: kickerProgress,
          }}
        >
          <div style={{width: lineWidth, height: 1, background: COLORS.goldL}} />
          <div
            style={{
              fontFamily: monoFont,
              fontSize: 20,
              letterSpacing: '0.3em',
              color: COLORS.goldL,
              textTransform: 'uppercase',
            }}
          >
            CAREER SUPPORT
          </div>
          <div style={{width: lineWidth, height: 1, background: COLORS.goldL}} />
        </div>

        <KineticLines
          lines={['伴走型', 'キャリア支援']}
          fontSize={92}
          staggerFrames={9}
          startFrame={6}
        />

        <div
          style={{
            opacity: wordmarkProgress,
            transform: `translateY(${(1 - wordmarkProgress) * 26}px)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            marginTop: 10,
          }}
        >
          <div
            style={{
              fontFamily: monoFont,
              fontSize: 30,
              letterSpacing: '0.35em',
              color: COLORS.white,
            }}
          >
            TRESWIN
          </div>
          <div
            style={{
              fontFamily: monoFont,
              fontSize: 14,
              letterSpacing: '0.2em',
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            大阪梅田 発
          </div>
        </div>
      </div>
    </SceneFade>
  );
};
