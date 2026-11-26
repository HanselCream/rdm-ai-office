import * as THREE from "three";
import { useMemo } from "react";
import type { Office } from "../office/engine";
import type { AgentConfig } from "../types";
import { DESK_X } from "../office/map";
import { makeLabel } from "./textures";
import { Armchair, B, Bookshelf, Chair, CoffeeTable, ConfTable, GlassPartition, LowCabinet, Plant, SideTable, Sofa, TallCabinets, WaterCooler, Workstation, useLiveScreen } from "./Furniture";

const WALL = "#1d2b4d", CAP = "#e4eaf5", CY = "#4de1ff";

function Display({ p, rot = [0, 0, 0], w, h, tex }: { p: [number, number, number]; rot?: [number, number, number]; w: number; h: number; tex: THREE.Texture }) {
  return (
    <group position={p} rotation={rot}>
      <B s={[w + 0.2, h + 0.2, 0.12]} c="#14171d" rough={0.4} r={0.05} />
      <mesh position={[0, 0, 0.07]}><planeGeometry args={[w, h]} /><meshBasicMaterial map={tex} toneMapped={false} /></mesh>
    </group>
  );
}
function LiveDisplay({ office, id, name, ...rest }: { office: Office; id: string; name: string; p: [number, number, number]; w: number; h: number }) {
  const tex = useLiveScreen(office, id, name, 320, 200);
  return <Display {...rest} tex={tex} />;
}

export default function Room({ office, agents }: { office: Office; agents: AgentConfig[] }) {
  const sign = useMemo(() => makeLabel([{ text: "🌴  RDM", size: 150, color: "#ffffff", y: 120 }, { text: "AI  OFFICE", size: 70, color: CY, y: 215, font: "600" }], 1024, 280), []);
  const board = useMemo(() => makeLabel([{ text: "Build", size: 90, color: "#ffffff", y: 90 }, { text: "Smarter", size: 90, color: "#ffffff", y: 190 }, { text: "Together", size: 90, color: CY, y: 290 }], 512, 380), []);
  return (
    <group>
      {/* base slab + walls (thick, cutaway diorama) */}
      <B s={[25.2, 0.8, 17.2]} p={[12, -0.4, 8]} c="#12182a" rough={0.7} r={0.05} />
      <B s={[25.7, 0.25, 17.7]} p={[12, -0.88, 8]} c="#0a0e1b" r={0.05} />
      <B s={[25.2, 5, 0.6]} p={[12, 2.5, -0.3]} c={WALL} rough={0.85} r={0.02} />
      <B s={[25.2, 0.14, 0.8]} p={[12, 5.07, -0.3]} c={CAP} rough={0.5} r={0.03} />
      <B s={[24.4, 0.4, 0.1]} p={[12.2, 0.2, 0.05]} c="#20242d" r={0.01} />
      <B s={[24.4, 0.06, 0.06]} p={[12.2, 4.78, 0.04]} c={CY} em={CY} emI={2.2} r={0.01} cast={false} />
      <B s={[0.6, 5, 13.1]} p={[-0.3, 2.5, 5.95]} c={WALL} rough={0.85} r={0.02} />
      <B s={[0.6, 5, 1.1]} p={[-0.3, 2.5, 16.05]} c={WALL} rough={0.85} r={0.02} />
      <B s={[0.6, 1.2, 3]} p={[-0.3, 0.6, 14]} c={WALL} rough={0.85} r={0.02} />
      <B s={[0.6, 0.8, 3]} p={[-0.3, 4.6, 14]} c={WALL} rough={0.85} r={0.02} />
      <mesh position={[-0.3, 2.7, 14]}><boxGeometry args={[0.04, 3, 3]} /><meshPhysicalMaterial color="#9fd9ff" transparent opacity={0.18} roughness={0.05} metalness={0.1} envMapIntensity={1.5} side={THREE.DoubleSide} /></mesh>
      <B s={[0.08, 3, 0.07]} p={[-0.3, 2.7, 14]} c="#14171d" r={0.01} /><B s={[0.08, 0.07, 3]} p={[-0.3, 2.7, 14]} c="#14171d" r={0.01} />
      <B s={[0.8, 0.14, 17.2]} p={[-0.3, 5.07, 8]} c={CAP} rough={0.5} r={0.03} />
      <B s={[0.1, 0.4, 16.2]} p={[0.05, 0.2, 8.1]} c="#20242d" r={0.01} />
      <B s={[0.06, 0.06, 16.4]} p={[0.04, 4.78, 8.2]} c={CY} em={CY} emI={2.2} r={0.01} cast={false} />

      {/* wall displays */}
      <Display p={[12, 3.85, 0.1]} w={6.4} h={1.6} tex={sign} />
      {agents[0] && <LiveDisplay office={office} id={agents[0].id} name={agents[0].name} p={[DESK_X[0] + 2.5, 3.75, 0.1]} w={3.2} h={2.0} />}
      {agents[2] && <LiveDisplay office={office} id={agents[2].id} name={agents[2].name} p={[DESK_X[2] + 2.5, 3.75, 0.1]} w={3.2} h={2.0} />}
      <Display p={[0.1, 3.4, 10.5]} rot={[0, Math.PI / 2, 0]} w={2.6} h={1.9} tex={board} />

      {/* workstations */}
      {agents.map((a, i) => <group key={a.id}><Workstation office={office} id={a.id} name={a.name} x0={DESK_X[i]} /><Chair p={[DESK_X[i] + 2.5, 0, 2.9]} accent={a.shirt} /></group>)}
      <GlassPartition x={8} /><GlassPartition x={15} />

      {/* storage, shelving */}
      <Bookshelf z={7} len={4} /><LowCabinet z={10.5} len={3} /><TallCabinets />
      <WaterCooler p={[22.5, 0, 6.5]} />

      {/* collaboration area */}
      <ConfTable p={[12, 0, 10.5]} />
      {[10.5, 12, 13.5].map((x) => <group key={x}><Chair p={[x, 0, 8.2]} ry={Math.PI} accent="#8fb3ff" /><Chair p={[x, 0, 12.8]} accent="#8fb3ff" /></group>)}

      {/* lounge + huddle */}
      <B s={[5.6, 0.03, 5]} p={[4.4, 0.02, 14]} c="#1d3558" rough={1} r={0.01} cast={false} />
      <B s={[5.3, 0.035, 4.7]} p={[4.4, 0.03, 14]} c="#24446f" rough={1} r={0.01} cast={false} />
      <Sofa p={[1, 0, 14]} ry={Math.PI / 2} /><CoffeeTable p={[4, 0, 14]} /><Armchair p={[6.5, 0, 14]} ry={-Math.PI / 2} />
      <Armchair p={[18.6, 0, 14]} ry={Math.PI / 2} c="#2a8f9f" /><Armchair p={[21.4, 0, 14]} ry={-Math.PI / 2} c="#2a8f9f" /><SideTable p={[20, 0, 14]} />

      {/* plants */}
      <Plant p={[23.5, 0, 4.5]} s={1.5} seed={2} /><Plant p={[7.5, 0, 5.5]} s={1.4} seed={4} /><Plant p={[22.5, 0, 8.5]} s={1.5} seed={6} />
      <Plant p={[1.5, 0, 3.5]} s={1.6} seed={8} /><Plant p={[22.5, 0, 14.5]} s={1.6} seed={9} />
    </group>
  );
}
