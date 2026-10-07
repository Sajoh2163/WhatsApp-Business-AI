import { AuthForm } from "@/components/auth-form";
import { forgot } from "../login/actions";
export default async function P({ searchParams }: { searchParams: Promise<{ error?: string }> }) { return <AuthForm title="Mot de passe oublié" action={forgot} fields={[{ name: "email", label: "Email", type: "email" }]} cta="Envoyer le lien" error={(await searchParams).error} />; }
