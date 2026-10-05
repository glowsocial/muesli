import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, NEWS, SANS, PAPER, rise, tw, IN_OUT } from './theme.js';
import { T } from './timeline.js';
import { ArrowRight, Check, Download } from './ui.jsx';

// 5. Good notes travel. The download, and the three places the site says a note can go.
const DESTS = ['Obsidian', 'Your project folder', 'Any writing app'];

export const SceneTravel = () => {
  const f = useCurrentFrame();
  if (f < T.travelHead - 4 || f > T.travelOut + 26) return null;
  const exit = tw(f, T.travelOut, T.travelOut + 22, 0, 1, IN_OUT);
  const file = rise(f, T.fileIn, 28, 36);
  return (
    <AbsoluteFill style={{ opacity: 1 - exit, transform: `translateY(${-24 * exit}px)` }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center', ...rise(f, T.travelHead, 34, 30) }}>
        <div style={{ fontFamily: NEWS, fontSize: 124, letterSpacing: '-0.03em', lineHeight: 1.04, color: C.ink }}>
          Good notes <em style={{ color: C.accent }}>travel.</em>
        </div>
        <div style={{ fontFamily: SANS, fontSize: 34, color: C.muted, marginTop: 22 }}>Download your notes as Markdown.</div>
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, top: 620, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 36 }}>
        <div style={{ ...PAPER, ...file, display: 'flex', alignItems: 'center', gap: 16, padding: '0 34px', height: 112, fontFamily: SANS, fontWeight: 500, fontSize: 34, color: C.ink }}>
          <span style={{ color: C.accent, display: 'flex' }}><Download size={40} /></span>
          product-sync.md
        </div>
        <span style={{ color: C.muted, display: 'flex', opacity: tw(f, T.dests[0] - 10, T.dests[0] + 8, 0, 1) }}><ArrowRight size={48} /></span>
        <div style={{ display: 'flex', gap: 18 }}>
          {DESTS.map((d, i) => {
            const at = T.dests[i];
            return (
              <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 14, height: 112, padding: '0 30px', borderRadius: 16, background: C.wash, border: `1px solid ${C.line}`, fontFamily: SANS, fontWeight: 500, fontSize: 30, color: C.ink, whiteSpace: 'nowrap', ...rise(f, at, 24, 24) }}>
                <span style={{ width: 36, height: 36, borderRadius: '50%', background: C.accent, color: C.cream, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={22} /></span>
                {d}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
