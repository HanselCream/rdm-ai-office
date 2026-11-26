import { useState } from "react";
import type { AgentConfig, Settings } from "../types";
import { fetchFreeModels, sendToAgent } from "../api";
import { defaultSettings } from "../store";

interface Props { settings: Settings; onChange: (s: Settings) => void; onClose: () => void }

export default function SettingsDialog({ settings, onChange, onClose }: Props) {
  const [models, setModels] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [show, setShow] = useState(false);
  const [idx, setIdx] = useState(0);
  const [test, setTest] = useState("");
  const a = settings.agents[idx];
  const setAgent = (p: Partial<AgentConfig>) => onChange({ ...settings, agents: settings.agents.map((x, i) => (i === idx ? { ...x, ...p } : x)) });

  const free = async () => { setNote("Loading..."); try { const m = await fetchFreeModels(); setModels(m); setNote(`${m.length} free models found`); } catch (e) { setNote((e as Error).message); } };
  const runTest = async () => {
    setTest("Testing..."); const t0 = performance.now();
    try { const r = await sendToAgent(a, settings, "Reply with the single word: pong", [], "test"); setTest(`OK ${Math.round(performance.now() - t0)}ms: ${r.text.slice(0, 120)}`); }
    catch (e) { setTest(`FAILED: ${(e as Error).message}`); }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <header><h2>SETTINGS</h2><button className="btn sm" onClick={onClose}>X</button></header>
        <div className="body">
          <h3>OpenRouter (free models)</h3>
          <label>API key<div className="row"><input type={show ? "text" : "password"} value={settings.openrouterKey} placeholder="sk-or-v1-..." onChange={(e) => onChange({ ...settings, openrouterKey: e.target.value })} />
            <button className="btn sm" onClick={() => setShow(!show)}>{show ? "HIDE" : "SHOW"}</button></div></label>
          <div className="row"><button className="btn sm" onClick={free}>FETCH FREE MODELS</button><span className="note">{note}</span></div>
          <label>Timeout (seconds)<input type="number" min={5} value={settings.timeoutSec} onChange={(e) => onChange({ ...settings, timeoutSec: Number(e.target.value) || 60 })} /></label>

          <h3>Agent</h3>
          <div className="tabs">{settings.agents.map((x, i) => <button key={x.id} className={`btn sm ${i === idx ? "on" : ""}`} onClick={() => { setIdx(i); setTest(""); }}>{x.name.split(" ")[0]}</button>)}</div>
          <label>Name<input value={a.name} onChange={(e) => setAgent({ name: e.target.value })} /></label>
          <label>Department / role<input value={a.role} onChange={(e) => setAgent({ role: e.target.value })} /></label>
          <label>Connect through
            <select value={a.provider} onChange={(e) => setAgent({ provider: e.target.value as AgentConfig["provider"] })}>
              <option value="openrouter">OpenRouter (direct model)</option><option value="n8n">n8n webhook</option>
            </select></label>
          {a.provider === "n8n" ? (<>
            <label>Webhook URL<input value={a.webhookUrl} placeholder="https://your-n8n/webhook/rdm-finance" onChange={(e) => setAgent({ webhookUrl: e.target.value })} /></label>
            <div className="row2"><label>Auth header (optional)<input value={a.authHeader} placeholder="X-API-Key" onChange={(e) => setAgent({ authHeader: e.target.value })} /></label>
              <label>Auth value<input type="password" value={a.authValue} onChange={(e) => setAgent({ authValue: e.target.value })} /></label></div>
          </>) : (<>
            <label>Model<input list="free-models" value={a.model} placeholder="click FETCH FREE MODELS, then pick" onChange={(e) => setAgent({ model: e.target.value })} /></label>
            <datalist id="free-models">{models.map((m) => <option key={m} value={m} />)}</datalist>
            <label>System prompt<textarea rows={3} value={a.systemPrompt} onChange={(e) => setAgent({ systemPrompt: e.target.value })} /></label>
          </>)}
          <div className="row2"><label>Shirt<input type="color" value={a.shirt} onChange={(e) => setAgent({ shirt: e.target.value })} /></label>
            <label>Hair<input type="color" value={a.hair} onChange={(e) => setAgent({ hair: e.target.value })} /></label>
            <label className="chk"><input type="checkbox" checked={a.glasses} onChange={(e) => setAgent({ glasses: e.target.checked })} /> Glasses</label></div>
          <div className="row"><button className="btn" onClick={runTest}>TEST CONNECTION</button><span className="note">{test}</span></div>
          <p className="warn">Everything is stored in this browser only (localStorage). Nothing is hardcoded in the code.</p>
          <button className="btn sm danger" onClick={() => { if (confirm("Reset all settings?")) onChange(defaultSettings); }}>RESET ALL</button>
        </div>
      </div>
    </div>
  );
}
