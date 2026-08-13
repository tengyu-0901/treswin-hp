import React from 'react';
import {SceneFade} from '../components/SceneFade';
import {ValueItem} from '../components/ValueItem';
import {monoFont} from '../fonts';
import {COLORS} from '../theme';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';

const ITEMS = [
  'キャリアビジョンの整理',
  '市場価値の向上支援',
  '企業マッチングサポート',
];

export const Scene4Values: React.FC<{durationInFrames: number}> = ({durationInFrames}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const headerProgress = spring({fps, frame, config: {damping: 20}});

  return (
    <SceneFade durationInFrames={durationInFrames}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 70}}>
        <div
          style={{
            fontFamily: monoFont,
            fontSize: 20,
            letterSpacing: '0.25em',
            color: COLORS.goldL,
            opacity: headerProgress,
            transform: `translateY(${(1 - headerProgress) * -14}px)`,
          }}
        >
          伴走型サポートの3つの柱
        </div>

        <div style={{display: 'flex', flexDirection: 'column', gap: 56}}>
          {ITEMS.map((label, i) => (
            <ValueItem key={label} index={i + 1} label={label} startFrame={20 + i * 34} />
          ))}
        </div>
      </div>
    </SceneFade>
  );
};
