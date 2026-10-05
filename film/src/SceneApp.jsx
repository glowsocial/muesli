import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, NEWS, SANS, rise, tw, typed, win, IN_OUT } from './theme.js';
import { MODES, T } from './timeline.js';
import { Cursor } from './ui.jsx';

// 2. The real dashboard (app/dashboard/page.tsx, app/globals.css), rebuilt at its true labels and
// colors and shown through a camera. Stop saves a row in Recordings; Generate Notes is a button on
// that row; the notes arrive as a downloadable file in Notes. Captions are the site's own three steps.
const S = 1.4; // zoom on the 560 px column
const X0 = 858; // screen x of the column's left edge
const Y0 = 16; // screen y of the column's top edge
const REC_END = 768; // the timer lands on 12:48
const TITLE = 'Product sync';
const D = {
  card: '#fffdf8', border: '#e6e1d6', borderHover: '#d9d3c6', input: '#efe9dd', inputBorder: '#d9d3c6',
  text: '#1c2b36', secondary: '#3f4d58', muted: '#5c6873', accent: '#8e3b57', accentBg: '#f3e4e9',
  accentBorder: '#d8a9bb', accentText: '#6e2a43', danger: '#b9382b', dangerBg: '#fbeeec', dangerBorder: '#efc3bd', success: '#3f7a4a',
};

const pad2 = (n) => String(n).padStart(2, '0');
const clock = (s) => `${pad2(Math.floor(s / 60))}:${pad2(Math.floor(s % 60))}`;

const MicIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);
const StopIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2" /></svg>
);
const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const Spinner = ({ f }) => (
  <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(142,59,87,0.2)', borderTopColor: D.accent, borderRadius: '50%', transform: `rotate(${f * 22}deg)` }} />
);

const cardStyle = (compact) => ({
  background: D.card, border: `1px solid ${D.border}`, borderRadius: 20, padding: compact ? '24px 28px' : 32, marginBottom: 16,
  boxShadow: '0 1px 3px rgba(28,43,54,0.05), 0 4px 14px rgba(28,43,54,0.04)',
});
const sectionTitle = { fontFamily: NEWS, fontSize: 17, fontWeight: 600, color: D.text, letterSpacing: '-0.01em', margin: 0 };
const count = { fontSize: 11, color: D.muted, background: D.input, padding: '2px 8px', borderRadius: 100, fontWeight: 600 };
const btnSm = { padding: '8px 16px', minHeight: 44, borderRadius: 10, fontSize: 12, fontWeight: 600, fontFamily: SANS, whiteSpace: 'nowrap', border: '1px solid', marginLeft: 12, display: 'inline-flex', alignItems: 'center' };

// camera: where the column sits on screen as the flow moves down the page
// (a fixed frame: the column fits, and the cards that grow below the fold are cropped, as a page is)
const panAt = () => 0;

// 1x layout of the column (container-relative px), so the cursor can find the buttons it presses
const layout = (f) => {
  const recording = f >= T.startClick && f < T.stopClick;
  const status = f >= T.genClick;
  const h1 = recording ? 400 : 241;
  const recTop = 124 + h1 + (status ? 40 : 0) + 16;
  const hasRow = f >= T.rowIn;
  const recH = hasRow ? 154 : 220;
  const notesTop = recTop + recH + 16;
  return { recTop, notesTop, rowY: recTop + 62 + 34, noteRowY: notesTop + 62 + 34 };
};
const toScreen = (x, y, pan) => [X0 + x * S, Y0 + y * S + pan];

const Caption = ({ f, at, until, title, em, sub }) => {
  const o = win(f, at, at + 22, until - 16, until);
  if (o <= 0.001) return null;
  return (
    <div style={{ position: 'absolute', left: 130, top: 330, width: 600, opacity: o, transform: `translateY(${(1 - o) * 24}px)` }}>
      <div style={{ fontFamily: NEWS, fontSize: 104, lineHeight: 1.04, letterSpacing: '-0.03em', color: C.ink }}>
        {title} <em style={{ color: C.accent }}>{em}</em>
      </div>
      <div style={{ fontFamily: SANS, fontSize: 31, lineHeight: 1.5, color: C.muted, marginTop: 26, maxWidth: 560 }}>{sub}</div>
    </div>
  );
};

