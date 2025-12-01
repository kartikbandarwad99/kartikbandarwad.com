"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { supabaseServer } from "@/utils/supabase/serverClient";
import { validateCsrfToken } from "@/utils/security/csrf";

// whitelist origins
const ALLOWED_ORIGINS = new Set<string>([
  process.env.NEXT_PUBLIC_SITE_URL || "",
  "http://localhost:3000",
]);

// ---------- Zod schema for founders (aligned with new form) ----------
const founderBaseSchema = z.object({
  userType: z.literal("founder"),

  foundername: z.string(),
  founderemail: z.string().email(),

  companyName: z.string(),

  // website is required and must look like a URL (https:// or www.)
  website: z
    .string()
    .min(1, "Website is required")
    .refine(
      (v) => /^(https?:\/\/|www\.)\S+$/i.test(v),
      "Enter a valid URL (including https:// or www.)"
    ),

  country: z.string(),
  stage: z.string(),
  industries: z.array(z.string()).nonempty(),

  oneLinePitch: z.string(),
  companyDescription: z.string(),

  currentlyRaising: z.enum(["yes", "no"]),

  // numbers – frontend already validates, server just coerces
  totalRaisedToDate: z.coerce.number(),
  roundTarget: z.coerce.number(),
  roundCommitted: z.coerce.number(),

  businessModel: z.enum(["saas", "non-saas"]),
  currentArr: z.coerce.number().optional(),
  ttmRevenue: z.coerce.number().optional(),
  momGrowth: z.coerce.number(),

  fundingTimeline: z.string().optional(),
  investorPreference: z.string().optional(),

  canShareSummary: z.enum(["yes", "no"]),
  canShareDetailsIfInterested: z.enum(["yes", "no"]).optional(),

  pitchDeckLink: z
    .string()
    .min(1, "Pitch deck link is required")
    .refine(
      (v) => /^(https?:\/\/|www\.)\S+$/i.test(v),
      "Enter a valid URL (including https:// or www.)"
    ),

  // populated after upload (if any)
  pitchDeckFileUrl: z.string().optional(),

  // team info
  isRepeatFounder: z.enum(["yes", "no"]),
  hasTechnicalFounder: z.enum(["yes", "no"]),
  teamSize: z.coerce.number(),
  teamSummary: z.string(),

  founderLinkedin: z
    .string()
    .min(1, "LinkedIn is required")
    .refine(
      (v) => /^https?:\/\/(www\.)?linkedin\.com\//i.test(v),
      "Enter a valid LinkedIn URL"
    ),
});

// conditional SaaS / non-SaaS checks
const founderSchema = founderBaseSchema.superRefine((data, ctx) => {
  if (data.businessModel === "saas") {
    if (data.currentArr === undefined || Number.isNaN(data.currentArr)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["currentArr"],
        message: "Current ARR is required for SaaS",
      });
    }
  }

  if (data.businessModel === "non-saas") {
    if (data.ttmRevenue === undefined || Number.isNaN(data.ttmRevenue)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["ttmRevenue"],
        message: "TTM Revenue is required for Non-SaaS",
      });
    }
  }
});

