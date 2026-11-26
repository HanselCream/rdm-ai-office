import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { useMemo, useRef } from "react";
import type { Office } from "../office/engine";
import { makeScreen, woodTex } from "./textures";

type V3 = [number, number, number];
interface BP { p?: V3; s: V3; c?: string; r?: number; rough?: number; metal?: number; map?: THREE.Texture | null; rot?: V3; em?: string; emI?: number; op?: number; cast?: boolean }

/** Rounded box with PBR material. */
export function B({ p = [0, 0, 0], s, c = "#888", r = 0.03, rough = 0.6, metal = 0, map = null, rot, em, emI = 1, op, cast = true }: BP) {
  return (
    <RoundedBox args={s} radius={Math.max(0.002, Math.min(r, Math.min(...s) / 2 - 0.002))} smoothness={2} position={p} rotation={rot} castShadow={cast && !op} receiveShadow>
      <meshStandardMaterial color={c} roughness={rough} metalness={metal} map={map} emissive={em ?? "#000000"} emissiveIntensity={em ? emI : 0} transparent={op !== undefined} opacity={op ?? 1} />
    </RoundedBox>
  );
}
/** Plain box (cheap, for small repeated parts). */
function X({ p = [0, 0, 0], s, c = "#888", rough = 0.7, metal = 0, rot }: BP) {
  return <mesh position={p} rotation={rot} castShadow receiveShadow><boxGeometry args={s} /><meshStandardMaterial color={c} roughness={rough} metalness={metal} /></mesh>;
}
function rng(seed: number) { let a = seed; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const CH = "#2a2f3a", NAVY = "#1d2b4d", CY = "#4de1ff";
const GLASS = { color: "#9fd9ff", transparent: true, opacity: 0.16, roughness: 0.05, metalness: 0.1, envMapIntensity: 1.5, side: THREE.DoubleSide } as const;

export function useLiveScreen(office: Office, id: string, name: string, w = 320, h = 180) {
  const scr = useMemo(() => makeScreen(w, h), [w, h]); const last = useRef(-1);
  useFrame((s) => { const t = s.clock.elapsedTime; if (t - last.current < 0.2) return; last.current = t; scr.draw(t, office.sims.get(id)?.state ?? "idle", name); });
  return scr.tex;
}

export function Plant({ p, s = 1, seed = 1 }: { p: V3; s?: number; seed?: number }) {
  const leaves = useMemo(() => { const R = rng(seed * 97); return Array.from({ length: 11 }, (_, i) => ({ a: i * 2.4 + seed, t: 0.25 + R() * 0.7, l: 0.7 + R() * 0.6, c: ["#2f9e4f", "#3fb862", "#238a43", "#52c26e"][i % 4] })); }, [seed]);
  return (
    <group position={p} scale={s}>
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow><cylinderGeometry args={[0.42, 0.32, 0.6, 24]} /><meshStandardMaterial color="#e6e1d8" roughness={0.8} /></mesh>
      <mesh position={[0, 0.6, 0]}><cylinderGeometry args={[0.4, 0.4, 0.04, 20]} /><meshStandardMaterial color="#2b1d14" roughness={1} /></mesh>
      {leaves.map((l, i) => (
        <group key={i} rotation={[0, l.a, 0]}><group position={[0, 0.6, 0]} rotation={[l.t, 0, 0]}>
          <mesh position={[0, l.l, 0]} scale={[0.2, l.l, 0.05]} castShadow><sphereGeometry args={[1, 10, 8]} /><meshStandardMaterial color={l.c} roughness={0.6} /></mesh>
        </group></group>
      ))}
    </group>
  );
}

export function Chair({ p, ry = 0, accent = CY }: { p: V3; ry?: number; accent?: string }) {
  return (
    <group position={p} rotation={[0, ry, 0]}>
      {[0, 1, 2, 3, 4].map((i) => (
        <group key={i} rotation={[0, (i * Math.PI * 2) / 5, 0]}>
          <X s={[0.07, 0.05, 0.5]} p={[0, 0.13, 0.25]} c="#171a21" metal={0.6} rough={0.4} />
          <mesh position={[0, 0.06, 0.5]} castShadow><sphereGeometry args={[0.055, 10, 8]} /><meshStandardMaterial color="#0d0f14" /></mesh>
        </group>
      ))}
      <mesh position={[0, 0.33, 0]} castShadow><cylinderGeometry args={[0.04, 0.05, 0.4, 12]} /><meshStandardMaterial color="#9aa3b2" metalness={0.9} roughness={0.25} /></mesh>
      <B s={[1.0, 0.14, 0.95]} p={[0, 0.56, 0]} c={CH} r={0.06} rough={0.85} />
      <B s={[1.02, 0.03, 0.97]} p={[0, 0.49, 0]} c="#111419" r={0.01} />
      <B s={[0.95, 1.0, 0.09]} p={[0, 1.15, 0.46]} c={CH} r={0.05} rough={0.9} rot={[-0.1, 0, 0]} />
      <B s={[0.6, 0.1, 0.03]} p={[0, 0.95, 0.4]} c={accent} em={accent} emI={0.6} r={0.01} />
      <B s={[0.5, 0.22, 0.07]} p={[0, 1.78, 0.5]} c={CH} r={0.04} rot={[-0.1, 0, 0]} />
      {[-1, 1].map((sx) => (<group key={sx}><X s={[0.06, 0.3, 0.06]} p={[sx * 0.52, 0.75, 0.1]} c="#171a21" metal={0.5} /><B s={[0.1, 0.05, 0.6]} p={[sx * 0.52, 0.92, 0.0]} c="#171a21" r={0.02} /></group>))}
    </group>
  );
}

export function Workstation({ office, id, name, x0 }: { office: Office; id: string; name: string; x0: number }) {
  const tex = useLiveScreen(office, id, name);
  const wood = woodTex();
  return (
    <group position={[x0 + 2.5, 0, 1.4]}>
      <B s={[5, 0.12, 2]} p={[0, 1.29, 0]} c="#ffffff" map={wood} rough={0.5} r={0.04} />
      {[-1, 1].map((sx) => <B key={sx} s={[0.1, 1.23, 1.9]} p={[sx * 2.4, 0.615, 0]} c={CH} metal={0.4} rough={0.5} />)}
      <B s={[4.7, 0.8, 0.05]} p={[0, 0.85, -0.85]} c={CH} />
      <B s={[1.3, 1.15, 1.8]} p={[1.65, 0.58, 0]} c="#232833" rough={0.6} />
      {[0.2, 0.58, 0.96].map((y) => <group key={y}><B s={[1.2, 0.3, 0.03]} p={[1.65, y - 0.0, 0.91]} c="#2f3644" r={0.01} /><B s={[0.4, 0.03, 0.03]} p={[1.65, y + 0.08, 0.94]} c={CY} em={CY} emI={1.5} r={0.01} /></group>)}
      {[-1, 1].map((sx) => (
        <group key={sx} position={[sx * 0.95, 1.35, -0.4]} rotation={[0, -sx * 0.18, 0]}>
          <B s={[0.5, 0.03, 0.3]} p={[0, 0.015, 0]} c="#1b1f27" metal={0.5} />
          <B s={[0.08, 0.45, 0.05]} p={[0, 0.25, -0.05]} c="#1b1f27" metal={0.5} />
          <B s={[1.55, 0.9, 0.05]} p={[0, 0.8, 0]} c="#14171d" rough={0.4} r={0.03} />
          <mesh position={[0, 0.8, 0.03]}><planeGeometry args={[1.47, 0.82]} /><meshBasicMaterial map={tex} toneMapped={false} /></mesh>
        </group>
      ))}
      <B s={[1.0, 0.04, 0.34]} p={[-0.1, 1.37, 0.5]} c="#1b1f27" r={0.02} />
      <B s={[0.14, 0.05, 0.22]} p={[0.75, 1.375, 0.5]} c="#1b1f27" r={0.025} />
      <B s={[0.5, 0.025, 0.4]} p={[0.75, 1.352, 0.5]} c={NAVY} r={0.01} />
      <B s={[0.9, 0.03, 0.12]} p={[-0.1, 1.36, 0.82]} c={CY} em={CY} emI={0.9} r={0.01} />
      <mesh position={[1.45, 1.46, 0.5]} castShadow><cylinderGeometry args={[0.1, 0.09, 0.2, 16]} /><meshStandardMaterial color="#f2efe9" roughness={0.4} /></mesh>
      <B s={[0.55, 0.03, 0.7]} p={[-1.55, 1.365, 0.2]} c="#e9e3d3" rot={[0, 0.3, 0]} r={0.01} />
      <group position={[-2.0, 1.35, -0.55]}>
        <mesh castShadow><cylinderGeometry args={[0.18, 0.2, 0.05, 16]} /><meshStandardMaterial color="#111" /></mesh>
        <X s={[0.04, 0.8, 0.04]} p={[0, 0.4, 0]} c="#9aa3b2" metal={0.8} rot={[0, 0, 0.15]} />
        <B s={[0.4, 0.07, 0.15]} p={[0.2, 0.85, 0.05]} c="#cfd6de" em="#fff2cf" emI={0.8} r={0.03} rot={[0, 0, -0.2]} />
        <pointLight position={[0.2, 0.75, 0.1]} intensity={3} distance={4} color="#ffd9a0" />
      </group>
      <Plant p={[2.0, 1.35, -0.6]} s={0.32} seed={7} />
    </group>
  );
}

export function GlassPartition({ x }: { x: number }) {
  return (
    <group position={[x, 0, 1.55]}>
      <mesh><boxGeometry args={[0.04, 2.6, 3.1]} /><meshPhysicalMaterial {...GLASS} /></mesh>
      <B s={[0.08, 0.06, 3.14]} p={[0, 2.62, 0]} c={CH} metal={0.6} />
      <B s={[0.1, 0.04, 3.14]} p={[0, 2.66, 0]} c={CY} em={CY} emI={2} r={0.01} cast={false} />
      <B s={[0.08, 0.06, 3.14]} p={[0, 0.03, 0]} c={CH} metal={0.6} />
    </group>
  );
}

export function Bookshelf({ z, len = 4 }: { z: number; len?: number }) {
  const books = useMemo(() => { const R = rng(11), out: { x: number; y: number; z: number; w: number; h: number; c: string }[] = [];
    const pal = ["#1d3a6b", "#2a6f8f", "#e9e3d3", "#c9783a", "#6a4a2e", "#3a8f7a", "#8f2f3a", "#2a2f3a"];
    [0.14, 1.14, 2.14, 3.14].forEach((sy) => { let zz = -len / 2 + 0.15; while (zz < len / 2 - 0.5) { const w = 0.1 + R() * 0.14, h = 0.6 + R() * 0.3; if (R() < 0.12) { zz += 0.4; continue; } out.push({ x: -0.1 + R() * 0.05, y: sy + 0.035 + h / 2, z: zz + w / 2, w, h, c: pal[Math.floor(R() * pal.length)] }); zz += w + 0.01; } });
    return out; }, [len]);
  return (
    <group position={[0.5, 0, z]}>
      <B s={[0.06, 4.2, len]} p={[-0.47, 2.1, 0]} c="#9a6a3e" map={woodTex()} />
      {[-1, 1].map((sz) => <B key={sz} s={[1, 4.2, 0.08]} p={[0, 2.1, (sz * (len - 0.08)) / 2]} c="#9a6a3e" map={woodTex()} />)}
      {[0.07, 1.1, 2.1, 3.1, 4.17].map((y) => <B key={y} s={[0.95, 0.07, len - 0.1]} p={[0, y, 0]} c="#9a6a3e" map={woodTex()} />)}
      {books.map((b, i) => <X key={i} s={[0.55, b.h, b.w]} p={[b.x, b.y, b.z]} c={b.c} rough={0.8} />)}
      <Plant p={[0.05, 3.18, len / 2 - 0.6]} s={0.4} seed={3} />
      <B s={[0.5, 0.35, 0.5]} p={[0, 2.325, 0.8]} c="#e9e3d3" />
    </group>
  );
}

export function LowCabinet({ z, len = 3 }: { z: number; len?: number }) {
  return (
    <group position={[0.5, 0, z]}>
      <B s={[1, 1.6, len]} p={[0, 0.8, 0]} c={CH} rough={0.55} />
      <B s={[1.06, 0.08, len + 0.1]} p={[0, 1.64, 0]} c="#ffffff" map={woodTex()} />
      {Array.from({ length: Math.round(len) }, (_, i) => <group key={i}><B s={[0.02, 1.4, 0.94]} p={[0.51, 0.8, -len / 2 + 0.5 + i]} c="#343b49" r={0.01} /><B s={[0.04, 0.4, 0.04]} p={[0.55, 0.9, -len / 2 + 0.85 + i]} c={CY} em={CY} emI={1} r={0.01} /></group>)}
      <B s={[0.5, 0.45, 0.4]} p={[0, 1.9, -0.6]} c="#14171d" metal={0.4} />
      <mesh position={[0.1, 1.76, 0.2]} castShadow><cylinderGeometry args={[0.1, 0.09, 0.2, 14]} /><meshStandardMaterial color="#f2efe9" /></mesh>
    </group>
  );
}

export function TallCabinets() {
  return (
    <group position={[22.5, 0, 1.1]}>
      {[-0.75, 0.75].map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          <B s={[1.4, 3.7, 2.1]} p={[0, 1.85, 0]} c="#b5814f" map={woodTex()} rough={0.55} />
          <B s={[1.2, 3.4, 0.03]} p={[0, 1.85, 1.07]} c="#2f3644" r={0.01} />
          <B s={[0.03, 3.3, 0.03]} p={[0, 1.85, 1.1]} c="#171a21" r={0.005} />
          <B s={[0.05, 0.5, 0.05]} p={[i ? -0.15 : 0.15, 1.8, 1.12]} c={CY} em={CY} emI={1} r={0.01} />
        </group>
      ))}
    </group>
  );
}

