"use server";

import { supabaseServer } from "@/utils/supabase/serverClient";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function submitApplicationAction(formData: FormData): Promise<void> {
  const payloadRaw = formData.get("payload") as string | null;
  const file = formData.get("pitchDeckPdf") as File | null;

  if (!payloadRaw) throw new Error("Missing payload");

  const payload = JSON.parse(payloadRaw);

  const supabase = await supabaseServer();

  // ------------------------------
  // 1) Upload PDF to Supabase Storage
  // ------------------------------
  let deck_pdf_path: string | null = null;

  if (file && file.size > 0) {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    const ext = (file.name.split(".").pop() || "pdf").toLowerCase();

    // safe folder (email)
    const emailSafe = (payload?.founder?.email || "anon")
      .toLowerCase()
      .replace(/[^a-z0-9@._-]/g, "_");

    // safe company name
    const companySafe = (payload?.company?.name || "startup")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_");

    // date string: YYYY-MM-DD
    const date = new Date().toISOString().split("T")[0];

    // final filename
    const fileName = `${companySafe}_pitch_deck_${date}.${ext}`;
    const objectName = `${emailSafe}/${fileName}`;

    const { data: up, error: upErr } = await supabase.storage
      .from("pitch-decks")
      .upload(objectName, bytes, {
        contentType: file.type || "application/pdf",
        upsert: false,
      });

    if (upErr) throw upErr;
    deck_pdf_path = up?.path ?? objectName;
  }

  // ------------------------------
  // 2) Insert DB row in public.applications
  // ------------------------------

  const toNum = (v: unknown) => {
    if (v === null || v === undefined || v === "") return null;
    const n = typeof v === "number" ? v : parseFloat(String(v).replace(/[, ]/g, ""));
    return Number.isFinite(n) ? n : null;
  };

  const { error: insErr } = await supabase
    .from("applications")
    .insert({
      founder_first_name: payload.founder.firstName ?? null,
      founder_last_name: payload.founder.lastName ?? null,
      founder_email: payload.founder.email ?? null,
      founder_phone: payload.founder.phone ?? null,

      company_name: payload.company.name ?? null,
      company_website: payload.company.website ?? null,
      company_industries: payload.company.industries ?? null,
      company_region: payload.company.region ?? null,
      elevator_pitch: payload.company.elevatorPitch ?? null,
      deck_link: payload.company.deckLink ?? null,

      deck_pdf_path,

      partners_selected: payload.partnersSelected ?? null,
      competitions_selected: payload.competitionsSelected ?? null,
      programs_selected: payload.programsSelected ?? null,

      b2b_saas_with_3mo_runway: payload.eligibility.b2bSaaSWith3MoRunway ?? null,
      sells_physical_product: payload.eligibility.sellsPhysicalProduct ?? null,
      has_founder_over_50: payload.eligibility.hasFounderOver50 ?? null,
      has_black_founder: payload.eligibility.hasBlackFounder ?? null,
      has_female_founder: payload.eligibility.hasFemaleFounder ?? null,
      is_foreign_born_founder_in_us: payload.eligibility.isForeignBornFounderInUS ?? null,
      wants_other_competitions: payload.eligibility.wantsOtherCompetitions ?? null,

      fundraising_stage: payload.financials.fundraisingStage ?? null,
      raise_amount: toNum(payload.financials.raiseAmount),
      valuation: toNum(payload.financials.valuation),
      mrr: toNum(payload.financials.mrr),
      burn_rate: toNum(payload.financials.burnRate),
      previously_raised: toNum(payload.financials.previouslyRaised),
    })
    .single();

  if (insErr) throw insErr;

  // UX toast cookie + refresh
  (await cookies()).set("form:submitted", "1", { path: "/", maxAge: 60 });
  revalidatePath("/");
}