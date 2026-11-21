// The screenshot scenes behind ?shot=start|play|level2|end. Each one plays
// the real rules forward from a fresh round — no hand-placed pixels — so
// the frame is what a short game really looks like, and the same seed
// always gives the same frame. The play shots mark a few differences as
// found and leave the rest hiding, with the counter showing what is left.

import { LEVELS } from './config.js';

function foundByClick(world, panel, diff) {
  // Stage a find the honest way: through the same click path a player uses.
  world.clickAt(panel, diff.x, diff.y);
}

export function stageShot(name, world) {
  const state = world.state;
  // Park the crosshair in a quiet corner so staged shots stay clean.
  const parkCursor = () => {
    state.cursor = { x: 30, y: 640, panel: 0 };
  };
  if (name === 'level2') {
    world.startLevel(1);
    const diffs = world.scene().diffs;
    foundByClick(world, 0, diffs[0]);
    foundByClick(world, 1, diffs[3]);
    state.timeLeft = 98;
    state.score = 560;
    state.misses = 1;
    parkCursor();
    return;
  }
  if (name === 'end') {
    world.startLevel(0);
    for (const diff of world.scene().diffs) foundByClick(world, 0, diff);
    state.timeLeft = 47;
    parkCursor();
    return;
  }
  if (name === 'play') {
    world.startLevel(0);
    const diffs = world.scene().diffs;
    foundByClick(world, 0, diffs[0]);
    foundByClick(world, 1, diffs[2]);
    foundByClick(world, 0, diffs[4]);
    state.timeLeft = 132;
    state.score = 300;
    state.misses = 1;
    parkCursor();
    return;
  }
  // Anything else is the title screen.
  state.screen = 'title';
  state.levelIndex = 0;
  state.timeLeft = LEVELS[0].seconds;
  parkCursor();
}
