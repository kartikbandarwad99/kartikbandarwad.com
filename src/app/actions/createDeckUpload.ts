"use server";

import { supabaseAdmin } from "@/utils/supabase/adminServerClient";

export type SignedUpload = {
  path: string;
  token: string;
  signedUrl: string;
};

function safeEmail(s: string) {
  return (s || "anon").toLowerCase().replace(/[^a-z0-9@._-]/g, "_");
}
function safeCompany(s: string) {
  return (s || "startup").toLowerCase().replace(/[^a-z0-9]+/g, "_");
}

export async function createDeckUploadAction(input: {
  email: string;
  company: string;
  ext?: string;
}): Promise<SignedUpload> {
  const supabase = supabaseAdmin();

  const emailSafe = safeEmail(input.email);
  const companySafe = safeCompany(input.company);
  const date = new Date().toISOString().split("T")[0];
  const ext = (input.ext || "pdf").toLowerCase();

  const fileName = `${companySafe}_pitch_deck_${date}.${ext}`;
  const path = `${emailSafe}/${fileName}`;

  const { data, error } = await supabase.storage
    .from("pitch-decks")
    .createSignedUploadUrl(path);

  if (error || !data) throw new Error(error?.message || "Failed to create signed upload URL");

  return { path: data.path, token: data.token, signedUrl: data.signedUrl };
}