"""The film's score: an original, generated sound design (no samples, nothing licensed).

A soft electronic pad that changes chord with each scene, a light pluck pulse under the
busy middle, and small tactile UI sounds on the cues in public/audio/cues.json (written from
src/timeline.js by scripts/cues.mjs). Writes public/audio/score.wav, 48 kHz stereo, exactly 60 s.

Run: npm run audio   (node scripts/cues.mjs, then this file under uv with numpy)

The 15-second ad scores from its own cue sheet, which also carries its chords and pulse:
npm run audio:ad   (sound.py public/audio/ad-cues.json public/audio/ad-score.wav)
"""
import json
import sys
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
CUES_PATH = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "public/audio/cues.json"
OUT_PATH = Path(sys.argv[2]) if len(sys.argv) > 2 else ROOT / "public/audio/score.wav"
CUES = json.loads(CUES_PATH.read_text())
FPS = CUES["fps"]
SR = 48000
LEN = CUES["duration"] / FPS  # 60.0 s (the ad: 15.0 s)
N = int(LEN * SR)
rng = np.random.default_rng(7)


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def t_of(frame):
    return frame / FPS


def env_ad(n, attack, decay):
    t = np.arange(n) / SR
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    return a * np.exp(-np.maximum(t - attack, 0) / decay)


def lowpass_fast(x, cutoff):
    # frequency-domain low-pass for long signals
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (f / cutoff) ** 4)
    return np.fft.irfft(X, len(x))


def bandpass_noise(n, lo, hi):
    x = rng.standard_normal(n)
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    X *= ((f > lo) & (f < hi)).astype(float)
    y = np.fft.irfft(X, n)
    return y / (np.max(np.abs(y)) + 1e-9)


L = np.zeros(N)
R = np.zeros(N)


