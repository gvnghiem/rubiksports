// Rubiksports — synthesized sound effects (Web Audio, no audio files).
// Turn = soft plastic scrape + a "clack-click" when the layer locks into place.

let ctx = null;
let master = null;
let noise = null;
let enabled = true;
let lastClick = 0;

function ensure() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  const comp = ctx.createDynamicsCompressor();
  master = ctx.createGain();
  master.gain.value = 0.8;
  master.connect(comp);
  comp.connect(ctx.destination);
  noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return ctx;
}

function ready() {
  if (!enabled || !ensure()) return false;
  if (ctx.state === 'suspended') ctx.resume();
  return true;
}

/** Filtered noise burst. attack/dur in seconds; freqTo makes the filter sweep. */
function burst({ at = 0, dur = 0.03, freq = 2000, freqTo = null, q = 1, gain = 0.3, attack = 0.002, type = 'bandpass' }) {
  const t = ctx.currentTime + at;
  const src = ctx.createBufferSource();
  src.buffer = noise;
  src.loop = true;
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.Q.value = q;
  f.frequency.setValueAtTime(freq, t);
  if (freqTo) f.frequency.exponentialRampToValueAtTime(freqTo, t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(master);
  src.start(t, Math.random() * 0.5);
  src.stop(t + dur + 0.02);
}

function tone({ at = 0, freq = 440, freqTo = null, dur = 0.2, gain = 0.2, type = 'sine', attack = 0.005 }) {
  const t = ctx.currentTime + at;
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (freqTo) o.frequency.exponentialRampToValueAtTime(freqTo, t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.02);
}

export const sfx = {
  get enabled() { return enabled; },
  setEnabled(v) { enabled = v; if (v) ready(); },

  /** Call from a user gesture so mobile browsers allow audio. */
  unlock() { if (enabled && ensure() && ctx.state === 'suspended') ctx.resume(); },

  /** Layer starts turning: a short plastic scrape (skipped for very fast turns). */
  turnStart(ms) {
    if (!ready() || ms < 110) return;
    const dur = Math.min(0.32, (ms / 1000) * 0.75);
    burst({ at: 0.01, dur, freq: 1500 + Math.random() * 300, freqTo: 2600, q: 0.9, gain: 0.07, attack: dur * 0.35 });
  },

  /** Layer locks into place: clack + click + tiny thump. vol 0..1 */
  turnEnd(vol = 1) {
    if (!ready()) return;
    const now = performance.now();
    if (now - lastClick < 28) return; // keep fast scrambles crisp, not mushy
    lastClick = now;
    const v = vol * (0.85 + Math.random() * 0.3);
    const p = 0.92 + Math.random() * 0.2; // pitch jitter so it never sounds machine-gunned
    burst({ dur: 0.02, freq: 3300 * p, q: 1.3, gain: 0.5 * v });
    burst({ at: 0.011, dur: 0.016, freq: 4800 * p, q: 2, gain: 0.22 * v });
    burst({ dur: 0.055, freq: 950 * p, q: 2.2, gain: 0.32 * v });
    tone({ freq: 230 * p, freqTo: 105, dur: 0.07, gain: 0.2 * v });
  },

  /** Randomize / Solve swoosh. */
  whoosh() {
    if (!ready()) return;
    burst({ dur: 0.42, freq: 350, freqTo: 3200, q: 0.8, gain: 0.16, attack: 0.18 });
    burst({ at: 0.05, dur: 0.38, freq: 700, freqTo: 4500, q: 1.1, gain: 0.07, attack: 0.15 });
  },

  /** Win jingle: rising arpeggio, bright chord, sparkles. */
  fanfare() {
    if (!ready()) return;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      tone({ at: i * 0.09, freq: f, dur: 0.32, gain: 0.16, type: 'triangle' });
      tone({ at: i * 0.09, freq: f * 2, dur: 0.22, gain: 0.04, type: 'sine' });
    });
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f) => {
      tone({ at: 0.42, freq: f, dur: 1.0, gain: 0.1, type: 'triangle', attack: 0.012 });
    });
    for (let i = 0; i < 9; i++) {
      tone({ at: 0.45 + i * 0.075 + Math.random() * 0.03, freq: 2200 + Math.random() * 2800, dur: 0.14, gain: 0.05 });
    }
    burst({ at: 0.42, dur: 0.5, freq: 6000, q: 0.6, gain: 0.05, attack: 0.02, type: 'highpass' });
  },
};
