"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getRepo } from "@/repositories";
import { getTenant } from "@/lib/session";
import { isDemo } from "@/lib/env";
import { requirePermission } from "@/lib/rbac";
import { getAIService } from "@/services/ai";
const id = z.string().min(1).max(64);
async function ctx() { const t = await getTenant(); requirePermission(t.role, "conversations:write"); return { t, repo: await getRepo() }; }
export async function sendMessage(cid: string, body: string) {
  const { t, repo } = await ctx(); await repo.addMessage(t.orgId, id.parse(cid), "human", z.string().min(1).max(2000).parse(body)); revalidatePath("/inbox");
}
export async function setMode(cid: string, mode: "ai" | "human") { const { t, repo } = await ctx(); await repo.setMode(t.orgId, id.parse(cid), z.enum(["ai", "human"]).parse(mode)); revalidatePath("/inbox"); }
export async function simulateIncoming(cid: string) {
  if (!isDemo()) throw new Error("FORBIDDEN"); // jamais de faux messages en production
  const { t, repo } = await ctx(), conv = (await repo.listConversations(t.orgId)).find((c) => c.id === id.parse(cid)); if (!conv) throw new Error("NOT_FOUND");
  const text = ["Quel est le prix du portefeuille ?", "Vous livrez le jour même ?"][Math.floor(Math.random() * 2)]!;
  await repo.addMessage(t.orgId, conv.id, "customer", text);
  if (conv.mode === "ai") { // l'IA ne répond que si elle est active
    const history = [...conv.messages.map((m) => ({ role: m.sender, text: m.body })), { role: "customer" as const, text }];
    let r; try { r = await getAIService().generateResponse({ organizationId: t.orgId, history, context: [] }); } catch { await repo.setMode(t.orgId, conv.id, "human"); revalidatePath("/inbox"); return; } // IA en échec -> transfert humain
    await repo.addMessage(t.orgId, conv.id, "ai", r.text); if (r.shouldHandoff) await repo.setMode(t.orgId, conv.id, "human");
  }
  revalidatePath("/inbox");
}