export function WaterCooler({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <B s={[0.8, 1.7, 0.8]} p={[0, 0.85, 0]} c="#e8edf3" rough={0.4} r={0.08} />
      <B s={[0.5, 0.2, 0.05]} p={[0, 1.2, 0.41]} c="#2a2f3a" /><B s={[0.12, 0.08, 0.06]} p={[-0.12, 1.2, 0.45]} c="#3b82f6" em="#3b82f6" emI={1.2} /><B s={[0.12, 0.08, 0.06]} p={[0.12, 1.2, 0.45]} c="#ef4444" em="#ef4444" emI={1.2} />
      <mesh position={[0, 2.3, 0]} castShadow><cylinderGeometry args={[0.32, 0.32, 1.0, 24]} /><meshPhysicalMaterial color="#5fa8ff" transparent opacity={0.55} roughness={0.1} /></mesh>
    </group>
  );
}

export function Armchair({ p, ry, c = "#3b4a6b" }: { p: V3; ry: number; c?: string }) {
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <B s={[1.4, 0.5, 1.4]} p={[0, 0.45, 0]} c={c} rough={0.9} r={0.12} />
      <B s={[1.4, 1.0, 0.35]} p={[0, 1.0, -0.55]} c={c} rough={0.9} r={0.12} />
      {[-1, 1].map((sx) => <B key={sx} s={[0.28, 0.8, 1.4]} p={[sx * 0.56, 0.8, 0]} c={c} rough={0.9} r={0.1} />)}
      <B s={[1.0, 0.18, 1.0]} p={[0, 0.78, 0.1]} c="#4a5c82" rough={0.95} r={0.08} />
      {[[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]].map(([x, z], i) => <X key={i} s={[0.07, 0.2, 0.07]} p={[x, 0.1, z]} c="#b5814f" />)}
    </group>
  );
}

