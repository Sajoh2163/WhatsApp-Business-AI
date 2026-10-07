import { AuthForm } from "@/components/auth-form";
import { signup } from "../login/actions";
export default async function P({ searchParams }: { searchParams: Promise<{ error?: string }> }) { return <AuthForm title="Créer un compte" action={signup} fields={[{ name: "org_name", label: "Nom de l'entreprise" }, { name: "email", label: "Email", type: "email" }, { name: "password", label: "Mot de passe", type: "password" }]} cta="Créer mon compte" error={(await searchParams).error} />; }
