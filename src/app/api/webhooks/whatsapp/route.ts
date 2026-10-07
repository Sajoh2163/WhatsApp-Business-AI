import { env } from "@/lib/env";
import { verifySignature } from "@/lib/hmac";
import { allow } from "@/lib/rate-limit";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { parseIncoming } from "@/services/whatsapp/parse";
const MAX = 256 * 1024;
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams, t = env().WHATSAPP_VERIFY_TOKEN;
  if (t && q.get("hub.mode") === "subscribe" && q.get("hub.verify_token") === t) return new Response(q.get("hub.challenge") ?? "", { status: 200 });
  return new Response("Forbidden", { status: 403 });
}
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!allow(`wh:${ip}`, 600, 60_000)) return new Response("Too many requests", { status: 429 });
  const secret = env().WHATSAPP_APP_SECRET; // fail-closed : sans secret, rien n'est accepté, même en provider mock
  if (!secret) return new Response("Not configured", { status: 503 });
  if (Number(req.headers.get("content-length") ?? 0) > MAX) return new Response("Too large", { status: 413 });
  const raw = await req.text();
  if (raw.length > MAX) return new Response("Too large", { status: 413 });
  if (!verifySignature(raw, req.headers.get("x-hub-signature-256"), secret)) return new Response("Invalid signature", { status: 401 });
  let payload: unknown; try { payload = JSON.parse(raw); } catch { return new Response("Bad request", { status: 400 }); }
  const sb = supabaseAdmin(); let stored = 0, skipped = 0;
  for (const m of parseIncoming(payload)) {
    // Organisation déduite en base depuis phone_number_id ; idempotence par (organization_id, external_id).
    const { data, error } = await sb.rpc("ingest_whatsapp_message", { p_phone_number_id: m.phoneNumberId, p_from: m.from, p_name: m.name ?? null, p_external_id: m.externalId, p_body: m.text });
    if (error) { console.error("[webhook] ingest failed", error.code); return new Response("Error", { status: 500 }); } // 5xx => Meta réessaie, sans doublon
    if (data?.status === "stored") stored++; else skipped++;
  }
  return Response.json({ stored, skipped });
}
