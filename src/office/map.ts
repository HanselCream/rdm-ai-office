// 1 tile = 1 world unit (about 0.5 m). Room: 24 x 16 tiles. Back wall at z=0, left wall at x=0.
export const COLS = 24, ROWS = 16, WALL_H = 5;
export const DESK_X = [2, 9, 16], DESK_W = 5, SEAT_Y = 3;
export const SPOTS = [{ x: 1, y: 6 }, { x: 1, y: 10 }, { x: 22, y: 3 }, { x: 12, y: 7 }];
// solid footprints [x, y, w, h] in tiles
const solid: [number, number, number, number][] = [
  [0, 0, COLS, 3],   // workstation band + back-wall storage
  [0, 5, 1, 4],      // bookshelf
  [0, 9, 1, 3],      // cabinets
  [0, 12, 2, 4],     // sofa
  [3, 12, 2, 4],     // coffee table
  [6, 13, 1, 2],     // armchair
  [9, 8, 6, 5],      // collaboration table + chairs
  [18, 13, 4, 2],    // huddle chairs + side table
  [22, 6, 1, 1], [22, 8, 1, 1], [23, 4, 1, 1], [7, 5, 1, 1], [1, 3, 1, 1], [22, 14, 1, 1], // cooler + plants
];
export const blocked: boolean[][] = Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => false));
solid.forEach(([x, y, w, h]) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) blocked[j][i] = true; });
export const walkable = (x: number, y: number) => x >= 0 && y >= 0 && x < COLS && y < ROWS && !blocked[y][x];
