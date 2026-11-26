import { useEffect, useRef, useState } from "react";
import type { AgentConfig, AgentState, Msg } from "../types";

interface Props { agents: AgentConfig[]; agent: AgentConfig; state: AgentState; msgs: Msg[]; onPick: (id: string) => void; onSend: (t: string) => void; onClear: () => void; ready: boolean }
const LABEL: Record<AgentState, string> = { idle: "Idle", thinking: "Thinking", working: "Working", error: "Error" };

export default function ChatPanel({ agents, agent, state, msgs, onPick, onSend, onClear, ready }: Props) {
  const [text, setText] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const busy = state === "thinking" || state === "working";
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs.length, state]);
  const send = () => { const t = text.trim(); if (!t || busy) return; setText(""); onSend(t); };
  return (
    <section className="chat">
      <header className="chat-head">
        <select value={agent.id} onChange={(e) => onPick(e.target.value)}>{agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
        <div className="sub"><span className={`dot ${state}`} /> {ready ? LABEL[state] : "Setup required"} · {agent.role}</div>
        <button className="btn sm" onClick={onClear} title="Clear chat">CLEAR</button>
      </header>
      <div className="msgs">
        {!msgs.length && <div className="empty"><h2>GOOD MORNING.</h2><p>{ready ? `Ask ${agent.name} anything.` : "Open SETTINGS and connect an n8n webhook or an OpenRouter key."}</p></div>}
        {msgs.map((m) => <div key={m.id} className={`msg ${m.role}`}><div className="bubble">{m.content}</div></div>)}
        {busy && <div className="msg agent"><div className="bubble typing"><i /><i /><i /></div></div>}
        <div ref={end} />
      </div>
      <div className="composer">
        <textarea value={text} placeholder={`Message ${agent.name}...`} rows={2} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} />
        <button className="btn" onClick={send} disabled={busy || !text.trim()}>SEND ▶</button>
      </div>
    </section>
  );
}
