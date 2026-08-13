import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS} from '../theme';

export const BackgroundFX: React.FC<{grain?: boolean}> = ({grain = true}) => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 90) * 40;

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.navy3}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${50 + drift * 0.3}% -10%, rgba(154,123,60,0.22) 0%, rgba(154,123,60,0) 55%),
                       radial-gradient(circle at ${20 - drift * 0.2}% 110%, rgba(22,45,80,0.6) 0%, rgba(10,22,40,0) 60%)`,
        }}
      />
      {grain ? (
        <AbsoluteFill
          style={{
            opacity: 0.05,
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27120%27 height=%27120%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%272%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E")',
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
