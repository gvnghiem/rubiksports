// Rubiksports — app wiring: renderer, camera, input, timer, move log, solver, themes.
import * as THREE from '../vendor/three.module.min.js';
import { Cube, moveFromFace, moveFromSlice, notation } from './cube.js';
import { THEMES } from './themes.js';

const $ = (s) => document.querySelector(s);
const store = {
  get(k, d) { try { const v = localStorage.getItem('rubiksports.' + k); return v === null ? d : v; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('rubiksports.' + k, v); } catch { /* ignore */ } },
};

/* ---------------- renderer / scene ---------------- */
const canvas = $('#cube-canvas');
const stage = $('#stage');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
const hemi = new THREE.HemisphereLight(0xffffff, 0x888888, 1.3);
const sun = new THREE.DirectionalLight(0xffffff, 2.2);
const fill = new THREE.DirectionalLight(0xffffff, 0.5);
fill.position.set(-6, -5, -7);
scene.add(hemi, sun, fill);

// Soft contact shadow under the cube.
const blobTex = (() => {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(0,0,0,.9)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
})();
const blob = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 1),
  new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, opacity: 0.3 }),
);
blob.rotation.x = -Math.PI / 2;
scene.add(blob);

/* ---------------- state ---------------- */
const SPEEDS = [620, 400, 250, 150, 85]; // ms per quarter turn for user moves
const state = {
  size: 3,
  theme: THEMES[0],
  cube: null,
  locked: false,        // true while a scramble or solve is animating
  userMoves: 0,
  assisted: false,
  speed: 3,
  orbit: { theta: 0.78, phi: 1.12, zoom: 1 },
  log: [],
};
const timer = { running: false, t0: 0, elapsed: 0, raf: 0 };
const moveMs = () => SPEEDS[state.speed - 1];

/* ---------------- camera ---------------- */
function updateCamera() {
  const n = state.size;
  const vf = THREE.MathUtils.degToRad(camera.fov);
  const hf = 2 * Math.atan(Math.tan(vf / 2) * camera.aspect);
  const dist = (n * (camera.aspect < 1 ? 0.93 : 1.02)) / Math.sin(Math.min(vf, hf) / 2) * state.orbit.zoom;
  const { theta, phi } = state.orbit;
  camera.position.set(dist * Math.sin(phi) * Math.sin(theta), dist * Math.cos(phi), dist * Math.sin(phi) * Math.cos(theta));
  camera.lookAt(0, n * (camera.aspect < 1 ? 0.24 : 0.14), 0);
}
function resize() {
  const w = Math.max(1, stage.clientWidth), h = Math.max(1, stage.clientHeight);
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  updateCamera();
}
new ResizeObserver(resize).observe(stage);
renderer.setAnimationLoop(() => renderer.render(scene, camera));

/* ---------------- themes ---------------- */
const bgEl = $('#bg');
function applyTheme(theme, instant) {
  state.theme = theme;
  store.set('theme', theme.id);
  const root = document.documentElement.style;
  const ui = theme.ui;
  root.setProperty('--panel', ui.panel);
  root.setProperty('--text', ui.text);
  root.setProperty('--muted', ui.muted);
  root.setProperty('--accent', ui.accent);
  root.setProperty('--border', ui.border);
  root.setProperty('--page', ui.page);
  document.querySelector('meta[name="theme-color"]').setAttribute('content', ui.page);

  const layer = document.createElement('div');
  layer.className = 'bg-layer';
  layer.innerHTML = theme.svg;
  bgEl.appendChild(layer);
  requestAnimationFrame(() => requestAnimationFrame(() => layer.classList.add('show')));
  const old = [...bgEl.children].filter((el) => el !== layer);
  setTimeout(() => old.forEach((el) => el.remove()), instant ? 0 : 900);

  const L = theme.light;
  hemi.color.set(L.hemi[0]);
  hemi.groundColor.set(L.hemi[1]);
  hemi.intensity = L.hemi[2] * 1.7;
  sun.color.set(L.dir[0]);
  sun.intensity = L.dir[1] * 1.5;
  sun.position.set(...L.dir[2]);
  fill.intensity = L.fill * 1.6;
  blob.material.opacity = L.blob;
  document.querySelectorAll('.chip-theme').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.id === theme.id)));
}

