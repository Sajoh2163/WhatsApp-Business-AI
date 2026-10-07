/** TEMPORAIRE : écrit à la main d'après supabase/migrations. Remplacer par `supabase gen types typescript`. */
export type Sender = "customer" | "ai" | "human";
export type OrderStatus = "new" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
export type Message = { id: string; organization_id: string; conversation_id: string; sender: Sender; body: string; created_at: string };
export type Customer = { id: string; organization_id: string; name: string; phone: string; tags: string[]; orders: number; spent: number };
export type Conversation = { id: string; organization_id: string; customer_id: string; mode: "ai" | "human"; unread: number; messages: Message[] };
export type Product = { id: string; organization_id: string; name: string; price: number; stock: number; category: string; active: boolean };
export type Order = { id: string; organization_id: string; number: number; customer_id: string; product_id: string; quantity: number; total: number; status: OrderStatus; created_at: string };
export type Appointment = { id: string; organization_id: string; customer_id: string; starts_at: string; status: string };
export type Automation = { id: string; organization_id: string; name: string; enabled: boolean };
export type Dashboard = { kpis: { label: string; value: string }[]; series: { day: string; value: number }[]; usage: { used: number; limit: number } };
