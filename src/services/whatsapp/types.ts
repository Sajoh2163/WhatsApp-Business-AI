export type IncomingMessage = { externalId: string; from: string; text: string; phoneNumberId: string; timestamp: number };
export interface WhatsAppService {
  sendMessage(i: { phoneNumberId: string; to: string; text: string }): Promise<{ externalId: string }>;
  markAsRead(i: { phoneNumberId: string; externalId: string }): Promise<void>;
  verifyWebhook(q: URLSearchParams): string | null;
  verifySignature(rawBody: string, signature: string | null): boolean;
  receiveMessage(payload: unknown): IncomingMessage[];
}
