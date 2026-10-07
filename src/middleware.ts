import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
const AUTH = ["/login", "/signup", "/forgot-password", "/reset-password"];
const PUBLIC = ["/login", "/signup", "/forgot-password", "/reset-password", "/auth", "/api/webhooks"];
export async function middleware(req: NextRequest) {
  if (process.env.DEMO_MODE !== "false") return AUTH.some((x) => req.nextUrl.pathname.startsWith(x)) ? NextResponse.redirect(new URL("/dashboard", req.url)) : NextResponse.next(); // pas de Supabase en démo
  let res = NextResponse.next({ request: req });
  const sb = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies: { getAll: () => req.cookies.getAll(), setAll: (l) => { l.forEach(({ name, value }) => req.cookies.set(name, value)); res = NextResponse.next({ request: req }); l.forEach(({ name, value, options }) => res.cookies.set(name, value, options)); } } });
  const { data: { user } } = await sb.auth.getUser(), p = req.nextUrl.pathname;
  if (!user && p !== "/" && !PUBLIC.some((x) => p.startsWith(x))) return NextResponse.redirect(new URL("/login", req.url));
  return res;
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
