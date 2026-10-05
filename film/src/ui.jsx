import { interpolate } from 'remotion';
import { C, NEWS, SANS, LABEL, clamp, tw, IN_OUT } from './theme.js';

// Drawn icons, one stroke weight, as on the site (app/icons.tsx). No glyphs, no emoji.
const svg = (size, sw = 1.75) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: sw,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
});
export const Mic = ({ size = 28 }) => (
  <svg {...svg(size)}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" /></svg>
);
export const Square = ({ size = 28 }) => (
  <svg {...svg(size)}><rect x="5" y="5" width="14" height="14" rx="3" /></svg>
);
export const Notes = ({ size = 28 }) => (
  <svg {...svg(size)}><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h4" /></svg>
);
export const Download = ({ size = 28 }) => (
  <svg {...svg(size)}><path d="M12 4v11M7 10l5 5 5-5M5 19h14" /></svg>
);
export const ArrowRight = ({ size = 28 }) => (
  <svg {...svg(size)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const ArrowDown = ({ size = 28 }) => (
  <svg {...svg(size)}><path d="M12 5v14M6 13l6 6 6-6" /></svg>
);
export const ArrowUpRight = ({ size = 28 }) => (
  <svg {...svg(size)}><path d="M7 17 17 7M9 7h8v8" /></svg>
);
export const Check = ({ size = 28, sw = 2.2 }) => (
  <svg {...svg(size, sw)}><path d="m5 12 4.5 4.5L19 7" /></svg>
);
export const Mark = ({ size = 320, sw = 1 }) => (
  <svg {...svg(size, sw)}><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" /></svg>
);

// muesli. , the wordmark
export const Wordmark = ({ size = 48, color = C.ink, dot = C.accent }) => (
  <span style={{ fontFamily: NEWS, fontSize: size, letterSpacing: '-0.03em', color, lineHeight: 1 }}>
    muesli<span style={{ color: dot }}>.</span>
  </span>
);

// Live waveform: deterministic in the frame, so every render is identical.
export const Wave = ({ frame, bars = 46, height = 120, still = false, color = C.slate }) => {
  const speech = 0.4 + 0.6 * Math.abs(Math.sin(frame * 0.09) * Math.sin(frame * 0.031 + 1.3));
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, height }}>
      {Array.from({ length: bars }, (_, i) => {
        const wob = 0.5 + 0.5 * Math.sin(i * 0.83 + frame * 0.31) * Math.cos(i * 0.37 - frame * 0.17);
        const edge = Math.sin((Math.PI * (i + 0.5)) / bars);
        const h = still ? 6 + 4 * edge : 8 + (height - 8) * speech * (0.25 + 0.75 * wob) * (0.35 + 0.65 * edge);
        return <i key={i} style={{ width: 6, height: h, borderRadius: 3, background: color, opacity: still ? 0.55 : 0.9 }} />;
      })}
    </div>
  );
};

// A pill that names a mode, selected or not.
export const ModeChip = ({ label, selected }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      height: 56,
      padding: '0 14px',
      borderRadius: 999,
      fontFamily: SANS,
      fontWeight: 500,
      fontSize: 22,
      background: selected ? C.ink : 'transparent',
      color: selected ? C.cream : C.ink,
      border: `1.5px solid ${selected ? C.ink : C.line}`,
      whiteSpace: 'nowrap',
    }}
  >
    {label}
  </span>
);

// The small SAMPLE badge the landing's preview carries.
export const SampleBadge = () => (
  <span style={{ ...LABEL, fontSize: 18, color: C.accentDeep, background: C.accentSoft, borderRadius: 999, padding: '6px 14px' }}>Sample</span>
);

// The note's checkbox: a small box that fills and ticks.
export const TaskBox = ({ on }) => (
  <span
    style={{
      width: 34,
      height: 34,
      borderRadius: 9,
      background: on > 0.01 ? C.accent : 'transparent',
      border: `2px solid ${C.accent}`,
      color: C.cream,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 'none',
    }}
  >
    <span style={{ opacity: on, transform: `scale(${0.6 + 0.4 * on})`, display: 'flex' }}><Check size={22} /></span>
  </span>
);

// The pointer: moves along keyframes [[frame, x, y], ...] and rings on each click frame.
export const Cursor = ({ frame, path, clicks, opacity = 1 }) => {
  const fs = path.map((p) => p[0]);
  const x = interpolate(frame, fs, path.map((p) => p[1]), { ...clamp, easing: IN_OUT });
  const y = interpolate(frame, fs, path.map((p) => p[2]), { ...clamp, easing: IN_OUT });
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, opacity, pointerEvents: 'none' }}>
      {clicks.map((c) => {
        const t = tw(frame, c, c + 16, 0, 1);
        const cx = interpolate(c, fs, path.map((p) => p[1]), clamp);
        const cy = interpolate(c, fs, path.map((p) => p[2]), clamp);
        return frame >= c && t < 1 ? (
          <span key={c} style={{ position: 'absolute', left: cx - 36, top: cy - 36, width: 72, height: 72, borderRadius: '50%', border: `3px solid ${C.accent}`, opacity: 0.5 * (1 - t), transform: `scale(${0.4 + 0.9 * t})` }} />
        ) : null;
      })}
      <svg width="44" height="44" viewBox="0 0 24 24" style={{ position: 'absolute', left: x - 6, top: y - 4, filter: 'drop-shadow(0 4px 6px rgba(28,43,54,0.25))' }}>
        <path d="M5 3l14 8-6 2 3.5 6.5-3 1.6L10 15l-5 4z" fill={C.ink} stroke={C.cream} strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    </div>
  );
};
