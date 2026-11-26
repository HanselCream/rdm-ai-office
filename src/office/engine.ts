import type { AgentState } from "../types";
import { DESK_X, SEAT_Y, SPOTS, walkable } from "./map";
import { bfs, type P } from "./pathfinding";

export interface Sim { id: string; x: number; y: number; path: P[]; queue: P[]; dir: "up" | "down" | "left" | "right"; moving: boolean; wait: number; state: AgentState; home: P }
const SPEED = 3.4;

/** Pure simulation (tile coordinates). Rendering lives in src/office3d. */
export class Office {
  sims = new Map<string, Sim>();
  constructor(ids: string[]) {
    ids.forEach((id, i) => { const home = { x: DESK_X[i] + 2, y: SEAT_Y }; this.sims.set(id, { id, x: home.x, y: home.y, path: [], queue: [], dir: "down", moving: false, wait: 0, state: "idle", home }); });
  }
  setState(id: string, s: AgentState) {
    const a = this.sims.get(id); if (!a || a.state === s) return;
    a.state = s; a.path = []; a.wait = 0; a.queue = s === "working" ? [] : [a.home];
  }
  moveTo(id: string, tx: number, ty: number) {
    const a = this.sims.get(id); if (!a || a.state === "working" || !walkable(tx, ty)) return;
    a.queue = [{ x: tx, y: ty }]; a.path = [];
  }
  step(id: string, dx: number, dy: number) {
    const a = this.sims.get(id); if (!a || a.state === "working" || a.path.length) return;
    const tx = Math.round(a.x) + dx, ty = Math.round(a.y) + dy;
    if (walkable(tx, ty)) { a.queue = []; a.path = [{ x: tx, y: ty }]; }
  }
  update(dt: number) {
    let ai = 0;
    this.sims.forEach((a) => {
      ai++;
      if (a.wait > 0) { a.wait -= dt; a.moving = false; return; }
      if (!a.path.length) {
        const nxt = a.queue.shift();
        if (nxt) a.path = bfs({ x: Math.round(a.x), y: Math.round(a.y) }, nxt);
        else if (a.state === "working") a.queue = SPOTS.map((_, k) => SPOTS[(k + ai) % SPOTS.length]).concat([a.home]);
        a.moving = false; return;
      }
      const t = a.path[0], dx = t.x - a.x, dy = t.y - a.y, d = Math.hypot(dx, dy), s = SPEED * dt;
      a.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up";
      a.moving = true;
      if (d <= s) { a.x = t.x; a.y = t.y; a.path.shift(); if (!a.path.length && a.state === "working") { a.wait = 1.2; a.dir = "up"; } }
      else { a.x += (dx / d) * s; a.y += (dy / d) * s; }
    });
  }
}
