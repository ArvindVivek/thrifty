// KL Web 1.0.2, from kitchenlabs-kit/web/kl-web/lib/supabase/server.ts. Kit-owned: change it in the kit, then run scripts/sync-web-kit.sh.
// Server Supabase client that acts as the caller, so RLS applies (from
// templates/supabase-admin.ts). Route handlers and server components only.
// The service-role client is in admin.ts.
import "server-only";
import { createClient } from "@supabase/supabase-js";

/** Reads an env var at first use, so `next build` never throws for a missing value. */
export function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}`);
  return value;
}

function bearer(req: Request): string {
  return (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
}

/**
 * A client that acts as the caller. Reads `Authorization: Bearer <token>`: the browser client
 * keeps its session in localStorage, so cookie-only auth made every phone call look signed out
 * (chiquitos-ukiyo). Send the token with accessToken() from browser.ts.
 */
export function supabaseForRequest(req: Request) {
  const token = bearer(req);
  return createClient(requiredEnv("NEXT_PUBLIC_SUPABASE_URL"), requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"), {
    db: { schema: requiredEnv("NEXT_PUBLIC_SUPABASE_SCHEMA") },
    global: token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** The signed-in caller (anonymous guests included), or null. */
export async function getCaller(req: Request) {
  const token = bearer(req);
  if (!token) return null;
  const { data, error } = await supabaseForRequest(req).auth.getUser(token);
  return error ? null : data.user;
}

/*
Usage in a route handler (app/api/items/route.ts):

import { getCaller, supabaseForRequest } from "@/lib/kl/supabase/server";

export async function GET(req: Request) {
  const user = await getCaller(req);
  if (!user) return Response.json({ error: { code: "unauthorized", message: "Please sign in." } }, { status: 401 });
  const { data } = await supabaseForRequest(req).from("items").select("*"); // RLS applies
  return Response.json({ items: data ?? [] });
}
*/
