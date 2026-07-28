function hashString(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface DecoShape {
  x: number;
  y: number;
  r: number;
  speedX: number;
  speedY: number;
  phase: number;
}

/** Deterministic decorative shapes for a scene, seeded by its id so they stay stable across re-renders. */
export function generateShapes(sceneId: string, count = 6): DecoShape[] {
  const rand = mulberry32(hashString(sceneId));
  return Array.from({ length: count }, () => ({
    x: rand(),
    y: rand(),
    r: 0.05 + rand() * 0.18,
    speedX: (rand() - 0.5) * 0.02,
    speedY: (rand() - 0.5) * 0.02,
    phase: rand() * Math.PI * 2,
  }));
}
