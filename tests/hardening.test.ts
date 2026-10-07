import test from "node:test"; import assert from "node:assert/strict"; import { randomBytes } from "node:crypto";
import { parseIncoming } from "../src/services/whatsapp/parse.ts";
import { allow } from "../src/lib/rate-limit.ts";
import { OpenAICompatibleAIService, AIProviderError } from "../src/services/ai/openai-compatible.ts";
import { encrypt } from "../src/lib/secrets.ts";
import { can, type Role, type Permission } from "../src/lib/rbac.ts";
import { AppError } from "../src/lib/errors.ts";
const payload = (msgs: any[], pid: any = "PN1") => ({ entry: [{ changes: [{ value: { metadata: { phone_number_id: pid }, contacts: [{ wa_id: "250788", profile: { name: "Aline" } }], messages: msgs } }] }] });
test("webhook : parse valide + ignore le malformé", () => {
  const ok = { id: "wamid.1", from: "250788", type: "text", text: { body: "Salut" } };
  assert.deepEqual(parseIncoming(payload([ok])), [{ externalId: "wamid.1", from: "250788", name: "Aline", text: "Salut", phoneNumberId: "PN1" }]);
  assert.equal(parseIncoming(payload([{ ...ok, type: "image" }, { ...ok, id: 5 }, { from: "x" }])).length, 0);
  assert.equal(parseIncoming(payload([ok], null)).length, 0);
  for (const bad of [null, "x", {}, { entry: "no" }, { entry: [null] }]) assert.deepEqual(parseIncoming(bad), []);
  assert.equal(parseIncoming(payload([{ ...ok, text: { body: "a".repeat(9000) } }]))[0]!.text.length, 4000);
});
test("rate limit : fenêtre fixe", () => {
  assert.ok(allow("k", 2, 1000, 0)); assert.ok(allow("k", 2, 1000, 1)); assert.ok(!allow("k", 2, 1000, 2)); assert.ok(allow("k", 2, 1000, 1001));
});
const resp = (status: number, body: unknown) => async () => new Response(JSON.stringify(body), { status });
const ai = (f: any) => new OpenAICompatibleAIService("http://x", "SECRET-KEY-123", "m", f, 50);
const input = { organizationId: "o", context: [], history: [{ role: "customer" as const, text: "bonjour" }] };
test("IA : succès, vide, 429, 500, timeout, réseau — sans fuite de clé", async () => {
  assert.equal((await ai(resp(200, { choices: [{ message: { content: " Bonjour ! " } }] })).generateResponse(input)).text, "Bonjour !");
  const kinds: [any, string][] = [[resp(200, { choices: [{ message: { content: "  " } }] }), "empty"], [resp(200, {}), "empty"], [resp(429, {}), "rate_limited"], [resp(500, { err: "SECRET-KEY-123" }), "unavailable"],
    [async () => { const e = new Error("t"); e.name = "TimeoutError"; throw e; }, "timeout"], [async () => { throw new Error("ECONNRESET SECRET-KEY-123"); }, "unavailable"]];
  for (const [f, kind] of kinds) await assert.rejects(ai(f).generateResponse(input), (e: any) => e instanceof AIProviderError && e.kind === kind && !e.message.includes("SECRET"));
});
test("secrets : clé invalide refusée, IV aléatoire", () => {
  assert.throws(() => encrypt("EAAB-token", "trop-court"), (e: any) => e.message === "INVALID_ENCRYPTION_KEY");
  const k = randomBytes(32).toString("hex"); assert.notEqual(encrypt("x", k), encrypt("x", k));
});
test("RBAC : matrice complète", () => {
  const all: Permission[] = ["conversations:write", "catalog:write", "settings:write", "team:write", "billing:write"];
  const exp: Record<Role, Permission[]> = { owner: all, admin: all.slice(0, 4), agent: ["conversations:write"] };
  for (const r of Object.keys(exp) as Role[]) for (const p of all) assert.equal(can(r, p), exp[r].includes(p), `${r}/${p}`);
});
test("AppError porte code et statut", () => { const e = new AppError("FORBIDDEN", "no", 403); assert.equal(e.code, "FORBIDDEN"); assert.equal(e.status, 403); });
