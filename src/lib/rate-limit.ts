/** Fenêtre fixe EN MÉMOIRE : non partagée entre instances serverless. Garde-fou, pas protection finale. */
const hits = new Map<string, { n: number; reset: number }>();
export function allow(key: string, limit: number, windowMs: number, now = Date.now()) {
  if (hits.size > 10000) for (const [k, h] of hits) if (now >= h.reset) hits.delete(k);
  const h = hits.get(key);
  if (!h || now >= h.reset) { hits.set(key, { n: 1, reset: now + windowMs }); return true; }
  if (h.n >= limit) return false;
  h.n++; return true;
}
