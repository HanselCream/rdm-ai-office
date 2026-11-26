import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html, useCursor } from "@react-three/drei";
import { useRef, useState } from "react";
import type { Office } from "../office/engine";
import type { AgentConfig, AgentState } from "../types";
import { B } from "./Furniture";

const FACE = { right: Math.PI / 2, left: -Math.PI / 2, down: 0, up: Math.PI } as const;
const BUB: Record<AgentState, [string, string] | null> = { idle: null, thinking: ["Thinking", "#3b82f6"], working: ["Analyzing", "#f59e0b"], error: ["Error", "#ef4444"] };

export default function Agent3D({ office, cfg, state, selected, onSelect }: { office: Office; cfg: AgentConfig; state: AgentState; selected: boolean; onSelect: (id: string) => void }) {
  const root = useRef<THREE.Group>(null), body = useRef<THREE.Group>(null), head = useRef<THREE.Group>(null), ring = useRef<THREE.Mesh>(null);
  const lu = useRef<THREE.Group>(null), ru = useRef<THREE.Group>(null), ll = useRef<THREE.Group>(null), rl = useRef<THREE.Group>(null);
  const la = useRef<THREE.Group>(null), ra = useRef<THREE.Group>(null), lf = useRef<THREE.Group>(null), rf = useRef<THREE.Group>(null);
  const S = useRef({ phase: 0, seat: 1, rot: Math.PI });
  const [hover, setHover] = useState(false); useCursor(hover);

  useFrame((st, dt) => {
    const a = office.sims.get(cfg.id), g = root.current; if (!a || !g) return;
    const t = st.clock.elapsedTime, s = S.current, k = Math.min(1, dt * 8);
    const home = !a.moving && !a.path.length && Math.round(a.x) === a.home.x && Math.round(a.y) === a.home.y;
    s.seat += ((home ? 1 : 0) - s.seat) * k;
    g.position.set(a.x + 0.5 + (state === "error" ? Math.sin(t * 50) * 0.03 : 0), -0.48 * s.seat, a.y + 0.5 - 0.6 * s.seat);
    const target = home ? Math.PI : FACE[a.dir]; let d = target - s.rot; d = Math.atan2(Math.sin(d), Math.cos(d)); s.rot += d * Math.min(1, dt * 10); g.rotation.y = s.rot;
    if (a.moving) s.phase += dt * 9;
    const sw = a.moving ? Math.sin(s.phase) : 0, w = 1 - s.seat, sit = s.seat, hold = Math.PI / 2;
    const typ = Math.sin(t * 14) * 0.08 * (state === "thinking" ? 1 : state === "idle" ? 0.15 : 0.5);
    lu.current!.rotation.x = sw * 0.7 * w - hold * sit; ru.current!.rotation.x = -sw * 0.7 * w - hold * sit;
    ll.current!.rotation.x = hold * sit + Math.max(0, -sw) * 0.6 * w; rl.current!.rotation.x = hold * sit + Math.max(0, sw) * 0.6 * w;
    la.current!.rotation.x = -sw * 0.6 * w - 1.05 * sit + typ; ra.current!.rotation.x = sw * 0.6 * w - 1.05 * sit - typ;
    lf.current!.rotation.x = -0.5 * sit - Math.max(0, sw) * 0.4 * w; rf.current!.rotation.x = -0.5 * sit - Math.max(0, -sw) * 0.4 * w;
    body.current!.position.y = (a.moving ? Math.abs(Math.sin(s.phase)) * 0.06 : 0) + Math.sin(t * 2) * 0.01;
    head.current!.rotation.z = state === "thinking" ? Math.sin(t * 2) * 0.12 : 0; head.current!.rotation.x = sit * 0.12;
    if (ring.current) { ring.current.position.y = 0.05 + 0.48 * sit; ring.current.visible = selected; ring.current.scale.setScalar(1 + Math.sin(t * 4) * 0.04); }
  });

  const col = cfg.shirt, W = "#eef2f7";
  return (
    <group ref={root} onClick={(e) => { e.stopPropagation(); onSelect(cfg.id); }} onPointerOver={(e) => { e.stopPropagation(); setHover(true); }} onPointerOut={() => setHover(false)}>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} visible={false}><ringGeometry args={[0.8, 0.98, 40]} /><meshBasicMaterial color="#4de1ff" transparent opacity={0.95} toneMapped={false} /></mesh>
      {([[-1, lu, ll], [1, ru, rl]] as const).map(([sx, u, l]) => (
        <group key={sx} ref={u} position={[sx * 0.2, 1.1, 0]}>
          <B s={[0.24, 0.56, 0.24]} p={[0, -0.27, 0]} c="#232a3d" r={0.08} rough={0.7} />
          <group ref={l} position={[0, -0.55, 0]}><B s={[0.21, 0.55, 0.21]} p={[0, -0.27, 0]} c="#232a3d" r={0.07} /><B s={[0.25, 0.11, 0.36]} p={[0, -0.57, 0.05]} c={W} r={0.05} rough={0.4} /></group>
        </group>
      ))}
      <group ref={body}>
        <B s={[0.85, 0.98, 0.52]} p={[0, 1.6, 0]} c={col} r={0.2} rough={0.5} />
        <B s={[0.5, 0.45, 0.04]} p={[0, 1.65, 0.27]} c={W} r={0.1} rough={0.35} />
        <mesh position={[0, 1.65, 0.3]}><circleGeometry args={[0.09, 16]} /><meshStandardMaterial color="#4de1ff" emissive="#4de1ff" emissiveIntensity={2.5} /></mesh>
        <mesh position={[0, 2.18, 0]}><cylinderGeometry args={[0.13, 0.15, 0.14, 12]} /><meshStandardMaterial color="#232a3d" /></mesh>
        <group ref={head} position={[0, 2.62, 0]}>
          <B s={[0.95, 0.8, 0.82]} c={W} r={0.3} rough={0.3} />
          <B s={[0.74, 0.4, 0.05]} p={[0, 0.02, 0.41]} c="#0a0e1a" r={0.15} rough={0.1} metal={0.5} />
          {[-0.18, 0.18].map((x) => <B key={x} s={[0.15, 0.15, 0.02]} p={[x, 0.03, 0.44]} c="#4de1ff" em="#4de1ff" emI={3} r={0.05} />)}
          {[-1, 1].map((sx) => <mesh key={sx} position={[sx * 0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[0.2, 0.2, 0.12, 20]} /><meshStandardMaterial color={col} roughness={0.4} /></mesh>)}
          <mesh position={[0, 0.2, 0]} rotation={[0, Math.PI / 2, 0]}><torusGeometry args={[0.5, 0.035, 8, 24, Math.PI]} /><meshStandardMaterial color={col} /></mesh>
          <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.02, 0.02, 0.25, 6]} /><meshStandardMaterial color="#9aa3b2" /></mesh>
          <mesh position={[0, 0.65, 0]}><sphereGeometry args={[0.06, 10, 8]} /><meshStandardMaterial color="#4de1ff" emissive="#4de1ff" emissiveIntensity={2.5} /></mesh>
        </group>
        {([[-1, la, lf], [1, ra, rf]] as const).map(([sx, u, f]) => (
          <group key={sx} ref={u} position={[sx * 0.56, 2.0, 0]}>
            <B s={[0.2, 0.52, 0.2]} p={[0, -0.25, 0]} c={col} r={0.08} />
            <group ref={f} position={[0, -0.5, 0]}><B s={[0.17, 0.48, 0.17]} p={[0, -0.24, 0]} c={W} r={0.07} rough={0.4} /><mesh position={[0, -0.52, 0]}><sphereGeometry args={[0.1, 10, 8]} /><meshStandardMaterial color="#232a3d" /></mesh></group>
          </group>
        ))}
      </group>
      <Html position={[0, 3.9, 0]} center zIndexRange={[5, 0]} style={{ pointerEvents: "none" }}>
        <div className="tag">{BUB[state] && <span className={`bub ${state}`} style={{ borderLeftColor: BUB[state]![1] }}>{BUB[state]![0]}{state === "thinking" && <span className="dots"><i /><i /><i /></span>}</span>}
          <b className={selected ? "sel" : ""}>{cfg.name.split(" ")[0]}</b></div>
      </Html>
    </group>
  );
}
