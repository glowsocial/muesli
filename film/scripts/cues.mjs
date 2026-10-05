// Writes the film's sound cues (from src/timeline.js) to public/audio/cues.json for the score.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ARP, CHORDS, DURATION, FPS, T, cues } from '../src/timeline.js';

const out = fileURLToPath(new URL('../public/audio/cues.json', import.meta.url));
writeFileSync(out, JSON.stringify({ fps: FPS, duration: DURATION, T, chords: CHORDS, arp: ARP, cues: cues() }, null, 1));
console.log(`wrote ${cues().length} cues to ${out}`);
