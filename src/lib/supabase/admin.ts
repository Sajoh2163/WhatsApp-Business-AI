import { createClient } from "@supabase/supabase-js";
import { env } from "../env";
/** SERVEUR UNIQUEMENT (service_role : contourne la RLS). Jamais depuis un composant client. */
export function supabaseAdmin() {
  const e = env();
  if (!e.NEXT_PUBLIC_SUPABASE_URL || !e.SUPABASE_SERVICE_ROLE_KEY) throw new Error("ADMIN_CLIENT_NOT_CONFIGURED");
  return createClient(e.NEXT_PUBLIC_SUPABASE_URL, e.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
}
