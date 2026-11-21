// Lantern Lane's state: screens, rounds, finds, timer and score. This is
// the only module that decides what a click means; render only shows it.

import { LEVELS, SCORING } from './config.js';
import { SCENES } from './scenes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_ROUND_CLEAR = 'roundClear';
export const SCREEN_GAME_OVER = 'gameOver';
export const SCREEN_GAME_CLEAR = 'gameClear';

export function createWorld() {
  const state = {
    screen: SCREEN_TITLE,
    levelIndex: 0,
    found: new Set(),
    score: 0,
    misses: 0,
    hintsUsed: 0,
    timeLeft: LEVELS[0].seconds,
    best: 0,
    toast: '',
    toastUntil: 0,
    hint: null, // { diff, until } while a hint ring is showing
    effects: [], // short-lived rings and crosses drawn over the panels
    cursor: { x: 640, y: 440, panel: 0 },
    elapsed: 0,
  };

  try {
    state.best = Number(localStorage.getItem('lantern-lane-best') || 0) || 0;
  } catch {
    state.best = 0;
  }

  function scene() {
    return SCENES[LEVELS[state.levelIndex].scene];
  }

  function startLevel(index) {
    state.levelIndex = index;
    state.found = new Set();
    state.timeLeft = LEVELS[index].seconds;
    state.screen = SCREEN_PLAY;
    state.toast = '';
    state.hint = null;
    state.effects = [];
    state.cursor = { x: 640, y: 440, panel: 0 };
  }

  function startGame() {
    state.score = 0;
    state.misses = 0;
    state.hintsUsed = 0;
    startLevel(0);
  }

  function saveBest() {
    if (state.score <= state.best) return;
    state.best = state.score;
    try {
      localStorage.setItem('lantern-lane-best', String(state.best));
    } catch {
      // Private mode or no storage: the score still shows this session.
    }
  }

  // A click at panel-local coordinates. Returns 'found', 'miss' or 'none'.
  function clickAt(panel, x, y) {
    if (state.screen !== SCREEN_PLAY) return 'none';
    const diffs = scene().diffs;
    for (const diff of diffs) {
      if (state.found.has(diff.id)) continue;
      const dx = x - diff.x;
      const dy = y - diff.y;
      if (dx * dx + dy * dy <= (diff.r + 8) * (diff.r + 8)) {
        state.found.add(diff.id);
        const gained = SCORING.findPoints + Math.round(state.timeLeft) * SCORING.timeBonusPerSecond;
        state.score += gained;
        state.toast = `Found: ${diff.label}! +${gained}`;
        state.toastUntil = state.elapsed + 2.2;
        state.effects.push({ kind: 'found', panel, x: diff.x, y: diff.y, r: diff.r, born: state.elapsed });
        if (state.found.size === diffs.length) {
          state.score += SCORING.roundClearBonus;
          saveBest();
          state.screen = state.levelIndex === LEVELS.length - 1 ? SCREEN_GAME_CLEAR : SCREEN_ROUND_CLEAR;
        }
        return 'found';
      }
    }
    state.misses += 1;
    state.timeLeft = Math.max(0, state.timeLeft - SCORING.wrongClickSeconds);
    state.toast = `Not a difference — minus ${SCORING.wrongClickSeconds}s`;
    state.toastUntil = state.elapsed + 1.6;
    state.effects.push({ kind: 'miss', panel, x, y, r: 16, born: state.elapsed });
    return 'miss';
  }

  // A hint rings one still-hidden difference for two seconds, for 10 seconds.
  function useHint() {
    if (state.screen !== SCREEN_PLAY || state.hint) return null;
    const remaining = scene().diffs.filter((diff) => !state.found.has(diff.id));
    if (remaining.length === 0) return null;
    const diff = remaining[Math.floor(Math.random() * remaining.length)];
    state.hintsUsed += 1;
    state.timeLeft = Math.max(0, state.timeLeft - SCORING.hintSeconds);
    state.hint = { diff, until: state.elapsed + 2 };
    state.toast = `Hint: look near “${diff.label}” — minus ${SCORING.hintSeconds}s`;
    state.toastUntil = state.elapsed + 2;
    return diff;
  }

  function tick(dt) {
    state.elapsed += dt;
    if (state.screen === SCREEN_PLAY) {
      state.timeLeft -= dt;
      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        saveBest();
        state.screen = SCREEN_GAME_OVER;
      }
    }
    if (state.hint && state.elapsed > state.hint.until) state.hint = null;
    state.effects = state.effects.filter((effect) => state.elapsed - effect.born < 1.2);
  }

  function remaining() {
    return scene().diffs.length - state.found.size;
  }

  function starsEarned() {
    const total = scene().diffs.length;
    const accuracy = state.misses === 0 ? 1 : Math.max(0, 1 - state.misses / (total * 2));
    const timeShare = state.timeLeft / LEVELS[state.levelIndex].seconds;
    const value = accuracy * 0.6 + timeShare * 0.4;
    return value > 0.75 ? 3 : value > 0.45 ? 2 : 1;
  }

  return { state, scene, startLevel, startGame, saveBest, clickAt, useHint, tick, remaining, starsEarned };
}
