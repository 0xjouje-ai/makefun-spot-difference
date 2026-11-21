// A tiny seeded random-number generator (mulberry32) so the two panels of a
// scene are drawn from exactly the same decorative randomness. The left and
// right pictures re-seed with the same seed, so every star, wave and flower
// lands in the same place on both sides; only the seven designed differences
// ever diverge.
export function makeRng(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Integer in [min, max] from a seeded generator.
export function rangeInt(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1));
}

// Pick one element of an array with a seeded generator.
export function pick(rng, items) {
  return items[Math.floor(rng() * items.length)];
}
