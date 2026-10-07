import test from "node:test"; import assert from "node:assert/strict"; import { createHmac, randomBytes } from "node:crypto";
import { DemoAIService } from "../src/services/ai/demo.ts";
import { verifySignature } from "../src/lib/hmac.ts"; import { encrypt, decrypt } from "../src/lib/secrets.ts";
test("DemoAIService : intention et transfert", async () => {
  const ai = new DemoAIService(), h = (text: string) => ({ organizationId: "o", context: [], history: [{ role: "customer" as const, text }] });
  assert.equal(await ai.classifyIntent("Quel est le prix ?"), "price");
  assert.equal((await ai.generateResponse(h("Je veux un remboursement"))).shouldHandoff, true);
  assert.equal((await ai.generateResponse(h("bonjour"))).shouldHandoff, false);
});
test("signature webhook WhatsApp", () => {
  const body = '{"a":1}', sig = "sha256=" + createHmac("sha256", "s3cret").update(body).digest("hex");
  assert.ok(verifySignature(body, sig, "s3cret")); assert.ok(!verifySignature(body + " ", sig, "s3cret")); assert.ok(!verifySignature(body, null, "s3cret")); assert.ok(!verifySignature(body, sig, ""));
});
test("chiffrement des tokens", () => {
  const k = randomBytes(32).toString("hex"), c = encrypt("EAAB-token", k);
  assert.equal(decrypt(c, k), "EAAB-token"); assert.ok(!c.includes("EAAB")); assert.throws(() => decrypt(c, randomBytes(32).toString("hex")));
});
