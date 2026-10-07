import { AuthForm } from "@/components/auth-form";
import { login } from "../login/actions";
export default async function P({ searchParams }: { searchParams: Promise<{ error?: string }> }) { return <AuthForm title="Connexion" action={login} fields={[{ name: "email", label: "Email", type: "email" }, { name: "password", label: "Mot de passe", type: "password" }]} cta="Se connecter" error={(await searchParams).error} />; }
