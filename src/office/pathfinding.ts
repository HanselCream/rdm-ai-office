import { COLS, ROWS, walkable } from "./map";
export interface P { x: number; y: number }
export function bfs(from: P, to: P): P[] {
  if (!walkable(to.x, to.y)) return [];
  const key = (p: P) => p.y * COLS + p.x;
  const prev = new Map<number, P | null>([[key(from), null]]);
  const q: P[] = [from];
  while (q.length) {
    const c = q.shift()!;
    if (c.x === to.x && c.y === to.y) break;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const n = { x: c.x + dx, y: c.y + dy };
      if (n.x < 0 || n.y < 0 || n.x >= COLS || n.y >= ROWS || prev.has(key(n)) || !walkable(n.x, n.y)) continue;
      prev.set(key(n), c); q.push(n);
    }
  }
  if (!prev.has(key(to))) return [];
  const path: P[] = [];
  for (let c: P | null = to; c && key(c) !== key(from); c = prev.get(key(c)) ?? null) path.unshift(c);
  return path;
}
void ROWS;
