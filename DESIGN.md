# Muesli — visual world

Muesli is AI meeting notes that run in the browser. A Granola alternative for people who would rather be in the conversation than typing.
The design says calm and handled: a notepad, not a dashboard.

## Palette (one world, landing and app)

| Token | Value | Use |
|---|---|---|
| cream | `#f6f1e7` | page background |
| paper | `#fffdf8` | notes, cards, inputs on cream |
| wash | `#ece6d9` | stages, widget frames, footer |
| ink | `#1c2b36` | text, primary buttons |
| slate | `#2b4455` | the dark band, primary hover |
| muted | `#5c6873` | secondary text (5:1 on cream) |
| line | `#d9d3c6` / `#e6e1d6` | rules and borders |
| accent | `#8e3b57` | bilberry: emphasis, markers, the selected state |
| accent soft | `#f3e4e9` with text `#6e2a43` | tasks, badges, step icons |
| danger | `#b9382b` | stop, errors |

No gradients as decoration. Shadows carry an offset and a soft blur, tinted from ink.

## Type

- Display: Newsreader, weight 400, italic for the emphasised phrase. Tracking -0.02em to -0.03em at display sizes.
- Body: Schibsted Grotesk, 400 and 500, 600 for small labels.
- Floor: nothing under 13px on marketing, 12px in the app. Body text 15 to 18px, line-height 1.6.
- Section labels: small caps with letter-spacing .06em, only inside a note (Decisions, Next steps).

## Rules

- The hero is the product: a note being made from a meeting, with the recording chip. No stock imagery.
- No eyebrows above headings, no section numbers. The heading carries its own weight.
- Icons are drawn (app/icons.tsx), one stroke weight, never glyphs or emoji.
- Every link and button is at least 44px tall.
- Copy is the product's own language. Controls name their action ("Start recording", not "Find your flow").
- Reduced motion turns transitions off and freezes the waveform.
