// Rubiksports — background themes. Each theme is an inline SVG scene plus UI colours and 3D lighting.

function rng(seed) {
  let s = seed >>> 0;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
}

const svg = (inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">${inner}</svg>`;

/* ---------- Outdoors: sunny park ---------- */
function outdoors() {
  const r = rng(7);
  const cloud = (x, y, s) =>
    `<g transform="translate(${x} ${y}) scale(${s})" fill="#fff" opacity=".92"><ellipse cx="0" cy="0" rx="90" ry="32"/><ellipse cx="-50" cy="-18" rx="52" ry="34"/><ellipse cx="30" cy="-30" rx="62" ry="40"/></g>`;
  const tree = (x, y, s) =>
    `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-11" y="-20" width="22" height="95" rx="7" fill="#7b4a2b"/><circle cx="0" cy="-72" r="64" fill="#2c8a3a"/><circle cx="-40" cy="-40" r="46" fill="#369a45"/><circle cx="42" cy="-44" r="48" fill="#40ab4e"/></g>`;
  let blades = '';
  for (let i = 0; i < 220; i++) {
    const x = r() * 1600, y = 650 + r() * 250, h = 10 + r() * 22;
    blades += `<path d="M${x.toFixed(0)} ${y.toFixed(0)} l${(r() * 8 - 4).toFixed(1)} ${-h.toFixed(0)}" stroke="${r() > 0.5 ? '#2f7d28' : '#8fdc6b'}" stroke-width="3" stroke-linecap="round"/>`;
  }
  let flowers = '';
  for (let i = 0; i < 26; i++) {
    const x = r() * 1600, y = 690 + r() * 190;
    flowers += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="5" fill="${['#ff6b9a', '#ffd23f', '#ffffff', '#b388ff'][i % 4]}"/>`;
  }
  return svg(`
  <defs>
    <linearGradient id="o-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f9ff0"/><stop offset=".6" stop-color="#b8e3ff"/><stop offset="1" stop-color="#eaf8ff"/></linearGradient>
    <radialGradient id="o-sun"><stop offset="0" stop-color="#fffbd0"/><stop offset=".3" stop-color="#ffec8c" stop-opacity=".85"/><stop offset="1" stop-color="#ffec8c" stop-opacity="0"/></radialGradient>
    <linearGradient id="o-grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#74c94f"/><stop offset="1" stop-color="#3a8a2c"/></linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#o-sky)"/>
  <circle cx="1260" cy="170" r="280" fill="url(#o-sun)"/><circle cx="1260" cy="170" r="56" fill="#fff7b3"/>
  ${cloud(260, 150, 1.2)}${cloud(720, 90, 0.8)}${cloud(1010, 250, 1)}${cloud(1480, 330, 0.7)}
  <path d="M0 600 Q 240 440 520 540 T 1080 520 T 1600 540 V 900 H0Z" fill="#8bd374"/>
  <path d="M0 650 Q 300 540 640 620 T 1250 600 T 1600 640 V 900 H0Z" fill="#5fb94c"/>
  ${tree(120, 650, 1.25)}${tree(340, 620, 0.9)}${tree(1190, 625, 0.75)}${tree(1390, 650, 1.15)}${tree(1530, 610, 0.8)}
  <rect y="650" width="1600" height="250" fill="url(#o-grass)"/>
  <path d="M690 900 Q 760 770 800 640 L 850 640 Q 905 770 1010 900Z" fill="#ead9a8" opacity=".85"/>
  ${blades}${flowers}
  <g fill="none" stroke="#3a4a5a" stroke-width="3" stroke-linecap="round" opacity=".6"><path d="M560 210 q10-12 20 0 q10-12 20 0"/><path d="M620 260 q8-10 16 0 q8-10 16 0"/></g>`);
}

/* ---------- Competition: speedcubing arena ---------- */
function competition() {
  const r = rng(21);
  let crowd = '';
  const bright = ['#ffb300', '#ef4444', '#22d3ee', '#a3e635', '#f472b6'];
  for (let row = 0; row < 4; row++) {
    const y = 380 + row * 48;
    for (let x = -20; x < 1640; x += 24 + r() * 8) {
      const col = r() > 0.88 ? bright[Math.floor(r() * bright.length)] : ['#0c1330', '#101a42', '#16224f', '#0a0f26'][Math.floor(r() * 4)];
      crowd += `<ellipse cx="${x.toFixed(0)}" cy="${(y + 34).toFixed(0)}" rx="17" ry="24" fill="${col}"/><circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="10" fill="${col}"/>`;
      if (r() > 0.93) crowd += `<rect x="${(x + 6).toFixed(0)}" y="${(y - 28).toFixed(0)}" width="6" height="10" rx="1.5" fill="#fff" opacity=".9"/>`;
    }
  }
  let lines = '';
  for (let x = -900; x <= 2500; x += 160) lines += `<line x1="800" y1="610" x2="${x}" y2="900" stroke="#fff" stroke-opacity=".07" stroke-width="2"/>`;
  [632, 668, 718, 786, 880].forEach((y) => (lines += `<line x1="0" y1="${y}" x2="1600" y2="${y}" stroke="#fff" stroke-opacity=".07" stroke-width="2"/>`));
  let truss = '';
  for (let x = 0; x < 1600; x += 100) truss += `<line x1="${x}" y1="40" x2="${x + 50}" y2="90" stroke="#3b4a7a" stroke-width="3"/><line x1="${x + 50}" y1="90" x2="${x + 100}" y2="40" stroke="#3b4a7a" stroke-width="3"/>`;
  let banners = '';
  for (let x = 20; x < 1600; x += 330) banners += `<text x="${x}" y="592" font-family="Arial Black, Impact, sans-serif" font-size="24" letter-spacing="6" fill="#ffb300">RUBIKSPORTS</text>`;
  return svg(`
  <defs>
    <linearGradient id="c-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#070b1f"/><stop offset=".6" stop-color="#14204a"/><stop offset="1" stop-color="#0c1233"/></linearGradient>
    <linearGradient id="c-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe4ff" stop-opacity=".55"/><stop offset="1" stop-color="#cfe4ff" stop-opacity="0"/></linearGradient>
    <linearGradient id="c-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#26356e"/><stop offset="1" stop-color="#0d1536"/></linearGradient>
    <radialGradient id="c-pool"><stop offset="0" stop-color="#cfe4ff" stop-opacity=".5"/><stop offset="1" stop-color="#cfe4ff" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#c-bg)"/>
  ${truss}<rect y="36" width="1600" height="6" fill="#4b5b92"/>
  <polygon points="250,40 330,40 620,700 60,700" fill="url(#c-beam)"/>
  <polygon points="620,40 700,40 980,700 560,700" fill="url(#c-beam)" opacity=".8"/>
  <polygon points="900,40 980,40 1080,700 700,700" fill="url(#c-beam)" opacity=".8"/>
  <polygon points="1270,40 1350,40 1560,700 1000,700" fill="url(#c-beam)"/>
  ${crowd}
  <rect y="560" width="1600" height="48" fill="#0f1e52"/><rect y="556" width="1600" height="6" fill="#ffb300"/>${banners}
  <rect y="608" width="1600" height="292" fill="url(#c-floor)"/>${lines}
  <ellipse cx="420" cy="760" rx="360" ry="60" fill="url(#c-pool)"/><ellipse cx="1180" cy="780" rx="380" ry="64" fill="url(#c-pool)"/><ellipse cx="800" cy="720" rx="300" ry="46" fill="url(#c-pool)"/>
  <rect x="70" y="150" width="520" height="116" rx="16" fill="#060a1b" stroke="#ffb300" stroke-width="3"/>
  <text x="330" y="206" text-anchor="middle" font-family="Consolas, Menlo, monospace" font-weight="700" font-size="40" fill="#ffb300">SPEEDCUBE OPEN</text>
  <text x="330" y="246" text-anchor="middle" font-family="Consolas, Menlo, monospace" font-size="24" fill="#7dd3fc">FINAL ROUND  •  LIVE</text>`);
}

/* ---------- Home: cosy living room ---------- */
function home() {
  const r = rng(5);
  let books = '';
  const palette = ['#c0392b', '#2980b9', '#27ae60', '#f39c12', '#8e44ad', '#16a085', '#d35400', '#34495e', '#e67e9a'];
  [0, 1, 2, 3].forEach((row) => {
    let x = 1138;
    const base = 214 + row * 128;
    while (x < 1420) {
      const w = 16 + r() * 16, h = 70 + r() * 40;
      books += `<rect x="${x.toFixed(0)}" y="${(base - h).toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" rx="2" fill="${palette[Math.floor(r() * palette.length)]}"/>`;
      x += w + 2;
    }
  });
  let planks = '';
  for (let x = 0; x <= 1600; x += 120) planks += `<line x1="${x}" y1="690" x2="${x}" y2="900" stroke="#7a4a26" stroke-opacity=".35" stroke-width="2"/>`;
  [730, 780, 840].forEach((y) => (planks += `<line x1="0" y1="${y}" x2="1600" y2="${y}" stroke="#7a4a26" stroke-opacity=".3" stroke-width="2"/>`));
  return svg(`
  <defs>
    <linearGradient id="h-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4e7d0"/><stop offset="1" stop-color="#e6d0ab"/></linearGradient>
    <linearGradient id="h-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c58d58"/><stop offset="1" stop-color="#a06c3d"/></linearGradient>
    <linearGradient id="h-win" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd0ff"/><stop offset="1" stop-color="#e3f6ff"/></linearGradient>
    <radialGradient id="h-glow"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".8"/><stop offset="1" stop-color="#ffe9a8" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#h-wall)"/>
  <rect y="690" width="1600" height="210" fill="url(#h-floor)"/>${planks}
  <rect y="672" width="1600" height="22" fill="#fbf3e4"/><rect y="692" width="1600" height="5" fill="#00000022"/>
  <rect x="190" y="130" width="380" height="390" rx="10" fill="#fff" stroke="#fff" stroke-width="14"/>
  <rect x="200" y="140" width="360" height="370" fill="url(#h-win)"/>
  <circle cx="470" cy="230" r="34" fill="#fff6b0"/><path d="M200 470 Q 300 400 380 450 T 560 430 V 510 H200Z" fill="#6cc04a"/><circle cx="270" cy="410" r="36" fill="#2f8d3c"/>
  <rect x="376" y="140" width="8" height="370" fill="#fff"/><rect x="200" y="320" width="360" height="8" fill="#fff"/>
  <path d="M120 110 H210 V560 Q165 540 120 560Z" fill="#3e7c85"/><path d="M550 110 H640 V560 Q595 540 550 560Z" fill="#3e7c85"/><rect x="100" y="100" width="560" height="14" rx="7" fill="#6b4a2f"/>
  <rect x="700" y="170" width="170" height="130" rx="6" fill="#fff" stroke="#6b4a2f" stroke-width="10"/><path d="M710 290 L770 220 L810 262 L840 236 L860 290Z" fill="#7cb9a8"/><circle cx="820" cy="206" r="14" fill="#f4b942"/>
  <rect x="900" y="150" width="90" height="120" rx="6" fill="#fff" stroke="#6b4a2f" stroke-width="10"/><circle cx="945" cy="210" r="30" fill="#e07a5f"/>
  <rect x="1110" y="100" width="330" height="570" rx="6" fill="#7b5233"/><rect x="1122" y="112" width="306" height="546" fill="#5d3b22"/>
  ${[0, 1, 2, 3].map((i) => `<rect x="1122" y="${216 + i * 128}" width="306" height="10" fill="#7b5233"/>`).join('')}${books}
  <circle cx="1040" cy="470" r="150" fill="url(#h-glow)"/>
  <rect x="1034" y="450" width="12" height="230" fill="#3b3b3b"/><path d="M996 450 L1084 450 L1064 392 L1016 392Z" fill="#f3d9a4"/><ellipse cx="1040" cy="682" rx="46" ry="9" fill="#2b2b2b"/>
  <ellipse cx="800" cy="800" rx="520" ry="70" fill="#b4533c" opacity=".55"/><ellipse cx="800" cy="800" rx="440" ry="52" fill="#d9825f" opacity=".45"/>
  <g><rect x="560" y="520" width="420" height="150" rx="34" fill="#5b7aa6"/><rect x="540" y="560" width="70" height="120" rx="28" fill="#4d6a95"/><rect x="930" y="560" width="70" height="120" rx="28" fill="#4d6a95"/><rect x="610" y="540" width="150" height="110" rx="20" fill="#6b8bb8"/><rect x="780" y="540" width="150" height="110" rx="20" fill="#6b8bb8"/><rect x="560" y="668" width="30" height="16" fill="#3a2a1d"/><rect x="950" y="668" width="30" height="16" fill="#3a2a1d"/></g>
  <g><path d="M70 690 H150 L138 620 H82Z" fill="#c8693e"/><path d="M110 620 Q70 540 40 500 Q100 520 112 590Z" fill="#3a9a52"/><path d="M110 620 Q120 520 150 470 Q158 540 118 600Z" fill="#2f8d3c"/><path d="M110 620 Q160 560 205 560 Q170 610 118 626Z" fill="#46ad5f"/></g>`);
}

/* ---------- Mall: bright shopping atrium ---------- */
function mall() {
  const store = (x, color, name) => `
    <g transform="translate(${x} 0)">
      <rect y="330" width="380" height="290" fill="#f7f7f9" stroke="#cfd4de" stroke-width="3"/>
      <rect y="330" width="380" height="64" fill="${color}"/>
      <text x="190" y="376" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-size="36" letter-spacing="4" fill="#fff">${name}</text>
      <rect x="24" y="418" width="332" height="202" fill="#bfe3f5" opacity=".85"/><rect x="24" y="418" width="332" height="202" fill="none" stroke="#fff" stroke-width="6"/>
      <path d="M40 600 L120 440 L150 440 L70 600Z" fill="#fff" opacity=".28"/>
      <rect x="150" y="540" width="80" height="80" rx="6" fill="${color}" opacity=".55"/><rect x="250" y="500" width="70" height="120" rx="6" fill="${color}" opacity=".35"/>
    </g>`;
  let tiles = '';
  for (let x = -1000; x <= 2600; x += 150) tiles += `<line x1="800" y1="620" x2="${x}" y2="900" stroke="#b9c0cd" stroke-width="2" opacity=".7"/>`;
  [640, 668, 704, 756, 830].forEach((y) => (tiles += `<line x1="0" y1="${y}" x2="1600" y2="${y}" stroke="#b9c0cd" stroke-width="2" opacity=".7"/>`));
  let rail = '';
  for (let x = 0; x < 1600; x += 36) rail += `<rect x="${x}" y="236" width="4" height="62" fill="#9aa5b8"/>`;
  const palm = (x) => `<g transform="translate(${x} 0)"><path d="M-40 680 H40 L30 610 H-30Z" fill="#7a8396"/><rect x="-6" y="500" width="12" height="112" fill="#6b4f31"/><path d="M0 500 Q-70 470 -110 520 Q-50 500 0 510Z" fill="#2e9b57"/><path d="M0 500 Q70 470 110 520 Q50 500 0 510Z" fill="#2e9b57"/><path d="M0 500 Q-30 430 -80 420 Q-30 450 0 500Z" fill="#38b06a"/><path d="M0 500 Q30 430 80 420 Q30 450 0 500Z" fill="#38b06a"/><path d="M0 500 Q0 420 0 400 Q10 450 0 500Z" fill="#38b06a"/></g>`;
  return svg(`
  <defs>
    <linearGradient id="m-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dfe8f7"/><stop offset="1" stop-color="#f4f6fb"/></linearGradient>
    <linearGradient id="m-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9e7e2"/><stop offset="1" stop-color="#cfcbc2"/></linearGradient>
    <linearGradient id="m-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <linearGradient id="m-sheen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#m-wall)"/>
  <rect x="300" y="0" width="1000" height="110" fill="#bcd9f5"/><g stroke="#fff" stroke-width="6"><line x1="466" y1="0" x2="466" y2="110"/><line x1="633" y1="0" x2="633" y2="110"/><line x1="800" y1="0" x2="800" y2="110"/><line x1="966" y1="0" x2="966" y2="110"/><line x1="1133" y1="0" x2="1133" y2="110"/></g>
  <polygon points="400,110 560,110 760,640 300,640" fill="url(#m-beam)"/><polygon points="760,110 920,110 1060,640 640,640" fill="url(#m-beam)" opacity=".8"/><polygon points="1060,110 1220,110 1380,640 960,640" fill="url(#m-beam)"/>
  <rect y="210" width="1600" height="120" fill="#eef1f8"/><rect y="228" width="1600" height="8" fill="#9aa5b8"/>${rail}
  ${store(60, '#e11d74', 'CAFÉ')}${store(610, '#2563eb', 'BOOKS')}${store(1160, '#ea580c', 'SPORTS')}
  <rect y="620" width="1600" height="280" fill="url(#m-floor)"/>${tiles}<rect y="620" width="1600" height="120" fill="url(#m-sheen)" opacity=".5"/>
  ${palm(30)}${palm(1570)}
  <g><rect x="740" y="120" width="8" height="70" fill="#9aa5b8"/><rect x="700" y="170" width="90" height="140" rx="6" fill="#e11d74"/><text x="745" y="248" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-size="26" fill="#fff">SALE</text><text x="745" y="280" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#fff">50% OFF</text></g>`);
}

/* ---------- Beach ---------- */
function beach() {
  const r = rng(11);
  let waves = '';
  for (let i = 0; i < 18; i++) {
    const x = r() * 1500, y = 500 + r() * 120;
    waves += `<path d="M${x.toFixed(0)} ${y.toFixed(0)} q20 -10 40 0 t40 0 t40 0" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="3" stroke-linecap="round"/>`;
  }
  let shells = '';
  for (let i = 0; i < 24; i++) shells += `<circle cx="${(r() * 1600).toFixed(0)}" cy="${(700 + r() * 190).toFixed(0)}" r="${(2 + r() * 3).toFixed(1)}" fill="#e7c98a"/>`;
  return svg(`
  <defs>
    <linearGradient id="b-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34b0f2"/><stop offset=".7" stop-color="#bdeaff"/><stop offset="1" stop-color="#fff2d6"/></linearGradient>
    <linearGradient id="b-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b8fcb"/><stop offset="1" stop-color="#7fe0e4"/></linearGradient>
    <linearGradient id="b-sand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6e2ab"/><stop offset="1" stop-color="#e8c987"/></linearGradient>
    <radialGradient id="b-sun"><stop offset="0" stop-color="#fffbd0"/><stop offset=".35" stop-color="#ffe790" stop-opacity=".8"/><stop offset="1" stop-color="#ffe790" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#b-sky)"/>
  <circle cx="1180" cy="190" r="260" fill="url(#b-sun)"/><circle cx="1180" cy="190" r="52" fill="#fff8b8"/>
  <g fill="#fff" opacity=".9"><ellipse cx="420" cy="170" rx="110" ry="30"/><ellipse cx="500" cy="150" rx="70" ry="32"/><ellipse cx="860" cy="280" rx="90" ry="24"/></g>
  <rect y="440" width="1600" height="200" fill="url(#b-sea)"/><rect y="436" width="1600" height="6" fill="#fff" opacity=".5"/>${waves}
  <path d="M0 640 Q 400 600 800 640 T 1600 630 V 900 H0Z" fill="url(#b-sand)"/><path d="M0 646 Q 400 606 800 646 T 1600 636" fill="none" stroke="#fff" stroke-width="10" opacity=".7"/>${shells}
  <g transform="translate(150 700)"><path d="M0 0 Q30 -200 -10 -330" fill="none" stroke="#7b5a35" stroke-width="22" stroke-linecap="round"/><g fill="#2fa05a"><path d="M-10 -330 Q-100 -380 -190 -320 Q-100 -340 -10 -320Z"/><path d="M-10 -330 Q80 -390 170 -330 Q80 -340 -10 -320Z"/><path d="M-10 -330 Q-60 -420 -140 -430 Q-60 -380 -10 -325Z"/><path d="M-10 -330 Q40 -430 120 -440 Q50 -385 -10 -325Z"/><path d="M-10 -330 Q-10 -430 -10 -470 Q10 -400 -10 -325Z"/></g></g>
  <g transform="translate(1330 700)"><rect x="-4" y="-230" width="8" height="250" fill="#8a8f99"/><path d="M-190 -230 Q0 -380 190 -230Z" fill="#ef4444"/><path d="M-190 -230 Q-95 -300 0 -230 Q-60 -300 -190 -230Z" fill="#fff"/><path d="M0 -230 Q95 -300 190 -230 Q130 -300 0 -230Z" fill="#fff"/><ellipse cx="0" cy="70" rx="170" ry="26" fill="#2563eb" opacity=".35"/></g>`);
}

/* ---------- Space ---------- */
function space() {
  const r = rng(3);
  let stars = '';
  for (let i = 0; i < 260; i++) {
    const big = r() > 0.94;
    stars += `<circle cx="${(r() * 1600).toFixed(0)}" cy="${(r() * 900).toFixed(0)}" r="${(big ? 1.8 + r() * 1.4 : 0.5 + r() * 1.1).toFixed(1)}" fill="#fff" opacity="${(0.4 + r() * 0.6).toFixed(2)}"/>`;
  }
  return svg(`
  <defs>
    <radialGradient id="s-bg" cx=".5" cy=".4" r=".9"><stop offset="0" stop-color="#2b1458"/><stop offset=".6" stop-color="#0f0a2c"/><stop offset="1" stop-color="#04030d"/></radialGradient>
    <radialGradient id="s-neb1"><stop offset="0" stop-color="#ec4899" stop-opacity=".45"/><stop offset="1" stop-color="#ec4899" stop-opacity="0"/></radialGradient>
    <radialGradient id="s-neb2"><stop offset="0" stop-color="#22d3ee" stop-opacity=".35"/><stop offset="1" stop-color="#22d3ee" stop-opacity="0"/></radialGradient>
    <radialGradient id="s-planet" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#ffd2a1"/><stop offset=".55" stop-color="#ff8f5c"/><stop offset="1" stop-color="#8a2f4a"/></radialGradient>
    <radialGradient id="s-moon" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#f1f5f9"/><stop offset="1" stop-color="#8b94a8"/></radialGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#s-bg)"/>
  <ellipse cx="380" cy="260" rx="520" ry="300" fill="url(#s-neb1)"/><ellipse cx="1250" cy="640" rx="560" ry="320" fill="url(#s-neb2)"/>
  ${stars}
  <g transform="translate(1260 220)"><path d="M-260 30 A260 70 0 0 1 260 30" fill="none" stroke="#f9d6a8" stroke-opacity=".55" stroke-width="14"/><circle r="130" fill="url(#s-planet)"/><path d="M-260 30 A260 70 0 0 0 260 30" fill="none" stroke="#f9d6a8" stroke-opacity=".85" stroke-width="14"/></g>
  <circle cx="260" cy="700" r="64" fill="url(#s-moon)"/><circle cx="240" cy="684" r="12" fill="#7d869b" opacity=".6"/><circle cx="286" cy="720" r="9" fill="#7d869b" opacity=".6"/><circle cx="270" cy="672" r="6" fill="#7d869b" opacity=".6"/>
  <line x1="700" y1="120" x2="840" y2="80" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/><line x1="640" y1="136" x2="700" y2="120" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".3"/>`);
}

const LIGHT = { // dark UI chrome on light scenes and vice-versa
  panelLight: 'rgba(255,255,255,.74)',
  panelDark: 'rgba(12,16,40,.72)',
};

export const THEMES = [
  {
    id: 'outdoors', name: 'Outdoors', emoji: '🌳', svg: outdoors(),
    ui: { panel: LIGHT.panelLight, text: '#12304a', muted: '#4a6a85', accent: '#1e88e5', border: 'rgba(18,48,74,.15)', page: '#9bd3ff' },
    light: { hemi: [0xcfeaff, 0x6aa84f, 1.35], dir: [0xfff2d0, 2.4, [5, 8, 6]], fill: 0.5, blob: 0.28 },
  },
  {
    id: 'competition', name: 'Competition', emoji: '🏆', svg: competition(),
    ui: { panel: LIGHT.panelDark, text: '#eaf0ff', muted: '#9fb0dc', accent: '#ffb300', border: 'rgba(255,255,255,.14)', page: '#0b1230' },
    light: { hemi: [0xd5e2ff, 0x3a4680, 1.45], dir: [0xffffff, 3.1, [4, 9, 5]], fill: 0.6, blob: 0.55 },
  },
  {
    id: 'home', name: 'Home', emoji: '🏠', svg: home(),
    ui: { panel: 'rgba(255,248,236,.78)', text: '#3b2a1a', muted: '#7b6248', accent: '#c2410c', border: 'rgba(59,42,26,.16)', page: '#e6d0ab' },
    light: { hemi: [0xfff1d6, 0xa06c3d, 1.25], dir: [0xffe6b8, 2.0, [-4, 7, 7]], fill: 0.5, blob: 0.35 },
  },
  {
    id: 'mall', name: 'Mall', emoji: '🛍️', svg: mall(),
    ui: { panel: LIGHT.panelLight, text: '#1f2937', muted: '#586274', accent: '#db2777', border: 'rgba(31,41,55,.14)', page: '#dfe8f7' },
    light: { hemi: [0xffffff, 0xb9c0cd, 1.45], dir: [0xffffff, 2.2, [3, 10, 6]], fill: 0.6, blob: 0.3 },
  },
  {
    id: 'beach', name: 'Beach', emoji: '🏖️', svg: beach(),
    ui: { panel: LIGHT.panelLight, text: '#0b3b4d', muted: '#3f6a7a', accent: '#f97316', border: 'rgba(11,59,77,.15)', page: '#bdeaff' },
    light: { hemi: [0xd8f1ff, 0xe8c987, 1.35], dir: [0xfff0c2, 2.5, [6, 8, 4]], fill: 0.5, blob: 0.26 },
  },
  {
    id: 'space', name: 'Space', emoji: '🪐', svg: space(),
    ui: { panel: 'rgba(14,8,40,.7)', text: '#efeaff', muted: '#b4a8e0', accent: '#a78bfa', border: 'rgba(255,255,255,.14)', page: '#0b0620' },
    light: { hemi: [0xd2c8ff, 0x4b3a8c, 1.5], dir: [0xffffff, 3.0, [-5, 6, 7]], fill: 0.7, blob: 0.18 },
  },
];
