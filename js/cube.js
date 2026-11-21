// Rubiksports — cube model, animation queue and notation helpers.
// A cube is an NxN grid of "cubies" (only the visible outer ones are built).
// A move is { axis: 0|1|2, index: layer 0..n-1 along that axis, turns: -1 | 1 | 2 },
// where `turns` is the number of quarter turns about the POSITIVE axis (right-hand rule).
import * as THREE from '../vendor/three.module.min.js';

const AX = [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)];
const AX_NAME = ['x', 'y', 'z'];

// Standard colour scheme: white up, green front, red right.
const FACE_COLOR = {
  '1,0,0': 0xc8102e,   // R red
  '-1,0,0': 0xff6b00,  // L orange
  '0,1,0': 0xf5f5f5,   // U white
  '0,-1,0': 0xffd500,  // D yellow
  '0,0,1': 0x00a651,   // F green
  '0,0,-1': 0x0051ba,  // B blue
};

const PLUS_FACE = ['R', 'U', 'F'];
const MINUS_FACE = ['L', 'D', 'B'];
const MIDDLE = ['M', 'E', 'S'];
const MIDDLE_SIGN = [1, 1, -1]; // M follows L, E follows D, S follows F

export const normTurns = (t) => {
  t = ((t % 4) + 4) % 4;
  return t === 3 ? -1 : t;
};

export const inverse = (m) => ({ axis: m.axis, index: m.index, turns: normTurns(-m.turns) });

/** Standard (SiGN-style) notation for a move on an n×n×n cube. */
export function notation(m, n) {
  const { axis, index, turns } = m;
  let name;
  let cw; // sign of rotation about +axis that reads as "clockwise" for this name
  if (index === n - 1) { name = PLUS_FACE[axis]; cw = -1; }
  else if (index === 0) { name = MINUS_FACE[axis]; cw = 1; }
  else if (n === 3) { name = MIDDLE[axis]; cw = MIDDLE_SIGN[axis]; }
  else if (index === n - 2) { name = '2' + PLUS_FACE[axis]; cw = -1; }
  else { name = '2' + MINUS_FACE[axis]; cw = 1; }
  if (Math.abs(turns) === 2) return name + '2';
  return name + (turns * cw > 0 ? '' : "'");
}

/** Build the move for an outer-face turn such as R or U' on an n×n×n cube. */
export function moveFromFace(face, prime, n) {
  const p = PLUS_FACE.indexOf(face);
  if (p >= 0) return { axis: p, index: n - 1, turns: prime ? 1 : -1 };
  const q = MINUS_FACE.indexOf(face);
  return { axis: q, index: 0, turns: prime ? -1 : 1 };
}

/** Build the move for a 3×3 middle slice (M, E, S). */
export function moveFromSlice(slice, prime) {
  const a = MIDDLE.indexOf(slice);
  const cw = MIDDLE_SIGN[a];
  return { axis: a, index: 1, turns: prime ? -cw : cw };
}

function roundedRectGeometry(size, radius) {
  const h = size / 2, r = radius;
  const s = new THREE.Shape();
  s.moveTo(-h + r, -h);
  s.lineTo(h - r, -h);
  s.quadraticCurveTo(h, -h, h, -h + r);
  s.lineTo(h, h - r);
  s.quadraticCurveTo(h, h, h - r, h);
  s.lineTo(-h + r, h);
  s.quadraticCurveTo(-h, h, -h, h - r);
  s.lineTo(-h, -h + r);
  s.quadraticCurveTo(-h, -h, -h + r, -h);
  return new THREE.ShapeGeometry(s, 6);
}

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const key3 = (v) => `${Math.round(v.x)},${Math.round(v.y)},${Math.round(v.z)}`;

export class Cube {
  constructor(scene, size) {
    this.n = size;
    this.scene = scene;
    this.root = new THREE.Group();
    scene.add(this.root);
    this.cubies = [];
    this.history = [];      // net moves since the cube was last solved
    this.queue = [];
    this.busy = false;
    this.dead = false;
    this.onMoveStart = null;
    this.onMoveEnd = null;
    this.onIdle = null;
    this._geo = [];
    this._mats = [];
    this._build();
  }

