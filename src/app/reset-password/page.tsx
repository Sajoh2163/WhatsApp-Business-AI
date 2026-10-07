import { AuthForm } from "@/components/auth-form";
import { resetPassword } from "../login/actions";
export default async function P({ searchParams }: { searchParams: Promise<{ error?: string }> }) { return <AuthForm title="Nouveau mot de passe" action={resetPassword} fields={[{ name: "password", label: "Mot de passe", type: "password" }]} cta="Enregistrer" error={(await searchParams).error} />; }
