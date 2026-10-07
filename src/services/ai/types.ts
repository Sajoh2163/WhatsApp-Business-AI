export type Msg = { role: "customer" | "ai" | "human"; text: string };
export type Intent = "price" | "order" | "booking" | "complaint" | "human_request" | "other";
export interface AIService {
  generateResponse(i: { organizationId: string; history: Msg[]; context: string[] }): Promise<{ text: string; shouldHandoff: boolean }>;
  classifyIntent(text: string): Promise<Intent>;
  summarizeConversation(history: Msg[]): Promise<string>;
  extractCustomerData(history: Msg[]): Promise<{ name?: string; phone?: string; email?: string }>;
  searchKnowledge(organizationId: string, query: string): Promise<string[]>; // RAG : pgvector (knowledge_chunks)
}
