import { createHmac, timingSafeEqual } from "node:crypto";
import { AppError } from "@/lib/errors";
import type { WhatsAppService, IncomingMessage } from "./types";
/** NON TESTÉ contre l'API Meta. Le token vient du stockage serveur, jamais du client. */
export class WhatsAppCloudService implements WhatsAppService {
  constructor(private accessToken: string, private verifyToken: string, private appSecret: string) {}
  private async call(phoneNumberId: string, body: object) {
    const r = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, { method: "POST", headers: { Authorization: `Bearer ${this.accessToken}`, "Content-Type": "application/json" }, body: JSON.stringify({ messaging_product: "whatsapp", ...body }) });
    if (!r.ok) throw new AppError("EXTERNAL", "We couldn't reach WhatsApp.", 502);
    return r.json() as Promise<{ messages?: { id: string }[] }>;
  }
  async sendMessage(i: { phoneNumberId: string; to: string; text: string }) {
    const j = await this.call(i.phoneNumberId, { to: i.to, type: "text", text: { body: i.text } });
    return { externalId: j.messages?.[0]?.id ?? "" };
  }
  async markAsRead(i: { phoneNumberId: string; externalId: string }) { await this.call(i.phoneNumberId, { status: "read", message_id: i.externalId }); }
  verifyWebhook(q: URLSearchParams) { return q.get("hub.mode") === "subscribe" && q.get("hub.verify_token") === this.verifyToken ? q.get("hub.challenge") : null; }
  verifySignature(raw: string, sig: string | null) {
    if (!sig || !this.appSecret) return false;
    const exp = Buffer.from("sha256=" + createHmac("sha256", this.appSecret).update(raw).digest("hex")), got = Buffer.from(sig);
    return exp.length === got.length && timingSafeEqual(exp, got);
  }
  receiveMessage(p: any): IncomingMessage[] {
    return (p?.entry ?? []).flatMap((e: any) => e.changes ?? []).flatMap((c: any) => (c.value?.messages ?? []).map((m: any) => ({ externalId: m.id, from: m.from, text: m.text?.body ?? "", phoneNumberId: c.value.metadata?.phone_number_id, timestamp: Number(m.timestamp) })));
  }
}