function buildThemeChips() {
  const nav = $('#themes');
  THEMES.forEach((t) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip-theme';
    b.dataset.id = t.id;
    b.textContent = `${t.emoji} ${t.name}`;
    b.addEventListener('click', () => applyTheme(t));
    nav.appendChild(b);
  });
}

/* ---------------- timer ---------------- */
const timerEl = $('#timer');
const statusEl = $('#status');
const movesEl = $('#moves');
const bestEl = $('#best');
const btnTimer = $('#btnTimer');
const btnTimerLbl = $('#btnTimerLbl');

function fmt(ms) {
  const m = Math.floor(ms / 60000), s = Math.floor((ms % 60000) / 1000), cs = Math.floor((ms % 1000) / 10);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}
const setStatus = (t) => { statusEl.textContent = t; };
function tick() {
  if (!timer.running) return;
  timer.elapsed = performance.now() - timer.t0;
  timerEl.textContent = fmt(timer.elapsed);
  timer.raf = requestAnimationFrame(tick);
}
function startTimer() {
  timer.running = true;
  timer.elapsed = 0;
  timer.t0 = performance.now();
  state.assisted = false;
  timerEl.className = 'timer running';
  btnTimerLbl.textContent = 'Stop';
  btnTimer.classList.add('running');
  setStatus('Go!');
  cancelAnimationFrame(timer.raf);
  tick();
}
function stopTimer(done) {
  if (timer.running) timer.elapsed = performance.now() - timer.t0;
  timer.running = false;
  cancelAnimationFrame(timer.raf);
  timerEl.textContent = fmt(timer.elapsed);
  timerEl.className = done ? 'timer done' : 'timer';
  btnTimerLbl.textContent = 'Start';
  btnTimer.classList.remove('running');
}
function resetTimer() {
  timer.running = false;
  timer.elapsed = 0;
  cancelAnimationFrame(timer.raf);
  timerEl.textContent = fmt(0);
  timerEl.className = 'timer';
  btnTimerLbl.textContent = 'Start';
  btnTimer.classList.remove('running');
}
const bestKey = () => 'best' + state.size;
function showBest() {
  const b = parseFloat(store.get(bestKey(), ''));
  bestEl.textContent = Number.isFinite(b) ? fmt(b) : '—';
}

/* ---------------- move log ---------------- */
const logEl = $('#log');
const LABEL = { scramble: 'Scramble', user: 'You', solve: 'Solve' };
let curGroup = null, curSrc = null;
const counts = { scramble: 0, user: 0, solve: 0 };

function updateCounts() {
  const total = counts.scramble + counts.user + counts.solve;
  $('#logCount').textContent = `${total} move${total === 1 ? '' : 's'}`;
  movesEl.textContent = String(state.userMoves);
}
function addLogMove(text, src) {
  state.log.push({ text, src });
  counts[src]++;
  if (src !== curSrc || !curGroup) {
    curGroup = document.createElement('div');
    curGroup.className = 'grp ' + src;
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = LABEL[src];
    const mv = document.createElement('div');
    mv.className = 'mvs';
    curGroup.append(tag, mv);
    curGroup._mv = mv;
    logEl.appendChild(curGroup);
    curSrc = src;
  }
  const chip = document.createElement('span');
  chip.className = 'chip';
  chip.textContent = text;
  if (src === 'user' && timer.running) chip.title = fmt(timer.elapsed);
  curGroup._mv.appendChild(chip);
  logEl.scrollTop = logEl.scrollHeight;
  updateCounts();
}
function addNote(text, ok) {
  const d = document.createElement('div');
  d.className = 'note' + (ok ? ' ok' : '');
  d.textContent = text;
  logEl.appendChild(d);
  curSrc = null;
  curGroup = null;
  logEl.scrollTop = logEl.scrollHeight;
}
function clearLog() {
  logEl.textContent = '';
  state.log = [];
  curGroup = null;
  curSrc = null;
  counts.scramble = counts.user = counts.solve = 0;
  updateCounts();
}
function logAsText() {
  const lines = [];
  let last = null, cur = [];
  const flush = () => { if (cur.length) lines.push(`${LABEL[last]}: ${cur.join(' ')}`); cur = []; };
  for (const e of state.log) {
    if (e.src !== last) { flush(); last = e.src; }
    cur.push(e.text);
  }
  flush();
  return lines.join('\n');
}

