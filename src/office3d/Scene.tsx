import * as THREE from "three";
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, MeshReflectorMaterial, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Bloom, EffectComposer, N8AO, SMAA, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import type { Office } from "../office/engine";
import type { AgentConfig, AgentState } from "../types";
import { COLS, ROWS } from "../office/map";
import Agent3D from "./Agent3D";
import Room from "./Room";
import { floorTex } from "./textures";

const TARGET = new THREE.Vector3(12, 1.8, 8), D = 52;
const preset = (polar: number) => new THREE.Vector3(TARGET.x + D * Math.sin(polar) * Math.SQRT1_2, TARGET.y + D * Math.cos(polar), TARGET.z + D * Math.sin(polar) * Math.SQRT1_2);
const ISO = preset((55 * Math.PI) / 180), TOP = preset((14 * Math.PI) / 180); // 35 deg elevation vs near top-down

function CameraRig({ top }: { top: boolean }) {
  const { camera, size } = useThree(); const goal = useRef<THREE.Vector3 | null>(null);
  useEffect(() => { goal.current = (top ? TOP : ISO).clone(); }, [top]);
  useEffect(() => { camera.zoom = Math.min(1.05, 0.83 * (size.width / size.height)); camera.updateProjectionMatrix(); }, [camera, size]);
  useFrame((_, dt) => { if (goal.current) { camera.position.lerp(goal.current, 1 - Math.pow(0.002, dt)); if (camera.position.distanceTo(goal.current) < 0.05) goal.current = null; } });
  return null;
}

interface Props { office: Office; agents: AgentConfig[]; states: Record<string, AgentState>; selected: string; onSelect: (id: string) => void; top: boolean }

export default function Scene({ office, agents, states, selected, onSelect, top }: Props) {
  useFrame((_, dt) => office.update(Math.min(dt, 0.05)));
  return (
    <>
      <color attach="background" args={["#070b16"]} />
      <PerspectiveCamera makeDefault fov={28} near={1} far={300} position={ISO.toArray()} />
      <OrbitControls makeDefault target={TARGET} enablePan={false} enableDamping dampingFactor={0.08} minDistance={22} maxDistance={80}
        minPolarAngle={0.2} maxPolarAngle={1.2} minAzimuthAngle={0.05} maxAzimuthAngle={Math.PI / 2 - 0.05} />
      <CameraRig top={top} />

      <hemisphereLight args={["#bcd0ff", "#1a1f2e", 0.55]} />
      <directionalLight position={[22, 30, 20]} intensity={2.3} color="#fff1dc" castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} shadow-normalBias={0.05}
        shadow-camera-left={-22} shadow-camera-right={22} shadow-camera-top={22} shadow-camera-bottom={-22} shadow-camera-near={1} shadow-camera-far={90} />
      <pointLight position={[12, 5.5, 10.5]} intensity={40} distance={16} color="#ffcf9a" />
      <pointLight position={[4, 4, 14]} intensity={18} distance={10} color="#8fb3ff" />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.2} position={[0, 12, 14]} scale={[24, 10, 1]} color="#cfe3ff" />
        <Lightformer form="rect" intensity={1.4} position={[-12, 6, 0]} rotation-y={Math.PI / 2} scale={[16, 8, 1]} color="#4de1ff" />
        <Lightformer form="ring" intensity={1.5} position={[10, 14, -6]} scale={6} color="#ffd9a0" />
      </Environment>

      <group onClick={(e) => e.stopPropagation()}><Room office={office} agents={agents} /></group>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[COLS / 2, 0.005, ROWS / 2]} receiveShadow
        onClick={(e) => { if (e.delta > 5) return; e.stopPropagation(); office.moveTo(selected, Math.floor(e.point.x), Math.floor(e.point.z)); }}>
        <planeGeometry args={[COLS, ROWS]} />
        <MeshReflectorMaterial map={floorTex()} color="#ffffff" roughness={0.75} metalness={0.15} blur={[280, 80]} resolution={512} mixBlur={1.2} mixStrength={0.7} mirror={0.5} depthScale={0.3} />
      </mesh>

      {agents.map((a) => <Agent3D key={a.id} office={office} cfg={a} state={states[a.id] ?? "idle"} selected={selected === a.id} onSelect={onSelect} />)}
      <ContactShadows position={[12, 0.02, 8]} scale={[26, 18]} blur={2.2} far={4} opacity={0.55} resolution={512} frames={Infinity} color="#000814" />

      <EffectComposer multisampling={0} enableNormalPass={false}>
        <N8AO aoRadius={1.4} intensity={2.2} distanceFalloff={1} quality="medium" />
        <Bloom luminanceThreshold={1} intensity={0.55} mipmapBlur />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <SMAA />
      </EffectComposer>
    </>
  );
}
