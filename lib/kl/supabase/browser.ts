// KL Web 1.0.2, from kitchenlabs-kit/web/kl-web/lib/supabase/browser.ts. Kit-owned: change it in the kit, then run scripts/sync-web-kit.sh.
// Browser Supabase client for a Kitchen Labs web app (from templates/supabase-browser.ts).
//
// Uses only public values: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and
// NEXT_PUBLIC_SUPABASE_SCHEMA (the app's schema on the shared instance). The service-role
// client is in admin.ts and must never be imported from here or any "use client" file.
// Guide: docs/web/supabase-and-auth.md and docs/backend/auth.md.
"use client";

import { createClient, type User } from "@supabase/supabase-js";

// Literal process.env reads: Next only inlines public env vars written exactly this way.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const schema = process.env.NEXT_PUBLIC_SUPABASE_SCHEMA;

/** False when the env vars are absent: the app then runs local-only instead of crashing. */
export const supabaseConfigured = Boolean(url && anonKey && schema);

function create() {
  return createClient(url!, anonKey!, {
    db: { schema: schema! },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: `${schema}-auth`, // one login per app on the same origin
    },
  });
}

export type AppClient = ReturnType<typeof create>;
let client: AppClient | null = null;

/** The one browser client, or null when Supabase isn't configured. */
export function getSupabase(): AppClient | null {
  if (!supabaseConfigured) return null;
  client ??= create();
  return client;
}

function requireSupabase(): AppClient {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured (NEXT_PUBLIC_SUPABASE_* missing).");
  return supabase;
}

// Auth helpers (profiles-per-schema pattern). auth.users is shared by every Kitchen Labs app;
// <schema>.profiles decides who is in THIS app. Show people authErrorMessage(), never raw text.

/** Creates this app's profile if it doesn't exist yet (never overwrites an existing one). */
async function ensureProfile(user: User, displayName?: string) {
  const { error } = await requireSupabase()
    .from("profiles")
    .upsert(
      { id: user.id, ...(displayName ? { display_name: displayName } : {}) },
      { onConflict: "id", ignoreDuplicates: true },
    );
  if (error) throw error;
}

/**
 * Sign up and join this app. If the email already has a Kitchen Labs login (another app), the
 * password is checked by signing in, then the profile for this app is created.
 */
export async function signUpWithProfile(email: string, password: string, displayName?: string) {
  const supabase = requireSupabase();
  const { data, error } = await supabase.auth.signUp({ email, password });

  // An existing login shows up either as an "already registered" error or, with email
  // confirmation off (as on the shared instance), as a user with no identities.
  const isExistingUser =
    error?.message?.includes("already registered") ||
    (data?.user && (!data.user.identities || data.user.identities.length === 0));
  if (error && !isExistingUser) throw error;

  if (isExistingUser) {
    const { data: signedIn, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) throw signInError;
    await ensureProfile(signedIn.user, displayName);
    return { user: signedIn.user, isExistingUser: true };
  }

  if (data.user) await ensureProfile(data.user, displayName);
  return { user: data.user, isExistingUser: false };
}

/**
 * Sign in. Pick the app's rule once and write it in the app's CLAUDE.md:
 * - joinIfMissing: false (default): a login without a profile for this app is signed out and
 *   refused (Flow).
 * - joinIfMissing: true: "one Kitchen Labs account", a missing profile is created (Loop).
 */
export async function signInWithProfile(
  email: string,
  password: string,
  { joinIfMissing = false }: { joinIfMissing?: boolean } = {},
) {
  const supabase = requireSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  if (joinIfMissing) {
    await ensureProfile(data.user);
    return data;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", data.user.id)
    .maybeSingle();
  if (profileError) throw profileError;
  if (!profile) {
    await supabase.auth.signOut();
    throw new Error("no_profile");
  }
  return data;
}

export async function signOut() {
  const { error } = await requireSupabase().auth.signOut();
  if (error) throw error;
}

/** Access token to send as `Authorization: Bearer` to your own API routes, or null. */
export async function accessToken(): Promise<string | null> {
  const { data } = (await getSupabase()?.auth.getSession()) ?? { data: { session: null } };
  return data.session?.access_token ?? null;
}

/**
 * A plain sentence for any auth error. Logs the real one; never falls back to the raw message
 * (Loop's humanize() did, and people saw "AuthApiError: ...").
 */
export function authErrorMessage(err: unknown): string {
  console.error("[auth]", err);
  const raw = String((err as { message?: unknown } | null)?.message ?? err).toLowerCase();
  if (raw.includes("no_profile")) return "There's no account for this app with that email yet. Sign up first.";
  if (raw.includes("invalid login credentials")) return "That email and password don't match an account.";
  if (raw.includes("already registered")) return "That email already has an account. Try signing in.";
  if (raw.includes("password") && raw.includes("characters")) return "Use a password with at least 6 characters.";
  if (raw.includes("rate limit") || raw.includes("too many")) return "Too many attempts just now. Wait a minute and try again.";
  if (raw.includes("network") || raw.includes("fetch")) return "We couldn't reach the server. Check your connection and try again.";
  return "Something went wrong signing you in. Please try again.";
}
