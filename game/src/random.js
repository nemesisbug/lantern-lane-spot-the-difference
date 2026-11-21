// A tiny seeded generator (mulberry32) so a scene's decorative scatter —
// stars, fireflies, blossom — is identical every time it is drawn, and the
// staged screenshots always show the same frame.

export function makeRandom(seed) {
  let state = seed >>> 0;
  return function random() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

// A deterministic scatter of points inside a rectangle, used for stars and
// fireflies: same seed, same sky, every run.
export function scatter(seed, count, x, y, width, height) {
  const random = makeRandom(seed);
  const points = [];
  for (let index = 0; index < count; index += 1) {
    points.push({ x: x + random() * width, y: y + random() * height, r: 1 + random() * 2.2 });
  }
  return points;
}
