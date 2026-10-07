import { redirect } from "next/navigation";
import { isDemo } from "./env";
import { supabaseServer } from "./supabase/server";
import type { Role } from "./rbac";
export type Tenant = { userId: string; orgId: string; role: Role; email: string };
/** Source unique du tenant : jamais lu depuis le client. */
export async function getTenant(): Promise<Tenant> {
  if (isDemo()) return { userId: "demo", orgId: "org_demo", role: "owner", email: "demo@relais.app" };
  const sb = await supabaseServer(), { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: m } = await sb.from("organization_members").select("organization_id, role").eq("user_id", user.id).limit(1).maybeSingle();
  if (!m) redirect("/auth/callback"); // crée l'organisation depuis user_metadata.org_name
  return { userId: user.id, orgId: m.organization_id, role: m.role as Role, email: user.email ?? "" };
}
