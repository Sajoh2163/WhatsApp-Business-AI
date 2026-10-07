import type { AIService, Msg } from "./types";
import { DemoAIService } from "./demo.ts";
export type AIErrorKind = "timeout" | "unavailable" | "rate_limited" | "empty";
export class AIProviderError extends Error {
  kind: AIErrorKind;
  constructor(kind: AIErrorKind) { super(`AI_${kind.toUpperCase()}`); this.kind = kind; } // jamais de clé ni de corps de réponse dans le message
}
type FetchLike = (url: string, init: RequestInit) => Promise<Response>;
/** Fournisseur compatible /chat/completions. classifyIntent/extractCustomerData/summarize restent ceux de la démo (non branchés). */
export class OpenAICompatibleAIService extends DemoAIService implements AIService {
  baseUrl: string; key: string; model: string; fetchImpl: FetchLike; timeoutMs: number;
  constructor(baseUrl: string, key: string, model: string, fetchImpl: FetchLike = fetch, timeoutMs = 15000) { super(); this.baseUrl = baseUrl; this.key = key; this.model = model; this.fetchImpl = fetchImpl; this.timeoutMs = timeoutMs; }
  async generateResponse(i: { organizationId: string; history: Msg[]; context: string[] }) {
    let res: Response;
    try {
      res = await this.fetchImpl(`${this.baseUrl}/chat/completions`, { method: "POST", signal: AbortSignal.timeout(this.timeoutMs), headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: this.model, messages: [{ role: "system", content: "Tu es l'assistant commercial de l'entreprise. Contexte:\n" + i.context.join("\n") }, ...i.history.map((m) => ({ role: m.role === "customer" ? "user" : "assistant", content: m.text }))] }) });
    } catch (e) { throw new AIProviderError(["TimeoutError", "AbortError"].includes((e as Error).name) ? "timeout" : "unavailable"); }
    if (res.status === 429) throw new AIProviderError("rate_limited");
    if (!res.ok) { console.error("[ai] provider status", res.status); throw new AIProviderError("unavailable"); }
    const j = (await res.json().catch(() => null)) as { choices?: { message?: { content?: string } }[] } | null;
    const text = j?.choices?.[0]?.message?.content?.trim();
    if (!text) throw new AIProviderError("empty");
    return { text: text.slice(0, 4000), shouldHandoff: (await this.classifyIntent(i.history.at(-1)?.text ?? "")) === "human_request" };
  }
}
