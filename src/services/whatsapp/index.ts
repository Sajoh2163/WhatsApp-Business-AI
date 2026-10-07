import { env } from "@/lib/env";
import { decrypt } from "@/lib/secrets";
import { MockWhatsAppService } from "./mock";
import { WhatsAppCloudService } from "./cloud";
import type { WhatsAppService } from "./types";
/** Token propre à l'organisation : valeur chiffrée lue côté serveur (whatsapp_accounts.token_encrypted). */
export function getWhatsAppService(tokenEncrypted?: string): WhatsAppService {
  const e = env();
  if (e.WHATSAPP_PROVIDER !== "cloud") return new MockWhatsAppService();
  const token = tokenEncrypted ? decrypt(tokenEncrypted, e.SECRETS_ENCRYPTION_KEY!) : "";
  return new WhatsAppCloudService(token, e.WHATSAPP_VERIFY_TOKEN!, e.WHATSAPP_APP_SECRET!);
}
