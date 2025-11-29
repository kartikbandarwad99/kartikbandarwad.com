"use client";

import { useForm, Controller, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import countryList from "react-select-country-list";
import Select, { GroupBase } from "react-select";
import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
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

import { submitEntity } from "../actions/submit-entry";
import { prepareCsrf } from "@/app/submit/csrf-actions";
import { Toaster } from "@/components/ui/sonner";

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

// -------- helpers for numeric inputs --------
const toNumber = (v: unknown) => {
  const s = String(v ?? "").replace(/[^0-9.]/g, "");
  if (s === "") return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
};
const blurOnWheel = (e: React.WheelEvent<HTMLInputElement>) => (e.currentTarget as HTMLInputElement).blur();

// -------- Zod Schemas --------
const founderBase = z.object({
  userType: z.literal("founder"),
  foundername: z.string().min(2).max(50),
  founderemail: z.string().email(),
  industries: z.array(z.string()).nonempty("Select at least one industry"),
  website: z.string().optional(),
  country: z.string(),
  stage: z.string(),
  companyName: z.string().min(2).max(50),
  companyDescription: z.string().min(10).max(500),
  amountRaised: z.coerce.number(),
  currentround: z.coerce.number(),
  roundclosed: z.coerce.number(),
  businessModel: z.enum(["saas", "non-saas"]),
  currentArr: z.coerce.number().optional(),
  ttmRevenue: z.coerce.number().optional(),
  momGrowth: z.coerce.number().min(0).optional(),
});

const founderSchema = founderBase.superRefine((data, ctx) => {
  if (data.momGrowth === undefined || Number.isNaN(data.momGrowth)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["momGrowth"], message: "MoM Growth % is required" });
  }
  if (data.businessModel === "saas") {
    if (data.currentArr === undefined || Number.isNaN(data.currentArr)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["currentArr"], message: "Current ARR is required for SaaS" });
    }
  } else {
    if (data.ttmRevenue === undefined || Number.isNaN(data.ttmRevenue)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["ttmRevenue"], message: "TTM Revenue is required for Non-SaaS" });
    }
  }
});

const investorSchema = z.object({
  userType: z.literal("investor"),
  investorName: z.string(),
  investoremail: z.string().email(),
  investorType: z.enum(["VC", "Angel"]).optional(),
  investmentstage: z.array(z.string()).optional(),
  countriesofInvestment: z.array(z.string()).optional(),
  industriesofInterest: z.array(z.string()).optional(),
  title: z.string().optional(),
  website: z.string().optional(),
  hqCountry: z.string().optional(),
});

const vcinvestorSchema = investorSchema.extend({
  investorType: z.literal("VC"),
  firm: z.string(),
  fund: z.coerce.number(),
  avgTicketSize: z.coerce.number().optional(),
  fundStage: z.enum(["Micro VC", "Seed Fund", "Early Stage VC Fund", "Growth Fund", "Multi-stage", "CVC"]).optional(),
  leadPreference: z.enum(["Lead", "Follow", "Either"]).optional(),
  boardSeat: z.enum(["Yes", "No"]).optional(),
  decisionSpeed: z.enum(["Fast", "Moderate", "Deliberate"]).optional(),
});

const angelInvestorSchema = investorSchema.extend({
  investorType: z.literal("Angel"),
  chequesize: z.coerce.number(),
  leadPreference: z.enum(["Lead", "Follow", "Either"]).optional(),
  boardSeat: z.enum(["Yes", "No"]).optional(),
  decisionSpeed: z.enum(["Fast", "Moderate", "Deliberate"]).optional(),
});

const userSchema = z.union([founderSchema, vcinvestorSchema, angelInvestorSchema]);

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className={`w-full rounded-lg font-semibold shadow-md transition-colors ${
        pending ? "bg-lime-200 text-black cursor-not-allowed" : "bg-lime-300 text-black hover:bg-lime-200"
      }`}
    >
      {pending ? "Submitting..." : "Submit"}
    </Button>
  );
}