export function Sofa({ p, ry }: { p: V3; ry: number }) {
  return (
    <group position={p} rotation={[0, ry, 0]}>
      <B s={[4, 0.55, 1.6]} p={[0, 0.45, 0]} c="#3b4a6b" rough={0.9} r={0.1} />
      <B s={[4, 1.1, 0.4]} p={[0, 1.05, -0.65]} c="#3b4a6b" rough={0.9} r={0.12} />
      {[-1, 1].map((sx) => <B key={sx} s={[0.35, 0.85, 1.6]} p={[sx * 1.83, 0.85, 0]} c="#33415f" rough={0.9} r={0.1} />)}
      {[-0.85, 0.85].map((x) => <B key={x} s={[1.6, 0.22, 1.1]} p={[x, 0.82, 0.12]} c="#4a5c82" rough={0.95} r={0.08} />)}
      {[-1.2, 1.2].map((x, i) => <B key={x} s={[0.6, 0.6, 0.18]} p={[x, 1.05, -0.2]} c={i ? "#3fd6e8" : "#2a8f9f"} rough={0.95} r={0.08} rot={[-0.25, i ? -0.2 : 0.2, 0]} />)}
      {[[-1.8, -0.7], [1.8, -0.7], [-1.8, 0.7], [1.8, 0.7]].map(([x, z], i) => <X key={i} s={[0.07, 0.18, 0.07]} p={[x, 0.09, z]} c="#b5814f" />)}
    </group>
  );
}

