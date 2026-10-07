import { env } from "@/lib/env";
import { DemoAIService } from "./demo";
import { OpenAICompatibleAIService } from "./openai-compatible";
import type { AIService } from "./types";
export function getAIService(): AIService {
  const e = env();
  return e.AI_PROVIDER === "openai-compatible" ? new OpenAICompatibleAIService(e.AI_BASE_URL!, e.AI_API_KEY!, e.AI_MODEL!) : new DemoAIService();
}
