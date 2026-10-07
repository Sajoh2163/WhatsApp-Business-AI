import { Table } from "@/components/ui/table";
import { getRepo } from "@/repositories";
import { getTenant } from "@/lib/session";
export default async function Page() {
  const t = await getTenant(), d = await (await getRepo()).listProducts(t.orgId);
  return <><h1 className="mb-4 text-2xl font-extrabold">Produits</h1><Table cols={["Produit","Catégorie","Prix","Stock"]} rows={d.map((p) => [p.name, p.category, p.price + " $", p.stock])} empty="Ajoutez votre premier produit." /></>;
}
