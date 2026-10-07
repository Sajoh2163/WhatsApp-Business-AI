import type { WhatsAppService, IncomingMessage } from "./types";
export class MockWhatsAppService implements WhatsAppService {
  sent: { to: string; text: string }[] = [];
  async sendMessage(i: { to: string; text: string }) { this.sent.push(i); return { externalId: `mock_${Date.now()}` }; }
  async markAsRead() {}
  verifyWebhook(q: URLSearchParams) { return q.get("hub.challenge"); }
  verifySignature() { return true; }
  receiveMessage(p: unknown): IncomingMessage[] { return (p as { messages?: IncomingMessage[] }).messages ?? []; }
}