  _build() {
    const n = this.n, off = (n - 1) / 2;
    const bodyGeo = new THREE.BoxGeometry(0.97, 0.97, 0.97);
    const stickerGeo = roundedRectGeometry(0.84, 0.13);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x111317, roughness: 0.55, metalness: 0.05 });
    this._geo.push(bodyGeo, stickerGeo);
    this._mats.push(bodyMat);
    const stickerMats = {};
    const matFor = (k) => {
      if (!stickerMats[k]) {
        stickerMats[k] = new THREE.MeshStandardMaterial({ color: FACE_COLOR[k], roughness: 0.32, metalness: 0.0 });
        this._mats.push(stickerMats[k]);
      }
      return stickerMats[k];
    };

    // Solid black core so no gaps show while inner slices turn.
    const core = new THREE.Mesh(new THREE.BoxGeometry(n - 1, n - 1, n - 1), bodyMat);
    this._geo.push(core.geometry);
    this.root.add(core);

    const zAxis = new THREE.Vector3(0, 0, 1);
    for (let x = 0; x < n; x++) for (let y = 0; y < n; y++) for (let z = 0; z < n; z++) {
      const c = [x, y, z];
      if (!c.some((v) => v === 0 || v === n - 1)) continue; // hidden interior
      const g = new THREE.Group();
      g.position.set(x - off, y - off, z - off);
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.userData.cubie = g;
      g.add(body);
      g.userData.stickers = [];
      for (let a = 0; a < 3; a++) for (const s of [-1, 1]) {
        if (c[a] !== (s > 0 ? n - 1 : 0)) continue;
        const nrm = AX[a].clone().multiplyScalar(s);
        const k = key3(nrm);
        const st = new THREE.Mesh(stickerGeo, matFor(k));
        st.quaternion.setFromUnitVectors(zAxis, nrm);
        st.position.copy(nrm).multiplyScalar(0.4875);
        st.userData.cubie = g;
        st.userData.n = nrm;
        st.userData.color = k;
        g.add(st);
        g.userData.stickers.push(st);
      }
      this.root.add(g);
      this.cubies.push(g);
    }
  }

  dispose() {
    this.dead = true;
    this.queue.length = 0;
    this.scene.remove(this.root);
    this._geo.forEach((g) => g.dispose());
    this._mats.forEach((m) => m.dispose());
  }

  layerOf(cubie, axis) {
    return Math.round(cubie.position.getComponent(axis) + (this.n - 1) / 2);
  }

  /** Queue moves. source is 'user' | 'scramble' | 'solve'. */
  enqueue(moves, { ms = 250, source = 'user' } = {}) {
    for (const m of moves) this.queue.push({ move: m, ms, source });
    this._pump();
  }

  async _pump() {
    if (this.busy || this.dead) return;
    this.busy = true;
    while (this.queue.length && !this.dead) {
      const job = this.queue.shift();
      this.onMoveStart && this.onMoveStart(job.move, job.source, job.ms);
      await this._anim(job.move, job.ms * (Math.abs(job.move.turns) === 2 ? 1.45 : 1));
      if (this.dead) return;
      if (job.source === 'solve') this.history.length = 0;
      else this._record(job.move);
      this.onMoveEnd && this.onMoveEnd(job.move, job.source);
    }
    this.busy = false;
    if (!this.dead) this.onIdle && this.onIdle();
  }

  _record(m) {
    const last = this.history[this.history.length - 1];
    if (last && last.axis === m.axis && last.index === m.index) {
      const t = normTurns(last.turns + m.turns);
      if (t === 0) this.history.pop(); else last.turns = t;
    } else {
      this.history.push({ ...m });
    }
  }

  _anim(move, ms) {
    return new Promise((resolve) => {
      const pivot = new THREE.Group();
      this.root.add(pivot);
      const layer = this.cubies.filter((c) => this.layerOf(c, move.axis) === move.index);
      layer.forEach((c) => pivot.attach(c));
      const target = move.turns * Math.PI / 2;
      const key = AX_NAME[move.axis];
      const t0 = performance.now();
      const finish = () => {
        pivot.rotation[key] = target;
        pivot.updateMatrixWorld(true);
        layer.forEach((c) => { this.root.attach(c); this._snap(c); });
        this.root.remove(pivot);
        resolve();
      };
      const step = (now) => {
        if (this.dead) { resolve(); return; }
        const t = ms <= 0 ? 1 : Math.min(1, (now - t0) / ms);
        if (t >= 1) { finish(); return; }
        pivot.rotation[key] = target * ease(t);
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  _snap(c) {
    c.position.set(Math.round(c.position.x * 2) / 2, Math.round(c.position.y * 2) / 2, Math.round(c.position.z * 2) / 2);
    const m = new THREE.Matrix4().makeRotationFromQuaternion(c.quaternion);
    m.fromArray(m.elements.map((v) => Math.round(v)));
    c.quaternion.setFromRotationMatrix(m);
  }

  /** Solved = every face shows a single colour (works for any whole-cube orientation). */
  isSolved() {
    const seen = new Map();
    const v = new THREE.Vector3();
    for (const c of this.cubies) {
      for (const st of c.userData.stickers) {
        v.copy(st.userData.n).applyQuaternion(c.quaternion);
        const k = key3(v);
        const col = st.userData.color;
        if (seen.has(k) && seen.get(k) !== col) return false;
        seen.set(k, col);
      }
    }
    return true;
  }

  /** Intersect a raycaster with the cube. Returns { cubie, normal, point } or null. */
  pick(raycaster) {
    const hits = raycaster.intersectObjects(this.cubies, true);
    if (!hits.length) return null;
    const hit = hits[0];
    const normal = hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
    normal.set(Math.round(normal.x), Math.round(normal.y), Math.round(normal.z));
    return { cubie: hit.object.userData.cubie, normal, point: hit.point.clone() };
  }

  randomScramble() {
    const n = this.n;
    const len = { 2: 11, 3: 20, 4: 40 }[n] || 20;
    const layers = n === 2 ? [1] : n === 3 ? [0, 2] : [0, 1, 2, 3];
    const out = [];
    let lastAxis = -1;
    while (out.length < len) {
      const axis = Math.floor(Math.random() * 3);
      if (axis === lastAxis) continue;
      lastAxis = axis;
      const index = layers[Math.floor(Math.random() * layers.length)];
      const turns = [1, -1, 2][Math.floor(Math.random() * 3)];
      out.push({ axis, index, turns });
    }
    return out;
  }

  /** The inverse of everything done since the cube was last solved. */
  solutionMoves() {
    const out = [];
    for (let i = this.history.length - 1; i >= 0; i--) out.push(inverse(this.history[i]));
    return out;
  }
}
