// Lantern Lane's three scenes. Every scene is drawn twice — once as the
// original (variant 0, left panel) and once altered (variant 1, right
// panel) — by the same function, so the two pictures are near-identical by
// construction and only the listed differences change. All art is original
// vector drawing: no images, no borrowed characters, no network.
//
// A difference is { id, x, y, r, label }: its spot in panel-local pixels
// (panels are 600 x 668), the click radius, and the name shown when found.

import { hashSeed, scatter } from './random.js';

function circle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function roundRect(ctx, x, y, w, h, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function sky(ctx, top, bottom) {
  const gradient = ctx.createLinearGradient(0, 0, 0, 340);
  gradient.addColorStop(0, top);
  gradient.addColorStop(1, bottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 600, 340);
}

function stars(ctx, points, skip) {
  for (const star of points) {
    if (skip && star.x === skip.x && star.y === skip.y) continue;
    ctx.fillStyle = 'rgba(255, 244, 200, 0.9)';
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

// A paper lantern: glowing body, dark caps, tassel below.
function lantern(ctx, x, y, r, color, glow) {
  if (glow) {
    ctx.fillStyle = 'rgba(255, 190, 80, 0.25)';
    ctx.beginPath();
    ctx.arc(x, y, r * 1.7, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(x - r * 0.35, y - r - 6, r * 0.7, 7);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.85, r, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(60, 20, 20, 0.55)';
  ctx.lineWidth = 2;
  for (let i = -1; i <= 1; i += 1) {
    ctx.beginPath();
    ctx.ellipse(x, y, r * 0.45 * Math.abs(i) + r * 0.2, r * 0.92, 0, -1.2, 1.2);
    ctx.stroke();
  }
  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(x - r * 0.35, y + r - 1, r * 0.7, 7);
  ctx.strokeStyle = '#e8b23a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y + r + 6);
  ctx.lineTo(x, y + r + 20);
  ctx.stroke();
}

// A crescent moon (variant 0) or a full moon (variant 1).
function moon(ctx, x, y, r, full) {
  circle(ctx, x, y, r, '#ffe9a8');
  if (!full) {
    circle(ctx, x + r * 0.45, y - r * 0.2, r * 0.85, '#2b1d4e');
  } else {
    ctx.fillStyle = 'rgba(210, 170, 90, 0.7)';
    circle(ctx, x - r * 0.3, y + r * 0.2, r * 0.16, '#e8c877');
    circle(ctx, x + r * 0.25, y - r * 0.3, r * 0.12, '#e8c877');
  }
}

function cat(ctx, x, y, color) {
  // Sitting cat, seen from the side: body, head, ears, tail curl.
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, 26, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  circle(ctx, x + 18, y - 22, 15, color);
  ctx.beginPath();
  ctx.moveTo(x + 8, y - 30);
  ctx.lineTo(x + 12, y - 44);
  ctx.lineTo(x + 18, y - 32);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 22, y - 34);
  ctx.lineTo(x + 28, y - 46);
  ctx.lineTo(x + 32, y - 32);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(x - 24, y + 8, 14, Math.PI * 0.6, Math.PI * 1.5);
  ctx.stroke();
  ctx.fillStyle = '#ffe9a8';
  circle(ctx, x + 23, y - 25, 2.5, '#ffe9a8');
}

// ---------------------------------------------------------------- scene 1
const MARKET_STARS = scatter(hashSeed('lantern-market'), 26, 20, 16, 560, 120);

function drawMarket(ctx, variant) {
  sky(ctx, '#241a4d', '#c96f3f');
  stars(ctx, MARKET_STARS, variant === 1 ? null : { x: 520, y: 60 });
  // The one star that vanishes on the right: drawn only on the left.
  if (variant === 0) circle(ctx, 520, 60, 2.4, '#fff4c8');
  moon(ctx, 90, 80, 32, variant === 1);

  // Distant rooftops.
  ctx.fillStyle = '#1b1436';
  ctx.beginPath();
  ctx.moveTo(0, 300);
  ctx.lineTo(70, 252);
  ctx.lineTo(140, 300);
  ctx.lineTo(210, 258);
  ctx.lineTo(300, 300);
  ctx.lineTo(380, 250);
  ctx.lineTo(470, 300);
  ctx.lineTo(540, 262);
  ctx.lineTo(600, 300);
  ctx.lineTo(600, 340);
  ctx.lineTo(0, 340);
  ctx.closePath();
  ctx.fill();
  // A few lit windows in the distant rooftops.
  ctx.fillStyle = '#ffd166';
  [[52, 282], [120, 276], [258, 282], [348, 274], [430, 280], [500, 276]].forEach(([x, y]) => {
    ctx.fillRect(x, y, 8, 10);
  });

  // Cobblestone street.
  rect(ctx, 0, 470, 600, 198, '#4a3a5e');
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.lineWidth = 2;
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      ctx.strokeRect(8 + col * 66 + (row % 2) * 30, 486 + row * 44, 58, 36);
    }
  }
  rect(ctx, 0, 460, 600, 12, '#6b557f');

  // Lantern string across the top.
  ctx.strokeStyle = '#241a33';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 108);
  ctx.quadraticCurveTo(300, 150, 600, 108);
  ctx.stroke();
  const lanternXs = [70, 170, 270, 370, 470];
  const lanternColors = ['#ff5d73', '#ffc93c', '#ff8c42', '#2ec4b6', '#ffc93c'];
  lanternXs.forEach((x, i) => {
    if (variant === 1 && i === 2) return; // the missing lantern
    const color = variant === 1 && i === 4 ? '#ff7ad9' : lanternColors[i];
    lantern(ctx, x, 132 + Math.sin((x / 600) * Math.PI) * 8, 24, color, true);
  });

  // Left stall: dumplings, red awning on the left, teal on the right.
  const awning = variant === 1 ? '#2ec4b6' : '#e63946';
  roundRect(ctx, 40, 210, 240, 44, 10, awning);
  for (let i = 0; i < 6; i += 1) {
    rect(ctx, 48 + i * 40, 210, 20, 44, i % 2 ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.12)');
  }
  rect(ctx, 52, 254, 8, 170, '#5a3d24');
  rect(ctx, 260, 254, 8, 170, '#5a3d24');
  roundRect(ctx, 44, 420, 232, 60, 8, '#7a5230');
  roundRect(ctx, 44, 420, 232, 14, 8, '#9c6b3f');
  // Dumplings on the counter: three on the left, four on the right.
  [120, 150, 180].forEach((x) => circle(ctx, x, 414, 13, '#ffe9c4'));
  if (variant === 1) circle(ctx, 210, 414, 13, '#ffe9c4');
  ctx.fillStyle = '#fff6e0';
  ctx.beginPath();
  ctx.roundRect(66, 296, 188, 72, 10);
  ctx.fill();
  ctx.fillStyle = '#2b1d4e';
  ctx.font = 'bold 26px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('DUMPLINGS', 160, 330);
  ctx.font = '16px "Trebuchet MS", sans-serif';
  ctx.fillText('steamed · fried · soup', 160, 356);

  // Right stall: tea house with cups and a sign.
  roundRect(ctx, 330, 210, 230, 44, 10, '#2ec4b6');
  for (let i = 0; i < 6; i += 1) {
    rect(ctx, 338 + i * 38, 210, 19, 44, i % 2 ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.12)');
  }
  rect(ctx, 342, 254, 8, 170, '#5a3d24');
  rect(ctx, 540, 254, 8, 170, '#5a3d24');
  roundRect(ctx, 334, 420, 222, 60, 8, '#5e4632');
  roundRect(ctx, 334, 420, 222, 14, 8, '#7d5f43');
  [380, 420, 460, 500].forEach((x) => {
    circle(ctx, x, 408, 11, '#bfe8ff');
    rect(ctx, x - 12, 414, 24, 5, '#8ecae6');
  });
  ctx.fillStyle = '#fff6e0';
  ctx.font = 'bold 26px "Trebuchet MS", sans-serif';
  ctx.fillText('MOON TEA', 445, 330);
  ctx.font = '16px "Trebuchet MS", sans-serif';
  ctx.fillText('jasmine · oolong · mint', 445, 356);

  // Crates, plant and bicycle dressing the street.
  roundRect(ctx, 300, 500, 64, 54, 6, '#8a6a42');
  ctx.strokeStyle = '#5a3d24';
  ctx.lineWidth = 3;
  ctx.strokeRect(300, 500, 64, 54);
  ctx.beginPath();
  ctx.moveTo(300, 527);
  ctx.lineTo(364, 527);
  ctx.stroke();
  roundRect(ctx, 540, 520, 46, 60, 6, '#b3543f');
  ctx.fillStyle = '#3f9e4d';
  circle(ctx, 563, 505, 18, '#3f9e4d');
  circle(ctx, 550, 512, 14, '#57b368');
  circle(ctx, 576, 512, 14, '#57b368');
  // A proper bicycle: two wheels, a frame triangle, seat and handlebar.
  ctx.strokeStyle = '#c0c8d8';
  ctx.lineWidth = 4;
  for (const wx of [86, 186]) {
    ctx.beginPath();
    ctx.arc(wx, 592, 22, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(86, 592);
  ctx.lineTo(136, 548);
  ctx.lineTo(186, 592);
  ctx.lineTo(150, 592);
  ctx.lineTo(136, 548);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(136, 548);
  ctx.lineTo(128, 540);
  ctx.moveTo(136, 548);
  ctx.lineTo(152, 540);
  ctx.stroke();

  // The market cat, perched on a crate — gone on the right.
  if (variant === 0) {
    roundRect(ctx, 440, 566, 70, 40, 6, '#8a6a42');
    cat(ctx, 472, 556, '#e08a3c');
  }
}

// ---------------------------------------------------------------- scene 2
const POND_STARS = scatter(hashSeed('koi-pond-garden'), 18, 20, 14, 560, 110);

function koi(ctx, x, y, angle, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, 34, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-30, 0);
  ctx.lineTo(-48, -12);
  ctx.lineTo(-48, 12);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  circle(ctx, 14, -4, 4, 'rgba(255,255,255,0.75)');
  circle(ctx, 20, 3, 3, 'rgba(255,255,255,0.75)');
  ctx.fillStyle = '#1d3557';
  circle(ctx, 24, -3, 2.5, '#1d3557');
  ctx.restore();
}

function lilyPad(ctx, x, y, r) {
  ctx.fillStyle = '#2f9e5f';
  ctx.beginPath();
  ctx.arc(x, y, r, 0.3, Math.PI * 2 - 0.3);
  ctx.lineTo(x, y);
  ctx.closePath();
  ctx.fill();
  circle(ctx, x - r * 0.3, y - r * 0.2, 4, '#ff8fc7');
}

function drawPond(ctx, variant) {
  sky(ctx, '#1d3a2f', '#7fb069');
  stars(ctx, POND_STARS, null);
  if (variant === 0) circle(ctx, 200, 90, 2.4, '#fff4c8'); // firefly that vanishes
  // Cherry tree canopy: a cloud of overlapping blossom, not separate blobs.
  ctx.fillStyle = '#e58aa8';
  circle(ctx, 470, 118, 62, '#e58aa8');
  circle(ctx, 412, 142, 42, '#e58aa8');
  circle(ctx, 528, 142, 42, '#e58aa8');
  circle(ctx, 470, 78, 40, '#f2a7bd');
  circle(ctx, 428, 96, 34, '#f2a7bd');
  circle(ctx, 512, 96, 34, '#f2a7bd');
  if (variant === 0) {
    // One bright blossom cluster, low on the canopy.
    circle(ctx, 470, 122, 17, '#ff5d8f');
    circle(ctx, 458, 128, 6, '#ff8fc7');
    circle(ctx, 482, 128, 6, '#ff8fc7');
  }
  ctx.fillStyle = '#5a3d24';
  ctx.fillRect(452, 150, 16, 60);
  // Garden wall and stone lantern.
  rect(ctx, 0, 180, 600, 26, '#8a7a63');
  rect(ctx, 60, 120, 60, 60, '#9a8a73');
  rect(ctx, 52, 108, 76, 14, '#7a6a53');
  rect(ctx, 68, 180, 44, 26, '#7a6a53');
  if (variant === 0) {
    circle(ctx, 90, 152, 10, '#ffd166'); // lantern flame lit
    ctx.fillStyle = 'rgba(255, 209, 102, 0.3)';
    ctx.beginPath();
    ctx.arc(90, 152, 24, 0, Math.PI * 2);
    ctx.fill();
  } else {
    circle(ctx, 90, 152, 10, '#3a3a4a'); // unlit
  }
  // The pond.
  const water = ctx.createLinearGradient(0, 206, 0, 668);
  water.addColorStop(0, '#2a7f8f');
  water.addColorStop(1, '#14455c');
  ctx.fillStyle = water;
  ctx.fillRect(0, 206, 600, 462);
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 7; i += 1) {
    ctx.beginPath();
    ctx.moveTo(30 + i * 80, 240 + i * 52);
    ctx.quadraticCurveTo(90 + i * 80, 250 + i * 52, 150 + i * 80, 240 + i * 52);
    ctx.stroke();
  }
  // Arched bridge across the pond.
  ctx.fillStyle = variant === 1 ? '#6b4a2f' : '#a33b2e';
  ctx.beginPath();
  ctx.moveTo(180, 300);
  ctx.quadraticCurveTo(300, 210, 420, 300);
  ctx.lineTo(420, 322);
  ctx.quadraticCurveTo(300, 236, 180, 322);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#5a3d24';
  ctx.lineWidth = 4;
  for (let i = 0; i < 5; i += 1) {
    const x = 210 + i * 45;
    ctx.beginPath();
    ctx.moveTo(x, 268 + Math.abs(x - 300) * 0.12);
    ctx.lineTo(x, 300);
    ctx.stroke();
  }
  // Lily pads: one extra appears on the right.
  lilyPad(ctx, 90, 380, 30);
  lilyPad(ctx, 480, 430, 34);
  lilyPad(ctx, 250, 560, 28);
  lilyPad(ctx, 520, 600, 26);
  if (variant === 1) lilyPad(ctx, 120, 520, 28);
  // Koi: the middle one changes colour.
  koi(ctx, 200, 350, 0.4, '#ff8c42');
  koi(ctx, 300, 420, -0.3, variant === 1 ? '#f4f1ea' : '#ff6b35');
  koi(ctx, 420, 500, 0.9, '#ffd166');
  // Frog on a rock — gone on the right.
  ctx.fillStyle = '#7a7a72';
  ctx.beginPath();
  ctx.ellipse(500, 312, 42, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  if (variant === 0) {
    ctx.fillStyle = '#4caf50';
    ctx.beginPath();
    ctx.ellipse(500, 296, 17, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    circle(ctx, 492, 288, 15, '#4caf50');
    circle(ctx, 508, 288, 15, '#4caf50');
    ctx.fillStyle = '#1d3557';
    circle(ctx, 490, 284, 4, '#1d3557');
    circle(ctx, 510, 284, 4, '#1d3557');
  }
  // A shy turtle, only on the right.
  if (variant === 1) {
    ctx.fillStyle = '#2f7d4f';
    ctx.beginPath();
    ctx.ellipse(430, 560, 30, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    circle(ctx, 462, 556, 10, '#2f7d4f');
    ctx.fillStyle = '#57b368';
    ctx.beginPath();
    ctx.ellipse(430, 556, 20, 10, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Stepping stones along the bottom.
  [90, 200, 320, 450].forEach((x, i) => {
    ctx.fillStyle = i % 2 ? '#9a8a73' : '#b0a08a';
    ctx.beginPath();
    ctx.ellipse(x, 632, 44, 16, 0, 0, Math.PI * 2);
    ctx.fill();
  });
}

// ---------------------------------------------------------------- scene 3
const ROOF_STARS = scatter(hashSeed('firefly-rooftops'), 30, 16, 14, 568, 130);

function building(ctx, x, y, w, h, color, litWindows, darkOne) {
  rect(ctx, x, y, w, h, color);
  rect(ctx, x - 6, y - 12, w + 12, 12, '#241a33');
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      const wx = x + 18 + col * ((w - 36) / 3);
      const wy = y + 24 + row * ((h - 60) / 3);
      const lit = litWindows.includes(`${row}:${col}`);
      const dark = darkOne === `${row}:${col}`;
      rect(ctx, wx, wy, 22, 26, lit && !dark ? '#ffd166' : '#1d1830');
      if (lit && !dark) {
        ctx.fillStyle = 'rgba(255, 209, 102, 0.25)';
        ctx.fillRect(wx - 3, wy - 3, 28, 32);
        ctx.fillStyle = '#ffd166';
      }
    }
  }
}

function firework(ctx, x, y, r, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  for (let i = 0; i < 10; i += 1) {
    const angle = (i / 10) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
    ctx.stroke();
  }
  circle(ctx, x, y, 5, '#fff6e0');
}

function drawRooftops(ctx, variant) {
  sky(ctx, '#1c1440', '#e2725b');
  stars(ctx, ROOF_STARS, null);
  if (variant === 0) circle(ctx, 540, 60, 2.4, '#fff4c8'); // star that vanishes
  moon(ctx, 90, 80, 30, variant === 1);
  firework(ctx, 200, 130, 34, '#ff8fc7');
  firework(ctx, 480, 110, 28, '#7ad9ff');
  if (variant === 1) firework(ctx, 300, 90, 30, '#ffc93c'); // extra burst
  // Skyline.
  building(ctx, 20, 330, 150, 338, '#2e2450', ['0:0', '1:2', '2:1', '3:3'], variant === 1 ? '2:1' : null);
  building(ctx, 190, 280, 170, 388, '#3a2c5e', ['0:2', '1:0', '2:3', '3:1'], null);
  building(ctx, 380, 350, 150, 318, '#2a2148', ['0:1', '1:3', '2:0', '3:2'], null);
  building(ctx, 520, 300, 70, 368, '#332a56', ['0:0', '2:1'], null);
  // Water tower on the second roof.
  ctx.fillStyle = '#5a4632';
  ctx.fillRect(238, 226, 8, 54);
  ctx.fillRect(308, 226, 8, 54);
  ctx.fillStyle = '#7a5c40';
  ctx.beginPath();
  ctx.ellipse(277, 212, 46, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(231, 212);
  ctx.lineTo(277, 178);
  ctx.lineTo(323, 212);
  ctx.closePath();
  ctx.fill();
  circle(ctx, 277, 176, 6, variant === 1 ? '#2ec4b6' : '#ff5d73'); // tower light
  // Antenna on the third roof, tilting the other way on the right.
  ctx.strokeStyle = '#c0c8d8';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(520, 350);
  ctx.lineTo(520, 250);
  ctx.stroke();
  ctx.save();
  ctx.translate(520, 246);
  ctx.rotate(variant === 1 ? 0.7 : -0.7);
  ctx.beginPath();
  ctx.arc(0, 0, 22, -Math.PI * 0.4, Math.PI * 0.9);
  ctx.stroke();
  ctx.restore();
  // Chimney with smoke — the smoke is gone on the right.
  rect(ctx, 440, 300, 26, 50, '#4a3a5e');
  if (variant === 0) {
    ctx.fillStyle = 'rgba(230, 230, 240, 0.75)';
    circle(ctx, 458, 282, 12, 'rgba(230,230,240,0.75)');
    circle(ctx, 470, 262, 16, 'rgba(230,230,240,0.6)');
    circle(ctx, 484, 238, 20, 'rgba(230,230,240,0.45)');
  }
  // Clothesline between two roofs: the middle shirt changes colour.
  ctx.strokeStyle = '#241a33';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(190, 420);
  ctx.quadraticCurveTo(300, 448, 380, 420);
  ctx.stroke();
  rect(ctx, 240, 424, 30, 34, '#ff5d73');
  rect(ctx, 300, 428, 30, 34, variant === 1 ? '#2e6fd8' : '#ffc93c');
  rect(ctx, 340, 424, 30, 34, '#2ec4b6');
  // A pigeon on the first roof — gone on the right.
  if (variant === 0) {
    ctx.fillStyle = '#8d99ae';
    ctx.beginPath();
    ctx.ellipse(120, 470, 16, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    circle(ctx, 134, 458, 8, '#8d99ae');
    ctx.fillStyle = '#ff8c42';
    ctx.beginPath();
    ctx.moveTo(141, 458);
    ctx.lineTo(148, 460);
    ctx.lineTo(141, 462);
    ctx.closePath();
    ctx.fill();
  }
  // String lights along the bottom roof edge.
  ctx.strokeStyle = '#241a33';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(20, 620);
  ctx.quadraticCurveTo(300, 650, 580, 620);
  ctx.stroke();
  ['#ff5d73', '#ffc93c', '#2ec4b6', '#ff8fc7'].forEach((color, i) => {
    circle(ctx, 90 + i * 130, 632 + Math.sin(i * 1.3) * 6, 6, color);
  });
}

export const SCENES = [
  {
    name: 'Lantern Market',
    draw: drawMarket,
    diffs: [
      { id: 'moon', x: 90, y: 80, r: 34, label: 'The moon changed phase' },
      { id: 'lantern-missing', x: 270, y: 138, r: 26, label: 'A lantern went missing' },
      { id: 'cat', x: 472, y: 552, r: 32, label: 'The market cat slipped away' },
      { id: 'awning', x: 150, y: 230, r: 32, label: 'The awning changed colour' },
      { id: 'dumpling', x: 210, y: 414, r: 18, label: 'An extra dumpling appeared' },
      { id: 'lantern-pink', x: 470, y: 136, r: 24, label: 'A lantern turned pink' },
      { id: 'star', x: 520, y: 60, r: 16, label: 'A star blinked out' },
    ],
  },
  {
    name: 'Koi Pond Garden',
    draw: drawPond,
    diffs: [
      { id: 'koi', x: 300, y: 420, r: 30, label: 'A koi changed colour' },
      { id: 'lily', x: 120, y: 520, r: 26, label: 'An extra lily pad floated in' },
      { id: 'frog', x: 500, y: 296, r: 26, label: 'The frog hopped off' },
      { id: 'stone-lantern', x: 90, y: 152, r: 26, label: 'The stone lantern went dark' },
      { id: 'blossom', x: 470, y: 120, r: 28, label: 'A blossom cluster fell' },
      { id: 'bridge', x: 300, y: 252, r: 26, label: 'The bridge changed colour' },
      { id: 'turtle', x: 430, y: 560, r: 28, label: 'A turtle surfaced' },
      { id: 'firefly', x: 200, y: 90, r: 14, label: 'A firefly flew away' },
    ],
  },
  {
    name: 'Firefly Rooftops',
    draw: drawRooftops,
    diffs: [
      { id: 'window', x: 87, y: 552, r: 22, label: 'A window went dark' },
      { id: 'antenna', x: 520, y: 246, r: 26, label: 'The antenna tilted away' },
      { id: 'firework', x: 300, y: 90, r: 30, label: 'An extra firework burst' },
      { id: 'shirt', x: 315, y: 445, r: 24, label: 'A shirt changed colour' },
      { id: 'pigeon', x: 124, y: 466, r: 22, label: 'The pigeon flew off' },
      { id: 'smoke', x: 470, y: 256, r: 26, label: 'The chimney smoke cleared' },
      { id: 'moon', x: 90, y: 80, r: 30, label: 'The moon changed phase' },
      { id: 'tower-light', x: 277, y: 176, r: 20, label: 'The tower light changed colour' },
      { id: 'star', x: 540, y: 60, r: 14, label: 'A star blinked out' },
    ],
  },
];
