// utils/supabase/serverClient.ts
"use server";

import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function supabaseServer() {
  // In newer Next.js versions, cookies() can be awaited safely
  const cookieStore = await cookies();

  return createServerClient(
    process.env.SUPABASE_URL!,        // or NEXT_PUBLIC_SUPABASE_URL if you're using that
    process.env.SUPABASE_ANON_KEY!,   // or NEXT_PUBLIC_SUPABASE_ANON_KEY
    {
      cookies: {
        // ✅ new API: getAll + setAll (no deprecation)
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component (where cookies can't be mutated).
            // Safe to ignore if you're not doing auth session refresh here.
          }
        },
      },
      db: { schema: "public" },
    }
  );
}