import { Table } from "@/components/ui/table";
import { getRepo } from "@/repositories";
import { getTenant } from "@/lib/session";
export default async function Page() {
  const t = await getTenant(), d = await (await getRepo()).listOrders(t.orgId);
  return <><h1 className="mb-4 text-2xl font-extrabold">Commandes</h1><Table cols={["N°","Montant","Statut","Date"]} rows={d.map((o) => ["#" + o.number, o.total + " $", o.status, o.created_at.slice(0, 10)])} empty="Les commandes apparaîtront ici." /></>;
}