export function CoffeeTable({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <B s={[1.5, 0.08, 2.6]} p={[0, 0.8, 0]} c="#ffffff" map={woodTex()} r={0.04} />
      {[[-0.6, -1.1], [0.6, -1.1], [-0.6, 1.1], [0.6, 1.1]].map(([x, z], i) => <X key={i} s={[0.06, 0.76, 0.06]} p={[x, 0.38, z]} c="#171a21" metal={0.6} rough={0.4} />)}
      <B s={[0.6, 0.06, 0.45]} p={[0, 0.87, -0.5]} c={NAVY} r={0.01} /><B s={[0.55, 0.05, 0.4]} p={[0, 0.92, -0.5]} c="#e9e3d3" r={0.01} />
      <mesh position={[0.1, 0.95, 0.5]} castShadow><cylinderGeometry args={[0.1, 0.09, 0.2, 14]} /><meshStandardMaterial color="#f2efe9" /></mesh>
      <Plant p={[0, 0.84, 0.95]} s={0.28} seed={5} />
    </group>
  );
}

export function ConfTable({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <B s={[8.6, 0.05, 6.6]} p={[0, 0.03, 0]} c="#ffffff" map={woodTex()} rough={0.5} r={0.02} cast={false} />
      <B s={[6, 0.14, 3]} p={[0, 1.3, 0]} c="#ffffff" map={woodTex()} rough={0.4} r={0.5} />
      {[-1.9, 1.9].map((x) => <B key={x} s={[0.5, 1.24, 2.0]} p={[x, 0.65, 0]} c={CH} rough={0.5} r={0.1} />)}
      <B s={[0.8, 0.02, 0.8]} p={[0, 1.38, 0]} c="#111" r={0.01} />
      <mesh position={[0, 1.42, 0]}><torusGeometry args={[0.95, 0.03, 12, 48]} /><meshStandardMaterial color={CY} emissive={CY} emissiveIntensity={2.5} /></mesh>
      <mesh position={[0, 1.85, 0]}><cylinderGeometry args={[0.7, 0.7, 0.9, 32, 1, true]} /><meshBasicMaterial color={CY} transparent opacity={0.12} side={THREE.DoubleSide} depthWrite={false} /></mesh>
    </group>
  );
}

export function SideTable({ p }: { p: V3 }) {
  return (<group position={p}><mesh position={[0, 0.7, 0]} castShadow receiveShadow><cylinderGeometry args={[0.55, 0.55, 0.07, 32]} /><meshStandardMaterial color="#b5814f" roughness={0.5} /></mesh><mesh position={[0, 0.35, 0]} castShadow><cylinderGeometry args={[0.06, 0.06, 0.7, 12]} /><meshStandardMaterial color="#171a21" metalness={0.7} roughness={0.3} /></mesh><mesh position={[0, 0.03, 0]}><cylinderGeometry args={[0.35, 0.35, 0.05, 24]} /><meshStandardMaterial color="#171a21" metalness={0.7} roughness={0.3} /></mesh></group>);
}
