export type SkyObjectKind = 'wish' | 'story' | 'voice' | 'secret' | 'moon' | 'nebula' | 'black-hole';

export interface SkyObjectPoint {
  x: number;
  y: number;
  kind: SkyObjectKind;
  radius?: number;
}

const SKY_BOUNDS = { minX: 8, maxX: 92, minY: 8, maxY: 92 } as const;

const OBJECT_RADIUS: Record<SkyObjectKind, number> = {
  wish: 10,
  story: 9,
  voice: 7,
  secret: 5,
  moon: 15,
  nebula: 18,
  'black-hole': 16
};

const PERMANENT_OBJECTS: SkyObjectPoint[] = [
  { x: 52, y: 20, kind: 'moon' },
  { x: 25, y: 50, kind: 'nebula' },
  { x: 78, y: 72, kind: 'black-hole' }
];

const distance = (a: SkyObjectPoint, b: SkyObjectPoint) => Math.hypot(a.x - b.x, a.y - b.y);

export function getSkyObjects(existing: SkyObjectPoint[] = []) {
  return [...PERMANENT_OBJECTS, ...existing];
}

export function findSafeSkyPosition(
  kind: SkyObjectKind,
  existing: SkyObjectPoint[] = [],
  attempts = 240
): { x: number; y: number } {
  const objects = getSkyObjects(existing);
  const radius = OBJECT_RADIUS[kind];

  for (let index = 0; index < attempts; index += 1) {
    const candidate = {
      x: SKY_BOUNDS.minX + Math.random() * (SKY_BOUNDS.maxX - SKY_BOUNDS.minX),
      y: SKY_BOUNDS.minY + Math.random() * (SKY_BOUNDS.maxY - SKY_BOUNDS.minY),
      kind
    };
    const isSafe = objects.every((object) => {
      const requiredGap = radius + (object.radius ?? OBJECT_RADIUS[object.kind]) + 5;
      return distance(candidate, object) >= requiredGap;
    });
    if (isSafe) return { x: candidate.x, y: candidate.y };
  }

  let fallback = { x: 50, y: 50 };
  let bestScore = -Infinity;
  for (let x = SKY_BOUNDS.minX; x <= SKY_BOUNDS.maxX; x += 4) {
    for (let y = SKY_BOUNDS.minY; y <= SKY_BOUNDS.maxY; y += 4) {
      const candidate = { x, y, kind };
      const score = Math.min(...objects.map((object) => distance(candidate, object) - radius - (object.radius ?? OBJECT_RADIUS[object.kind])));
      if (score > bestScore) {
        bestScore = score;
        fallback = { x, y };
      }
    }
  }
  return fallback;
}

export function skyPositionIsInsideBounds(x: number, y: number) {
  return x >= SKY_BOUNDS.minX && x <= SKY_BOUNDS.maxX && y >= SKY_BOUNDS.minY && y <= SKY_BOUNDS.maxY;
}

export function getSkyBounds() {
  return SKY_BOUNDS;
}
