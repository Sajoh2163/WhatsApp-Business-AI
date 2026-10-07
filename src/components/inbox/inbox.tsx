"use client";
import { useState, useTransition } from "react";
import type { Conversation, Customer } from "@/types/db";
import { sendMessage, setMode, simulateIncoming } from "@/app/(app)/inbox/actions";
export function Inbox({ conversations, customers }: { conversations: Conversation[]; customers: Customer[] }) {
  const [sel, setSel] = useState<string | null>(null), [text, setText] = useState(""), [pending, run] = useTransition();
  const conv = conversations.find((c) => c.id === sel), cu = (c: Conversation) => customers.find((x) => x.id === c.customer_id);
  if (!conversations.length) return <p className="p-10 text-center text-mut">No conversations yet. Once customers start messaging you, conversations will appear here.</p>;
  const me = conv && cu(conv), human = conv?.mode === "human";
  return <div className="grid h-[calc(100vh-170px)] overflow-hidden rounded-xl border border-line bg-card md:grid-cols-[280px_1fr_230px]">
    <ul className={`overflow-auto border-r border-line ${conv ? "hidden md:block" : ""}`}>{conversations.map((c) => <li key={c.id}><button onClick={() => setSel(c.id)} className={`w-full border-b border-line p-3 text-left ${c.id === sel ? "bg-bg" : ""}`}><b>{cu(c)?.name}</b><p className="truncate text-sm text-mut">{c.messages.at(-1)?.body}</p></button></li>)}</ul>
    {conv && me ? <><section className="flex min-h-0 flex-col"><div className="flex flex-wrap items-center justify-between gap-2 border-b border-line p-3"><span><button className="mr-2 md:hidden" onClick={() => setSel(null)} aria-label="Retour">←</button><b>{me.name}</b></span>
      <span className="flex gap-2"><span className="rounded-full tint px-3 py-1 text-xs font-bold">{human ? "Human" : "AI Active"}</span>
      <button disabled={pending} onClick={() => run(() => setMode(conv.id, human ? "ai" : "human"))} className="rounded-lg border border-line px-3 text-sm font-semibold">{human ? "Return to AI" : "Take over"}</button>
      <button disabled={pending} onClick={() => run(() => simulateIncoming(conv.id))} className="rounded-lg border border-line px-3 text-sm font-semibold">Simuler un message</button></span></div>
      <div className="flex-1 space-y-2 overflow-auto p-4" aria-live="polite">{conv.messages.map((m) => <div key={m.id} className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${m.sender === "customer" ? "bg-bg" : "ml-auto tint"}`}>{m.body}<small className="block text-mut">{m.sender === "ai" ? "IA" : m.sender === "human" ? "Équipe" : ""}</small></div>)}</div>
      <form className="flex gap-2 border-t border-line p-3" onSubmit={(e) => { e.preventDefault(); if (text) run(async () => { await sendMessage(conv.id, text); setText(""); }); }}><input value={text} onChange={(e) => setText(e.target.value)} disabled={!human} aria-label="Message" placeholder={human ? "Écrire un message…" : "Prenez la main pour écrire"} className="flex-1 rounded-lg border border-line bg-bg px-3 py-2 disabled:opacity-50" /><button disabled={!human || pending} className="rounded-lg bg-acc px-4 font-semibold text-white disabled:opacity-50">Envoyer</button></form></section>
      <aside className="hidden border-l border-line p-4 text-sm md:block"><b className="text-lg">{me.name}</b><p className="text-mut">{me.phone}</p><p className="mt-3">{me.orders} commandes · {me.spent} $</p><p className="mt-2">{me.tags.join(", ")}</p></aside></> : <p className="hidden place-items-center text-mut md:grid">Sélectionnez une conversation</p>}</div>;
}
