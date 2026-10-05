// Every beat of the film, in frames at 30 fps. The scenes and the sound score both read this
// file (scripts/cues.mjs turns it into public/audio/cues.json), so a timing change moves the
// picture and its sound together. Plain values only: no Remotion import here.

export const FPS = 30;
export const DURATION = 1500; // exactly 50 s

export const T = {
  // 1. Less scribbling. More being here. (0 to 106)
  wordmarkIn: 6,
  lessIn: 8,
  moreIn: 30,
  beingIn: 44,
  heroOut: 84,
  // 2. The real dashboard: record, stop, generate, download (106 to 528)
  appIn: 106,
  cap1: 112, // Press record.
  titleType: 140,
  titleStep: 3,
  cursorIn: 166,
  startClick: 198,
  cap2: 208, // Follow the thought.
  stopClick: 300,
  rowIn: 310,
  cap3: 320, // Leave with clarity.
  genClick: 358,
  procEnd: 406,
  noteRow: 414,
  dlClick: 478,
  appOut: 506,
  // 3. What is inside the notes: a sample (536 to 834)
  papersIn: 536,
  noteTitle: 560,
  noteTitleStep: 2,
  summaryIn: 626,
  decIn: 662,
  dec1: 672,
  dec2: 688,
  nextIn: 716,
  hilite: 720,
  taskIn: 728,
  taskCheck: 752,
  footIn: 770,
  papersOut: 812,
  // 4. A little messy in. A lot clearer out. (838 to 1042)
  modesHead: 838,
  cards: [866, 896, 926, 956],
  modesOut: 1020,
  // 5. Good notes travel. (1046 to 1172)
  travelHead: 1046,
  fileIn: 1070,
  dests: [1096, 1112, 1128],
  travelOut: 1150,
  // 6. You brought the ideas. (1152 to 1500)
  slate: 1152,
  line1: 1190,
  line2: 1216,
  line3: 1244,
  manifestoOut: 1296,
  wordmark: 1322,
  tagline: 1352,
  cta: 1374,
  domain: 1392,
};

export const MODES = ['Meeting Notes', 'Voice Memo', 'Brain Dump', 'Content Draft'];

// The sound cues, derived from the beats above: [frame, kind, value]. See scripts/sound.py.
export const cues = () => {
  const c = [];
  for (let i = 0; i < 12; i++) c.push([T.titleType + i * T.titleStep, 'softkey', i]);
  c.push([T.startClick, 'click', 0]);
  c.push([T.stopClick, 'click', 0]);
  c.push([T.rowIn, 'pop', 0]);
  c.push([T.genClick, 'click', 0]);
  c.push([T.procEnd, 'chime', 1]);
  c.push([T.noteRow, 'pop', 2]);
  c.push([T.dlClick, 'click', 0]);
  c.push([T.papersIn - 8, 'whoosh', 0]);
  for (let i = 0; i < 28; i += 2) c.push([T.noteTitle + i * T.noteTitleStep, 'softkey', i]);
  c.push([T.summaryIn, 'pluck', 3]);
  c.push([T.dec1, 'pluck', 4]);
  c.push([T.dec2, 'pluck', 5]);
  c.push([T.taskIn, 'pluck', 7]);
  c.push([T.taskCheck, 'tick', 0]);
  T.cards.forEach((q, i) => c.push([q, 'chime', i]));
  c.push([T.fileIn, 'lift', 0]);
  T.dests.forEach((q, i) => c.push([q, 'pop', i + 1]));
  c.push([T.slate, 'dusk', 0]);
  c.push([T.wordmark, 'accent', 0]);
  c.push([T.tagline, 'resolve', 0]);
  return c.sort((a, b) => a[0] - b[0]);
};

// Chord changes, in seconds, taken from the beats above (a calm pad that turns with each scene).
const s = (frame) => frame / FPS;
export const CHORDS = [
  [0.0, [41, 48, 52, 55, 57]], // Fmaj9: less scribbling
  [s(T.appIn), [38, 45, 48, 52, 53]], // Dm9: the app
  [s(T.papersIn), [46, 53, 57, 60, 62]], // Bbmaj9: the notes
  [s(T.modesHead), [45, 52, 55, 57, 60]], // F/A: messy in, clearer out
  [s(T.travelHead), [43, 50, 53, 57, 58]], // Gm9: notes travel
  [s(T.slate + 24), [38, 45, 48, 53, 57]], // Dm9, lower: the manifesto
  [s(T.wordmark), [41, 48, 52, 55, 57, 60, 64]], // Fmaj9: the close
];
export const ARP = { start: s(T.appIn) + 1.2, end: s(T.slate), cal: s(T.modesHead), app: s(T.travelHead) };
