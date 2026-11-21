// Mouse and keyboard input. A click is mapped to panel-local coordinates
// (the same spot in either picture counts), and the arrow keys drive a
// crosshair so the whole game is playable without a mouse too.

import { PANELS } from './config.js';

export function panelAt(clientX, clientY, canvas) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (clientX - rect.left) * scaleX;
  const y = (clientY - rect.top) * scaleY;
  if (y < PANELS.top || y > PANELS.top + PANELS.height) return null;
  if (x >= PANELS.leftX && x <= PANELS.leftX + PANELS.width) {
    return { panel: 0, x: x - PANELS.leftX, y: y - PANELS.top };
  }
  if (x >= PANELS.rightX && x <= PANELS.rightX + PANELS.width) {
    return { panel: 1, x: x - PANELS.rightX, y: y - PANELS.top };
  }
  return null;
}

export function createInput(canvas, world, audio, onScreenChange) {
  const state = world.state;

  function clickFromPoint(clientX, clientY) {
    audio.unlock();
    const hit = panelAt(clientX, clientY, canvas);
    if (!hit) return;
    state.cursor = { x: hit.x, y: hit.y, panel: hit.panel };
    const result = world.clickAt(hit.panel, hit.x, hit.y);
    if (result === 'found') audio.found();
    else if (result === 'miss') audio.miss();
    if (result !== 'none') onScreenChange();
  }

  canvas.addEventListener('click', (event) => clickFromPoint(event.clientX, event.clientY));
  canvas.addEventListener('mousemove', (event) => {
    const hit = panelAt(event.clientX, event.clientY, canvas);
    if (hit) state.cursor = { x: hit.x, y: hit.y, panel: hit.panel };
  });

  function moveCursor(dx, dy) {
    state.cursor.x = Math.min(600, Math.max(0, state.cursor.x + dx));
    state.cursor.y = Math.min(668, Math.max(0, state.cursor.y + dy));
  }

  window.addEventListener('keydown', (event) => {
    const key = event.key;
    if (key === 'm' || key === 'M') {
      audio.toggleMute();
      return;
    }
    if (state.screen === 'title') {
      if (key === '1' || key === '2' || key === '3') {
        audio.unlock();
        world.startLevel(Number(key) - 1);
        onScreenChange();
      }
      return;
    }
    if (key === 'Escape' || key === 'p' || key === 'P') {
      if (state.screen === 'play') state.screen = 'paused';
      else if (state.screen === 'paused') state.screen = 'play';
      onScreenChange();
      return;
    }
    if (state.screen === 'play') {
      const step = event.shiftKey ? 48 : 14;
      if (key === 'ArrowLeft') { moveCursor(-step, 0); event.preventDefault(); }
      else if (key === 'ArrowRight') { moveCursor(step, 0); event.preventDefault(); }
      else if (key === 'ArrowUp') { moveCursor(0, -step); event.preventDefault(); }
      else if (key === 'ArrowDown') { moveCursor(0, step); event.preventDefault(); }
      else if (key === ' ' || key === 'Enter') {
        audio.unlock();
        const result = world.clickAt(state.cursor.panel, state.cursor.x, state.cursor.y);
        if (result === 'found') audio.found();
        else if (result === 'miss') audio.miss();
        onScreenChange();
        event.preventDefault();
      } else if (key === 'h' || key === 'H') {
        if (world.useHint()) audio.hint();
      }
    } else if (key === 'Enter') {
      audio.unlock();
      if (state.screen === 'roundClear') {
        world.startLevel(state.levelIndex + 1);
        onScreenChange();
      } else if (state.screen === 'gameOver' || state.screen === 'gameClear') {
        world.startGame();
        onScreenChange();
      }
    } else if ((key === 'r' || key === 'R') && state.screen === 'gameOver') {
      world.startLevel(state.levelIndex);
      onScreenChange();
    }
  });

  return { clickFromPoint };
}
