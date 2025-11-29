"use client";

import { useEffect, useState } from "react";
import { useForm, Controller, FieldErrors } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import countryList from "react-select-country-list";
import Select, { GroupBase } from "react-select";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select as ShadSelect,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import BackgroundFX from "@/components/BackgroundFX";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";

import { submitEntity } from "../actions/submit-entry";
import { prepareCsrf } from "@/app/submit/csrf-actions";
import type { DragEvent } from "react";

// ---------- react-select unified dark styles ----------
const customStyles = {
  control: (base: any, state: { isFocused: boolean }) => ({
    ...base,
    backgroundColor: "transparent",
    borderColor: state.isFocused ? "#bef264" : "#404040",
    borderWidth: 1,
    borderRadius: 6,
    minHeight: 40,
    boxShadow: "none",
    paddingLeft: 2,
    paddingRight: 2,
    "&:hover": { borderColor: "#bef264" },
  }),
  valueContainer: (base: any) => ({ ...base, paddingLeft: 8, paddingRight: 8 }),
  input: (base: any) => ({ ...base, color: "#fff", backgroundColor: "transparent", margin: 0, padding: 0 }),
  placeholder: (base: any) => ({ ...base, color: "#a3a3a3" }),
  singleValue: (base: any) => ({ ...base, color: "#fff" }),
  multiValue: (base: any) => ({ ...base, backgroundColor: "#262626", borderRadius: 6, padding: "2px 6px" }),
  multiValueLabel: (base: any) => ({ ...base, color: "#fff", fontWeight: 500 }),
  multiValueRemove: (base: any) => ({
    ...base,
    color: "#bef264",
    cursor: "pointer",
    ":hover": { backgroundColor: "#bef264", color: "#000", borderRadius: 4 },
  }),
  menu: (base: any) => ({
    ...base,
    backgroundColor: "#111111",
    border: "1px solid #404040",
    borderRadius: 8,
    overflow: "hidden",
    zIndex: 50,
  }),
  option: (base: any, state: { isFocused: boolean; isSelected: boolean }) => ({
    ...base,
    backgroundColor: state.isSelected ? "#2a2a2a" : state.isFocused ? "#222222" : "#111111",
    color: "#fff",
    ":active": { backgroundColor: "#333333" },
  }),
  indicatorsContainer: (base: any) => ({ ...base, backgroundColor: "transparent" }),
  indicatorSeparator: (base: any) => ({ ...base, backgroundColor: "#404040" }),
};

type OptionType = { value: string; label: string };

const stageOptions: OptionType[] = [
  { value: "idea", label: "Idea" },
  { value: "mvp", label: "MVP" },
  { value: "pre-seed", label: "Pre-Seed" },
  { value: "seed", label: "Seed" },
  { value: "series-a", label: "Series A" },
  { value: "series-b", label: "Series B" },
  { value: "series-c", label: "Series C" },
  { value: "series-d", label: "Series D and Beyond" },
];

const IndustryOptions: string[] = [
  "AI / Machine Learning",
  "ClimateTech",
  "Consumer Tech",
  "Web3 / Crypto",
  "Developer Tools",
  "Fintech",
  "HealthTech",
  "Productivity Tools",
  "Data & Analytics",
  "Social Platforms",
  "Enterprise / B2B SaaS",
  "Hardware / Devices",
  "Cloud / Infrastructure",
  "Deeptech (e.g., robotics, quantum, semiconductors)",
  "Mobility / Transportation / EVs",
  "Education / EdTech",
  "Marketplace",
  "E-commerce",
  "Media / Content / Creator Economy",
  "Security / Cybersecurity",
  "Gaming",
  "LegalTech / GovTech",
  "Other (please specify)",
];

const BusinessModelOptions = [
  { value: "saas", label: "SaaS / Subscription-based" },
  { value: "non-saas", label: "Non-SaaS / Other" },
];

const blurOnWheel = (e: any) => (e.currentTarget as HTMLInputElement).blur();

const yesNoField = (label: string) =>
  z
    .string()
    .min(1, `${label} is required`)
    .refine((v) => v === "yes" || v === "no", `${label} is required`);

