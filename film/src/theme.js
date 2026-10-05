import { Easing, interpolate } from 'remotion';
import { loadFont as loadNewsreader } from '@remotion/google-fonts/Newsreader';
import { loadFont as loadSchibsted } from '@remotion/google-fonts/SchibstedGrotesk';

// The same two faces as the site (app/layout.tsx): Newsreader for display, Schibsted Grotesk for body.
export const { fontFamily: NEWS } = loadNewsreader('normal', { weights: ['400'], subsets: ['latin'] });
loadNewsreader('italic', { weights: ['400'], subsets: ['latin'] });
export const { fontFamily: SANS } = loadSchibsted('normal', { weights: ['400', '500', '600'], subsets: ['latin'] });

// The palette from DESIGN.md: one world, landing and app.
export const C = {
  cream: '#f6f1e7',
  paper: '#fffdf8',
  wash: '#ece6d9',
  ink: '#1c2b36',
  slate: '#2b4455',
  muted: '#5c6873',
  line: '#d9d3c6',
  lineSoft: '#e6e1d6',
  accent: '#8e3b57',
  accentSoft: '#f3e4e9',
  accentDeep: '#6e2a43',
  danger: '#b9382b',
  dot: '#e4604a',
  wave: '#9fb0bd',
};

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };
export const OUT = Easing.bezier(0.16, 1, 0.3, 1); // long, soft landing
export const IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);

// interpolate with clamping and an easing, the one call every scene uses
export const tw = (f, a, b, from, to, easing = OUT) => interpolate(f, [a, b], [from, to], { ...clamp, easing });

// a soft rise into place: opacity and a short upward move
export const rise = (f, at, dur = 26, dist = 28) => {
  const t = tw(f, at, at + dur, 0, 1);
  return { opacity: t, transform: `translateY(${(1 - t) * dist}px)` };
};

// 0 -> 1 across a..b, then 1 -> 0 across c..d
export const win = (f, a, b, c, d) => tw(f, a, b, 0, 1, IN_OUT) * (1 - tw(f, c, d, 0, 1, IN_OUT));

// a string typed one character every `step` frames from frame `start`
export const typed = (str, f, start, step) => str.slice(0, Math.max(0, Math.min(str.length, Math.floor((f - start) / step))));

// A paper card, as on the site: paper on cream, a hairline, a shadow tinted from ink.
export const PAPER = {
  background: C.paper,
  border: `1px solid ${C.lineSoft}`,
  borderRadius: 16,
  boxShadow: '0 28px 56px -22px rgba(28, 43, 54, 0.28), 0 4px 14px rgba(28, 43, 54, 0.05)',
};

export const LABEL = {
  fontFamily: SANS,
  fontWeight: 600,
  fontSize: 22,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
};
