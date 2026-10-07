import { getRepo } from "@/repositories";
import { getTenant } from "@/lib/session";
import { Card } from "@/components/ui/card";
export default async function Page() {
  const t = await getTenant(), d = await (await getRepo()).getDashboard(t.orgId), max = Math.max(1, ...d.series.map((s) => s.value));
  const pts = d.series.map((s, i) => `${10 + i * (540 / Math.max(1, d.series.length - 1))},${150 - (s.value / max) * 130}`).join(" ");
  return <><h1 className="mb-4 text-2xl font-extrabold">Dashboard</h1>
    {d.usage.used >= d.usage.limit * 0.9 && <Card role="alert" className="mb-4 border-amber-600 p-3"><b>You're approaching your monthly limit.</b> {d.usage.used}/{d.usage.limit} conversations IA.</Card>}
    <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-5">{d.kpis.map((k) => <Card key={k.label} className="p-4"><span className="text-sm text-mut">{k.label}</span><b className="block text-2xl">{k.value}</b></Card>)}</div>
    <Card className="p-4"><b>Conversations (14 jours)</b>{d.series.length ? <svg viewBox="0 0 560 160" className="w-full" role="img" aria-label="Courbe des conversations"><polyline points={pts} fill="none" stroke="var(--acc)" strokeWidth="2.5" /></svg> : <p className="text-mut">Pas encore de données.</p>}</Card></>;
}
