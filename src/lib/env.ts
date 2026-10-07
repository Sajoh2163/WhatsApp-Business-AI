import { z } from "zod";
const schema = z.object({
  DEMO_MODE: z.enum(["true", "false"]).default("true"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  AI_PROVIDER: z.enum(["demo", "openai-compatible"]).default("demo"),
  AI_API_KEY: z.string().optional(),
  AI_BASE_URL: z.string().url().optional(),
  AI_MODEL: z.string().optional(),
  WHATSAPP_PROVIDER: z.enum(["mock", "cloud"]).default("mock"),
  WHATSAPP_VERIFY_TOKEN: z.string().optional(),
  WHATSAPP_APP_SECRET: z.string().optional(),
  SECRETS_ENCRYPTION_KEY: z.string().length(64).optional(),
}).superRefine((e, c) => {
  if (e.DEMO_MODE === "false" && (!e.NEXT_PUBLIC_SUPABASE_URL || !e.NEXT_PUBLIC_SUPABASE_ANON_KEY)) c.addIssue({ code: "custom", message: "Supabase URL/clé requises quand DEMO_MODE=false" });
  if (e.AI_PROVIDER === "openai-compatible" && !(e.AI_API_KEY && e.AI_BASE_URL && e.AI_MODEL)) c.addIssue({ code: "custom", message: "AI_API_KEY, AI_BASE_URL, AI_MODEL requis" });
  if (e.WHATSAPP_PROVIDER === "cloud" && !(e.WHATSAPP_APP_SECRET && e.WHATSAPP_VERIFY_TOKEN && e.SECRETS_ENCRYPTION_KEY)) c.addIssue({ code: "custom", message: "Variables WhatsApp cloud incomplètes" });
});
export const env = () => schema.parse(process.env);
export const isDemo = () => env().DEMO_MODE === "true";