const requiredNumberField = (label: string) =>
  z
    .string()
    .min(1, `${label} is required`)
    .transform((v) => v.trim())
    .refine(
      (v) => {
        const s = v.replace(/[^0-9.]/g, "");
        return s !== "" && !Number.isNaN(Number(s));
      },
      `${label} must be a number`
    );

const optionalNumberField = (label: string) =>
  z
    .string()
    .optional()
    .transform((v) => (v ?? "").trim())
    .refine(
      (v) => {
        if (!v) return true;
        const s = v.replace(/[^0-9.]/g, "");
        return s !== "" && !Number.isNaN(Number(s));
      },
      `${label} must be a number`
    );

// -------- Zod Schema (Founders only) --------
const founderBase = z.object({
  userType: z.literal("founder"),

  foundername: z
    .string()
    .min(1, "Founder name is required")
    .min(2, "Founder name must be at least 2 characters")
    .max(50, "Founder name can be at most 50 characters"),

  founderemail: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),

  companyName: z
    .string()
    .min(1, "Company name is required")
    .min(2, "Company name must be at least 2 characters")
    .max(80, "Company name can be at most 80 characters"),

  website: z
    .string()
    .min(1, "Website is required")
    .refine(
      (v) => /^(https?:\/\/|www\.)\S+$/i.test(v),
      "Enter a valid URL (including https:// or www.)"
    ),

  country: z.string().min(1, "Headquartered at is required"),
  stage: z.string().min(1, "Stage is required"),

  industries: z
    .array(z.string())
    .min(1, "Industries is required"),

  oneLinePitch: z
    .string()
    .min(1, "One-line pitch is required")
    .min(10, "One-line pitch must be at least 10 characters")
    .max(140, "One-line pitch can be at most 140 characters"),

  companyDescription: z
    .string()
    .min(1, "Company description is required")
    .min(20, "Company description must be at least 20 characters")
    .max(500, "Company description can be at most 500 characters"),

  pitchDeckLink: z
    .string()
    .min(1, "Pitch deck link is required")
    .refine(
      (v) => /^(https?:\/\/|www\.)\S+$/i.test(v),
      "Enter a valid URL (including https:// or www.)"
    ),

  pitchDeckFile: z.any().optional(),

  // Team
  isRepeatFounder: yesNoField("Repeat founders in the team"),
  hasTechnicalFounder: yesNoField("Technical founder"),
  teamSize: requiredNumberField("Team size"),
  teamSummary: z
    .string()
    .min(1, "Team overview is required")
    .min(20, "Team overview must be at least 20 characters")
    .max(500, "Team overview can be at most 500 characters"),
  founderLinkedin: z
    .string()
    .min(1, "Primary founder LinkedIn is required")
    .refine(
      (v) => /^https?:\/\/(www\.)?linkedin\.com\//i.test(v),
      "Enter a valid LinkedIn URL"
    ),

  // Fundraising & traction
  currentlyRaising: yesNoField("Currently raising"),

  totalRaisedToDate: requiredNumberField("Total Raised To Date"),
  roundTarget: requiredNumberField("Current round target"),
  roundCommitted: requiredNumberField("Amount Committed"),

  businessModel: z
    .string()
    .min(1, "Business model is required")
    .refine((v) => v === "saas" || v === "non-saas", "Business model is required"),

  // now optional at base level; required conditionally in superRefine
  currentArr: optionalNumberField("Current ARR"),
  ttmRevenue: optionalNumberField("TTM Revenue"),

  // always required
  momGrowth: requiredNumberField("MoM Growth"),

  fundingTimeline: z.string().max(120, "Funding timeline can be at most 120 characters").optional(),
  investorPreference: z
    .string()
    .max(240, "Preferred investor profile can be at most 240 characters")
    .optional(),

  // Visibility / sharing
  canShareSummary: yesNoField("One-line summary sharing"),
  canShareDetailsIfInterested: z
    .string()
    .optional()
    .refine(
      (v) => !v || v === "yes" || v === "no",
      "Share more details if interested is required"
    ),
});

