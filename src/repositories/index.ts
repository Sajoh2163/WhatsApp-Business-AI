import { isDemo } from "@/lib/env";
import { supabaseServer } from "@/lib/supabase/server";
import { DemoRepository } from "./demo";
import { SupabaseRepository } from "./supabase";
import type { Repository } from "./types";
const g = globalThis as unknown as { __demo?: DemoRepository };
export async function getRepo(): Promise<Repository> {
  if (isDemo()) return (g.__demo ??= new DemoRepository()) as unknown as Repository;
  return new SupabaseRepository(await supabaseServer());
}
