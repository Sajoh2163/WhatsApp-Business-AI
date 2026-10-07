import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
/** AES-256-GCM. Format iv.tag.data (base64) -> whatsapp_accounts.token_encrypted. */
const chk = (k: string) => { if (!/^[0-9a-f]{64}$/i.test(k)) throw new Error("INVALID_ENCRYPTION_KEY"); };
export function encrypt(plain: string, keyHex: string) {
  chk(keyHex);
  const iv = randomBytes(12), c = createCipheriv("aes-256-gcm", Buffer.from(keyHex, "hex"), iv);
  const d = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  return [iv, c.getAuthTag(), d].map((b) => b.toString("base64")).join(".");
}
export function decrypt(blob: string, keyHex: string) {
  chk(keyHex);
  const [iv, tag, d] = blob.split(".").map((s) => Buffer.from(s, "base64"));
  const c = createDecipheriv("aes-256-gcm", Buffer.from(keyHex, "hex"), iv!); c.setAuthTag(tag!);
  return Buffer.concat([c.update(d!), c.final()]).toString("utf8");
}
