import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "../env";
/** Client lié à la session utilisateur : la RLS s'applique. */
export async function supabaseServer() {
  const c = await cookies(), e = env();
  return createServerClient(e.NEXT_PUBLIC_SUPABASE_URL, e.NEXT_PUBLIC_SUPABASE_ANON_KEY, { cookies: { getAll: () => c.getAll(), setAll: (l) => l.forEach(({ name, value, options }) => c.set(name, value, options)) } });
}
