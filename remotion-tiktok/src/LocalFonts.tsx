import React, {useEffect} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';

const FACES: {family: string; weight: number; file: string}[] = [
  {family: 'DM Mono', weight: 400, file: 'DMMono-400.woff2'},
  {family: 'DM Mono', weight: 500, file: 'DMMono-500.woff2'},
  {family: 'Noto Sans JP', weight: 400, file: 'NotoSansJP-400.woff2'},
  {family: 'Noto Sans JP', weight: 500, file: 'NotoSansJP-500.woff2'},
  {family: 'Noto Sans JP', weight: 700, file: 'NotoSansJP-700.woff2'},
  {family: 'Noto Sans JP', weight: 900, file: 'NotoSansJP-900.woff2'},
  {family: 'Noto Serif JP', weight: 700, file: 'NotoSerifJP-700.woff2'},
  {family: 'Noto Serif JP', weight: 900, file: 'NotoSerifJP-900.woff2'},
];

const css = FACES.map(
  ({family, weight, file}) => `
@font-face {
  font-family: '${family}';
  font-style: normal;
  font-weight: ${weight};
  font-display: block;
  src: url('${staticFile(`fonts/${file}`)}') format('woff2');
}`
).join('\n');

export const LocalFonts: React.FC = () => {
  useEffect(() => {
    const handle = delayRender('Loading local fonts');
    Promise.all(
      FACES.map(({family, weight}) => document.fonts.load(`${weight} 16px "${family}"`))
    )
      .then(() => document.fonts.ready)
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  }, []);

  return <style>{css}</style>;
};