/* ---------------- cube lifecycle ---------------- */
const btnRandom = $('#btnRandom');
const btnSolve = $('#btnSolve');
function setLocked(v) {
  state.locked = v;
  btnRandom.disabled = v;
  btnSolve.disabled = v;
}

function makeCube(size) {
  if (state.cube) state.cube.dispose();
  state.size = size;
  const cube = new Cube(scene, size);
  state.cube = cube;
  cube.onMoveStart = (m, src) => {
    if (cube !== state.cube) return;
    if (src === 'user') state.userMoves++;
    addLogMove(notation(m, size), src);
  };
  cube.onMoveEnd = (m, src) => {
    if (cube !== state.cube) return;
    if (src === 'user' && timer.running && cube.queue.length === 0 && cube.isSolved()) finishByHand();
  };
  cube.onIdle = () => {
    if (cube !== state.cube) return;
    onIdle();
  };
  blob.position.y = -size / 2 - 0.85;
  blob.scale.setScalar(size * 2.2);
  document.querySelectorAll('#sizes button').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.size === size)));
  updateCamera();
  showBest();
}

function resetSession(size = state.size) {
  setLocked(false);
  makeCube(size);
  resetTimer();
  clearLog();
  state.userMoves = 0;
  state.assisted = false;
  updateCounts();
}

function finishByHand() {
  const cube = state.cube;
  cube.history.length = 0;
  stopTimer(true);
  const t = timer.elapsed;
  let msg = `Solved in ${fmt(t)}! 🎉`;
  if (!state.assisted) {
    const best = parseFloat(store.get(bestKey(), ''));
    if (!Number.isFinite(best) || t < best) {
      store.set(bestKey(), String(t));
      showBest();
      if (Number.isFinite(best)) msg += ' New best!';
    }
  }
  setStatus(msg);
  addNote(`Solved in ${fmt(t)} · ${state.userMoves} moves`, true);
}

let lastSrc = null;
function onIdle() {
  const cube = state.cube;
  const src = lastSrc;
  if (src === 'scramble') {
    setLocked(false);
    setStatus('Scrambled — press Start, then solve it!');
  } else if (src === 'solve') {
    setLocked(false);
    if (timer.running) { stopTimer(false); }
    setStatus('Solved by the solver ✨');
    addNote('Solved by the solver', true);
  } else if (src === 'user') {
    if (cube.isSolved()) {
      cube.history.length = 0;
      if (!timer.running && state.userMoves > 0 && timer.elapsed === 0) setStatus('Solved! 🎉');
    }
  }
}

function randomize() {
  if (state.locked) return;
  resetSession();
  const cube = state.cube;
  const moves = cube.randomScramble();
  addNote(`Scramble — ${moves.length} moves`);
  setLocked(true);
  setStatus('Scrambling…');
  lastSrc = 'scramble';
  cube.enqueue(moves, { ms: Math.max(55, moveMs() * 0.45), source: 'scramble' });
}

function solve() {
  if (state.locked) return;
  const cube = state.cube;
  if (cube.queue.length || cube.busy) return;
  if (cube.isSolved()) {
    cube.history.length = 0;
    setStatus('Already solved!');
    return;
  }
  const sol = cube.solutionMoves();
  cube.history.length = 0;
  if (timer.running) state.assisted = true;
  addNote(`Solve — ${sol.length} move${sol.length === 1 ? '' : 's'} (reverses everything since the cube was last solved)`);
  setLocked(true);
  setStatus('Solving…');
  lastSrc = 'solve';
  cube.enqueue(sol, { ms: Math.max(100, moveMs() * 0.8), source: 'solve' });
}

