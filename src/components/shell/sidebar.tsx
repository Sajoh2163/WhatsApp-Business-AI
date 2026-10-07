"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
const L = [["dashboard","Dashboard"],["inbox","Inbox"],["customers","Clients"],["products","Produits"],["orders","Commandes"],["appointments","Rendez-vous"]];
export function Sidebar() {
  const p = usePathname();
  return <nav aria-label="Navigation principale" className="fixed inset-x-0 bottom-0 z-10 flex border-t border-line bg-card p-1 md:static md:w-52 md:flex-col md:gap-1 md:border-r md:border-t-0 md:p-3">
    <span className="mb-3 hidden px-3 text-lg font-extrabold md:block">Relais</span>
    {L.map(([h, l]) => <Link key={h} href={`/${h}`} aria-current={p === `/${h}` ? "page" : undefined} className={`flex-1 rounded-lg px-3 py-2 text-center text-xs font-semibold md:flex-none md:text-left md:text-sm ${p === `/${h}` ? "tint text-acc" : "text-mut"}`}>{l}</Link>)}</nav>;
}
