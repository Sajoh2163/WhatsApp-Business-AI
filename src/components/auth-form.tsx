import { Button } from "./ui/button";
import { Card } from "./ui/card";
type F = { name: string; label: string; type?: string };
export function AuthForm({ title, action, fields, cta, error }: { title: string; action: (f: FormData) => Promise<void>; fields: F[]; cta: string; error?: string }) {
  return <main className="grid min-h-screen place-items-center p-6"><Card className="w-full max-w-sm p-6"><h1 className="mb-4 text-2xl font-extrabold">{title}</h1>
    {error && <p role="alert" className="mb-3 rounded-lg bg-amber-100 p-2 text-sm text-amber-900">{error}</p>}
    <form action={action} className="grid gap-3">{fields.map((f) => <label key={f.name} className="grid gap-1 text-sm font-semibold">{f.label}<input name={f.name} type={f.type ?? "text"} required className="rounded-lg border border-line bg-bg p-2 font-normal" /></label>)}<Button variant="primary" type="submit">{cta}</Button></form>
    <nav className="mt-4 flex justify-between text-sm text-mut"><a href="/login">Connexion</a><a href="/signup">Créer un compte</a><a href="/forgot-password">Mot de passe oublié</a></nav></Card></main>;
}
