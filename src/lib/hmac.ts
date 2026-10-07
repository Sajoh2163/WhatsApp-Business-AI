import { createHmac, timingSafeEqual } from "node:crypto";
export function verifySignature(raw: string, header: string | null, secret: string) {
  if (!header || !secret) return false;
  const a = Buffer.from("sha256=" + createHmac("sha256", secret).update(raw).digest("hex")), b = Buffer.from(header);
  return a.length === b.length && timingSafeEqual(a, b);
}
