import type { Appointment, Automation, Conversation, Customer, Dashboard, Message, Order, Product, Sender } from "../types/db";
/** Toute méthode exige organizationId : aucun accès « global » n'existe. */
export interface Repository {
  getDashboard(org: string): Promise<Dashboard>;
  listCustomers(org: string): Promise<Customer[]>;
  listConversations(org: string): Promise<Conversation[]>;
  listProducts(org: string): Promise<Product[]>;
  listOrders(org: string): Promise<Order[]>;
  listAppointments(org: string): Promise<Appointment[]>;
  listAutomations(org: string): Promise<Automation[]>;
  addMessage(org: string, conversationId: string, sender: Sender, body: string): Promise<Message>;
  setMode(org: string, conversationId: string, mode: "ai" | "human"): Promise<void>;
}
