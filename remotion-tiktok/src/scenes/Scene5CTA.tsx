import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {SceneFade} from '../components/SceneFade';
import {COLORS} from '../theme';
import {monoFont, sansFont, serifFont} from '../fonts';

export const Scene5CTA: React.FC<{durationInFrames: number}> = ({durationInFrames}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const ctaProgress = spring({fps, frame, config: {damping: 18}});
  const brandProgress = spring({fps, frame: frame - 14, config: {damping: 16, mass: 0.7}});
  const urlProgress = spring({fps, frame: frame - 30, config: {damping: 20}});
  const pulse = 1 + Math.sin(frame / 6) * 0.02;

  return (
    <SceneFade durationInFrames={durationInFrames} fadeOut={0}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34}}>
        <div
          style={{
            fontFamily: sansFont,
            fontWeight: 700,
            fontSize: 40,
            color: COLORS.white,
            opacity: ctaProgress,
            transform: `translateY(${(1 - ctaProgress) * 24}px)`,
          }}
        >
          まずは無料相談から。
        </div>

        <div
          style={{
            fontFamily: serifFont,
            fontWeight: 900,
            fontSize: 108,
            color: COLORS.goldL,
            opacity: brandProgress,
            transform: `scale(${(0.85 + brandProgress * 0.15) * pulse})`,
            letterSpacing: '0.04em',
          }}
        >
          TRESWIN
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            opacity: urlProgress,
            transform: `translateY(${(1 - urlProgress) * 16}px)`,
          }}
        >
          <div
            style={{
              fontFamily: monoFont,
              fontSize: 26,
              letterSpacing: '0.1em',
              color: COLORS.white,
            }}
          >
            tres-win.com
          </div>
          <div
            style={{
              fontFamily: monoFont,
              fontSize: 14,
              letterSpacing: '0.18em',
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            大阪梅田発 伴走型ビジネス支援
          </div>
        </div>
      </div>
    </SceneFade>
  );
};
