import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, NEWS, rise, tw, IN_OUT } from './theme.js';
import { T } from './timeline.js';

// 1. The promise, before any product: one calm line on cream.
export const SceneHero = () => {
  const f = useCurrentFrame();
  if (f > T.heroOut + 26) return null;
  const out = tw(f, T.heroOut, T.heroOut + 22, 0, 1, IN_OUT);
  const h1 = { fontFamily: NEWS, fontWeight: 400, fontSize: 168, lineHeight: 1.04, letterSpacing: '-0.03em', color: C.ink, margin: 0 };
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: 1 - out, transform: `translateY(${-40 * out}px)` }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ ...h1, ...rise(f, T.lessIn, 34, 34) }}>Less scribbling.</h1>
        <h1 style={{ ...h1 }}>
          <span style={rise(f, T.moreIn, 34, 34)}>More </span>
          <em style={{ ...rise(f, T.beingIn, 38, 34), color: C.accent, fontStyle: 'italic', display: 'inline-block' }}>being here.</em>
        </h1>
      </div>
    </AbsoluteFill>
  );
};
