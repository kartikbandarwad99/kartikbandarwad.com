// app/submit/csrf-actions.ts
"use server";

import { cookies } from "next/headers";
import { randomBytes } from "crypto";

export async function prepareCsrf(): Promise<string> {
  const token = randomBytes(32).toString("hex");
  (await cookies()).set("csrf_token", token, {
    httpOnly: true,
    // ❗ secure only in production, else cookie won't be set on localhost
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  return token;
}