def add(sig, at_s, gain=1.0, pan=0.0):
    i = int(at_s * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    lg = np.cos((pan + 1) * np.pi / 4) * gain
    rg = np.sin((pan + 1) * np.pi / 4) * gain
    L[i : i + len(sig)] += sig * lg
    R[i : i + len(sig)] += sig * rg


# ---------------------------------------------------------------- pad
CHORDS = [(s, notes) for s, notes in CUES["chords"]]  # (start s, midi notes), from src/timeline.js
FADE_IN = CUES.get("fade_in", 3.0)
XF = 1.4  # crossfade seconds
t = np.arange(N) / SR
pad = np.zeros((2, N))
for ci, (start, notes) in enumerate(CHORDS):
    end = CHORDS[ci + 1][0] if ci + 1 < len(CHORDS) else LEN
    s0 = max(0.0, start - XF / 2)
    s1 = min(LEN, end + XF / 2)
    i0, i1 = int(s0 * SR), int(s1 * SR)
    tt = t[i0:i1]
    w = np.ones(i1 - i0)
    fin = np.clip((tt - s0) / XF, 0, 1)
    fout = np.clip((s1 - tt) / XF, 0, 1)
    if ci == 0:
        fin = np.clip(tt / FADE_IN, 0, 1)  # the film opens from silence
    w *= np.sin(fin * np.pi / 2) ** 2 * np.sin(fout * np.pi / 2) ** 2
    for k, m in enumerate(notes):
        # the root stays low and soft; the upper voices sit an octave up, where laptop speakers play
        f0 = hz(m if k == 0 else m + 12)
        vg = 0.6 if k == 0 else 1.0
        for side, det in ((0, -0.004), (1, 0.004)):
            ph = rng.uniform(0, 2 * np.pi)
            v = np.zeros_like(tt)
            for p in range(1, 6):
                v += np.sin(2 * np.pi * f0 * p * (1 + det) * tt + ph * p) / p ** 1.8
            lfo = 1 + 0.12 * np.sin(2 * np.pi * (0.07 + 0.013 * k) * tt + k)
            pad[side, i0:i1] += v * w * lfo * vg / len(notes)
pad[0] = lowpass_fast(pad[0], 2400)
pad[1] = lowpass_fast(pad[1], 2400)
L += pad[0] * 0.075
R += pad[1] * 0.075


# ---------------------------------------------------------------- sounds
def sine(f0, dur, f1=None, attack=0.002, decay=0.1):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    f = np.full(n, f0) if f1 is None else np.geomspace(f0, f1, n)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * env_ad(n, attack, decay)


def click(bright=3500, dur=0.012, gain=1.0):
    n = int(dur * SR)
    return bandpass_noise(n, bright * 0.5, bright * 1.8) * env_ad(n, 0.0005, dur / 4) * gain


def mx(*xs):
    # sum signals of different lengths
    n = max(len(x) for x in xs)
    return sum(np.pad(x, (0, n - len(x))) for x in xs)


def bell(f0, dur=1.6, bright=1.0):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    v = np.zeros(n)
    for ratio, amp, dec in ((1, 1.0, dur * 0.5), (2.0, 0.35 * bright, dur * 0.3), (2.76, 0.25 * bright, dur * 0.18), (5.4, 0.12 * bright, dur * 0.08)):
        v += amp * np.sin(2 * np.pi * f0 * ratio * tt) * np.exp(-tt / dec)
    return v * np.clip(tt / 0.003, 0, 1)


def pluck(f0, dur=0.5):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    v = np.sin(2 * np.pi * f0 * tt) * np.exp(-tt / 0.16) + 0.3 * np.sin(2 * np.pi * f0 * 4 * tt) * np.exp(-tt / 0.03)
    return v * np.clip(tt / 0.002, 0, 1)


def whoosh(dur=0.7, lo=300, hi=2500, peak=0.45):
    n = int(dur * SR)
    x = bandpass_noise(n, lo, hi)
    tt = np.arange(n) / SR
    e = np.where(tt < dur * peak, (tt / (dur * peak)) ** 2, np.exp(-(tt - dur * peak) / (dur * 0.18)))
    return x * e


PENTA = [53, 55, 57, 60, 62, 65, 67, 69, 72, 74, 77, 79, 81, 84, 86, 89, 91, 93]  # F major pentatonic
CHIMES = [77, 81, 84, 89]

for frame, kind, val in CUES["cues"]:
    at = t_of(frame)
    if kind == "key":
        add(click(3000 + 180 * (val % 5), 0.012), at, 0.08, pan=-0.1)
        add(sine(190 - 8 * (val % 3), 0.05, 120, decay=0.016), at, 0.10)
    elif kind == "softkey":
        add(click(3400, 0.01), at, 0.045, pan=0.15)
    elif kind == "swell":
        add(whoosh(1.0, 200, 1500, 0.8), at - 0.5, 0.05)
        add(sine(hz(65), 1.2, attack=0.6, decay=0.6), at - 0.3, 0.03)
    elif kind == "lift":
        add(sine(520, 0.18, 820, attack=0.004, decay=0.06), at, 0.06, pan=0.3)
    elif kind == "sweep":
        add(whoosh(2.3, 900, 4000, 0.5), at, 0.025, pan=0.2)
    elif kind == "tick":
        g = 0.07 if val == 0 else 0.035
        add(mx(sine(2400, 0.08, decay=0.018), 0.5 * sine(3600, 0.06, decay=0.01)), at, g, pan=0.25)
    elif kind == "whoosh":
        lo, hi = ((250, 1800), (400, 2600), (300, 2000))[int(val) % 3]
        add(whoosh(0.6, lo, hi, 0.55), at - 0.3, 0.06)
    elif kind == "pop":
        add(mx(sine(680 + 60 * (val % 4), 0.1, 360, decay=0.035), click(2500, 0.006) * 0.4), at, 0.09, pan=-0.3 + 0.12 * val)
    elif kind == "pluck":
        f = hz(PENTA[min(int(val), len(PENTA) - 1)])
        add(pluck(f), at, 0.07, pan=-0.4 + 0.045 * val)
    elif kind == "accent":
        for m in (65, 69, 72, 76):
            add(bell(hz(m), 1.8, 0.6), at + 0.02 * (m - 65) / 4, 0.03)
    elif kind == "click":
        add(click(4200, 0.008), at, 0.16)
        add(sine(1200, 0.02, decay=0.006), at, 0.05)
        add(click(3600, 0.006), at + 0.07, 0.07)
    elif kind == "toggle":
        add(sine(880, 0.07, decay=0.03), at, 0.07)
        add(sine(1320, 0.1, decay=0.04), at + 0.06, 0.07)
    elif kind == "dusk":
        add(whoosh(2.2, 120, 900, 0.5), at, 0.05)
        add(sine(hz(38), 2.4, attack=0.9, decay=0.9), at, 0.06)
    elif kind == "chime":
        add(bell(hz(CHIMES[int(val)]), 1.6, 0.8), at, 0.06, pan=-0.45 + 0.3 * val)
    elif kind == "thump":
        add(sine(90, 0.25, 55, attack=0.003, decay=0.08), at, 0.22)
    elif kind == "drop":
        add(mx(sine(900, 0.12, 450, decay=0.04), click(2800, 0.006) * 0.4), at + 0.2, 0.08)
    elif kind == "resolve":
        for j, m in enumerate((65, 69, 72, 76, 81)):
            add(bell(hz(m), 4.0, 0.7), at + 0.035 * j, 0.045, pan=-0.3 + 0.15 * j)
        add(sine(hz(41), 4.0, attack=0.05, decay=1.6), at, 0.09)

# the pulse: a soft pluck arpeggio on eighth notes under the posts, calendar and app scenes
BPM = 96
step = 60 / BPM / 2
A = CUES["arp"]  # the pulse window and its chord sections, in seconds
arp_start, arp_end, arp_cal, arp_app = A["start"], A["end"], A["cal"], A["app"]
arp_notes = {0: [58, 62, 65, 69], 1: [57, 60, 64, 67], 2: [55, 58, 62, 65]}
k = 0
tt0 = arp_start
while tt0 < arp_end:
    sec = 0 if tt0 < arp_cal else (1 if tt0 < arp_app else 2)
    notes = arp_notes[sec]
    f = hz(notes[k % 4] + (12 if k % 8 >= 4 else 0))
    fade = min(1, (tt0 - arp_start) / 2, (arp_end - tt0) / 1.5)
    add(pluck(f, 0.35), tt0, 0.018 * fade, pan=(-0.35 if k % 2 else 0.35))
    k += 1
    tt0 += step

# ---------------------------------------------------------------- room + master
def reverb(x, secs=1.9, mix=0.22):
    n = int(secs * SR)
    ir = rng.standard_normal(n) * np.exp(-np.arange(n) / SR / (secs / 5))
    ir = lowpass_fast(ir, 5000)
    ir /= np.sqrt(np.sum(ir ** 2))
    size = 1 << int(np.ceil(np.log2(len(x) + n)))
    y = np.fft.irfft(np.fft.rfft(x, size) * np.fft.rfft(ir, size), size)[: len(x)]
    return x * (1 - mix) + y * mix * 1.6


L = reverb(L)
R = reverb(R)
st = np.stack([L, R])
end_fade = np.clip((LEN - t) / 1.2, 0, 1)
st *= end_fade
st /= np.max(np.abs(st)) / 0.89  # peak -1 dBFS
path = OUT_PATH


def write(x):
    out = (np.clip(x, -1, 1).T * 32767).astype(np.int16)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(out.tobytes())


def lufs():
    import re
    import subprocess
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(path), "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True)
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r.stderr)[-1])


# Loudness: -16 LUFS integrated (a calm web film), true peak kept under -1 dBFS by a soft knee.
TARGET = -16.0
write(st)
st = st * 10 ** ((TARGET - lufs()) / 20)
over = np.abs(st) > 0.72
st[over] = np.sign(st[over]) * (0.72 + 0.15 * np.tanh((np.abs(st[over]) - 0.72) / 0.15))  # ceiling -1.2 dBFS
write(st)
print(f"wrote {path} ({LEN:.2f} s, {len(CUES['cues'])} cues, {lufs():.1f} LUFS, peak {20 * np.log10(np.max(np.abs(st))):.1f} dBFS)")
