import * as THREE from "three";

function canvasTex(w: number, h: number, draw: (c: CanvasRenderingContext2D, w: number, h: number) => void) {
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  draw(cv.getContext("2d")!, w, h);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
const cache: Record<string, THREE.CanvasTexture> = {};
const lazy = (k: string, f: () => THREE.CanvasTexture) => (cache[k] ??= f());

export const floorTex = () => lazy("floor", () => {
  const t = canvasTex(1024, 1024, (c, w, h) => {
    c.fillStyle = "#151a26"; c.fillRect(0, 0, w, h);
    const n = 4, s = w / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const v = Math.floor(Math.random() * 12); c.fillStyle = `rgb(${52 + v},${60 + v},${78 + v})`; c.fillRect(i * s + 4, j * s + 4, s - 8, s - 8); }
    const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, "rgba(255,255,255,.05)"); g.addColorStop(1, "rgba(0,0,0,.08)"); c.fillStyle = g; c.fillRect(0, 0, w, h);
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 2); return t;
});

export const woodTex = () => lazy("wood", () => canvasTex(512, 512, (c, w, h) => {
  c.fillStyle = "#b5814f"; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 90; i++) { c.fillStyle = `rgba(${60 + Math.random() * 40},${30 + Math.random() * 20},10,${Math.random() * 0.14})`; c.fillRect(0, Math.random() * h, w, 1 + Math.random() * 3); }
  for (let i = 0; i < 6; i++) { c.fillStyle = "rgba(60,30,10,.18)"; c.fillRect(0, (i + 1) * (h / 7), w, 2); }
}));

export function makeLabel(lines: { text: string; size: number; color: string; y: number; font?: string }[], w: number, h: number, bg = "#0e1630", border = "#4de1ff") {
  return canvasTex(w, h, (c) => {
    c.fillStyle = bg; c.fillRect(0, 0, w, h); c.strokeStyle = border; c.lineWidth = 6; c.strokeRect(10, 10, w - 20, h - 20);
    c.textAlign = "center"; c.textBaseline = "middle";
    lines.forEach((l) => { c.font = `${l.font ?? "800"} ${l.size}px system-ui, sans-serif`; c.fillStyle = l.color; c.fillText(l.text, w / 2, l.y); });
  });
}

const STATE_COL: Record<string, string> = { idle: "#3ddc84", thinking: "#3b82f6", working: "#f59e0b", error: "#ef4444" };
export function makeScreen(w: number, h: number) {
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  const c = cv.getContext("2d")!; const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return { tex, draw(t: number, state: string, title: string) {
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#0b1530"); g.addColorStop(1, "#0a2a3d"); c.fillStyle = g; c.fillRect(0, 0, w, h);
    const col = STATE_COL[state] ?? "#3ddc84"; c.fillStyle = "#0f1d3d"; c.fillRect(0, 0, w, h * 0.14);
    c.fillStyle = col; c.fillRect(8, h * 0.04, h * 0.06, h * 0.06);
    c.fillStyle = "#cfe6ff"; c.font = `bold ${Math.round(h * 0.075)}px system-ui, sans-serif`; c.textBaseline = "middle"; c.fillText(`${title.toUpperCase()}  ·  ${state.toUpperCase()}`, 12 + h * 0.08, h * 0.07);
    const amp = state === "working" ? 1 : state === "thinking" ? 0.7 : 0.35, n = 12, bw = (w * 0.5) / n;
    for (let i = 0; i < n; i++) { const v = 0.25 + 0.75 * Math.abs(Math.sin(t * 0.9 * amp + i * 0.7)) * (0.5 + 0.5 * Math.sin(i * 1.3)); const bh = v * h * 0.5;
      c.fillStyle = i % 4 === 0 ? col : "#4de1ff"; c.fillRect(w * 0.06 + i * bw, h * 0.88 - bh, bw * 0.7, bh); }
    c.strokeStyle = "#7df0c0"; c.lineWidth = 2; c.beginPath();
    for (let i = 0; i <= 20; i++) { const x = w * 0.6 + (i / 20) * w * 0.34, y = h * 0.42 + Math.sin(t * amp + i * 0.5) * h * 0.1 - i * 1.2; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
    c.fillStyle = "#16284f"; c.fillRect(w * 0.6, h * 0.58, w * 0.34, h * 0.1); c.fillRect(w * 0.6, h * 0.72, w * 0.34, h * 0.1);
    c.fillStyle = col; c.fillRect(w * 0.6, h * 0.58, w * 0.34 * (0.3 + 0.6 * Math.abs(Math.sin(t * 0.4))), h * 0.1);
    if (state === "error") { c.fillStyle = "rgba(239,68,68,.35)"; c.fillRect(0, h * 0.14, w, h); }
    tex.needsUpdate = true;
  } };
}
