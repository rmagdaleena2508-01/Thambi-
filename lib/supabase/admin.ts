import "server-only";
import { createClient } from "@supabase/supabase-js";

// Server-only client with the service key. Used only after the caller's identity
// and ownership have been checked. Returns null when the key isn't configured,
// so the app degrades safely (reports stay "pending" for a moderator).
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
