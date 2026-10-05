import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, NEWS, SANS, rise, tw, IN_OUT } from './theme.js';
import { T } from './timeline.js';
import { ArrowUpRight, Mark, Wordmark } from './ui.jsx';

// 6. The manifesto on the slate band, then the close. Copy is the site's own (app/page.tsx).
export const SceneClose = () => {
  const f = useCurrentFrame();
  if (f < T.slate - 2) return null;
  const rose = tw(f, T.slate, T.slate + 30, 100, 0, IN_OUT);
  const manOut = tw(f, T.manifestoOut, T.manifestoOut + 22, 0, 1, IN_OUT);
  const line = { fontFamily: NEWS, fontSize: 108, lineHeight: 1.08, letterSpacing: '-0.03em', color: C.cream };
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', inset: 0, background: C.slate, transform: `translateY(${rose}%)` }} />

      {f < T.manifestoOut + 26 && (
        <AbsoluteFill style={{ opacity: 1 - manOut, transform: `translateY(${-24 * manOut}px)` }}>
          <div style={{ position: 'absolute', right: 70, top: 300, color: C.cream, opacity: 0.1 * tw(f, T.line1, T.line1 + 40, 0, 1) }}><Mark size={440} sw={0.7} /></div>
          <div style={{ position: 'absolute', left: 160, right: 160, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ ...line, ...rise(f, T.line1, 34, 30) }}>You brought the ideas.</div>
            <div style={{ ...line, ...rise(f, T.line2, 34, 30) }}>You shouldn’t have to bring</div>
            <div style={{ ...line, ...rise(f, T.line3, 38, 30), fontStyle: 'italic', color: C.accentSoft }}>the perfect memory.</div>
          </div>
        </AbsoluteFill>
      )}

      {f >= T.wordmark - 4 && (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <div style={rise(f, T.wordmark, 34, 30)}><Wordmark size={250} color={C.cream} dot={C.accentSoft} /></div>
          <div style={{ fontFamily: NEWS, fontSize: 64, letterSpacing: '-0.02em', color: C.cream, marginTop: 30, ...rise(f, T.tagline, 30, 22) }}>
            Good conversations. <em style={{ color: C.accentSoft }}>Great notes.</em>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 36, marginTop: 56, ...rise(f, T.cta, 30, 20) }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 14, height: 84, padding: '0 38px', borderRadius: 12, background: C.cream, color: C.ink, fontFamily: SANS, fontWeight: 500, fontSize: 32 }}>
              Start recording <ArrowUpRight size={30} />
            </span>
            <span style={{ fontFamily: SANS, fontSize: 36, color: C.cream, opacity: 0.86 * tw(f, T.domain, T.domain + 20, 0, 1) }}>mueslirecorder.com</span>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
