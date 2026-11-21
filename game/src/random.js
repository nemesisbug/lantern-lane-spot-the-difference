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

// A stable numeric seed from a name, so a scene's scatter can be named
// instead of numbered: hashSeed('lantern-market') always gives the same sky.
export function hashSeed(name) {
  let hash = 2166136261;
  for (let index = 0; index < name.length; index += 1) {
    hash ^= name.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

// A seeded integer in [min, max], for picking a deterministic variant.
export function range(seed, min, max) {
  return min + Math.floor(makeRandom(seed)() * (max - min + 1));
}
