"use server";

import { supabaseAdmin } from "@/utils/supabase/adminServerClient";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export type SubmitState = {
  ok: boolean;
  message?: string;
  error?: string;
};

export async function submitApplicationAction(
  _prev: SubmitState,
  formData: FormData
): Promise<SubmitState> {
  try {
    const payloadRaw = formData.get("payload") as string | null;
    if (!payloadRaw) return { ok: false, error: "Missing payload" };

    const payload = JSON.parse(payloadRaw);

    // ✅ PDF path now comes from client (after direct upload)
    const deck_pdf_path: string | null = payload?.company?.deckPdfPath ?? null;

    const toNum = (v: unknown) => {
      if (v === null || v === undefined || v === "") return null;
      const n =
        typeof v === "number" ? v : parseFloat(String(v).replace(/[, ]/g, ""));
      return Number.isFinite(n) ? n : null;
    };

    const hasCoFounderRaw = payload?.founder?.hasCoFounder as "yes" | "no" | undefined;
    const hasCoFounder = hasCoFounderRaw === "yes";

    const fundSpecific = payload?.fundSpecific ?? {};
    const ecom = fundSpecific?.ecomEcosystemBuilders ?? null;
    const b2b = fundSpecific?.b2bSaasAccel ?? null;
    const outlander = fundSpecific?.outlander ?? null;

    const ecomPlatforms =
      Array.isArray(ecom?.platforms) ? (ecom.platforms as string[]) : null;

    const supabase = supabaseAdmin();

    const { error: insErr } = await supabase.from("applications").insert({
      founder_first_name: payload?.founder?.firstName ?? null,
      founder_last_name: payload?.founder?.lastName ?? null,
      founder_email: payload?.founder?.email ?? null,
      founder_phone: payload?.founder?.phone ?? null,

      has_cofounder: hasCoFounder,
      cofounder_first_name: hasCoFounder ? payload?.founder?.cofounderFirstName ?? null : null,
      cofounder_last_name: hasCoFounder ? payload?.founder?.cofounderLastName ?? null : null,
      cofounder_email: hasCoFounder ? payload?.founder?.cofounderEmail ?? null : null,

      company_name: payload?.company?.name ?? null,
      company_website: payload?.company?.website ?? null,
      company_industries: payload?.company?.industries ?? null,
      company_region: payload?.company?.region ?? null,
      company_state: payload?.company?.state ?? null,

      elevator_pitch: payload?.company?.elevatorPitch ?? null,
      business_model: payload?.company?.businessModel ?? null,
      deck_link: payload?.company?.deckLink ?? null,

      deck_pdf_path,

      partners_selected: payload?.partnersSelected ?? null,
      competitions_selected: payload?.competitionsSelected ?? null,
      programs_selected: payload?.programsSelected ?? null,

      is_vc_backed: payload?.eligibility?.isVCBacked ?? null,

      b2b_saas_with_3mo_runway: payload?.eligibility?.b2bSaaSWith3MoRunway ?? null,
      sells_physical_product: payload?.eligibility?.sellsPhysicalProduct ?? null,
      has_founder_over_50: payload?.eligibility?.hasFounderOver50 ?? null,
      has_black_founder: payload?.eligibility?.hasBlackFounder ?? null,
      has_female_founder: payload?.eligibility?.hasFemaleFounder ?? null,
      is_foreign_born_founder_in_us: payload?.eligibility?.isForeignBornFounderInUS ?? null,
      wants_other_competitions: payload?.eligibility?.wantsOtherCompetitions ?? null,

      fundraising_stage: payload?.financials?.fundraisingStage ?? null,
      raise_amount: toNum(payload?.financials?.raiseAmount),
      valuation: toNum(payload?.financials?.valuation),
      mrr: toNum(payload?.financials?.mrr),
      burn_rate: toNum(payload?.financials?.burnRate),
      previously_raised: toNum(payload?.financials?.previouslyRaised),
      runway_months: toNum(payload?.financials?.runwayMonths),

      ecom_customer_count: toNum(ecom?.customerCount),
      ecom_plans_merchants: typeof ecom?.plansMerchants === "boolean" ? ecom.plansMerchants : null,
      ecom_platforms: ecomPlatforms,

      b2b_incorporated_us: typeof b2b?.incorporatedUS === "boolean" ? b2b.incorporatedUS : null,
      b2b_trailing_12mo_revenue: toNum(b2b?.trailing12MoRevenue),

      outlander_has_technical_10pct:
        typeof outlander?.hasTechnicalLead10pct === "boolean" ? outlander.hasTechnicalLead10pct : null,
    });

    if (insErr) return { ok: false, error: insErr.message };

    (await cookies()).set("form:submitted", "1", { path: "/", maxAge: 60 });
    revalidatePath("/Lvlup");

    return { ok: true, message: "Application submitted successfully." };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Unknown error" };
  }
}