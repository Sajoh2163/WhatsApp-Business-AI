import { Table } from "@/components/ui/table";
import { getRepo } from "@/repositories";
import { getTenant } from "@/lib/session";
export default async function Page() {
  const t = await getTenant(), d = await (await getRepo()).listAppointments(t.orgId);
  return <><h1 className="mb-4 text-2xl font-extrabold">Rendez-vous</h1><Table cols={["Date","Statut"]} rows={d.map((a) => [a.starts_at.slice(0, 16).replace("T", " "), a.status])} empty="Aucun rendez-vous." /></>;
}
