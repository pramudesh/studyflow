import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env";

/**
 * Admin client — uses the service-role key and BYPASSES Row Level Security.
 * Only use this for operations that must run with elevated trust
 * (e.g. the handle_new_user bootstrap, admin tooling). Never expose this
 * client or its key to the frontend.
 */
export const supabaseAdmin: SupabaseClient = createClient(
  env.supabase.url,
  env.supabase.serviceRoleKey,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

/**
 * Per-request client — built from the caller's own access token, so every
 * query made with it is subject to Postgres Row Level Security as that
 * specific user. This is the client almost all route handlers should use.
 */
export function supabaseForUser(accessToken: string): SupabaseClient {
  return createClient(env.supabase.url, env.supabase.anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  });
}

/**
 * Plain anon client — no user context. Used for signup/login/refresh,
 * where there's no access token yet.
 */
export const supabaseAnon: SupabaseClient = createClient(
  env.supabase.url,
  env.supabase.anonKey,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
