import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import type { AgentConfig, AgentState } from "../types";
import { Office } from "../office/engine";
import Scene from "../office3d/Scene";

interface Props { agents: AgentConfig[]; states: Record<string, AgentState>; selected: string; onSelect: (id: string) => void; tilt: boolean }

/** tilt=false: isometric view (35 deg). tilt=true: top view. */
export default function OfficeCanvas({ agents, states, selected, onSelect, tilt }: Props) {
  const [office] = useState(() => new Office(agents.map((a) => a.id)));
  const prev = useRef<Record<string, AgentState>>({});
  const sel = useRef(selected); sel.current = selected;

  useEffect(() => { agents.forEach((a) => { const s = states[a.id] ?? "idle"; if (prev.current[a.id] !== s) { office.setState(a.id, s); prev.current[a.id] = s; } }); }, [states, agents, office]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement).tagName)) return;
      const m: Record<string, [number, number]> = { ArrowUp: [0, -1], w: [0, -1], ArrowDown: [0, 1], s: [0, 1], ArrowLeft: [-1, 0], a: [-1, 0], ArrowRight: [1, 0], d: [1, 0] };
      const v = m[e.key]; if (v) { e.preventDefault(); office.step(sel.current, v[0], v[1]); }
    };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [office]);

  return (
    <div className="stage">
      <Canvas shadows="soft" dpr={[1, 2]} gl={{ antialias: false, powerPreference: "high-performance" }} style={{ position: "absolute", inset: 0 }}>
        <Suspense fallback={null}><Scene office={office} agents={agents} states={states} selected={selected} onSelect={onSelect} top={tilt} /></Suspense>
      </Canvas>
      <div className="hint">CLICK AGENT TO SELECT · CLICK FLOOR OR WASD TO WALK · DRAG TO ORBIT · SCROLL TO ZOOM</div>
    </div>
  );
}
