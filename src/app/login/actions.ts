"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
const email = z.string().email(), pw = z.string().min(8, "8 caractères minimum");
const fail = (path: string, msg: string): never => redirect(`${path}?error=${encodeURIComponent(msg)}`);
const origin = () => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export async function login(f: FormData) {
  const p = z.object({ email, password: pw }).safeParse(Object.fromEntries(f));
  if (!p.success) return fail("/login", "Email ou mot de passe invalide.");
  const { error } = await (await supabaseServer()).auth.signInWithPassword(p.data);
  if (error) fail("/login", "Identifiants incorrects.");
  redirect("/dashboard");
}
export async function signup(f: FormData) {
  const p = z.object({ email, password: pw, org_name: z.string().min(2).max(80) }).safeParse(Object.fromEntries(f));
  if (!p.success) return fail("/signup", p.error.issues[0]?.message ?? "Données invalides.");
  const { error } = await (await supabaseServer()).auth.signUp({ email: p.data.email, password: p.data.password, options: { data: { org_name: p.data.org_name }, emailRedirectTo: `${origin()}/auth/callback` } });
  if (error) fail("/signup", error.message);
  redirect("/login?error=Vérifiez votre email pour confirmer votre compte.");
}
export async function forgot(f: FormData) {
  await (await supabaseServer()).auth.resetPasswordForEmail(String(f.get("email")), { redirectTo: `${origin()}/auth/callback?next=/reset-password` });
  redirect("/forgot-password?error=Si ce compte existe, un email vient d'être envoyé.");
}
export async function resetPassword(f: FormData) {
  if (!pw.safeParse(f.get("password")).success) return fail("/reset-password", "8 caractères minimum");
  const { error } = await (await supabaseServer()).auth.updateUser({ password: String(f.get("password")) });
  if (error) fail("/reset-password", error.message);
  redirect("/dashboard");
}
export async function logout() { await (await supabaseServer()).auth.signOut(); redirect("/login"); }