function userMove(m) {
  if (state.locked) return;
  lastSrc = 'user';
  state.cube.enqueue([m], { ms: moveMs(), source: 'user' });
}

/* ---------------- input: orbit, drag-to-turn, pinch, wheel, keyboard ---------------- */
const raycaster = new THREE.Raycaster();
const ptrs = new Map();
let gesture = null;
const DRAG_THRESHOLD = 12;

function ndc(e) {
  const r = canvas.getBoundingClientRect();
  return new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
}
function pickAt(e) {
  raycaster.setFromCamera(ndc(e), camera);
  return state.cube.pick(raycaster);
}
const pinchDist = () => {
  const [a, b] = [...ptrs.values()];
  return Math.hypot(a.x - b.x, a.y - b.y);
};
const hideHint = () => $('#hint').classList.add('hide');

function decideTurn(hit, dx, dy) {
  const cube = state.cube;
  const w = canvas.clientWidth, h = canvas.clientHeight;
  const p0 = hit.point.clone().project(camera);
  const drag = new THREE.Vector2(dx, dy).normalize();
  const axes = [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)];
  let best = null, bestDot = -Infinity;
  for (const base of axes) {
    if (Math.abs(base.dot(hit.normal)) > 0.5) continue; // skip the face normal axis
    for (const s of [-1, 1]) {
      const t = base.clone().multiplyScalar(s);
      const p1 = hit.point.clone().addScaledVector(t, 0.5).project(camera);
      const sd = new THREE.Vector2((p1.x - p0.x) * w / 2, -(p1.y - p0.y) * h / 2).normalize();
      const d = sd.dot(drag);
      if (d > bestDot) { bestDot = d; best = t; }
    }
  }
  if (!best) return;
  const rot = new THREE.Vector3().crossVectors(hit.normal, best); // layer rotates about normal × drag
  const axis = Math.abs(rot.x) > 0.5 ? 0 : Math.abs(rot.y) > 0.5 ? 1 : 2;
  const sign = Math.sign(rot.getComponent(axis));
  userMove({ axis, index: cube.layerOf(hit.cubie, axis), turns: sign });
}

canvas.addEventListener('pointerdown', (e) => {
  canvas.setPointerCapture(e.pointerId);
  ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  hideHint();
  if (ptrs.size === 2) {
    gesture = { type: 'pinch', d0: pinchDist(), z0: state.orbit.zoom };
    return;
  }
  const hit = state.locked || state.cube.busy ? null : pickAt(e);
  gesture = hit
    ? { type: 'turn', hit, sx: e.clientX, sy: e.clientY, done: false }
    : { type: 'orbit', lx: e.clientX, ly: e.clientY };
});

canvas.addEventListener('pointermove', (e) => {
  if (!ptrs.has(e.pointerId) || !gesture) return;
  ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (gesture.type === 'pinch' && ptrs.size === 2) {
    state.orbit.zoom = THREE.MathUtils.clamp(gesture.z0 * (gesture.d0 / Math.max(1, pinchDist())), 0.55, 1.9);
    updateCamera();
  } else if (gesture.type === 'orbit') {
    state.orbit.theta -= (e.clientX - gesture.lx) * 0.009;
    state.orbit.phi = THREE.MathUtils.clamp(state.orbit.phi - (e.clientY - gesture.ly) * 0.009, 0.12, Math.PI - 0.12);
    gesture.lx = e.clientX;
    gesture.ly = e.clientY;
    updateCamera();
  } else if (gesture.type === 'turn' && !gesture.done) {
    const dx = e.clientX - gesture.sx, dy = e.clientY - gesture.sy;
    if (Math.hypot(dx, dy) > DRAG_THRESHOLD) {
      gesture.done = true;
      decideTurn(gesture.hit, dx, dy);
    }
  }
});

