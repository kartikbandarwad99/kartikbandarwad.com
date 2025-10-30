// utils/supabase/serverClient.ts
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

async function getCookieStore() {
  const maybe = cookies() as unknown;
  if (maybe && typeof (maybe as any).then === "function") {
    return await (maybe as Promise<ReturnType<typeof cookies>>);
  }
  return maybe as ReturnType<typeof cookies>;
}

type CookieTuple = [string, string, Record<string, any>?];
type CookieObject = { name: string; value: string; options?: Record<string, any> };
type CookieBatch = Array<CookieTuple | CookieObject>;

export async function supabaseServer() {
  const cookieStore = await getCookieStore();

  const url = process.env.SUPABASE_URL!;        // server-only
  const anon = process.env.SUPABASE_ANON_KEY!;  // server-only (use SERVICE_ROLE only in trusted server contexts)

  return createServerClient(url, anon, {
    cookies: {
      getAll: () => cookieStore.getAll().map((c) => ({ name: c.name, value: c.value })),
    // Next.js allows setting cookies inside Server Actions / Route Handlers
      setAll: (batch: CookieBatch) => {
        for (const entry of batch) {
          if (Array.isArray(entry)) {
            const [name, value, options] = entry;
            cookieStore.set(name, value, options);
          } else {
            cookieStore.set(entry.name, entry.value, entry.options);
          }
        }
      },
    },
    // 👇 IMPORTANT: point the client at your Data API schema
    db: { schema: "public" },
  });
}