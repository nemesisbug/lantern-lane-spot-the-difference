// Drawing only: the world's state in, pixels out. The playfield is a fixed
// 1280x720 logical space scaled to the window; the header carries the
// counter the screenshots must show, and each found difference gets a gold
// ring on both panels.

import { FONT, HUD, LEVELS, PALETTE, PANELS, VIEW } from './config.js';
import { SCENES } from './scenes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

function fmtTime(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  const view = { scale: 1, x: 0, y: 0 };

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(window.innerWidth * ratio);
    canvas.height = Math.round(window.innerHeight * ratio);
    view.scale = Math.min(canvas.width / VIEW.width, canvas.height / VIEW.height);
    view.x = (canvas.width - VIEW.width * view.scale) / 2;
    view.y = (canvas.height - VIEW.height * view.scale) / 2;
  }

  function text(value, x, y, size, color, align = 'left', bold = false) {
    ctx.font = `${bold ? 'bold ' : ''}${size}px ${FONT}`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(value, x, y);
  }

  function panelOrigin(panel) {
    return { x: panel === 0 ? PANELS.leftX : PANELS.rightX, y: PANELS.top };
  }

  function drawPanels(world) {
    const scene = world.scene();
    for (let panel = 0; panel < 2; panel += 1) {
      const origin = panelOrigin(panel);
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(origin.x, origin.y, PANELS.width, PANELS.height, 14);
      ctx.clip();
      ctx.save();
      ctx.translate(origin.x, origin.y);
      scene.draw(ctx, panel);
      ctx.restore();
      // A dim veil while paused or on an end screen.
      if (world.state.screen === 'paused' || world.state.screen === 'gameOver') {
        ctx.fillStyle = 'rgba(13, 11, 28, 0.45)';
        ctx.fillRect(origin.x, origin.y, PANELS.width, PANELS.height);
      }
      ctx.restore();
      ctx.strokeStyle = PALETTE.panelEdge;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(origin.x, origin.y, PANELS.width, PANELS.height, 14);
      ctx.stroke();
      // Panel tabs: A is the original, B hides the changes.
      ctx.fillStyle = panel === 0 ? PALETTE.gold : PALETTE.teal;
      ctx.beginPath();
      ctx.roundRect(origin.x + 14, origin.y + 12, 44, 30, 8);
      ctx.fill();
      text(panel === 0 ? 'A' : 'B', origin.x + 36, origin.y + 34, 20, PALETTE.ink, 'center', true);
    }
  }

  function drawFoundRings(world) {
    const scene = world.scene();
    for (const diff of scene.diffs) {
      if (!world.state.found.has(diff.id)) continue;
      for (let panel = 0; panel < 2; panel += 1) {
        const origin = panelOrigin(panel);
        const x = origin.x + diff.x;
        const y = origin.y + diff.y;
        ctx.strokeStyle = PALETTE.gold;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(x, y, diff.r + 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, diff.r + 11, 0, Math.PI * 2);
        ctx.stroke();
        // Tick inside the ring.
        ctx.strokeStyle = PALETTE.gold;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x - 9, y);
        ctx.lineTo(x - 2, y + 8);
        ctx.lineTo(x + 11, y - 8);
        ctx.stroke();
        ctx.lineCap = 'butt';
      }
    }
  }

  function drawEffects(world) {
    for (const effect of world.state.effects) {
      const age = world.state.elapsed - effect.born;
      const alpha = Math.max(0, 1 - age / 1.2);
      const origin = panelOrigin(effect.panel);
      const x = origin.x + effect.x;
      const y = origin.y + effect.y;
      if (effect.kind === 'miss') {
        ctx.strokeStyle = `rgba(255, 93, 115, ${alpha})`;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x - 12, y - 12);
        ctx.lineTo(x + 12, y + 12);
        ctx.moveTo(x + 12, y - 12);
        ctx.lineTo(x - 12, y + 12);
        ctx.stroke();
        ctx.lineCap = 'butt';
      } else {
        ctx.strokeStyle = `rgba(255, 201, 60, ${alpha})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(x, y, effect.r + 6 + age * 14, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    const hint = world.state.hint;
    if (hint) {
      const pulse = 1 + 0.15 * Math.sin(world.state.elapsed * 10);
      for (let panel = 0; panel < 2; panel += 1) {
        const origin = panelOrigin(panel);
        ctx.strokeStyle = PALETTE.teal;
        ctx.lineWidth = 4;
        ctx.setLineDash([10, 8]);
        ctx.beginPath();
        ctx.arc(origin.x + hint.diff.x, origin.y + hint.diff.y, (hint.diff.r + 12) * pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }

  function drawCursor(world) {
    if (world.state.screen !== 'play') return;
    const origin = panelOrigin(world.state.cursor.panel);
    const x = origin.x + world.state.cursor.x;
    const y = origin.y + world.state.cursor.y;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 18, y);
    ctx.lineTo(x - 8, y);
    ctx.moveTo(x + 8, y);
    ctx.lineTo(x + 18, y);
    ctx.moveTo(x, y - 18);
    ctx.lineTo(x, y - 8);
    ctx.moveTo(x, y + 8);
    ctx.lineTo(x, y + 18);
    ctx.stroke();
  }

  function drawHud(world) {
    const state = world.state;
    const level = LEVELS[state.levelIndex];
    const scene = world.scene();
    const found = state.found.size;
    const left = scene.diffs.length - found;

    ctx.fillStyle = PALETTE.hudBg;
    ctx.fillRect(0, 0, VIEW.width, HUD.height);
    ctx.fillStyle = PALETTE.gold;
    ctx.fillRect(0, HUD.height, VIEW.width, 3);

    text('🏮 LANTERN LANE', 24, 40, 26, PALETTE.gold, 'left', true);
    text('Spot the Difference', 24, 66, 15, PALETTE.muted);
    text(`${level.name}  ·  ${state.levelIndex + 1}/${LEVELS.length}`, 300, 38, 17, PALETTE.cream);
    text(level.sub, 300, 62, 14, PALETTE.muted);

    // The remaining counter: big, centred, impossible to miss.
    const counterX = 640;
    ctx.fillStyle = left === 0 ? PALETTE.teal : PALETTE.gold;
    ctx.beginPath();
    ctx.roundRect(counterX - 92, 14, 184, 58, 12);
    ctx.fill();
    text(`${left} LEFT`, counterX, 40, 26, PALETTE.ink, 'center', true);
    text(`found ${found} / ${scene.diffs.length}`, counterX, 63, 13, PALETTE.ink, 'center');

    // Timer bar + clock.
    const urgent = state.timeLeft <= 15;
    ctx.fillStyle = '#332a52';
    ctx.beginPath();
    ctx.roundRect(880, 20, 150, 14, 7);
    ctx.fill();
    ctx.fillStyle = urgent ? PALETTE.danger : PALETTE.teal;
    const frac = Math.max(0, state.timeLeft / level.seconds);
    ctx.beginPath();
    ctx.roundRect(880, 20, 150 * frac, 14, 7);
    ctx.fill();
    text(fmtTime(state.timeLeft), 955, 56, 22, urgent ? PALETTE.danger : PALETTE.cream, 'center', true);
    text('TIME', 880, 68, 12, PALETTE.muted);
    text(`SCORE ${state.score}`, 1060, 40, 20, PALETTE.cream, 'left', true);
    text(`misses ${state.misses} · best ${state.best}`, 1060, 64, 13, PALETTE.muted);
    if (state.streak >= 2) {
      text(`🔥 streak ×${state.streak}`, 1060, 82, 13, PALETTE.gold, 'left', true);
    }
  }

  // The toast lives in the strip below the panels, so it never covers art.
  function drawToast(world) {
    const state = world.state;
    if (!state.toast || state.elapsed >= state.toastUntil) return;
    ctx.font = `13px ${FONT}`;
    const width = ctx.measureText(state.toast).width + 36;
    ctx.fillStyle = 'rgba(13, 11, 28, 0.9)';
    ctx.beginPath();
    ctx.roundRect(640 - width / 2, VIEW.height - 25, width, 22, 10);
    ctx.fill();
    text(state.toast, 640, VIEW.height - 9, 13, PALETTE.cream, 'center');
  }

  function overlayPanel(title, lines, prompt, accent) {
    ctx.fillStyle = 'rgba(13, 11, 28, 0.72)';
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    const width = 640;
    const height = 120 + lines.length * 34 + 70;
    const x = (VIEW.width - width) / 2;
    const y = (VIEW.height - height) / 2;
    ctx.fillStyle = PALETTE.hudBg;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 18);
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 18);
    ctx.stroke();
    text(title, 640, y + 56, 34, accent, 'center', true);
    lines.forEach((line, i) => text(line, 640, y + 104 + i * 34, 18, PALETTE.cream, 'center'));
    text(prompt, 640, y + height - 26, 16, PALETTE.muted, 'center');
  }

  function drawTitle(world) {
    // The market scene as a dim backdrop, then the menu on top.
    const scene = world.scene();
    ctx.save();
    ctx.translate(PANELS.leftX, PANELS.top);
    ctx.scale(2.1, 1.15);
    scene.draw(ctx, 0);
    ctx.restore();
    ctx.fillStyle = 'rgba(13, 11, 28, 0.66)';
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    text('🏮 LANTERN LANE', 640, 150, 64, PALETTE.gold, 'center', true);
    text('SPOT THE DIFFERENCE', 640, 196, 26, PALETTE.cream, 'center', true);
    text('Two pictures. One hides the changes. Find them all before the lanterns burn down.', 640, 236, 18, PALETTE.muted, 'center');
    // Level cards.
    LEVELS.forEach((level, i) => {
      const cardX = 250 + i * 270;
      const cardY = 290;
      ctx.fillStyle = PALETTE.hudBg;
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, 240, 150, 14);
      ctx.fill();
      ctx.strokeStyle = PALETTE.gold;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, 240, 150, 14);
      ctx.stroke();
      text(`${i + 1}`, cardX + 120, cardY + 48, 30, PALETTE.gold, 'center', true);
      text(level.name, cardX + 120, cardY + 86, 18, PALETTE.cream, 'center', true);
      text(`${SCENES[level.scene].diffs.length} differences · ${fmtTime(level.seconds)}`, cardX + 120, cardY + 114, 14, PALETTE.muted, 'center');
    });
    text('Click a difference in either picture — or steer with the arrow keys and press Space.', 640, 500, 17, PALETTE.cream, 'center');
    text('H hint (−10s) · P pause · M mute · wrong click −5s · a find earns +100 and a time bonus', 640, 530, 15, PALETTE.muted, 'center');
    text('Press 1, 2 or 3 to play a round', 640, 580, 20, PALETTE.gold, 'center', true);
    if (world.state.best > 0) text(`Best score so far: ${world.state.best}`, 640, 620, 16, PALETTE.muted, 'center');
    text('An original game — every scene drawn for Lantern Lane, nothing borrowed.', 640, 664, 14, PALETTE.muted, 'center');
  }

  function drawRoundClear(world) {
    const stars = world.starsEarned();
    overlayPanel(
      'Round Clear!',
      [
        `${world.scene().name} — all ${world.scene().diffs.length} differences found.`,
        `${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}   Score ${world.state.score}   ·   misses ${world.state.misses}   ·   hints ${world.state.hintsUsed}`,
        `Time left: ${fmtTime(world.state.timeLeft)}`,
      ],
      'Press Enter for the next round',
      PALETTE.gold,
    );
  }

  function drawGameOver(world) {
    overlayPanel(
      'Out of Time',
      [
        `${world.scene().name} — ${world.remaining()} difference${world.remaining() === 1 ? '' : 's'} still hiding.`,
        `Score ${world.state.score}   ·   best ${world.state.best}`,
      ],
      'Press Enter to start over · R to retry this round',
      PALETTE.danger,
    );
  }

  function drawGameClear(world) {
    overlayPanel(
      'You Found Them All!',
      [
        'Every lantern, koi and firefly accounted for — all three rounds clear.',
        `Final score ${world.state.score}   ·   misses ${world.state.misses}   ·   hints ${world.state.hintsUsed}`,
        world.state.score >= world.state.best ? 'A new best score!' : `Best score: ${world.state.best}`,
      ],
      'Press Enter to play again',
      PALETTE.teal,
    );
  }

  function draw(world) {
    resize();
    ctx.setTransform(view.scale, 0, 0, view.scale, view.x, view.y);
    ctx.fillStyle = PALETTE.night;
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    if (world.state.screen === 'title') {
      drawTitle(world);
      return;
    }
    drawHud(world);
    drawPanels(world);
    drawFoundRings(world);
    drawEffects(world);
    drawCursor(world);
    drawToast(world);
    if (world.state.screen === 'paused') {
      overlayPanel('Paused', ['Take a breath — the clock is waiting.'], 'Press P or Esc to keep hunting', PALETTE.muted);
    } else if (world.state.screen === 'roundClear') {
      drawRoundClear(world);
    } else if (world.state.screen === 'gameOver') {
      drawGameOver(world);
    } else if (world.state.screen === 'gameClear') {
      drawGameClear(world);
    }
  }

  return { draw, resize };
}
