// The three lantern-lit scenes of Twin Lanterns. Every scene is drawn twice
// from the same seeded generator: once as the original (side 0) and once as
// the changed picture (side 1). Decorative randomness (stars, waves, flowers)
// re-seeds identically for both sides, so the pictures match everywhere
// except the seven designed differences, each of which is a small, deliberate
// change: a colour, a missing or extra creature, a shape that moved.
//
// A scene is { id, name, seed, blurb, differences, draw }. `differences`
// lists the seven findable spots in panel coordinates (560 x 420) with a
// short name the game shows when one is found. `draw(ctx, side)` paints
// that side of the picture.
import { makeRng, rangeInt } from './rng.js';

export const PANEL_W = 560;
export const PANEL_H = 420;

function circle(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function poly(ctx, points, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

function star(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.45;
    const px = x + Math.cos(angle) * rad;
    const py = y + Math.sin(angle) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function bird(ctx, x, y, scale, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5 * scale;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 12 * scale, y);
  ctx.quadraticCurveTo(x - 5 * scale, y - 8 * scale, x, y);
  ctx.quadraticCurveTo(x + 5 * scale, y - 8 * scale, x + 12 * scale, y);
  ctx.stroke();
}

function scatterStars(ctx, rng, count, top, color) {
  for (let i = 0; i < count; i += 1) {
    const x = rangeInt(rng, 8, PANEL_W - 8);
    const y = rangeInt(rng, 8, top);
    const r = rng() * 1.6 + 0.6;
    circle(ctx, x, y, r, color);
  }
}

// ---------------------------------------------------------------------------
// Scene 1 — Harbor at Dusk
// A striped lighthouse watches over a little harbour: sailboats, a wooden
// pier, crates, gulls and a fish that only sometimes jumps.
// ---------------------------------------------------------------------------
function drawHarbor(ctx, side) {
  const rng = makeRng(101);
  const sky = ctx.createLinearGradient(0, 0, 0, 250);
  sky.addColorStop(0, '#2b1e4f');
  sky.addColorStop(0.6, '#7a4a72');
  sky.addColorStop(1, '#e8825a');
  rect(ctx, 0, 0, PANEL_W, 250, sky);
  scatterStars(ctx, rng, 26, 110, 'rgba(255,244,214,0.9)');
  circle(ctx, 452, 118, 34, '#ffd98a');
  circle(ctx, 452, 118, 26, '#ffe9b0');
  ellipse(ctx, 300, 60, 70, 14, 'rgba(255,214,190,0.5)');
  ellipse(ctx, 340, 66, 46, 10, 'rgba(255,214,190,0.4)');
  ellipse(ctx, 130, 44, 56, 12, 'rgba(255,214,190,0.45)');

  // Sea.
  const sea = ctx.createLinearGradient(0, 250, 0, PANEL_H);
  sea.addColorStop(0, '#2c5a74');
  sea.addColorStop(1, '#122f45');
  rect(ctx, 0, 250, PANEL_W, PANEL_H - 250, sea);
  ctx.strokeStyle = 'rgba(255,220,170,0.35)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 14; i += 1) {
    const y = 262 + i * 11 + Math.floor(rng() * 5);
    const x = Math.floor(rng() * 420) + 20;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + 22, y - 5, x + 48, y);
    ctx.stroke();
  }

  // Lighthouse: striped tower, gallery, lamp room.
  rect(ctx, 66, 92, 68, 158, '#f2ead8');
  rect(ctx, 66, 118, 68, 22, '#c94f43');
  rect(ctx, 66, 168, 68, 22, '#c94f43');
  rect(ctx, 66, 218, 68, 22, '#c94f43');
  rect(ctx, 58, 84, 84, 10, '#3a2f4d');
  rect(ctx, 74, 62, 52, 22, '#3a2f4d');
  // Difference 7: the flag on the lamp room — red, flying right (left) or
  // green, flying left (right).
  if (side === 0) poly(ctx, [[100, 62], [132, 52], [132, 68]], '#e84a3f');
  else poly(ctx, [[100, 62], [68, 52], [68, 68]], '#4fc94f');
  // Difference 2: the lamp glows warm gold on the left, cold blue-white
  // on the right, and its beam changes colour with it.
  const beamColor = side === 0 ? 'rgba(255,214,120,0.28)' : 'rgba(170,220,255,0.28)';
  poly(ctx, [[126, 73], [330, 30], [330, 118]], beamColor);
  circle(ctx, 100, 73, 11, side === 0 ? '#ffd76a' : '#cfe8ff');
  circle(ctx, 100, 73, 5, '#fff6d8');
  // Difference 5: the tower window is lit on the left, dark on the right.
  rect(ctx, 92, 158, 16, 24, side === 0 ? '#ffd76a' : '#2c2440');
  rect(ctx, 92, 158, 16, 24, 'rgba(0,0,0,0)');
  ctx.strokeStyle = '#3a2f4d';
  ctx.lineWidth = 2;
  ctx.strokeRect(92, 158, 16, 24);
  rect(ctx, 60, 250, 80, 10, '#3a2f4d');

  // Gulls. Difference 1: a fourth gull appears on the right.
  bird(ctx, 210, 70, 1, '#2b1e4f');
  bird(ctx, 270, 52, 0.8, '#2b1e4f');
  bird(ctx, 330, 84, 0.9, '#2b1e4f');
  if (side === 1) bird(ctx, 430, 70, 1, '#2b1e4f');

  // Wooden pier with posts.
  rect(ctx, 170, 292, 370, 12, '#8a6a44');
  rect(ctx, 170, 304, 370, 6, '#6e5232');
  for (let x = 190; x <= 520; x += 55) rect(ctx, x, 304, 10, 26, '#5a4128');
  // Crates on the pier. Difference 4: a second crate on the right.
  rect(ctx, 468, 262, 30, 30, '#b98a4a');
  ctx.strokeStyle = '#7a5a28';
  ctx.lineWidth = 2;
  ctx.strokeRect(468, 262, 30, 30);
  ctx.beginPath();
  ctx.moveTo(468, 262);
  ctx.lineTo(498, 292);
  ctx.moveTo(498, 262);
  ctx.lineTo(468, 292);
  ctx.stroke();
  if (side === 1) {
    rect(ctx, 432, 272, 22, 20, '#b98a4a');
    ctx.strokeRect(432, 272, 22, 20);
  }

  // Sailboats. Difference 3: the near boat's sail is white on the left,
  // red on the right.
  poly(ctx, [[300, 262], [300, 322], [344, 322]], side === 0 ? '#f6f1e2' : '#d94f3d');
  poly(ctx, [[292, 272], [292, 322], [258, 322]], '#f6f1e2');
  rect(ctx, 296, 258, 4, 66, '#4a3421');
  poly(ctx, [[250, 322], [352, 322], [338, 338], [264, 338]], '#7a4a2c');
  poly(ctx, [[420, 292], [420, 336], [452, 336]], '#e8ddc0');
  rect(ctx, 418, 290, 3, 48, '#4a3421');
  poly(ctx, [[392, 336], [462, 336], [450, 350], [404, 350]], '#5d3a22');

  // Difference 6: a fish jumps out of the sea on the right only.
  if (side === 1) {
    ellipse(ctx, 210, 356, 14, 6, '#7fd4e8');
    poly(ctx, [[222, 356], [232, 350], [232, 362]], '#7fd4e8');
    circle(ctx, 200, 354, 1.6, '#123043');
    ctx.strokeStyle = 'rgba(127,212,232,0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(210, 372, 12, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
  }
}

