import type { AIService, Intent } from "./types";
/** DEMO : règles par mots-clés. Aucune IA réelle. */
export class DemoAIService implements AIService {
  async classifyIntent(t: string): Promise<Intent> {
    t = t.toLowerCase();
    if (/humain|human|agent/.test(t)) return "human_request";
    if (/rembours|réclam|abîm|refund/.test(t)) return "complaint";
    if (/prix|combien|price/.test(t)) return "price";
    if (/table|rendez-vous|réserv|book/.test(t)) return "booking";
    return /command|order|prends/.test(t) ? "order" : "other";
  }
  async generateResponse({ history }: Parameters<AIService["generateResponse"]>[0]) {
    const intent = await this.classifyIntent(history.at(-1)?.text ?? "");
    const handoff = intent === "human_request" || intent === "complaint";
    return { shouldHandoff: handoff, text: handoff ? "Je transfère votre demande à l'équipe." : "Bien noté ! Souhaitez-vous que je prépare la commande ?" };
  }
  async summarizeConversation(h: Parameters<AIService["summarizeConversation"]>[0]) { return `${h.length} messages échangés.`; }
  async extractCustomerData() { return {}; }
  async searchKnowledge() { return []; }
}
