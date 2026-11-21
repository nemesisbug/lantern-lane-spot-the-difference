// Lantern Lane — entry point. Wires the world, renderer, input and sound
// together, runs the fixed-step loop, and stages a screenshot scene when
// the page is opened with ?shot=<name>.

import { createWorld } from './world.js';
import { createRenderer } from './render.js';
import { createInput } from './input.js';
import { createAudio } from './audio.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const status = document.getElementById('status');

const world = createWorld();
const renderer = createRenderer(canvas);
const audio = createAudio();
let lastScreen = world.state.screen;
let lastTickSecond = -1;

function announceScreen() {
  if (world.state.screen !== lastScreen) {
    lastScreen = world.state.screen;
    if (world.state.screen === 'roundClear') audio.clear();
    if (world.state.screen === 'gameOver') audio.over();
    if (world.state.screen === 'gameClear') audio.fanfare();
  }
}

// Switching tabs mid-round pauses the clock instead of letting it run out
// while nobody is looking.
document.addEventListener('visibilitychange', () => {
  if (document.hidden && world.state.screen === 'play') {
    world.state.screen = 'paused';
    announceScreen();
  }
});

createInput(canvas, world, audio, announceScreen);

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) {
  // A staged shot: freeze the world exactly as staged, no ticking clock.
  stageShot(shot, world);
  renderer.draw(world);
  status.textContent = `Lantern Lane — staged shot ${shot}.`;
} else {
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    world.tick(dt);
    const whole = Math.ceil(world.state.timeLeft);
    if (world.state.screen === 'play' && whole <= 10 && whole !== lastTickSecond && whole > 0) {
      lastTickSecond = whole;
      audio.tick();
    }
    announceScreen();
    renderer.draw(world);
    const found = world.state.found.size;
    const total = world.scene().diffs.length;
    status.textContent =
      world.state.screen === 'play'
        ? `Lantern Lane, ${world.scene().name}: ${found} of ${total} differences found, ${total - found} left.`
        : `Lantern Lane — ${world.state.screen}.`;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
