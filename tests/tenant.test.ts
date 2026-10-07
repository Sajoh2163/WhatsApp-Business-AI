import test from "node:test"; import assert from "node:assert/strict";
import { DemoRepository, DEMO_ORG } from "../src/repositories/demo.ts";
test("seed : volumes demandés", () => {
  const d = new DemoRepository().db;
  assert.deepEqual([d.conversations.length, d.customers.length, d.products.length, d.orders.length, d.appointments.length, d.automations.length], [20, 15, 10, 12, 8, 5]);
});
test("seed : intégrité référentielle", () => {
  const d = new DemoRepository().db, ids = (a: any[]) => new Set(a.map((x) => x.id)), cu = ids(d.customers), pr = ids(d.products);
  assert.ok(d.orders.every((o: any) => cu.has(o.customer_id) && pr.has(o.product_id)));
  assert.ok(d.conversations.every((c: any) => cu.has(c.customer_id)));
  assert.ok(d.appointments.every((a: any) => cu.has(a.customer_id)));
});
test("isolation : une autre organisation ne voit ni n'écrit rien", async () => {
  const r = new DemoRepository();
  for (const f of ["listCustomers", "listConversations", "listProducts", "listOrders", "listAppointments"] as const) assert.equal((await r[f]("org_autre")).length, 0);
  await assert.rejects(r.addMessage("org_autre", "cv0", "human", "x"), /NOT_FOUND/);
  await assert.rejects(r.setMode("org_autre", "cv0", "human"), /NOT_FOUND/);
  assert.equal((await r.listCustomers(DEMO_ORG)).length, 15);
});
test("handoff : setMode puis message", async () => {
  const r = new DemoRepository(); await r.setMode(DEMO_ORG, "cv0", "human"); await r.addMessage(DEMO_ORG, "cv0", "human", "Bonjour");
  assert.equal(r.db.conversations[0].mode, "human"); assert.equal(r.db.conversations[0].messages.at(-1).body, "Bonjour");
});
