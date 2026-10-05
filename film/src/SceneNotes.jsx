import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, NEWS, SANS, LABEL, PAPER, rise, tw, typed, IN_OUT } from './theme.js';
import { T } from './timeline.js';
import { ArrowRight, Download, SampleBadge, TaskBox } from './ui.jsx';

// 3. The words become the notes: "The words" beside "The clarity", the pair the site's preview shows.
// Copy is the site's own sample (app/page.tsx hero note, app/notes-preview.tsx).
const PAPER_TOP = 130;
const PAPER_H = 800;
const TITLE = 'Keep the first launch small.';

const Hi = ({ f, children }) => {
  const t = tw(f, T.hilite, T.hilite + 18, 0, 1);
  return (
    <span style={{ background: `rgba(243, 228, 233, ${t})`, color: t > 0.5 ? C.accentDeep : 'inherit', borderRadius: 6, padding: '0 6px', margin: '0 -6px', fontWeight: t > 0.5 ? 500 : 'inherit' }}>
      {children}
    </span>
  );
};

const Meta = ({ left, right }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', ...LABEL, color: C.muted }}>
    <span>{left}</span>
    {right}
  </div>
);

export const SceneNotes = () => {
  const f = useCurrentFrame();
  if (f < T.papersIn - 4 || f > T.papersOut + 26) return null;
  const exit = tw(f, T.papersOut, T.papersOut + 22, 0, 1, IN_OUT);
  const task = rise(f, T.taskIn, 26, 20);
  const heading = (at) => ({ ...LABEL, fontSize: 22, color: C.ink, margin: '0 0 10px', ...rise(f, at, 22, 12) });
  const body = { fontFamily: SANS, fontSize: 29, lineHeight: 1.5, color: C.muted };

  return (
    <AbsoluteFill style={{ opacity: 1 - exit, transform: `translateY(${exit * 30}px)` }}>
      {/* the words */}
      <div style={{ position: 'absolute', left: 120, top: PAPER_TOP, width: 800, height: PAPER_H, ...PAPER, padding: 48, boxSizing: 'border-box', ...rise(f, T.papersIn, 30, 50) }}>
        <Meta left="The words" right={<SampleBadge />} />
        <div style={{ height: 2, background: C.lineSoft, margin: '22px 0 28px' }} />
        <p style={{ fontFamily: NEWS, fontSize: 48, lineHeight: 1.4, letterSpacing: '-0.01em', color: C.ink, margin: 0 }}>
          “Okay, let’s keep the launch small. One complete flow, not ten half-built features.{' '}
          <Hi f={f}>Alex</Hi>, can you send a <Hi f={f}>working draft</Hi> by <Hi f={f}>Friday</Hi>? Then we can get feedback and see what people actually need.”
        </p>
        <div style={{ position: 'absolute', left: 48, right: 48, bottom: 36, paddingTop: 20, borderTop: `1px solid ${C.lineSoft}`, fontFamily: SANS, fontSize: 24, color: C.muted }}>
          A thought doesn’t need to arrive neatly packaged.
        </div>
      </div>

      {/* the turn */}
      <div style={{ position: 'absolute', left: 960 - 36, top: PAPER_TOP + PAPER_H / 2 - 36, width: 72, height: 72, borderRadius: '50%', background: C.ink, color: C.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', ...rise(f, T.papersIn + 20, 22, 0), transform: `scale(${0.6 + 0.4 * tw(f, T.papersIn + 20, T.papersIn + 42, 0, 1)})` }}>
        <ArrowRight size={34} />
      </div>

      {/* the clarity */}
      <div style={{ position: 'absolute', left: 1000, top: PAPER_TOP, width: 800, height: PAPER_H, ...PAPER, padding: 48, boxSizing: 'border-box', ...rise(f, T.papersIn + 10, 30, 50) }}>
        <Meta left="The clarity" right={<SampleBadge />} />
        <h2 style={{ fontFamily: NEWS, fontWeight: 400, fontSize: 54, lineHeight: 1.1, letterSpacing: '-0.02em', margin: '22px 0 0', color: C.ink, minHeight: 60, whiteSpace: 'nowrap' }}>
          {typed(TITLE, f, T.noteTitle, T.noteTitleStep)}
        </h2>
        <div style={{ height: 2, background: C.lineSoft, margin: '24px 0 26px', width: `${tw(f, T.summaryIn - 14, T.summaryIn + 10, 0, 100)}%` }} />

        <div style={heading(T.summaryIn)}>Summary</div>
        <p style={{ ...body, margin: '0 0 28px', ...rise(f, T.summaryIn + 4, 26, 14) }}>
          One complete flow before new features. Alex sends a working draft on Friday, and the feedback decides the next release.
        </p>

        <div style={heading(T.decIn)}>Decisions</div>
        <ul style={{ ...body, margin: '0 0 26px', paddingLeft: 30 }}>
          <li style={{ ...rise(f, T.dec1, 22, 12) }}>Focus on one complete flow.</li>
          <li style={{ ...rise(f, T.dec2, 22, 12) }}>Test the working draft before adding features.</li>
        </ul>

        <div style={heading(T.nextIn)}>Next steps</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: C.accentSoft, color: C.accentDeep, borderRadius: 12, padding: '18px 22px', fontFamily: SANS, fontWeight: 500, fontSize: 28, ...task }}>
          <TaskBox on={tw(f, T.taskCheck, T.taskCheck + 12, 0, 1)} />
          Alex · Share the working draft by Friday.
        </div>

        <div style={{ position: 'absolute', left: 48, right: 48, bottom: 36, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20, borderTop: `1px solid ${C.lineSoft}`, fontFamily: SANS, fontSize: 24, color: C.muted, opacity: tw(f, T.footIn, T.footIn + 20, 0, 1) }}>
          <span>Made with Muesli</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}><Download size={26} /> product-sync.md</span>
        </div>
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, top: 962, textAlign: 'center', fontFamily: SANS, fontSize: 24, color: C.muted, opacity: tw(f, T.papersIn + 30, T.papersIn + 54, 0, 1) }}>
        A sample, not a live recording.
      </div>
    </AbsoluteFill>
  );
};