const founderSchema = founderBase.superRefine((data, ctx) => {
  // SaaS → ARR required, TTM optional
  if (data.businessModel === "saas") {
    if (!data.currentArr) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["currentArr"],
        message: "Current ARR is required for SaaS",
      });
    }
  }

  // Non-SaaS → TTM required, ARR optional
  if (data.businessModel === "non-saas") {
    if (!data.ttmRevenue) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["ttmRevenue"],
        message: "TTM Revenue is required for Non-SaaS",
      });
    }
  }
});

type FounderFormValues = z.infer<typeof founderSchema>;

const FIELD_LABEL: Record<keyof FounderFormValues, string> = {
  userType: "User type",
  foundername: "Founder name",
  founderemail: "Email",
  companyName: "Company name",
  website: "Website",
  country: "Headquartered at",
  stage: "Stage",
  industries: "Industries",
  oneLinePitch: "One-line pitch",
  companyDescription: "Company description",
  pitchDeckLink: "Pitch deck link",
  pitchDeckFile: "Pitch deck file",
  isRepeatFounder: "Repeat founders in the team",
  hasTechnicalFounder: "Technical founder",
  teamSize: "Team size",
  teamSummary: "Team overview",
  founderLinkedin: "Primary founder LinkedIn",
  currentlyRaising: "Currently raising",
  totalRaisedToDate: "Total Raised To Date",
  roundTarget: "Current round target",
  roundCommitted: "Amount Committed",
  businessModel: "Business model",
  currentArr: "Current ARR",
  ttmRevenue: "TTM Revenue",
  momGrowth: "MoM Growth",
  fundingTimeline: "Funding timeline",
  investorPreference: "Preferred investor profile",
  canShareSummary: "One-line summary sharing",
  canShareDetailsIfInterested: "Share more details if interested",
};

