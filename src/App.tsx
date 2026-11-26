import { useCallback, useEffect, useState } from "react";
import ChatPanel from "./components/ChatPanel";
import OfficeCanvas from "./components/OfficeCanvas";
import SettingsDialog from "./components/SettingsDialog";
import { sendToAgent } from "./api";
import { conversationId, useChats, useSettings } from "./store";
import type { AgentConfig, AgentState, Msg } from "./types";

const isReady = (a: AgentConfig, key: string) => (a.provider === "n8n" ? /^https?:\/\//.test(a.webhookUrl) : !!key && !!a.model);
const mk = (role: Msg["role"], content: string): Msg => ({ id: crypto.randomUUID(), role, content, ts: new Date().toISOString() });

export default function App() {
  const [settings, setSettings] = useSettings();
  const [chats, setChats] = useChats();
  const [selected, setSelected] = useState(settings.agents[0].id);
  const [states, setStates] = useState<Record<string, AgentState>>({});
  const [open, setOpen] = useState(false);
  const [tilt, setTilt] = useState(false);
  const [tab, setTab] = useState<"office" | "chat">("office");
  const [leftW, setLeftW] = useState(() => Number(localStorage.getItem("rdm-left")) || 400);

  const agent = settings.agents.find((a) => a.id === selected) ?? settings.agents[0];
  const setSt = useCallback((id: string, s: AgentState) => setStates((p) => ({ ...p, [id]: s })), []);
  const add = useCallback((id: string, m: Msg) => setChats((p) => ({ ...p, [id]: [...(p[id] ?? []), m].slice(-60) })), [setChats]);

  const send = async (text: string) => {
    const id = agent.id, history = chats[id] ?? [];
    add(id, mk("user", text)); setSt(id, "thinking");
    const t = setTimeout(() => setStates((p) => (p[id] === "thinking" ? { ...p, [id]: "working" } : p)), 1200);
    try {
      const r = await sendToAgent(agent, settings, text, history, conversationId(id));
      add(id, mk("agent", r.text)); setSt(id, r.status ?? "idle");
    } catch (e) {
      add(id, mk("error", (e as Error).message)); setSt(id, "error"); setTimeout(() => setSt(id, "idle"), 4000);
    } finally { clearTimeout(t); }
  };

  const drag = (e: React.PointerEvent) => {
    e.preventDefault();
    const move = (ev: PointerEvent) => setLeftW(Math.min(window.innerWidth * 0.55, Math.max(300, ev.clientX)));
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
  };
  useEffect(() => { localStorage.setItem("rdm-left", String(Math.round(leftW))); }, [leftW]);

  return (
    <div className="app">
      <header className="top">
        <div className="logo">🌴 <b>RDM</b> AI OFFICE</div>
        <div className="actions">
          <button className={`btn sm ${tilt ? "on" : ""}`} onClick={() => setTilt(!tilt)}>{tilt ? "TOP VIEW" : "ISO VIEW"}</button>
          <button className="btn sm" onClick={() => setOpen(true)}>⚙ SETTINGS</button>
        </div>
      </header>
      <main className={`main show-${tab}`} style={{ ["--left" as string]: `${leftW}px` }}>
        <div className="left">
          <ChatPanel agents={settings.agents} agent={agent} state={states[agent.id] ?? "idle"} msgs={chats[agent.id] ?? []} ready={isReady(agent, settings.openrouterKey)}
            onPick={setSelected} onSend={send} onClear={() => setChats((p) => ({ ...p, [agent.id]: [] }))} />
        </div>
        <div className="split" onPointerDown={drag} onDoubleClick={() => setLeftW(400)} title="Drag to resize" />
        <div className="right"><OfficeCanvas agents={settings.agents} states={states} selected={selected} onSelect={setSelected} tilt={tilt} /></div>
      </main>
      <nav className="tabbar"><button className={tab === "office" ? "on" : ""} onClick={() => setTab("office")}>OFFICE</button><button className={tab === "chat" ? "on" : ""} onClick={() => setTab("chat")}>CHAT</button></nav>
      {open && <SettingsDialog settings={settings} onChange={setSettings} onClose={() => setOpen(false)} />}
    </div>
  );
}
