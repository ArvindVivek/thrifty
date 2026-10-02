// KL Web 1.0.3, from kitchenlabs-kit/web/kl-web/lib/supabase/admin.ts. Kit-owned: change it in the kit, then run scripts/sync-web-kit.sh.
// Service-role Supabase client: bypasses RLS. Server only; `import "server-only"` makes an
// import from client code a build error (from templates/supabase-admin.ts).
//
// SUPABASE_SERVICE_ROLE_KEY lives in the Vercel project env (never with a NEXT_PUBLIC_ prefix)
// and, locally, in .env.local copied from kitchenlabs-kit/.env (gitignored).
import "server-only";
import { createClient } from "@supabase/supabase-js";
import { requiredEnv } from "./server";

function createAdmin() {
  return createClient(requiredEnv("NEXT_PUBLIC_SUPABASE_URL"), requiredEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    db: { schema: requiredEnv("NEXT_PUBLIC_SUPABASE_SCHEMA") },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

let admin: ReturnType<typeof createAdmin> | null = null;

/** Built lazily, so `next build` never needs the key. Use it only for work the caller can't do. */
export function supabaseAdmin() {
  admin ??= createAdmin();
  return admin;
}
