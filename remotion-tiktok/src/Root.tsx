import React from 'react';
import {Composition} from 'remotion';
import {CareerVideo, TOTAL_DURATION} from './CareerVideo';
import {LocalFonts} from './LocalFonts';
import {FPS, HEIGHT, WIDTH} from './theme';

export const Root: React.FC = () => {
  return (
    <>
      <LocalFonts />
      <Composition
        id="CareerSupport"
        component={CareerVideo}
        durationInFrames={TOTAL_DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    </>
  );
};