const HARBOR_DIFFS = [
  { id: 'gull', name: 'an extra gull', x: 430, y: 70, r: 20 },
  { id: 'lamp', name: 'the lighthouse beam', x: 100, y: 73, r: 16 },
  { id: 'sail', name: 'the sail colour', x: 312, y: 296, r: 26 },
  { id: 'crate', name: 'an extra crate', x: 443, y: 282, r: 18 },
  { id: 'window', name: 'the lit window', x: 100, y: 170, r: 14 },
  { id: 'fish', name: 'the jumping fish', x: 210, y: 356, r: 18 },
  { id: 'flag', name: 'the flag direction', x: 128, y: 58, r: 14 },
];

// ---------------------------------------------------------------------------
// Scene 2 — Lantern Garden
// A quiet garden at blue hour: a three-tier pagoda, a koi pond, paper
// lanterns, a frog on a lily pad and a butterfly that may or may not be there.
// ---------------------------------------------------------------------------
function drawGarden(ctx, side) {
  const rng = makeRng(202);
  const sky = ctx.createLinearGradient(0, 0, 0, 250);
  sky.addColorStop(0, '#16283f');
  sky.addColorStop(0.7, '#2c5a6e');
  sky.addColorStop(1, '#7fae8e');
  rect(ctx, 0, 0, PANEL_W, 250, sky);
  scatterStars(ctx, rng, 30, 130, 'rgba(255,250,220,0.85)');
  circle(ctx, 486, 58, 26, '#f4ead0');
  circle(ctx, 476, 52, 22, '#e8dcb8');
  ellipse(ctx, 150, 70, 60, 12, 'rgba(220,235,220,0.35)');
  ellipse(ctx, 190, 78, 40, 9, 'rgba(220,235,220,0.3)');

  // Grass.
  const grass = ctx.createLinearGradient(0, 240, 0, PANEL_H);
  grass.addColorStop(0, '#3f7a4e');
  grass.addColorStop(1, '#24512f');
  rect(ctx, 0, 240, PANEL_W, PANEL_H - 240, grass);
  for (let i = 0; i < 26; i += 1) {
    const x = Math.floor(rng() * PANEL_W);
    const y = 250 + Math.floor(rng() * 160);
    ctx.strokeStyle = 'rgba(180,230,170,0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 3, y - 7);
    ctx.stroke();
  }

  // Tree on the left.
  rect(ctx, 52, 150, 18, 100, '#5d3a22');
  circle(ctx, 60, 130, 52, '#2c6b3a');
  circle(ctx, 24, 158, 34, '#35804a');
  circle(ctx, 98, 156, 36, '#2f7a42');
  circle(ctx, 60, 100, 30, '#3d8a4f');
  // Difference 7: a butterfly by the tree, on the right only.
  if (side === 1) {
    ellipse(ctx, 88, 146, 9, 6, '#ffb347');
    ellipse(ctx, 102, 146, 9, 6, '#ff8fb0');
    ctx.strokeStyle = '#3a2f4d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(95, 140);
    ctx.lineTo(95, 152);
    ctx.stroke();
  }

  // Pagoda: three tiers, red pillars, dark tiled roofs.
  rect(ctx, 238, 210, 84, 34, '#8a2f2a');
  rect(ctx, 246, 214, 10, 26, '#f2ead8');
  rect(ctx, 304, 214, 10, 26, '#f2ead8');
  rect(ctx, 272, 214, 16, 26, '#ffd76a');
  poly(ctx, [[226, 212], [334, 212], [318, 182], [242, 182]], '#2c2440');
  rect(ctx, 248, 150, 64, 34, '#8a2f2a');
  rect(ctx, 254, 154, 8, 26, '#f2ead8');
  rect(ctx, 298, 154, 8, 26, '#f2ead8');
  poly(ctx, [[238, 152], [322, 152], [308, 126], [252, 126]], '#2c2440');
  rect(ctx, 258, 100, 44, 28, '#8a2f2a');
  poly(ctx, [[248, 102], [312, 102], [300, 80], [260, 80]], '#2c2440');
  // Difference 4: the golden finial on the roof — gold on the left,
  // red and smaller on the right.
  if (side === 0) {
    circle(ctx, 280, 72, 8, '#ffd76a');
    rect(ctx, 278, 76, 4, 6, '#ffd76a');
  } else {
    circle(ctx, 280, 74, 5, '#d94f3d');
  }

  // Koi pond. Difference 2: a third koi on the right.
  ellipse(ctx, 380, 366, 110, 40, '#2c6b8a');
  ellipse(ctx, 380, 366, 96, 32, '#3a86a8');
  ellipse(ctx, 352, 358, 16, 7, '#ff8a5c');
  poly(ctx, [[368, 358], [378, 352], [378, 364]], '#ff8a5c');
  ellipse(ctx, 408, 376, 16, 7, '#f4ead8');
  poly(ctx, [[392, 376], [382, 370], [382, 382]], '#f4ead8');
  if (side === 1) {
    ellipse(ctx, 330, 366, 14, 6, '#ffd76a');
    poly(ctx, [[344, 366], [352, 361], [352, 371]], '#ffd76a');
  }
  // Lily pads and the frog. Difference 3: the frog sits on the left only.
  ellipse(ctx, 150, 362, 34, 12, '#2c6b3a');
  ellipse(ctx, 196, 374, 24, 9, '#35804a');
  if (side === 0) {
    ellipse(ctx, 150, 350, 16, 12, '#4fae5e');
    circle(ctx, 142, 338, 6, '#4fae5e');
    circle(ctx, 158, 338, 6, '#4fae5e');
    circle(ctx, 142, 336, 2.5, '#171226');
    circle(ctx, 158, 336, 2.5, '#171226');
  }

  // Paper lanterns on a line from the tree to the pagoda, and one on a pole.
  ctx.strokeStyle = '#3a2f4d';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(96, 118);
  ctx.quadraticCurveTo(280, 96, 452, 108);
  ctx.stroke();
  const lanternXs = [150, 230, 310, 390];
  lanternXs.forEach((x, i) => {
    const y = 116 + (i % 2) * 8;
    ctx.strokeStyle = '#3a2f4d';
    ctx.beginPath();
    ctx.moveTo(x, y - 14);
    ctx.lineTo(x, y - 4);
    ctx.stroke();
    ellipse(ctx, x, y + 8, 13, 16, '#e84a3f');
    rect(ctx, x - 5, y - 8, 10, 4, '#ffd76a');
    rect(ctx, x - 5, y + 22, 10, 4, '#ffd76a');
  });
  // Difference 1: the pole lantern is red on the left, gold on the right.
  rect(ctx, 446, 96, 4, 60, '#3a2f4d');
  ellipse(ctx, 448, 118, 15, 18, side === 0 ? '#e84a3f' : '#ffd76a');
  rect(ctx, 443, 98, 10, 4, '#ffd76a');
  rect(ctx, 443, 134, 10, 4, '#ffd76a');

  // Stepping stones to the pagoda. Difference 6: an extra stone, right only.
  const stones = [[214, 330], [252, 352], [292, 368], [330, 388]];
  stones.forEach(([x, y]) => ellipse(ctx, x, y, 20, 8, '#b8b0a0'));
  if (side === 1) ellipse(ctx, 344, 306, 18, 7, '#b8b0a0');

  // Flowers. Difference 5: the big flower by the pond is pink on the
  // left, blue on the right.
  for (let i = 0; i < 10; i += 1) {
    const x = 20 + Math.floor(rng() * 520);
    const y = 300 + Math.floor(rng() * 100);
    const colors = ['#ff8fb0', '#ffd76a', '#f4ead8'];
    for (let p = 0; p < 5; p += 1) {
      const a = (p / 5) * Math.PI * 2;
      circle(ctx, x + Math.cos(a) * 5, y + Math.sin(a) * 5, 3.5, colors[i % 3]);
    }
    circle(ctx, x, y, 3, '#ffb347');
  }
  for (let p = 0; p < 6; p += 1) {
    const a = (p / 6) * Math.PI * 2;
    circle(ctx, 500 + Math.cos(a) * 9, 330 + Math.sin(a) * 9, 6, side === 0 ? '#ff8fb0' : '#7fb0ff');
  }
  circle(ctx, 500, 330, 5, '#ffd76a');
}

