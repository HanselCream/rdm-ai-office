export type AgentState = "idle" | "thinking" | "working" | "error";
export type Provider = "n8n" | "openrouter";
export interface AgentConfig {
  id: string; name: string; role: string; provider: Provider;
  webhookUrl: string; authHeader: string; authValue: string;
  model: string; systemPrompt: string; shirt: string; hair: string; glasses: boolean;
}
export interface Settings { openrouterKey: string; timeoutSec: number; agents: AgentConfig[] }
export interface Msg { id: string; role: "user" | "agent" | "error"; content: string; ts: string }
