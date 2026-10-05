import { Composition } from 'remotion';
import { Film } from './Film.jsx';
import { DURATION, FPS } from './timeline.js';

export const Root = () => (
  <Composition id="MuesliFilm" component={Film} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} />
);
