// Lantern Lane — Spot the Difference: shared constants for the whole game.
// One place holds every number the other modules agree on, so tuning the
// feel of a round (time, points, penalties) never means hunting through code.

export const VIEW = { width: 1280, height: 800 };

// The two picture panels, in canvas pixels. Both are the same size so a
// difference sits at the same local spot in each one.
export const PANELS = {
  width: 600,
  height: 668,
  top: 104,
  leftX: 24,
  rightX: 656,
  gap: 32,
};

export const HUD = { height: 88 };

// Points and penalties: a find is worth a flat 100 plus whatever seconds
// are left on the clock, so fast eyes beat slow ones.
export const SCORING = {
  findPoints: 100,
  timeBonusPerSecond: 2,
  wrongClickSeconds: 5,
  hintSeconds: 10,
  roundClearBonus: 250,
};

// How long each round lasts, and how many differences hide in it.
export const LEVELS = [
  { name: 'Lantern Market', sub: 'A night market by the canal', seconds: 180, scene: 0 },
  { name: 'Koi Pond Garden', sub: 'Still water, restless fish', seconds: 150, scene: 1 },
  { name: 'Firefly Rooftops', sub: 'The town asleep above you', seconds: 120, scene: 2 },
];

export const FONT = '"Trebuchet MS", "Segoe UI", Verdana, sans-serif';

export const PALETTE = {
  night: '#141126',
  nightDeep: '#0d0b1c',
  panelEdge: '#3d2b5e',
  gold: '#ffc93c',
  goldSoft: '#ffe08a',
  cream: '#fff6e0',
  ink: '#241a33',
  muted: '#b9a8d9',
  danger: '#ff5d73',
  teal: '#2ec4b6',
  hudBg: '#1c1733',
};
