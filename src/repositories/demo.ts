import { buildSeed } from "./seed.ts";
export const DEMO_ORG = "org_demo";
/** DEMO : données en mémoire du processus serveur. */
export class DemoRepository {
  db: any = buildSeed(DEMO_ORG);
  own(org: string, rows: any[]) { return org === DEMO_ORG ? rows : []; }
  async getDashboard(org: string) {
    if (org !== DEMO_ORG) return { kpis: [], series: [], usage: { used: 0, limit: 50 } };
    const d = this.db, rev = d.orders.reduce((s: number, o: any) => s + o.total, 0), ai = d.conversations.filter((c: any) => c.mode === "ai").length;
    return { kpis: [{ label: "Conversations", value: String(d.conversations.length) }, { label: "Gérées par l'IA", value: Math.round((ai / d.conversations.length) * 100) + " %" }, { label: "Clients", value: String(d.customers.length) }, { label: "Commandes", value: String(d.orders.length) }, { label: "Revenu", value: rev + " $" }], series: d.series, usage: { used: 45, limit: 50 } };
  }
  async listCustomers(org: string) {
    return this.own(org, this.db.customers).map((c: any) => { const o = this.db.orders.filter((x: any) => x.customer_id === c.id); return { ...c, orders: o.length, spent: o.reduce((s: number, x: any) => s + x.total, 0) }; });
  }
  async listConversations(org: string) { return this.own(org, this.db.conversations); }
  async listProducts(org: string) { return this.own(org, this.db.products); }
  async listOrders(org: string) { return this.own(org, this.db.orders); }
  async listAppointments(org: string) { return this.own(org, this.db.appointments); }
  async listAutomations(org: string) { return this.own(org, this.db.automations); }
  async addMessage(org: string, cid: string, sender: string, body: string) {
    const c = this.own(org, this.db.conversations).find((x: any) => x.id === cid);
    if (!c) throw new Error("NOT_FOUND");
    const m = { id: `${cid}m${c.messages.length}`, organization_id: org, conversation_id: cid, sender, body, created_at: new Date().toISOString() };
    c.messages.push(m); c.unread = sender === "customer" ? c.unread + 1 : 0; return m;
  }
  async setMode(org: string, cid: string, mode: string) {
    const c = this.own(org, this.db.conversations).find((x: any) => x.id === cid);
    if (!c) throw new Error("NOT_FOUND"); c.mode = mode;
  }
}