export const SceneApp = () => {
  const f = useCurrentFrame();
  if (f < T.appIn || f > T.appOut + 26) return null;
  const exit = tw(f, T.appOut, T.appOut + 22, 0, 1, IN_OUT);
  const pan = panAt(f);
  const L = layout(f);

  const recording = f >= T.startClick && f < T.stopClick;
  const afterStop = f >= T.stopClick;
  const processing = f >= T.genClick && f < T.procEnd;
  const done = f >= T.procEnd;
  const hasRow = f >= T.rowIn;
  const hasNote = f >= T.noteRow;
  const secs = tw(f, T.startClick, T.stopClick, 0, REC_END, (x) => x);
  const typedTitle = afterStop ? '' : typed(TITLE, f, T.titleType, T.titleStep);
  const focusing = !recording && !afterStop && f >= T.titleType - 4 && f < T.startClick - 6;
  const press = (at) => (f >= at && f < at + 6 ? 0.975 : 1);

  const wave = [0, 0.1, 0.2, 0.3, 0.4, 0.3, 0.2, 0.1, 0].map((d) => 8 + 16 * (0.5 - 0.5 * Math.cos(0.2618 * f - d * 7.85)));
  const pulse = (f % 60) / 60;

  const status = processing ? { t: `Processing "${TITLE}"...`, c: D.accent, spin: true } : done ? { t: 'Notes generated!', c: D.success } : null;

  // the cursor presses four buttons: Start, Stop, Generate Notes, Download
  const pt = (f0, x, y) => [f0, ...toScreen(x, y, panAt(f0))];
  const start = { x: 280, y: 307 };
  const stop = { x: 280, y: 466 };
  const genY = layout(T.genClick).rowY;
  const dlY = layout(T.dlClick).noteRowY;
  const path = [
    pt(T.cursorIn, 520, 420),
    pt(T.startClick, start.x, start.y),
    pt(T.startClick + 26, 420, 330),
    pt(T.stopClick - 26, 420, 400),
    pt(T.stopClick, stop.x, stop.y),
    pt(T.stopClick + 24, 400, 420),
    pt(T.genClick - 22, 440, genY + 30),
    pt(T.genClick, 449, genY),
    pt(T.genClick + 22, 400, genY + 60),
    pt(T.dlClick - 26, 420, dlY + 70),
    pt(T.dlClick, 457, dlY),
  ];

  return (
    <AbsoluteFill style={{ opacity: 1 - exit, transform: `translateY(${exit * 24}px)` }}>
      <Caption f={f} at={T.cap1} until={T.cap2} title="Press" em="record." sub="Open Muesli on your phone, laptop, or tablet. Name the meeting and let the conversation begin." />
      <Caption f={f} at={T.cap2} until={T.cap3} title="Follow the" em="thought." sub="Your browser keeps the audio while you stay in the room." />
      <Caption f={f} at={T.cap3} until={T.appOut + 8} title="Leave with" em="clarity." sub="The summary, the decisions, and the next steps, ready to take with you." />

      <div style={{ position: 'absolute', left: 0, top: 0, ...rise(f, T.appIn, 28, 40) }}>
      <div style={{ position: 'absolute', left: X0, top: Y0, width: 560, transformOrigin: 'top left', transform: `translateY(${pan}px) scale(${S})`, fontFamily: SANS, color: D.text }}>
        <div style={{ padding: '48px 20px 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
            <div style={{ fontFamily: NEWS, fontSize: 24, fontWeight: 700 }}>Muesli</div>
            <div style={{ padding: '8px 14px', minHeight: 44, display: 'flex', alignItems: 'center', borderRadius: 10, fontSize: 13, fontWeight: 600, border: `1px solid ${D.border}`, color: D.muted }}>Sign Out</div>
          </div>

          {/* recording card */}
          <div style={cardStyle(false)}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12, opacity: recording ? 0.4 : 1 }}>
              {MODES.map((m, i) => (
                <span key={m} style={{ padding: '8px 14px', minHeight: 44, display: 'inline-flex', alignItems: 'center', borderRadius: 100, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', border: `1px solid ${i === 0 ? D.accentBorder : D.border}`, background: i === 0 ? D.accentBg : D.input, color: i === 0 ? D.accentText : D.muted }}>{m}</span>
              ))}
            </div>
            <div style={{ width: '100%', padding: '14px 18px', background: D.input, border: `1px solid ${focusing ? D.accent : D.inputBorder}`, boxShadow: focusing ? '0 0 0 3px rgba(142,59,87,0.12)' : 'none', borderRadius: 14, fontSize: 15, marginBottom: 20, opacity: recording ? 0.4 : 1, minHeight: 49, boxSizing: 'border-box' }}>
              {typedTitle ? <span>{typedTitle}</span> : <span style={{ color: D.muted }}>e.g. UX Review with Dan</span>}
            </div>

            {recording && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24, paddingTop: 4 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', height: 28, gap: 3, marginBottom: 16 }}>
                  {wave.map((h, i) => <span key={i} style={{ width: 3, height: h, borderRadius: 3, background: D.danger }} />)}
                </div>
                <div style={{ fontFamily: NEWS, fontSize: 40, fontWeight: 600, color: D.danger, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', lineHeight: 1.2 }}>{clock(secs)}</div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, padding: '5px 14px', borderRadius: 100, background: D.dangerBg, border: `1px solid ${D.dangerBorder}`, color: D.danger, fontSize: 12, fontWeight: 600 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: D.danger, opacity: 0.35 + 0.65 * Math.abs(Math.cos(f * 0.105)) }} />
                  Recording
                </div>
              </div>
            )}

            <div style={{ width: '100%', padding: 16, borderRadius: 16, fontSize: 16, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxSizing: 'border-box', background: recording ? D.danger : D.accent, boxShadow: recording ? `0 0 0 ${12 * pulse}px rgba(196,69,54,${0.3 * (1 - pulse)})` : '0 4px 16px rgba(142,59,87,0.25)', transform: `scale(${recording ? press(T.stopClick) : press(T.startClick)})` }}>
              {recording ? <><StopIcon /> Stop Recording</> : <><MicIcon /> Start Recording</>}
            </div>
            {status && (
              <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: status.c, height: 20 }}>
                {status.spin && <Spinner f={f} />}{status.t}
              </div>
            )}
          </div>

          {/* recordings */}
          <div style={cardStyle(true)}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={sectionTitle}>Recordings</h2>
              {hasRow && <span style={count}>1</span>}
            </div>
            {!hasRow ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3, margin: '0 auto 10px', display: 'block' }}>
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
                </svg>
                <p style={{ fontSize: 14, color: D.muted, margin: 0 }}>Hit record to get started</p>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', margin: '0 -16px', opacity: tw(f, T.rowIn, T.rowIn + 18, 0, 1) }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, textTransform: 'capitalize' }}>{TITLE}</div>
                  <div style={{ fontSize: 12, color: D.muted, marginTop: 3 }}>Oct 5, 9:30 AM · 6.1 MB</div>
                </div>
                <span style={{ ...btnSm, background: D.accentBg, borderColor: D.accentBorder, color: D.accentText, opacity: processing ? 0.5 : 1, transform: `scale(${press(T.genClick)})`, gap: 8 }}>
                  {processing ? <><Spinner f={f} /> Processing...</> : 'Generate Notes'}
                </span>
              </div>
            )}
          </div>

          {/* notes */}
          <div style={cardStyle(true)}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={sectionTitle}>Notes</h2>
              {hasNote && <span style={count}>1</span>}
            </div>
            {!hasNote ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3, margin: '0 auto 10px', display: 'block' }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                <p style={{ fontSize: 14, color: D.muted, margin: 0 }}>Notes will appear here after processing</p>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', margin: '0 -16px', opacity: tw(f, T.noteRow, T.noteRow + 18, 0, 1) }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, textTransform: 'capitalize' }}>{TITLE}</div>
                  <div style={{ fontSize: 12, color: D.muted, marginTop: 3 }}>Oct 5, 9:34 AM</div>
                </div>
                <span style={{ ...btnSm, background: D.input, borderColor: D.border, color: D.secondary, transform: `scale(${press(T.dlClick)})` }}><DownloadIcon /> Download</span>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>

      <Cursor frame={f} clicks={[T.startClick, T.stopClick, T.genClick, T.dlClick]} path={path} opacity={tw(f, T.cursorIn, T.cursorIn + 14, 0, 1) * (1 - tw(f, T.dlClick + 14, T.dlClick + 30, 0, 1))} />
    </AbsoluteFill>
  );
};
