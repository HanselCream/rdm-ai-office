import { useEffect, useState } from "react";
import type { Msg, Settings } from "./types";

const base = { webhookUrl: "", authHeader: "", authValue: "", model: "" };
export const defaultSettings: Settings = {
  openrouterKey: "", timeoutSec: 60,
  agents: [
    { ...base, id: "finance", name: "Finance Agent", role: "Finance & Analytics", provider: "openrouter",
      systemPrompt: "You are the Finance Agent of RDM AI Office. Be concise, numeric and practical.", shirt: "#3b82f6", hair: "#2b1d14", glasses: true },
    { ...base, id: "research", name: "Research Agent", role: "Research & Insights", provider: "openrouter",
      systemPrompt: "You are the Research Agent of RDM AI Office. Summarize clearly and state assumptions.", shirt: "#ec4899", hair: "#111111", glasses: false },
    { ...base, id: "ops", name: "Ops Agent", role: "Operations", provider: "openrouter",
      systemPrompt: "You are the Ops Agent of RDM AI Office. Give step-by-step, actionable answers.", shirt: "#f59e0b", hair: "#7a4a21", glasses: false },
  ],
};

function load<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; }
}
function usePersisted<T>(key: string, init: T) {
  const [v, setV] = useState<T>(() => load(key, init));
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* ignore */ } }, [key, v]);
  return [v, setV] as const;
}
export function useSettings() {
  const [s, set] = usePersisted<Settings>("rdm-office-settings", defaultSettings);
  const merged: Settings = { ...defaultSettings, ...s, agents: defaultSettings.agents.map((d, i) => ({ ...d, ...(s.agents?.[i] ?? {}) })) };
  return [merged, set] as const;
}
export const useChats = () => usePersisted<Record<string, Msg[]>>("rdm-office-chats", {});
export function conversationId(agentId: string) {
  const k = `rdm-conv-${agentId}`;
  let id = localStorage.getItem(k);
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(k, id); }
  return id;
}
