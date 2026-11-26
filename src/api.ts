import type { AgentConfig, AgentState, Msg, Settings } from "./types";

export interface AgentReply { text: string; status?: AgentState }

async function timedFetch(url: string, init: RequestInit, sec: number) {
  const ac = new AbortController();
  const id = setTimeout(() => ac.abort(), sec * 1000);
  try { return await fetch(url, { ...init, signal: ac.signal }); }
  catch (e) {
    if ((e as Error).name === "AbortError") throw new Error(`Timed out after ${sec}s`);
    throw new Error("Network/CORS error. For n8n: Webhook node > Options > Allowed Origins (CORS) = *");
  } finally { clearTimeout(id); }
}

function extract(data: unknown): AgentReply {
  if (typeof data === "string") return { text: data };
  if (Array.isArray(data)) return extract(data[0]);
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    const t = d.output ?? d.reply ?? d.message ?? d.text;
    const st = ["idle", "thinking", "working", "error"].includes(String(d.status)) ? (d.status as AgentState) : undefined;
    return { text: typeof t === "string" ? t : JSON.stringify(data, null, 2), status: st };
  }
  return { text: String(data) };
}

export async function sendToAgent(a: AgentConfig, s: Settings, message: string, history: Msg[], conversation: string): Promise<AgentReply> {
  if (a.provider === "n8n") {
    if (!/^https?:\/\//.test(a.webhookUrl)) throw new Error("Set the n8n webhook URL in Settings.");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (a.authHeader && a.authValue) headers[a.authHeader] = a.authValue;
    const res = await timedFetch(a.webhookUrl, { method: "POST", headers, body: JSON.stringify({
      message, agent: a.id, department: a.role, conversation,
      history: history.slice(-20).map((m) => ({ role: m.role, content: m.content })), timestamp: new Date().toISOString(),
    }) }, s.timeoutSec);
    const raw = await res.text();
    if (!res.ok) throw new Error(`n8n responded ${res.status}: ${raw.slice(0, 300)}`);
    try { return extract(JSON.parse(raw)); } catch { return { text: raw }; }
  }
  if (!s.openrouterKey) throw new Error("Add your OpenRouter API key in Settings.");
  if (!a.model) throw new Error("Pick an OpenRouter model for this agent in Settings (use Fetch free models).");
  const messages = [
    { role: "system", content: a.systemPrompt || `You are ${a.name}.` },
    ...history.filter((m) => m.role !== "error").slice(-20).map((m) => ({ role: m.role === "agent" ? "assistant" : "user", content: m.content })),
    { role: "user", content: message },
  ];
  const res = await timedFetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${s.openrouterKey}`, "Content-Type": "application/json", "HTTP-Referer": location.origin, "X-Title": "RDM AI Office" },
    body: JSON.stringify({ model: a.model, messages }),
  }, s.timeoutSec);
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) throw new Error(`OpenRouter: ${json?.error?.message ?? res.status}`);
  return { text: json.choices?.[0]?.message?.content ?? "(empty reply)" };
}

export async function fetchFreeModels(): Promise<string[]> {
  const res = await fetch("https://openrouter.ai/api/v1/models");
  if (!res.ok) throw new Error(`Models request failed (${res.status})`);
  const json = await res.json();
  return (json.data as { id: string; pricing?: { prompt?: string; completion?: string } }[])
    .filter((m) => Number(m.pricing?.prompt) === 0 && Number(m.pricing?.completion) === 0)
    .map((m) => m.id).sort();
}