function endPointer(e) {
  ptrs.delete(e.pointerId);
  if (ptrs.size === 0) gesture = null;
  else if (ptrs.size === 1) {
    const [p] = [...ptrs.values()];
    gesture = { type: 'orbit', lx: p.x, ly: p.y };
  }
}
canvas.addEventListener('pointerup', endPointer);
canvas.addEventListener('pointercancel', endPointer);
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  state.orbit.zoom = THREE.MathUtils.clamp(state.orbit.zoom * (1 + Math.sign(e.deltaY) * 0.08), 0.55, 1.9);
  updateCamera();
}, { passive: false });
canvas.addEventListener('contextmenu', (e) => e.preventDefault());

const KEY_FACE = { KeyR: 'R', KeyL: 'L', KeyU: 'U', KeyD: 'D', KeyF: 'F', KeyB: 'B' };
const KEY_SLICE = { KeyM: 'M', KeyE: 'E', KeyS: 'S' };
window.addEventListener('keydown', (e) => {
  if (e.target.closest && e.target.closest('input, select, textarea')) return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const n = state.size;
  if (KEY_FACE[e.code]) { e.preventDefault(); userMove(moveFromFace(KEY_FACE[e.code], e.shiftKey, n)); }
  else if (n === 3 && KEY_SLICE[e.code]) { e.preventDefault(); userMove(moveFromSlice(KEY_SLICE[e.code], e.shiftKey)); }
});

/* ---------------- UI wiring ---------------- */
function buildPad() {
  const pad = $('#pad');
  ['U', 'D', 'L', 'R', 'F', 'B'].forEach((f) => {
    [false, true].forEach((prime) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = f + (prime ? "'" : '');
      b.setAttribute('aria-label', `${f} ${prime ? 'counter-clockwise' : 'clockwise'}`);
      b.addEventListener('click', () => userMove(moveFromFace(f, prime, state.size)));
      pad.appendChild(b);
    });
  });
}

document.querySelectorAll('#sizes button').forEach((b) => {
  b.addEventListener('click', () => {
    const size = +b.dataset.size;
    if (size === state.size) return;
    store.set('size', String(size));
    resetSession(size);
    setStatus(`${size}×${size} ready — Randomize to start`);
  });
});

btnRandom.addEventListener('click', randomize);
btnSolve.addEventListener('click', solve);
btnTimer.addEventListener('click', () => (timer.running ? (stopTimer(false), setStatus('Stopped')) : startTimer()));
$('#btnReset').addEventListener('click', () => { resetSession(); setStatus('Reset — Randomize to start'); });
$('#btnClearLog').addEventListener('click', clearLog);
$('#btnCopy').addEventListener('click', async (e) => {
  const text = logAsText();
  const btn = e.currentTarget;
  try { await navigator.clipboard.writeText(text); btn.textContent = 'Copied'; }
  catch { btn.textContent = 'Press ⌘/Ctrl+C'; window.prompt('Copy the move log:', text); }
  setTimeout(() => (btn.textContent = 'Copy'), 1400);
});
$('#speed').addEventListener('input', (e) => { state.speed = +e.target.value; store.set('speed', e.target.value); });

/* ---------------- boot ---------------- */
const params = new URLSearchParams(location.search);
const startSize = [2, 3, 4].includes(+params.get('size')) ? +params.get('size') : [2, 3, 4].includes(+store.get('size', 3)) ? +store.get('size', 3) : 3;
const startTheme = THEMES.find((t) => t.id === (params.get('theme') || store.get('theme', ''))) || THEMES[0];
state.speed = Math.min(5, Math.max(1, +store.get('speed', 3) || 3));
$('#speed').value = String(state.speed);

buildThemeChips();
buildPad();
applyTheme(startTheme, true);
resize();

// On narrow portrait screens, merge the timer HUD into the top bar so nothing overlays the cube.
{
  const hud = document.querySelector('.hud');
  const topbar = document.querySelector('.topbar');
  const mq = window.matchMedia('(max-width: 860px) and (orientation: portrait)');
  const place = () => (mq.matches ? topbar : stage).appendChild(hud);
  place();
  mq.addEventListener('change', place);
}
resetSession(startSize);
resetTimer();

// Small hook for automated tests and tinkering in the console.
window.rubiksports = { state, timer, randomize, solve, userMove, applyTheme, THEMES, THREE, camera, get cube() { return state.cube; } };
