// utils/supabase/adminServerClient.ts
import { createClient } from "@supabase/supabase-js";

// If you have a generated Database type, you can do:
// import type { Database } from "@/types/supabase";
// const supabaseAdmin = createClient<Database>(...)

export function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  // IMPORTANT: service role key is server-only, never exposed to the client
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
    db: { schema: "public" },
  });
}