export default function Page() {
  const countryOptions = countryList().getData().map((c) => ({ value: c.value, label: c.label }));
  const [csrfToken, setCsrfToken] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState,
    reset,
    setFocus,
    watch,
  } = useForm<FounderFormValues>({
    resolver: zodResolver(founderSchema) as any,
    defaultValues: {
      userType: "founder",
      foundername: "",
      founderemail: "",
      companyName: "",
      website: "",
      country: "",
      stage: "",
      industries: [],
      oneLinePitch: "",
      companyDescription: "",
      pitchDeckLink: "",
      pitchDeckFile: undefined as any,
      isRepeatFounder: "",
      hasTechnicalFounder: "",
      teamSize: "" as any,
      teamSummary: "",
      founderLinkedin: "",
      currentlyRaising: "",
      totalRaisedToDate: "" as any,
      roundTarget: "" as any,
      roundCommitted: "" as any,
      businessModel: "",
      currentArr: "" as any,
      ttmRevenue: "" as any,
      momGrowth: "" as any,
      fundingTimeline: "",
      investorPreference: "",
      canShareSummary: "",
      canShareDetailsIfInterested: "",
    } as any,
    mode: "onSubmit",
  });

  const watchBusinessModel = watch("businessModel");
  const isSubmitting = formState.isSubmitting;

  useEffect(() => {
    document.documentElement.style.setProperty("--form-input-bg", "#181818");
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const t = await prepareCsrf();
        setCsrfToken(t);
      } catch {
        toast.error("Failed to initialize form. Please refresh.");
      }
    })();
  }, []);

  const onSubmit = async (values: FounderFormValues) => {
    try {
      const fd = new FormData();

      fd.set("csrfToken", csrfToken);

      Object.entries(values).forEach(([key, raw]) => {
        if (key === "pitchDeckFile" || key === "industries") return;
        if (raw === undefined || raw === null) return;
        fd.set(key, raw as any);
      });

      fd.set("industries", JSON.stringify(values.industries ?? []));

      const fileVal = values.pitchDeckFile as any;
      if (fileVal instanceof FileList && fileVal.length > 0) {
        fd.set("pitchDeckFile", fileVal[0]);
      }

      fd.set("userType", "founder");

      const res = await submitEntity(fd);
      if (res?.ok) {
        toast.success("Submitted successfully", {
          description: "Your details have been saved.",
        });
        reset({
          userType: "founder",
          foundername: "",
          founderemail: "",
          companyName: "",
          website: "",
          country: "",
          stage: "",
          industries: [],
          oneLinePitch: "",
          companyDescription: "",
          pitchDeckLink: "",
          pitchDeckFile: undefined as any,
          isRepeatFounder: "",
          hasTechnicalFounder: "",
          teamSize: "" as any,
          teamSummary: "",
          founderLinkedin: "",
          currentlyRaising: "",
          totalRaisedToDate: "" as any,
          roundTarget: "" as any,
          roundCommitted: "" as any,
          businessModel: "",
          currentArr: "" as any,
          ttmRevenue: "" as any,
          momGrowth: "" as any,
          fundingTimeline: "",
          investorPreference: "",
          canShareSummary: "",
          canShareDetailsIfInterested: "",
        } as any);
      } else {
        toast.error("Submission failed", {
          description: "Please try again.",
        });
      }
    } catch (err: any) {
      toast.error("Submission failed", {
        description: err?.message || "Unexpected error",
      });
    }
  };

  const onError = (errors: FieldErrors<FounderFormValues>) => {
    const fields = Object.keys(errors) as (keyof FounderFormValues)[];
    if (!fields.length) {
      toast.error("Something went wrong. Please check the form.");
      return;
    }

    const first = fields[0];
    const firstError = errors[first];

    setFocus(first as any);

    let msg = (firstError?.message as string | undefined) || "";

    if (
      !msg ||
      msg === "Invalid input" ||
      msg === "Required" ||
      msg.startsWith("Invalid enum value")
    ) {
      msg = `${FIELD_LABEL[first] ?? "This field"} is required`;
    }

    toast.error(msg);
  };

  return (
    <main className="min-h-screen bg-[#111] text-white">
      <BackgroundFX mode="fixed" />
      <Navbar fixed={false} useHashLinks={false} />
      <Toaster />
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-0 pt-24 md:pt-28 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left Column */}
          <div className="flex flex-col justify-start md:pt-10">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
              Submit your details
            </h1>
            <p className="text-neutral-400 mb-8 max-w-prose">
              If you&apos;re a founder looking to connect with investors, share a few details about
              your company, traction, and business model. I&apos;ll use this to understand fit and
              selectively share high-signal opportunities (always with your permission).
            </p>
          </div>

          {/* Right Column – Founder Form */}
          <form
            onSubmit={handleSubmit(onSubmit, onError)}
            className="space-y-8 rounded-xl border border-neutral-800 bg-[#181818] p-8 shadow-lg w-full"
          >

            {/* ========== Section: Founder Info ========== */}
            <section>
              <h3 className="text-lg font-semibold">Founder Information</h3>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label className="text-neutral-400 text-xs uppercase tracking-wide">
                    Founder Name *
                  </Label>
                  <Input
                    {...register("foundername")}
                    placeholder="Full Name"
                    className="mt-2 !bg-[var(--form-input-bg)] border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300"
                  />
                </div>
                <div>
                  <Label className="text-neutral-400 text-xs uppercase tracking-wide">
                    Email *
                  </Label>
                  <Input
                    type="email"
                    {...register("founderemail")}
                    placeholder="abc@startup.com"
                    className="mt-2 !bg-[var(--form-input-bg)] border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300"
                  />
                </div>
              </div>
            </section>

            {/* ========== Section: Company Basics ========== */}
            <section>
              <h3 className="text-lg font-semibold">Company Information</h3>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label className="text-neutral-400 text-xs uppercase tracking-wide">
                    Company Name *
                  </Label>
                  <Input
                    {...register("companyName")}
                    placeholder="Acme Inc."
                    className="mt-2 !bg-[var(--form-input-bg)] border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300"
                  />
                </div>
                <div>
                  <Label className="text-neutral-400 text-xs uppercase tracking-wide">
                    Website *
                  </Label>
                  <Input
                    {...register("website")}
                    placeholder="https:// or www."
                    className="mt-2 !bg-[var(--form-input-bg)] border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300"
                  />
                </div>

                <div>
                  <Label className="text-neutral-400 text-xs uppercase tracking-wide">
                    Headquartered At *
                  </Label>
                  <Controller
                    control={control}
                    name="country"
                    render={({ field }) => (
                      <ShadSelect onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="mt-2 !bg-[var(--form-input-bg)] border border-neutral-700 text-white focus:border-lime-300">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#181818] border border-neutral-700 text-white max-h-60 overflow-y-auto">
                          {countryOptions.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </ShadSelect>
                    )}
                  />
                </div>

                <div>
                  <Label className="text-neutral-400 text-xs uppercase tracking-wide">
                    Stage *
                  </Label>
                  <Controller
                    control={control}
                    name="stage"
                    render={({ field }) => (
                      <ShadSelect onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="mt-2 !bg-[var(--form-input-bg)] border border-neutral-700 text-white focus:border-lime-300">
                          <SelectValue placeholder="Select stage" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#181818] border border-neutral-700 text-white">
                          {stageOptions.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </ShadSelect>
                    )}
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label className="text-neutral-400 text-xs uppercase tracking-wide">
                    Industries *
                  </Label>
                  <Controller
                    control={control}
                    name="industries"
                    render={({ field }) => {
                      const options = IndustryOptions.map((ind) => ({ value: ind, label: ind }));
                      const value = Array.isArray(field.value)
                        ? options.filter((opt) => field.value.includes(opt.value))
                        : [];
                      return (
                        <Select<OptionType, true, GroupBase<OptionType>>
                          isMulti
                          options={options}
                          styles={customStyles}
                          className="mt-2"
                          value={value}
                          onChange={(selected) => field.onChange(selected.map((s) => s.value))}
                          placeholder="Select industries"
                          closeMenuOnSelect={false}
                        />
                      );
                    }}
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label className="text-neutral-400 text-xs uppercase tracking-wide">
                    One-line Pitch *
                  </Label>
                  <Input
                    {...register("oneLinePitch")}
                    placeholder=""
                    maxLength={140}
                    className="mt-2 !bg-[var(--form-input-bg)] border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300"
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label className="text-neutral-400 text-xs uppercase tracking-wide">
                    Company Description (min 20 chars) *
                  </Label>
                  <Textarea
                    {...register("companyDescription")}
                    rows={4}
                    maxLength={500}
                    placeholder=""
                    className="mt-2 !bg-[var(--form-input-bg)] border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300"
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label className="text-neutral-400 text-xs uppercase tracking-wide">
                    Pitch Deck Link *
                  </Label>
                  <Input
                    type="url"
                    {...register("pitchDeckLink")}
                    placeholder=""
                    className="mt-2 !bg-[var(--form-input-bg)] border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300"
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label className="text-neutral-400 text-xs uppercase tracking-wide">
                    Upload Pitch Deck (PDF)
                  </Label>

                  <div
                    onDragOver={(e: DragEvent<HTMLDivElement>) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={(e: DragEvent<HTMLDivElement>) => {
                      e.preventDefault();
                      setDragActive(false);
                    }}
                    onDrop={(e: DragEvent<HTMLDivElement>) => {
                      e.preventDefault();
                      setDragActive(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file && file.type === "application/pdf") {
                        const dt = new DataTransfer();
                        dt.items.add(file);
                        const input = document.getElementById("pitchDeckFileInput") as HTMLInputElement | null;
                        if (input) {
                          input.files = dt.files;
                        }
                      } else if (file) {
                        toast.error("Please upload a PDF file.");
                      }
                    }}
                    className={`mt-2 flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-700 px-4 py-6 text-center text-sm text-neutral-400 transition
                      ${dragActive ? "border-lime-300 bg-[#1f1f1f]" : "hover:border-lime-300 hover:bg-[#1a1a1a]"}`}
                  >
                    <p className="mb-2">
                      Drag & drop your deck here, or click to browse
                    </p>
                    <Input
                      id="pitchDeckFileInput"
                      type="file"
                      accept="application/pdf"
                      {...register("pitchDeckFile")}
                      className="mt-2 cursor-pointer border-0 bg-transparent p-0 text-xs text-neutral-500 file:mr-3 file:rounded-md file:border-0 file:bg-lime-300 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-black hover:file:bg-lime-200"
                    />
                  </div>

                  <p className="mt-1 text-xs text-neutral-500">
                    Optional. PDF only. I’ll still use your link as the primary reference.
                  </p>
                </div>
              </div>
            </section>

            {/* ========== Section: Team Info ========== */}
            <section>
              <h3 className="text-lg font-semibold">Team Information</h3>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label className="text-neutral-400 text-xs uppercase tracking-wide">
                    Any repeat founders in the team? *
                  </Label>
                  <Controller
                    control={control}
                    name="isRepeatFounder"
                    render={({ field }) => (
                      <ShadSelect onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="mt-2 !bg-[var(--form-input-bg)] border border-neutral-700 text-white focus:border-lime-300">
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#181818] border border-neutral-700 text-white">
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </ShadSelect>
                    )}
                  />
                </div>

                <div>
                  <Label className="text-neutral-400 text-xs uppercase tracking-wide">
                    Is there a technical founder (e.g. CTO)? *
                  </Label>
                  <Controller
                    control={control}
                    name="hasTechnicalFounder"
                    render={({ field }) => (
                      <ShadSelect onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="mt-2 !bg-[var(--form-input-bg)] border border-neutral-700 text-white focus:border-lime-300">
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#181818] border border-neutral-700 text-white">
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </ShadSelect>
                    )}
                  />
                </div>

                <div>
                  <Label className="text-neutral-400 text-xs uppercase tracking-wide">
                    Team size (full-time) *
                  </Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    {...register("teamSize")}
                    placeholder=""
                    onWheel={blurOnWheel}
                    className="mt-2 !bg-[var(--form-input-bg)] border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300"
                  />
                </div>

                <div>
                  <Label className="text-neutral-400 text-xs uppercase tracking-wide">
                    Primary founder LinkedIn *
                  </Label>
                  <Input
                    type="url"
                    {...register("founderLinkedin")}
                    placeholder=""
                    className="mt-2 !bg-[var(--form-input-bg)] border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300"
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label className="text-neutral-400 text-xs uppercase tracking-wide">
                    Team overview (min 20 chars) *
                  </Label>
                  <Textarea
                    {...register("teamSummary")}
                    rows={3}
                    maxLength={500}
                    placeholder="Short summary about the founding team and key members."
                    className="mt-2 !bg-[var(--form-input-bg)] border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300"
                  />
                </div>
              </div>
            </section>

            {/* ========== Section: Fundraising & Traction ========== */}
            <section>
              <h3 className="text-lg font-semibold">Fundraising & Traction</h3>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label className="text-neutral-400 text-xs uppercase tracking-wide">
                    Currently Raising? *
                  </Label>
                  <Controller
                    control={control}
                    name="currentlyRaising"
                    render={({ field }) => (
                      <ShadSelect onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="mt-2 !bg-[var(--form-input-bg)] border border-neutral-700 text-white focus:border-lime-300">
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#181818] border border-neutral-700 text-white">
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </ShadSelect>
                    )}
                  />
                </div>

                <div>
                  <Label className="text-neutral-400 text-xs uppercase tracking-wide">
                    Total Raised To Date (excl. current round) *
                  </Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    onWheel={blurOnWheel}
                    {...register("totalRaisedToDate")}
                    placeholder="$500,000"
                    className="mt-2 !bg-[var(--form-input-bg)] border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300"
                  />
                </div>

                <div>
                  <Label className="text-neutral-400 text-xs uppercase tracking-wide">
                    Current Round Target *
                  </Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    onWheel={blurOnWheel}
                    {...register("roundTarget")}
                    placeholder="$500,000"
                    className="mt-2 !bg-[var(--form-input-bg)] border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300"
                  />
                </div>

                <div>
                  <Label className="text-neutral-400 text-xs uppercase tracking-wide">
                    Amount Committed *
                  </Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    onWheel={blurOnWheel}
                    {...register("roundCommitted")}
                    placeholder="$500,000"
                    className="mt-2 !bg-[var(--form-input-bg)] border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300"
                  />
                </div>

                <div>
                  <Label className="text-neutral-400 text-xs uppercase tracking-wide">
                    Business Model *
                  </Label>
                  <Controller
                    control={control}
                    name="businessModel"
                    render={({ field }) => (
                      <ShadSelect onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="mt-2 !bg-[var(--form-input-bg)] border border-neutral-700 text-white focus:border-lime-300">
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#181818] border border-neutral-700 text-white">
                          {BusinessModelOptions.map((bm) => (
                            <SelectItem key={bm.value} value={bm.value}>
                              {bm.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </ShadSelect>
                    )}
                  />
                </div>

                {watchBusinessModel === "saas" && (
                  <>
                    <div>
                      <Label className="text-neutral-400 text-xs uppercase tracking-wide">
                        Current ARR *
                      </Label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        onWheel={blurOnWheel}
                        {...register("currentArr")}
                        placeholder="$500,000"
                        className="mt-2 !bg-[var(--form-input-bg)] border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300"
                      />
                    </div>
                    <div>
                      <Label className="text-neutral-400 text-xs uppercase tracking-wide">
                        MoM Growth (%) *
                      </Label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        onWheel={blurOnWheel}
                        {...register("momGrowth")}
                        placeholder=""
                        className="mt-2 !bg-[var(--form-input-bg)] border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300"
                      />
                    </div>
                  </>
                )}

                {watchBusinessModel === "non-saas" && (
                  <>
                    <div>
                      <Label className="text-neutral-400 text-xs uppercase tracking-wide">
                        TTM Revenue *
                      </Label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        onWheel={blurOnWheel}
                        {...register("ttmRevenue")}
                        placeholder="$500,000"
                        className="mt-2 !bg-[var(--form-input-bg)] border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300"
                      />
                    </div>
                    <div>
                      <Label className="text-neutral-400 text-xs uppercase tracking-wide">
                        MoM Growth (%) *
                      </Label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        onWheel={blurOnWheel}
                        {...register("momGrowth")}
                        placeholder=""
                        className="mt-2 !bg-[var(--form-input-bg)] border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300"
                      />
                    </div>
                  </>
                )}

                <div className="sm:col-span-2">
                  <Label className="text-neutral-400 text-xs uppercase tracking-wide">
                    Funding Timeline
                  </Label>
                  <Input
                    {...register("fundingTimeline")}
                    placeholder="Expected timeline to close"
                    className="mt-2 !bg-[var(--form-input-bg)] border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300"
                  />
                </div>
              </div>
            </section>

            {/* ========== Section: Visibility & Preferences ========== */}
            <section>
              <h3 className="text-lg font-semibold">Visibility & Investor Preferences</h3>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label className="text-neutral-400 text-xs uppercase tracking-wide">
                    Can we share a 1-line summary with relevant investors? *
                  </Label>
                  <Controller
                    control={control}
                    name="canShareSummary"
                    render={({ field }) => (
                      <ShadSelect onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="mt-2 !bg-[var(--form-input-bg)] border border-neutral-700 text-white focus:border-lime-300">
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#181818] border border-neutral-700 text-white">
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </ShadSelect>
                    )}
                  />
                </div>

                <div>
                  <Label className="text-neutral-400 text-xs uppercase tracking-wide">
                    If an investor is interested, can we share more details?
                  </Label>
                  <Controller
                    control={control}
                    name="canShareDetailsIfInterested"
                    render={({ field }) => (
                      <ShadSelect onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="mt-2 !bg-[var(--form-input-bg)] border border-neutral-700 text-white focus:border-lime-300">
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#181818] border border-neutral-700 text-white">
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </ShadSelect>
                    )}
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label className="text-neutral-400 text-xs uppercase tracking-wide">
                    Preferred Investor Profile
                  </Label>
                  <Textarea
                    {...register("investorPreference")}
                    rows={3}
                    maxLength={240}
                    placeholder=""
                    className="mt-2 !bg-[var(--form-input-bg)] border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300"
                  />
                </div>
              </div>
            </section>

            <Button
              type="submit"
              disabled={isSubmitting}
              className={`w-full rounded-lg font-semibold shadow-md transition-colors ${
                isSubmitting
                  ? "bg-lime-200 text-black cursor-not-allowed"
                  : "bg-lime-300 text-black hover:bg-lime-200"
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}