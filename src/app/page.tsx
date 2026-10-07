import { Card } from "@/components/ui/card";
import { isDemo } from "@/lib/env";
export default function Home() { return <main className="mx-auto max-w-3xl p-10"><h1 className="text-4xl font-extrabold">Relais</h1><Card className="mt-6 p-5">{isDemo() ? "Mode démo actif" : "Mode réel"} — landing à migrer depuis le prototype.</Card></main>; }
