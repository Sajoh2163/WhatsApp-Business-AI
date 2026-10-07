import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
export async function GET(req: Request) {
  const url = new URL(req.url), code = url.searchParams.get("code"), n = url.searchParams.get("next") ?? "/dashboard";
  const next = n.startsWith("/") && !n.startsWith("//") ? n : "/dashboard"; // anti open-redirect
  const sb = await supabaseServer();
  if (code && (await sb.auth.exchangeCodeForSession(code)).error) return NextResponse.redirect(new URL("/login?error=Lien invalide ou expiré", url.origin));
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", url.origin));
  const { data: m } = await sb.from("organization_members").select("organization_id").eq("user_id", user.id).limit(1).maybeSingle();
  if (!m) {
    const { error } = await sb.rpc("create_organization", { org_name: String(user.user_metadata?.org_name ?? "Mon entreprise") });
    if (error) return NextResponse.redirect(new URL("/login?error=Création de l'organisation impossible", url.origin)); // évite une boucle de redirection
  }
  return NextResponse.redirect(new URL(next, url.origin));
}