export default function SubmitPage() {
  const countryOptions = countryList().getData().map((c) => ({ value: c.value, label: c.label }));
  const [role, setRole] = useState<"founder" | "investor">("founder");
  const [csrfToken, setCsrfToken] = useState("");

  const form = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: { userType: "founder" },
  });

  const investorType = useWatch({ control: form.control, name: "investorType" });
  const businessModel = useWatch({ control: form.control, name: "businessModel" });

  // CSRF: fetch once on mount
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

  // helper: copy RHF values into FormData (so no hidden inputs needed)
  const mirrorToFormData = (fd: FormData) => {
    const v = form.getValues as any;

    // Scalars (Selects & text)
    fd.set("userType", String(v("userType") ?? ""));
    fd.set("investorType", String(v("investorType") ?? ""));
    fd.set("businessModel", String(v("businessModel") ?? ""));
    fd.set("stage", String(v("stage") ?? ""));
    fd.set("country", String(v("country") ?? ""));
    fd.set("hqCountry", String(v("hqCountry") ?? ""));
    fd.set("fundStage", String(v("fundStage") ?? ""));
    fd.set("leadPreference", String(v("leadPreference") ?? ""));
    fd.set("boardSeat", String(v("boardSeat") ?? ""));
    fd.set("decisionSpeed", String(v("decisionSpeed") ?? ""));

    // Arrays (react-select multi)
    fd.set("industries", JSON.stringify(v("industries") ?? []));
    fd.set("investmentstage", JSON.stringify(v("investmentstage") ?? []));
    fd.set("countriesofInvestment", JSON.stringify(v("countriesofInvestment") ?? []));
    fd.set("industriesofInterest", JSON.stringify(v("industriesofInterest") ?? []));
  };

  // reset to a clean slate but keep current role’s sensible defaults
  const resetAfterSuccess = () => {
    if (role === "founder") {
      form.reset({ userType: "founder" } as any);
    } else {
      form.reset({ userType: "investor", investorType: "VC" } as any);
    }
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
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">Submit your details</h1>
            <p className="text-neutral-400 mb-8 max-w-prose">
              Whether you’re a founder looking for investment or an investor seeking great startups, share a few details
              to join my network.
            </p>

            {/* Role toggle */}
            <div className="flex gap-4">
              <Button
                type="button"
                onClick={() => {
                  setRole("founder");
                  form.reset({ userType: "founder" } as any);
                }}
                className={
                  role === "founder"
                    ? "bg-lime-300 text-black font-semibold px-6 py-3 rounded-lg hover:bg-lime-200"
                    : "border border-lime-300 text-lime-300 font-semibold px-6 py-3 rounded-lg hover:bg-lime-300 hover:text-black bg-transparent"
                }
              >
                Founder
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setRole("investor");
                  form.reset({ userType: "investor", investorType: "VC" } as any);
                }}
                className={
                  role === "investor"
                    ? "bg-lime-300 text-black font-semibold px-6 py-3 rounded-lg hover:bg-lime-200"
                    : "border border-lime-300 text-lime-300 font-semibold px-6 py-3 rounded-lg hover:bg-lime-300 hover:text-black bg-transparent"
                }
              >
                Investor
              </Button>
            </div>
          </div>

          {/* Right Column */}
          <form
            action={async (formData) => {
              // attach CSRF
              formData.set("csrfToken", csrfToken);

              // copy non-native control values (no hidden inputs needed)
              mirrorToFormData(formData);

              const res = await submitEntity(formData);
              if (res?.ok) {
                toast.success("✅ Submitted successfully", { description: "Your details have been saved." });
                resetAfterSuccess();
              } else {
                toast.error("⚠️ Submission failed", { description: "Please try again." });
              }
            }}
            className="space-y-8 rounded-xl border border-neutral-800 bg-[#181818] p-8 shadow-lg w-full"
          >
            {role === "founder" ? (
              <>
                {/* Founder fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-neutral-400 text-xs uppercase tracking-wide">Founder Name</Label>
                    <Input {...form.register("foundername")} className="mt-2 border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300" />
                  </div>
                  <div>
                    <Label className="text-neutral-400 text-xs uppercase tracking-wide">Email</Label>
                    <Input type="email" {...form.register("founderemail")} className="mt-2 bg-black border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300" />
                  </div>

                  <div>
                    <Label className="text-neutral-400 text-xs uppercase tracking-wide">Company Name</Label>
                    <Input {...form.register("companyName")} className="mt-2 bg-black border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300" />
                  </div>
                  <div>
                    <Label className="text-neutral-400 text-xs uppercase tracking-wide">Website</Label>
                    <Input {...form.register("website")} placeholder="https://…" className="mt-2 bg-black border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300" />
                  </div>

                  <div>
                    <Label className="text-neutral-400 text-xs uppercase tracking-wide">Headquartered At</Label>
                    <Controller
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <ShadSelect onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="mt-2 bg-black border border-neutral-700 text-white focus:border-lime-300">
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#111] border border-neutral-700 text-white max-h-60 overflow-y-auto">
                            {countryList()
                              .getData()
                              .map((c) => (
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
                    <Label className="text-neutral-400 text-xs uppercase tracking-wide">Stage</Label>
                    <Controller
                      control={form.control}
                      name="stage"
                      render={({ field }) => (
                        <ShadSelect onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="mt-2 bg-black border border-neutral-700 text-white focus:border-lime-300">
                            <SelectValue placeholder="Select stage" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#111] border border-neutral-700 text-white">
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
                    <Label className="text-neutral-400 text-xs uppercase tracking-wide">Industries</Label>
                    <Controller
                      control={form.control}
                      name="industries"
                      render={({ field }) => {
                        const options = IndustryOptions.map((ind) => ({ value: ind, label: ind }));
                        const value = Array.isArray(field.value) ? options.filter((opt) => field.value.includes(opt.value)) : [];
                        return (
                          <Select<OptionType, true, GroupBase<OptionType>>
                            isMulti
                            options={options}
                            styles={customStyles}
                            className="mt-2"
                            value={value}
                            onChange={(selected) => field.onChange(selected.map((s) => s.value))}
                            placeholder="Select industries..."
                            closeMenuOnSelect={false}
                          />
                        );
                      }}
                    />
                  </div>

                  <div>
                    <Label className="text-neutral-400 text-xs uppercase tracking-wide">Net Amount Raised (excluding current round)</Label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9]*|[0-9]+(\\.[0-9]+)?"
                      onWheel={blurOnWheel}
                      {...form.register("amountRaised", { setValueAs: toNumber })}
                      placeholder="Enter amount in USD"
                      className="mt-2 bg-black border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300"
                    />
                  </div>
                  <div>
                    <Label className="text-neutral-400 text-xs uppercase tracking-wide">current round</Label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9]*|[0-9]+(\\.[0-9]+)?"
                      onWheel={blurOnWheel}
                      {...form.register("currentround", { setValueAs: toNumber })}
                      placeholder="Enter amount in USD"
                      className="mt-2 bg-black border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300"
                    />
                  </div>
                  <div>
                    <Label className="text-neutral-400 text-xs uppercase tracking-wide">round Closed</Label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9]*|[0-9]+(\\.[0-9]+)?"
                      onWheel={blurOnWheel}
                      {...form.register("roundclosed", { setValueAs: toNumber })}
                      placeholder="Enter amount in USD"
                      className="mt-2 bg-black border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300"
                    />
                  </div>

                  <div>
                    <Label className="text-neutral-400 text-xs uppercase tracking-wide">Business Model</Label>
                    <Controller
                      control={form.control}
                      name="businessModel"
                      render={({ field }) => (
                        <ShadSelect onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="mt-2 bg-black border border-neutral-700 text-white focus:border-lime-300">
                            <SelectValue placeholder="Select business model" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#111] border border-neutral-700 text-white">
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

                  {businessModel === "saas" && (
                    <>
                      <div>
                        <Label className="text-neutral-400 text-xs uppercase tracking-wide">Current ARR</Label>
                        <Input
                          type="text"
                          inputMode="decimal"
                          pattern="[0-9]*|[0-9]+(\\.[0-9]+)?"
                          onWheel={blurOnWheel}
                          {...form.register("currentArr", { setValueAs: toNumber })}
                          placeholder="$1,000,000"
                          className="mt-2 bg-black border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300"
                        />
                      </div>
                      <div>
                        <Label className="text-neutral-400 text-xs uppercase tracking-wide">MoM Growth (%)</Label>
                        <Input
                          type="text"
                          inputMode="decimal"
                          pattern="[0-9]*|[0-9]+(\\.[0-9]+)?"
                          onWheel={blurOnWheel}
                          {...form.register("momGrowth", { setValueAs: toNumber })}
                          placeholder="e.g. 12.5"
                          className="mt-2 bg-black border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300"
                        />
                      </div>
                    </>
                  )}

                  {businessModel === "non-saas" && (
                    <>
                      <div>
                        <Label className="text-neutral-400 text-xs uppercase tracking-wide">TTM Revenue</Label>
                        <Input
                          type="text"
                          inputMode="decimal"
                          pattern="[0-9]*|[0-9]+(\\.[0-9]+)?"
                          onWheel={blurOnWheel}
                          {...form.register("ttmRevenue", { setValueAs: toNumber })}
                          placeholder="$2,400,000"
                          className="mt-2 bg-black border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300"
                        />
                      </div>
                      <div>
                        <Label className="text-neutral-400 text-xs uppercase tracking-wide">MoM Growth (%)</Label>
                        <Input
                          type="text"
                          inputMode="decimal"
                          pattern="[0-9]*|[0-9]+(\\.[0-9]+)?"
                          onWheel={blurOnWheel}
                          {...form.register("momGrowth", { setValueAs: toNumber })}
                          placeholder="e.g. 8.0"
                          className="mt-2 bg-black border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <Label className="text-neutral-400 text-xs uppercase tracking-wide">Company Description</Label>
                  <Textarea
                    {...form.register("companyDescription")}
                    rows={4}
                    maxLength={500}
                    placeholder="One crisp paragraph…"
                    className="mt-2 bg-black border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300"
                  />
                </div>
              </>
            ) : (
              <>
                {/* Investor */}
                <div className="w-full">
                  <Label className="text-neutral-400 text-xs uppercase tracking-wide">Investor Type</Label>
                  <div className="mt-2 grid grid-cols-2 rounded-lg overflow-hidden border border-neutral-800">
                    <button
                      type="button"
                      onClick={() => form.setValue("investorType", "VC")}
                      className={`px-3 py-2 text-sm font-medium transition-colors border-r border-neutral-800 ${
                        investorType === "VC" ? "bg-lime-300 text-black" : "bg-[#111] text-white hover:bg-neutral-900"
                      }`}
                    >
                      VC
                    </button>
                    <button
                      type="button"
                      onClick={() => form.setValue("investorType", "Angel")}
                      className={`px-3 py-2 text-sm font-medium transition-colors ${
                        investorType === "Angel" ? "bg-lime-300 text-black" : "bg-[#111] text-white hover:bg-neutral-900"
                      }`}
                    >
                      Angel
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-neutral-400 text-xs uppercase tracking-wide">Investor Name</Label>
                    <Input {...form.register("investorName")} className="mt-2 bg-black border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300" />
                  </div>
                  <div>
                    <Label className="text-neutral-400 text-xs uppercase tracking-wide">Email</Label>
                    <Input type="email" {...form.register("investoremail")} className="mt-2 bg-black border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300" />
                  </div>
                  {investorType !== "Angel" && (
                    <div>
                      <Label className="text-neutral-400 text-xs uppercase tracking-wide">Title / Designation</Label>
                      <Input {...form.register("title")} placeholder="Partner, Principal, Angel, etc."
                        className="mt-2 bg-black border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300" />
                    </div>
                  )}

                  {investorType !== "Angel" && (
                    <div>
                      <Label className="text-neutral-400 text-xs uppercase tracking-wide">Website</Label>
                      <Input {...form.register("website")} placeholder="https://vc.com"
                        className="mt-2 bg-black border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300" />
                    </div>
                  )}

                  <div>
                    <Label className="text-neutral-400 text-xs uppercase tracking-wide">Headquartered At</Label>
                    <Controller
                      control={form.control}
                      name="hqCountry"
                      render={({ field }) => (
                        <ShadSelect onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="mt-2 bg-black border border-neutral-700 text-white focus:border-lime-300">
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#111] border border-neutral-700 text-white max-h-60 overflow-y-auto">
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

                  <div className="sm:col-span-2">
                    <Label className="text-neutral-400 text-xs uppercase tracking-wide">Investment Stages</Label>
                    <Controller
                      control={form.control}
                      name="investmentstage"
                      render={({ field }) => (
                        <Select<OptionType, true, GroupBase<OptionType>>
                          isMulti
                          options={stageOptions}
                          styles={customStyles}
                          className="mt-2"
                          value={stageOptions.filter((opt) => field.value?.includes(opt.value))}
                          onChange={(selected) => field.onChange(selected.map((s) => s.value))}
                          placeholder="Select stages..."
                          closeMenuOnSelect={false}
                        />
                      )}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label className="text-neutral-400 text-xs uppercase tracking-wide">Countries of Investment</Label>
                    <Controller
                      control={form.control}
                      name="countriesofInvestment"
                      render={({ field }) => (
                        <Select<OptionType, true, GroupBase<OptionType>>
                          isMulti
                          options={countryOptions}
                          styles={customStyles}
                          className="mt-2"
                          value={countryOptions.filter((opt) => field.value?.includes(opt.value))}
                          onChange={(selected) => field.onChange(selected.map((s) => s.value))}
                          placeholder="Select countries..."
                          closeMenuOnSelect={false}
                        />
                      )}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label className="text-neutral-400 text-xs uppercase tracking-wide">Industries of Interest</Label>
                    <Controller
                      control={form.control}
                      name="industriesofInterest"
                      render={({ field }) => {
                        const options = IndustryOptions.map((ind) => ({ value: ind, label: ind }));
                        const selectedValues = Array.isArray(field.value) ? field.value : [];
                        const value = options.filter((opt) => selectedValues.includes(opt.value));
                        return (
                          <Select<OptionType, true, GroupBase<OptionType>>
                            isMulti
                            options={options}
                            styles={customStyles}
                            className="mt-2"
                            value={value}
                            onChange={(selected) => field.onChange(selected.map((s) => s.value))}
                            placeholder="Select industries..."
                            closeMenuOnSelect={false}
                          />
                        );
                      }}
                    />
                  </div>
                </div>

                {investorType === "VC" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-neutral-400 text-xs uppercase tracking-wide">Firm</Label>
                      <Input {...form.register("firm")} className="mt-2 bg-black border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300" />
                    </div>
                    <div>
                      <Label className="text-neutral-400 text-xs uppercase tracking-wide">Fund Size (AUM)</Label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        pattern="[0-9]*|[0-9]+(\\.[0-9]+)?"
                        onWheel={blurOnWheel}
                        {...form.register("fund", { setValueAs: toNumber })}
                        placeholder="$50M"
                        className="mt-2 bg-black border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300"
                      />
                    </div>
                    <div>
                      <Label className="text-neutral-400 text-xs uppercase tracking-wide">Average Ticket Size</Label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        pattern="[0-9]*|[0-9]+(\\.[0-9]+)?"
                        onWheel={blurOnWheel}
                        {...form.register("avgTicketSize", { setValueAs: toNumber })}
                        placeholder="$1M"
                        className="mt-2 bg-black border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300"
                      />
                    </div>
                    <div>
                      <Label className="text-neutral-400 text-xs uppercase tracking-wide">Fund Type</Label>
                      <Controller
                        control={form.control}
                        name="fundStage"
                        render={({ field }) => (
                          <ShadSelect onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="mt-2 bg-black border border-neutral-700 text-white focus:border-lime-300">
                              <SelectValue placeholder="Select fund type" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#111] border border-neutral-700 text-white">
                              {["Micro VC", "Seed Fund", "Early Stage VC Fund", "Growth Fund", "Multi-stage", "CVC"].map((f) => (
                                <SelectItem key={f} value={f}>
                                  {f}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </ShadSelect>
                        )}
                      />
                    </div>
                    <div>
                      <Label className="text-neutral-400 text-xs uppercase tracking-wide">Lead vs Follow</Label>
                      <Controller
                        control={form.control}
                        name="leadPreference"
                        render={({ field }) => (
                          <ShadSelect onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="mt-2 bg-black border border-neutral-700 text-white focus:border-lime-300">
                              <SelectValue placeholder="Select preference" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#111] border border-neutral-700 text-white">
                              {["Lead", "Follow", "Either"].map((v) => (
                                <SelectItem key={v} value={v}>
                                  {v}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </ShadSelect>
                        )}
                      />
                    </div>
                    <div>
                      <Label className="text-neutral-400 text-xs uppercase tracking-wide">Board Seat</Label>
                      <Controller
                        control={form.control}
                        name="boardSeat"
                        render={({ field }) => (
                          <ShadSelect onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="mt-2 bg-black border border-neutral-700 text-white focus:border-lime-300">
                              <SelectValue placeholder="Select option" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#111] border border-neutral-700 text-white">
                              {["Yes", "No"].map((v) => (
                                <SelectItem key={v} value={v}>
                                  {v}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </ShadSelect>
                        )}
                      />
                    </div>
                    <div>
                      <Label className="text-neutral-400 text-xs uppercase tracking-wide">Decision Speed</Label>
                      <Controller
                        control={form.control}
                        name="decisionSpeed"
                        render={({ field }) => (
                          <ShadSelect onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="mt-2 bg-black border border-neutral-700 text-white focus:border-lime-300">
                              <SelectValue placeholder="Select speed" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#111] border border-neutral-700 text-white">
                              {["Fast", "Moderate", "Deliberate"].map((v) => (
                                <SelectItem key={v} value={v}>
                                  {v}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </ShadSelect>
                        )}
                      />
                    </div>
                  </div>
                )}

                {investorType === "Angel" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-neutral-400 text-xs uppercase tracking-wide">Cheque Size</Label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        pattern="[0-9]*|[0-9]+(\\.[0-9]+)?"
                        onWheel={blurOnWheel}
                        {...form.register("chequesize", { setValueAs: toNumber })}
                        placeholder="$100k"
                        className="mt-2 bg-black border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300"
                      />
                    </div>
                    <div>
                      <Label className="text-neutral-400 text-xs uppercase tracking-wide">Lead vs Follow</Label>
                      <Controller
                        control={form.control}
                        name="leadPreference"
                        render={({ field }) => (
                          <ShadSelect onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="mt-2 bg-black border border-neutral-700 text-white focus:border-lime-300">
                              <SelectValue placeholder="Select preference" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#111] border border-neutral-700 text-white">
                              {["Lead", "Follow", "Either"].map((v) => (
                                <SelectItem key={v} value={v}>
                                  {v}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </ShadSelect>
                        )}
                      />
                    </div>
                    <div>
                      <Label className="text-neutral-400 text-xs uppercase tracking-wide">Board Seat</Label>
                      <Controller
                        control={form.control}
                        name="boardSeat"
                        render={({ field }) => (
                          <ShadSelect onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="mt-2 bg-black border border-neutral-700 text-white focus:border-lime-300">
                              <SelectValue placeholder="Select option" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#111] border border-neutral-700 text-white">
                              {["Yes", "No"].map((v) => (
                                <SelectItem key={v} value={v}>
                                  {v}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </ShadSelect>
                        )}
                      />
                    </div>
                    <div>
                      <Label className="text-neutral-400 text-xs uppercase tracking-wide">Decision Speed</Label>
                      <Controller
                        control={form.control}
                        name="decisionSpeed"
                        render={({ field }) => (
                          <ShadSelect onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="mt-2 bg-black border border-neutral-700 text-white focus:border-lime-300">
                              <SelectValue placeholder="Select speed" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#111] border border-neutral-700 text-white">
                              {["Fast", "Moderate", "Deliberate"].map((v) => (
                                <SelectItem key={v} value={v}>
                                  {v}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </ShadSelect>
                        )}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <SubmitButton />
          </form>
        </div>
      </div>
    </main>
  );
}