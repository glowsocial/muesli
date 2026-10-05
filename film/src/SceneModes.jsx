import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, NEWS, SANS, LABEL, PAPER, rise, tw, IN_OUT } from './theme.js';
import { T } from './timeline.js';
import { ArrowDown } from './ui.jsx';

// 4. A little messy in. A lot clearer out. The four modes, with the site's own sample words and notes
// (app/notes-preview.tsx). Quotes are trimmed with an ellipsis; each one starts verbatim.
const CARDS = [
  { mode: 'Meeting', label: 'Team check-in', quote: 'Okay, let’s keep the launch small. One complete flow, not ten half-built features…', title: 'Monday, with a plan.', summary: 'Launch a smaller first version. Use early feedback to guide the next release.' },
  { mode: 'Voice memo', label: 'Morning walk', quote: 'Just had a thought on my walk. What if the welcome message didn’t explain everything…', title: 'An idea worth keeping.', summary: 'Help new customers reach their first useful result with a short welcome message.' },
  { mode: 'Brain dump', label: 'Thoughts, sorted', quote: 'So much in my head. The launch page needs finishing. I keep wanting to start something new…', title: 'A little more headspace.', summary: 'Finish the launch page before starting a new project.' },
  { mode: 'Content draft', label: 'Something to share', quote: 'I want to write about meeting notes. You’re trying to listen and type at the same time…', title: 'From thought to first draft.', summary: 'The best meeting notes let you be present.' },
];
const W = 400;
const GAP = 32;
const LEFT = (1920 - (4 * W + 3 * GAP)) / 2;

export const SceneModes = () => {
  const f = useCurrentFrame();
  if (f < T.modesHead - 4 || f > T.modesOut + 26) return null;
  const exit = tw(f, T.modesOut, T.modesOut + 22, 0, 1, IN_OUT);
  return (
    <AbsoluteFill style={{ opacity: 1 - exit, transform: `translateY(${-24 * exit}px)` }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: NEWS, fontSize: 96, letterSpacing: '-0.03em', lineHeight: 1.05, color: C.ink, ...rise(f, T.modesHead, 34, 30) }}>
        A little messy in. <em style={{ color: C.accent }}>A lot clearer out.</em>
      </div>
      {CARDS.map((c, i) => {
        const at = T.cards[i];
        return (
          <div key={c.mode} style={{ position: 'absolute', left: LEFT + i * (W + GAP), top: 350, width: W, height: 580, ...PAPER, padding: 32, boxSizing: 'border-box', ...rise(f, at, 30, 46) }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ ...LABEL, fontSize: 20, color: C.accentDeep, background: C.accentSoft, borderRadius: 999, padding: '7px 16px' }}>{c.mode}</span>
            </div>
            <p style={{ fontFamily: NEWS, fontStyle: 'italic', fontSize: 28, lineHeight: 1.32, color: C.muted, margin: '26px 0 0', height: 148 }}>“{c.quote}”</p>
            <div style={{ color: C.accent, margin: '14px 0', opacity: tw(f, at + 14, at + 30, 0, 1) }}><ArrowDown size={34} /></div>
            <div style={{ opacity: tw(f, at + 16, at + 38, 0, 1), transform: `translateY(${(1 - tw(f, at + 16, at + 38, 0, 1)) * 14}px)` }}>
              <h3 style={{ fontFamily: NEWS, fontWeight: 400, fontSize: 44, lineHeight: 1.1, letterSpacing: '-0.02em', color: C.ink, margin: '0 0 14px' }}>{c.title}</h3>
              <p style={{ fontFamily: SANS, fontSize: 25, lineHeight: 1.45, color: C.muted, margin: 0 }}>{c.summary}</p>
            </div>
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 968, textAlign: 'center', fontFamily: SANS, fontSize: 24, color: C.muted, opacity: tw(f, T.cards[3] + 20, T.cards[3] + 44, 0, 1) }}>
        Samples, not live recordings.
      </div>
    </AbsoluteFill>
  );
};