export async function submitEntity(formData: FormData) {
  // 1) Origin check
  const hdrs = await headers();
  const origin =
    hdrs.get("origin") ?? hdrs.get("x-forwarded-origin") ?? "";
  if (!ALLOWED_ORIGINS.has(origin)) {
    throw new Error("Disallowed origin");
  }

  // 2) CSRF check
  await validateCsrfToken(formData.get("csrfToken")?.toString());

  // 3) Ensure founder type
  const userType = formData.get("userType");
  if (userType !== "founder") {
    throw new Error("Invalid user type");
  }

  const supabase = await supabaseServer();

  // ---------- Pitch deck file upload (optional) ----------
  const pitchDeckFile = formData.get("pitchDeckFile") as File | null;
  let pitchDeckFileUrl: string | undefined;

  if (pitchDeckFile && pitchDeckFile.size > 0) {
    const arrayBuffer = await pitchDeckFile.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const ext = (pitchDeckFile.name.split(".").pop() || "pdf").toLowerCase();

    const emailSafe = (formData.get("founderemail")?.toString() || "anon")
      .toLowerCase()
      .replace(/[^a-z0-9@._-]/g, "_");

    const companySafe = (formData.get("companyName")?.toString() || "startup")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_");

    // YYYY-MM-DD
    const date = new Date().toISOString().split("T")[0];
    const fileName = `${companySafe}_pitch_deck_${date}.${ext}`;
    const objectName = `${emailSafe}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("founder-decks") // ensure this bucket exists
      .upload(objectName, bytes, {
        contentType: pitchDeckFile.type || "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      console.error("Error uploading pitch deck:", uploadError);
    } else {
      const { data } = supabase.storage
        .from("founder-decks")
        .getPublicUrl(objectName);
      pitchDeckFileUrl = data.publicUrl;
    }
  }

  // ---------- Build payload from FormData ----------
  const payload = {
    userType: "founder" as const,

    foundername: formData.get("foundername")?.toString() ?? "",
    founderemail: formData.get("founderemail")?.toString() ?? "",

    companyName: formData.get("companyName")?.toString() ?? "",
    website: formData.get("website")?.toString() ?? "",

    country: formData.get("country")?.toString() ?? "",
    stage: formData.get("stage")?.toString() ?? "",
    industries: JSON.parse(formData.get("industries")?.toString() ?? "[]"),

    oneLinePitch: formData.get("oneLinePitch")?.toString() ?? "",
    companyDescription: formData.get("companyDescription")?.toString() ?? "",

    currentlyRaising: formData.get("currentlyRaising")?.toString() as
      | "yes"
      | "no",

    totalRaisedToDate:
      formData.get("totalRaisedToDate")?.toString() ?? "",
    roundTarget: formData.get("roundTarget")?.toString() ?? "",
    roundCommitted:
      formData.get("roundCommitted")?.toString() ?? "",

    businessModel: formData.get("businessModel")?.toString() as
      | "saas"
      | "non-saas",
    currentArr: formData.get("currentArr")?.toString() || undefined,
    ttmRevenue: formData.get("ttmRevenue")?.toString() || undefined,
    momGrowth: formData.get("momGrowth")?.toString() ?? "",

    fundingTimeline:
      formData.get("fundingTimeline")?.toString() || undefined,
    investorPreference:
      formData.get("investorPreference")?.toString() || undefined,

    canShareSummary: formData.get("canShareSummary")?.toString() as
      | "yes"
      | "no",
    canShareDetailsIfInterested:
      (formData.get("canShareDetailsIfInterested")?.toString() as
        | "yes"
        | "no"
        | undefined) || undefined,

    pitchDeckLink: formData.get("pitchDeckLink")?.toString() ?? "",
    pitchDeckFileUrl,

    isRepeatFounder: formData.get("isRepeatFounder")?.toString() as
      | "yes"
      | "no",
    hasTechnicalFounder: formData.get("hasTechnicalFounder")?.toString() as
      | "yes"
      | "no",
    teamSize: formData.get("teamSize")?.toString() ?? "0",
    teamSummary: formData.get("teamSummary")?.toString() ?? "",
    founderLinkedin: formData.get("founderLinkedin")?.toString() ?? "",
  };

  // ---------- Validate with Zod ----------
  const parsed = founderSchema.parse(payload);

  // ---------- Insert into Supabase ----------
  const { error } = await supabase.from("founders").insert({
    founder_name: parsed.foundername,
    founder_email: parsed.founderemail,

    company_name: parsed.companyName,
    website: parsed.website ?? null,

    country: parsed.country,
    stage: parsed.stage,
    industries: parsed.industries,
    one_line_pitch: parsed.oneLinePitch,
    company_description: parsed.companyDescription,

    currently_raising: parsed.currentlyRaising,
    total_raised_to_date: parsed.totalRaisedToDate,
    round_target: parsed.roundTarget,
    round_committed: parsed.roundCommitted,

    business_model: parsed.businessModel,
    current_arr: parsed.currentArr ?? null,
    ttm_revenue: parsed.ttmRevenue ?? null,
    mom_growth: parsed.momGrowth,

    funding_timeline: parsed.fundingTimeline ?? null,
    investor_preference: parsed.investorPreference ?? null,

    can_share_summary: parsed.canShareSummary,
    can_share_details_if_interested:
      parsed.canShareDetailsIfInterested ?? null,

    pitch_deck_link: parsed.pitchDeckLink,
    pitch_deck_file_url: parsed.pitchDeckFileUrl ?? null,

    // Team fields – make sure these columns exist in your "founders" table
    is_repeat_founder: parsed.isRepeatFounder,
    has_technical_founder: parsed.hasTechnicalFounder,
    team_size: parsed.teamSize,
    team_summary: parsed.teamSummary,
    founder_linkedin: parsed.founderLinkedin,
  });

  if (error) throw error;

  return { ok: true, type: "founder" };
}