const GARDEN_DIFFS = [
  { id: 'pole-lantern', name: 'the pole lantern colour', x: 448, y: 118, r: 20 },
  { id: 'koi', name: 'a third koi', x: 330, y: 366, r: 18 },
  { id: 'frog', name: 'the frog', x: 150, y: 348, r: 20 },
  { id: 'finial', name: 'the roof finial', x: 280, y: 72, r: 16 },
  { id: 'flower', name: 'the big flower colour', x: 500, y: 330, r: 18 },
  { id: 'stone', name: 'an extra stepping stone', x: 344, y: 306, r: 16 },
  { id: 'butterfly', name: 'the butterfly', x: 95, y: 146, r: 18 },
];

// ---------------------------------------------------------------------------
// Scene 3 — Star Market
// A night market under strings of bulbs: two stalls, a cat on an awning,
// balloons, crates of fruit and a mouse that only comes out on one side.
// ---------------------------------------------------------------------------
function drawMarket(ctx, side) {
  const rng = makeRng(303);
  const sky = ctx.createLinearGradient(0, 0, 0, 260);
  sky.addColorStop(0, '#120e2a');
  sky.addColorStop(1, '#3b2a63');
  rect(ctx, 0, 0, PANEL_W, 260, sky);
  scatterStars(ctx, rng, 34, 150, 'rgba(255,250,220,0.9)');
  circle(ctx, 88, 56, 22, '#f4ead0');
  circle(ctx, 80, 50, 18, '#e8dcb8');

  // Cobble ground.
  rect(ctx, 0, 260, PANEL_W, PANEL_H - 260, '#4a3a52');
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 1;
  for (let y = 276; y < PANEL_H; y += 22) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(PANEL_W, y);
    ctx.stroke();
  }
  for (let i = 0; i < 20; i += 1) {
    const x = Math.floor(rng() * PANEL_W);
    const y = 270 + Math.floor(rng() * 140);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 12, y);
    ctx.stroke();
  }

  // String lights across the top. Difference 5: the bulb at (350, 95)
  // is lit on the left, dark on the right.
  ctx.strokeStyle = '#241d3d';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(20, 66);
  ctx.quadraticCurveTo(280, 130, 540, 66);
  ctx.stroke();
  for (let i = 0; i < 11; i += 1) {
    const t = i / 10;
    const x = 30 + t * 500;
    const y = 66 + Math.sin(t * Math.PI) * 58 - 6;
    const lit = !(side === 1 && i === 6);
    circle(ctx, x, y + 10, 6, lit ? '#ffd76a' : '#3a3348');
    if (lit) circle(ctx, x, y + 10, 11, 'rgba(255,215,106,0.25)');
  }

  // Stall 1 (left): red-striped awning, fruit crates.
  rect(ctx, 60, 210, 190, 10, '#6e5232');
  rect(ctx, 66, 220, 10, 130, '#6e5232');
  rect(ctx, 234, 220, 10, 130, '#6e5232');
  for (let i = 0; i < 6; i += 1) {
    rect(ctx, 60 + i * 32, 168, 32, 42, i % 2 === 0 ? '#d94f3d' : '#f4ead8');
  }
  rect(ctx, 60, 168, 192, 6, '#8a2f2a');
  rect(ctx, 60, 350, 192, 12, '#8a6a44');
  // Crates of fruit. Difference 4: the apples are red on the left,
  // orange on the right.
  rect(ctx, 84, 316, 52, 34, '#8a6a44');
  for (let r = 0; r < 2; r += 1) {
    for (let c = 0; c < 3; c += 1) {
      circle(ctx, 96 + c * 15, 326 + r * 12, 6, side === 0 ? '#e84a3f' : '#ff8a3d');
    }
  }
  rect(ctx, 168, 322, 52, 28, '#8a6a44');
  for (let c = 0; c < 3; c += 1) circle(ctx, 180 + c * 15, 332, 6, '#ffd76a');

  // The cat on stall 1's awning. Difference 2: its tail points up on
  // the left, down on the right.
  ellipse(ctx, 200, 158, 22, 12, '#3a3348');
  circle(ctx, 216, 142, 10, '#3a3348');
  poly(ctx, [[210, 134], [214, 122], [218, 134]], '#3a3348');
  poly(ctx, [[220, 134], [224, 122], [228, 134]], '#3a3348');
  if (side === 0) {
    ctx.strokeStyle = '#3a3348';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(180, 156);
    ctx.quadraticCurveTo(168, 140, 176, 124);
    ctx.stroke();
  } else {
    ctx.strokeStyle = '#3a3348';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(180, 156);
    ctx.quadraticCurveTo(170, 168, 178, 178);
    ctx.stroke();
  }

  // Stall 2 (right): teal awning, sign, jars.
  rect(ctx, 310, 210, 210, 10, '#6e5232');
  rect(ctx, 316, 220, 10, 130, '#6e5232');
  rect(ctx, 504, 220, 10, 130, '#6e5232');
  // Difference 6: one awning stripe changes colour on the right.
  for (let i = 0; i < 6; i += 1) {
    let fill = i % 2 === 0 ? '#2c8a7a' : '#f4ead8';
    if (side === 1 && i === 3) fill = '#d94f3d';
    rect(ctx, 310 + i * 35, 168, 35, 42, fill);
  }
  rect(ctx, 310, 168, 210, 6, '#1d5a50');
  rect(ctx, 310, 350, 210, 12, '#8a6a44');
  // Sign. Difference 3: three stars on the left, two on the right.
  rect(ctx, 360, 226, 110, 34, '#f4ead8');
  ctx.strokeStyle = '#3a2f4d';
  ctx.lineWidth = 2;
  ctx.strokeRect(360, 226, 110, 34);
  ctx.fillStyle = '#3a2f4d';
  ctx.font = 'bold 15px Trebuchet MS, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('TEA & SPICE', 415, 248);
  star(ctx, 372, 244, 5, '#e8a83d');
  star(ctx, 458, 244, 5, '#e8a83d');
  if (side === 0) star(ctx, 415, 240, 5, '#e8a83d');
  // Jars on the counter.
  rect(ctx, 330, 316, 26, 34, '#7fb0d4');
  rect(ctx, 366, 310, 26, 40, '#c98ad4');
  rect(ctx, 402, 318, 26, 32, '#8ad4a0');
  rect(ctx, 330, 312, 26, 5, '#3a2f4d');
  rect(ctx, 366, 306, 26, 5, '#3a2f4d');
  rect(ctx, 402, 314, 26, 5, '#3a2f4d');

  // Balloons tied to stall 2. Difference 1: the top balloon is purple
  // on the left, teal on the right.
  ctx.strokeStyle = '#3a2f4d';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(500, 96);
  ctx.lineTo(486, 168);
  ctx.moveTo(516, 100);
  ctx.lineTo(500, 168);
  ctx.stroke();
  ellipse(ctx, 500, 82, 16, 20, side === 0 ? '#9a6ad4' : '#2c8a7a');
  ellipse(ctx, 522, 92, 13, 16, '#ff8fb0');
  poly(ctx, [[500, 102], [494, 110], [506, 110]], side === 0 ? '#9a6ad4' : '#2c8a7a');

  // Difference 7: a little mouse by the crates, on the right only.
  if (side === 1) {
    ellipse(ctx, 520, 362, 14, 8, '#9a8a7a');
    circle(ctx, 532, 358, 6, '#9a8a7a');
    circle(ctx, 530, 352, 3, '#9a8a7a');
    circle(ctx, 536, 352, 3, '#9a8a7a');
    ctx.strokeStyle = '#9a8a7a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(508, 364);
    ctx.quadraticCurveTo(496, 368, 492, 358);
    ctx.stroke();
  }
}

