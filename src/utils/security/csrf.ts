// utils/security/csrf.ts
import { cookies } from "next/headers";
import { randomBytes, timingSafeEqual } from "crypto";

/** Support environments where cookies() might be sync or async */
async function getCookieStore() {
  const maybe = cookies() as unknown;
  if (maybe && typeof (maybe as any).then === "function") {
    return await (maybe as Promise<ReturnType<typeof cookies>>);
  }
  return maybe as ReturnType<typeof cookies>;
}

const CSRF_COOKIE = "csrf_token";

/** Mint a CSRF token, store in HttpOnly cookie, return the token to embed in a hidden input */
export async function issueCsrfToken(): Promise<string> {
  const cookieStore = await getCookieStore();
  const token = randomBytes(32).toString("hex");

  cookieStore.set(CSRF_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });

  return token;
}

/** Validate submitted token against cookie (throws on failure) */
export async function validateCsrfToken(submitted: string | null | undefined) {
  const cookieStore = await getCookieStore();

  const stored = cookieStore.get(CSRF_COOKIE)?.value ?? "";
  const got = submitted ?? "";

  if (!stored || !got) throw new Error("Invalid CSRF token");

  const a = Buffer.from(stored, "utf8");
  const b = Buffer.from(got, "utf8");

  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error("Invalid CSRF token");
  }
}