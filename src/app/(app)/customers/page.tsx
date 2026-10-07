import { Table } from "@/components/ui/table";
import { getRepo } from "@/repositories";
import { getTenant } from "@/lib/session";
export default async function Page() {
  const t = await getTenant(), d = await (await getRepo()).listCustomers(t.orgId);
  return <><h1 className="mb-4 text-2xl font-extrabold">Clients</h1><Table cols={["Nom","Téléphone","Commandes","Total","Tags"]} rows={d.map((c) => [c.name, c.phone, c.orders, c.spent + " $", c.tags.join(", ")])} empty="Aucun client pour l'instant." /></>;
}
