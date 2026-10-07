import type { SupabaseClient } from "@supabase/supabase-js";
import type { Repository } from "./types";
/** NON TESTÉ. Client lié à la session : RLS + filtre explicite organization_id (défense en profondeur). */
export class SupabaseRepository implements Repository {
  private sb: SupabaseClient;
  constructor(sb: SupabaseClient) { this.sb = sb; }
  private async rows(t: string, org: string, sel = "*") {
    const { data, error } = await this.sb.from(t).select(sel).eq("organization_id", org);
    if (error) throw new Error(error.message); return (data ?? []) as any[];
  }
  async getDashboard(org: string) {
    const [c, cu, o] = await Promise.all([this.rows("conversations", org), this.rows("customers", org), this.rows("orders", org)]);
    const rev = o.reduce((s, x) => s + x.total_cents / 100, 0), ai = c.filter((x) => x.mode === "ai").length;
    return { kpis: [{ label: "Conversations", value: String(c.length) }, { label: "Gérées par l'IA", value: c.length ? Math.round((ai / c.length) * 100) + " %" : "—" }, { label: "Clients", value: String(cu.length) }, { label: "Commandes", value: String(o.length) }, { label: "Revenu", value: rev + " $" }], series: [], usage: { used: 0, limit: 50 } /* TODO usage_records + plan */ };
  }
  async listCustomers(org: string) { return (await this.rows("customers", org, "*, orders(total_cents)")).map((c) => ({ ...c, orders: c.orders.length, spent: c.orders.reduce((s: number, o: any) => s + o.total_cents / 100, 0) })); }
  async listConversations(org: string) { return (await this.rows("conversations", org, "*, messages(*)")).map((c) => ({ ...c, unread: 0 })); }
  async listProducts(org: string) { return (await this.rows("products", org)).map((p) => ({ ...p, price: p.price_cents / 100 })); }
  async listOrders(org: string) { return (await this.rows("orders", org)).map((o) => ({ ...o, total: o.total_cents / 100, product_id: "", quantity: 1 })); }
  async listAppointments(org: string) { return this.rows("appointments", org); }
  async listAutomations(org: string) { return this.rows("automations", org); }
  async addMessage(org: string, cid: string, sender: any, body: string) {
    const { data, error } = await this.sb.from("messages").insert({ organization_id: org, conversation_id: cid, sender, body }).select().single();
    if (error) throw new Error(error.message); return data;
  }
  async setMode(org: string, cid: string, mode: string) {
    const { error } = await this.sb.from("conversations").update({ mode }).eq("organization_id", org).eq("id", cid);
    if (error) throw new Error(error.message);
  }
}
