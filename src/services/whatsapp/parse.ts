export type Inbound = { externalId: string; from: string; name?: string; text: string; phoneNumberId: string };
/** Extraction défensive du payload Meta : ignore tout ce qui n'est pas un message texte bien formé. */
export function parseIncoming(p: unknown): Inbound[] {
  const out: Inbound[] = [], entries = (p as any)?.entry;
  if (!Array.isArray(entries)) return out;
  for (const e of entries) for (const c of e?.changes ?? []) {
    const v = c?.value, pid = v?.metadata?.phone_number_id;
    if (typeof pid !== "string") continue;
    for (const m of v?.messages ?? []) {
      if (m?.type !== "text" || typeof m?.id !== "string" || typeof m?.from !== "string" || typeof m?.text?.body !== "string") continue;
      const name = (v?.contacts ?? []).find?.((x: any) => x?.wa_id === m.from)?.profile?.name;
      out.push({ externalId: m.id, from: m.from, name: typeof name === "string" ? name.slice(0, 120) : undefined, text: m.text.body.slice(0, 4000), phoneNumberId: pid });
    }
  }
  return out;
}