const MARKET_DIFFS = [
  { id: 'balloon', name: 'the balloon colour', x: 500, y: 82, r: 20 },
  { id: 'cat-tail', name: 'the cat tail', x: 178, y: 150, r: 20 },
  { id: 'sign-stars', name: 'a star on the sign', x: 415, y: 242, r: 16 },
  { id: 'fruit', name: 'the apple colour', x: 110, y: 332, r: 20 },
  { id: 'bulb', name: 'the dark bulb', x: 350, y: 100, r: 14 },
  { id: 'awning', name: 'the awning stripe', x: 415, y: 189, r: 20 },
  { id: 'mouse', name: 'the little mouse', x: 518, y: 360, r: 18 },
];

export const SCENES = [
  {
    id: 'harbor',
    name: 'Harbor at Dusk',
    seed: 101,
    blurb: 'Gulls over a striped lighthouse while the sun goes down.',
    differences: HARBOR_DIFFS,
    draw: drawHarbor,
  },
  {
    id: 'garden',
    name: 'Lantern Garden',
    seed: 202,
    blurb: 'A pagoda, a koi pond and paper lanterns at blue hour.',
    differences: GARDEN_DIFFS,
    draw: drawGarden,
  },
  {
    id: 'market',
    name: 'Star Market',
    seed: 303,
    blurb: 'A night market of tea, spice, balloons and one small mouse.',
    differences: MARKET_DIFFS,
    draw: drawMarket,
  },
];
