import { Sidebar } from "@/components/shell/sidebar";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { getTenant } from "@/lib/session";
import { isDemo } from "@/lib/env";
import { logout } from "../login/actions";
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const t = await getTenant();
  return <div className="min-h-screen md:flex"><Sidebar /><div className="min-w-0 flex-1 pb-16 md:pb-0">
    <header className="flex items-center justify-end gap-3 border-b border-line bg-card px-5 py-3">
      {isDemo() && <span className="rounded-full tint px-3 py-1 text-xs font-bold text-acc">Demo Mode</span>}
      <ThemeToggle /><span className="hidden text-sm text-mut sm:inline">{t.email} · {t.role}</span>
      {!isDemo() && <form action={logout}><button className="text-sm font-semibold">Déconnexion</button></form>}</header>
    <main className="p-5">{children}</main></div></div>;
}
