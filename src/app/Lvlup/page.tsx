"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, Controller, FieldErrors } from "react-hook-form";
import Select, { GroupBase } from "react-select";

import BackgroundFX from "@/components/BackgroundFX";
import Navbar from "@/components/Navbar";

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
import { X } from "lucide-react";
import { useFormStatus } from "react-dom";
import { submitApplicationAction } from "@/app/actions/lvlupsubmit"; // server action (Promise<void>)

// ============================ react-select dark styles ============================
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
    color: "#000",
    backgroundColor: "#bef264",
    borderRadius: 4,
    ":hover": { backgroundColor: "#a3e635", color: "#000" },
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

// ============================ Cards data ============================
type PartnerCard = {
  id: string;
  name: string;
  stage?: string;
  cheque?: string;
  focus?: string;
  regions?: string;
  criteria?: string;
  blurb?: string;
};

const partnersCards: PartnerCard[] = [
  {
    id: "lvlup",
    name: "LvlUp Ventures Seed Fund",
    stage: "Pre-Seed to Seed",
    cheque: "$100,000 – $250,000",
    focus: "Industry agnostic",
    regions: "United States, Canada",
    criteria: ">3 months in market",
  },
  {
    id: "cove-fund",
    name: "Cove Fund",
    stage: "Pre-Seed to Series A",
    cheque: "~$500,000",
    focus: "Deep Tech, Life Sciences, Enterprise Software, Data Analytics",
    regions: "Southern California",
    criteria: "Strong moat and product-market fit",
  },
  {
    id: "expertdojo",
    name: "ExpertDojo",
    stage: "Seed to Series A",
    cheque: "$50,000 – $3,000,000",
    focus: "Industry agnostic; emphasis on underrepresented founders (not a requirement)",
    regions: "Agnostic",
  },
  {
    id: "loreal-cvc",
    name: "L’Oréal Corporate Venture Arm",
    stage: "Strategic CVC / Acquisitions (Series A–C)",
    focus: "Beauty tech, retail innovation, sustainability; innovations enhancing L’Oréal’s ecosystem",
    criteria: "Potential for integration with L’Oréal’s core businesses",
  },
  {
    id: "sunset-ventures",
    name: "Sunset Ventures",
    stage: "Post-Seed",
    focus: "MediaTech, Creative Industries, Commerce, FinTech, Software",
    regions: "U.S. (California preferred)",
    criteria: "≥$250K annual revenue",
  },
  {
    id: "acronym",
    name: "Acronym VC",
    stage: "Late Seed to Series A",
    focus:
      "Enterprise & SMB SaaS — FinTech, Hospitality Tech, PropTech, Workflow, E-commerce Infrastructure, Cybersecurity, select Healthcare SaaS",
    regions: "U.S.",
  },
  {
    id: "apus-vc",
    name: "Apus VC",
    stage: "Early-stage (Post-revenue)",
    focus: "Tech and Real Estate; long-term growth with strategic/operational support",
    criteria: "Founders open to active partnership and board participation",
  },
  {
    id: "greycroft",
    name: "Greycroft",
    stage: "Seed to Series C",
    cheque: "Up to $50,000,000",
    focus: "Software generalists with emphasis on AI apps (consumer/B2B) and infrastructure",
    regions: "Primarily U.S.",
  },
  {
    id: "minnow",
    name: "Minnow Ventures",
    stage: "Pre-Seed to Series A",
    focus: "Healthcare — Biotech, HealthTech, AI in Healthcare, Drug Discovery, Lab Infrastructure",
    criteria: "Early-stage companies advancing healthcare innovation",
  },
  {
    id: "outlander",
    name: "Outlander VC",
    stage: "Pre-Seed and Seed",
    focus: "Industry agnostic",
    regions: "U.S.",
    criteria: "Strong early-stage founders with scalable potential",
    blurb: "Currently deploying Fund III ($150M).",
  },
  {
    id: "rpv-global",
    name: "RPV Global",
    stage: "Pre-Seed",
    focus: "Deep Tech (excludes Biotech, Pharma, Longevity, Psychedelics, Crypto, Software)",
    criteria: "U.S.-based with a proven scientific breakthrough",
  },
  {
    id: "brickyard",
    name: "Brickyard",
    stage: "Pre-Seed and Seed",
    cheque: "Up to $500,000",
    focus: "Industry agnostic",
    regions:
      "Global founders accepted; onsite in Chattanooga, TN until $1M ARR (optional for other team members)",
    criteria: "Founders committed to full focus and execution (“burn the ships”)",
  },
  {
    id: "enough",
    name: "Enough Ventures",
    stage: "Pre-Seed and Seed",
    focus: "HealthTech, AgeTech, Digital Infrastructure",
    regions: "Agnostic",
    criteria: "Purpose-driven ventures with measurable impact",
  },
  {
    id: "capital-midwest",
    name: "Capital Midwest Fund",
    stage: "Seed and Series A",
    focus: "Early revenue–stage software & tech-enabled (excludes healthcare and hardware)",
    regions: "Central U.S.",
    criteria: "Independent or syndicate participation",
  },
  {
    id: "lvlup-labs",
    name: "LvlUp Labs",
    stage: "N/A (Community platform, not a fund)",
    focus: "Founders-only community powered by LvlUp Ventures’ ecosystem",
    criteria: "Open to top-tier founders; free membership",
  },
  {
    id: "new-road",
    name: "New Road Capital",
    stage: "Growth to Expansion",
    cheque: "$5,000,000 – $20,000,000",
    focus: "Supply Chain & Logistics, Retail Technology, Marketing Technology",
    regions: "Mainly U.S.",
    criteria: "≥$1M ARR; PMF achieved",
  },
  {
    id: "incisive",
    name: "Incisive Ventures",
    stage: "Pre-Seed",
    cheque: "$250,000 – $750,000",
    focus:
      "B2B software; invests after MVP has been in customers’ hands ≥3 months; typical rounds $500K–$2M",
    criteria: "Post-revenue; product in-market with early customer validation",
  },
  {
    id: "connetic",
    name: "Connetic Ventures",
    stage: "Pre-Seed and Seed",
    cheque: "$500,000 – $1,000,000",
    focus: "Software, Data Analytics, FinTech, Consumer Products",
    regions: "North America (except Bay Area and Boston)",
  },
];

// ========= LvlUp Ventures Bootcamps =========
type BootcampCard = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  features: string[];
};

const bootcampCards: BootcampCard[] = [
  {
    id: "data-room",
    name: "LvlUp Cutting-Edge Data Room & Operations HQ Bootcamp",
    subtitle: "Build a world-class investor data room & ops HQ (Notion + AI).",
    description:
      "Self-paced, <30-day bootcamp to streamline operations and investor readiness. Ends with a live Demo Day & certification.",
    features: [
      "Free 6 months of Notion Pro + AI",
      "1:1 session with LvlUp team",
      "Weekly office hours & Demo Day with VCs",
      "Top 3 win expedited funding review (up to $1M)",
    ],
  },
  {
    id: "cap-table",
    name: "Prime Equity & Cap Table Bootcamp",
    subtitle: "Master equity management and VC-ready cap tables.",
    description:
      "Learn how to structure ownership, model dilution, and forecast raises. Culminates in Demo Day & certification.",
    features: [
      "1:1 sessions with Qapita + LvlUp",
      "Advisor agreement & templates included",
      "Access 3,000+ investor list post-graduation",
      "Top founders fast-tracked for $1M review",
    ],
  },
  {
    id: "financial-modeling",
    name: "LvlUp × Grasshopper Bank: Financial Modeling & Startup Banking Bootcamp",
    subtitle: "Optimize your financial systems and fundraising strategy.",
    description:
      "Self-paced program to master startup banking, cash flow, and modeling. Includes Demo Day with investors.",
    features: [
      "1:1 review with LvlUp & Grasshopper experts",
      "Curated 1,700+ investor list",
      "Workshops on cash flow & growth modeling",
      "Demo Day + awards + fast-track for $1M funding",
    ],
  },
];

// ========= LvlUp Applicant Exclusive Perks =========
type ProgramCard = { id: string; name: string; subtitle: string; perks: string[] };
const programsCards: ProgramCard[] = [
  {
    id: "wing",
    name: "Wing × LvlUp Ventures Perk",
    subtitle:
      "Access Top-Tier Entry & Mid-Level Talent at LvlUp-Subsidized Rates (Starting at $500/Month) — Used by 1,000+ Teams at Google, DoorDash & Harvard University",
    perks: ["Complimentary 1:1 consultation", "Earn a $50 startup grant after attending your consultation"],
  },
  {
    id: "shields",
    name: "Shields Group Executive Search × LvlUp Ventures Perk",
    subtitle: "For High-Level Hires | FREE Hiring Strategy Session",
    perks: [],
  },
  {
    id: "gcloud",
    name: "Google Cloud × LvlUp Ventures Perk",
    subtitle: "Up To $350K in Free Credits",
    perks: [],
  },
];

// ============================ Form fields ============================
const industryOptions = [
  "Adtech","AgeTech","AI","AR/VR","ArtTech","B2B","BioTech","Consumer",
  "Climate or CleanTech","Creator Economy","Cybersecurity","DeepTech","E-Commerce",
  "EdTech","Energy","Enterprise","FinTech","FoodTech","Future of Work","Gaming",
  "Hardware","HealthTech","InsurTech","LegalTech","Logistics & Manufacturing",
  "Media & Entertainment","MusicTech","Payments","Pets","PropTech","Retail","Saas",
  "Web 3.0","Other",
];

const regionOptions = [
  "United States",
  "LATAM",
  "United Kingdom",
  "Canada",
  "Israel",
  "Europe",
  "India",
  "Asia",
  "Singapore",
  "Other",
].map((r) => ({ value: r, label: r }));

const stageSelect = ["Bridge Round","Pre-Seed", "Seed","Seed Extension/Seed+", "Series A", "Series B","Series C"];

type YesNo = "yes" | "no";
type FormValues = {
  founderFirstName: string;
  founderLastName: string;
  founderEmail: string;
  founderPhone: string;

  companyName: string;
  companyWebsite: string;
  industry: string[]; // ≤4
  companyRegion: string;
  elevatorPitch: string; // ≤300
  pitchDeckPdf?: FileList;
  pitchDeckLink?: string;

  isB2BSaaSWithRunway: YesNo;
  sellsPhysicalProduct: YesNo;
  hasFounderOver50: YesNo;
  hasBlackFounder: YesNo;
  hasFemaleFounder: YesNo;
  isForeignBornInUS: YesNo;

  fundraisingStage: string;
  raiseAmount: string;
  valuation: string;
  mrr: string;
  burnRate: string;
  previouslyRaised: string;
  wantsOtherCompetitions: YesNo;

  programs: string[];
  competitions: string[];
};

/* ========== Yes/No pill ========== */
function PillYesNo({
  name,
  register,
  required = true,
}: {
  name: keyof FormValues;
  register: ReturnType<typeof useForm<FormValues>>["register"];
  required?: boolean;
}) {
  const base =
    "select-none rounded-full border border-neutral-700 bg-[#181818] px-4 py-2 text-sm text-white transition " +
    "peer-checked:bg-lime-300 peer-checked:text-black peer-checked:border-lime-300 hover:border-lime-300 focus:outline-none";
  return (
    <div className="inline-flex gap-3">
      <label className="inline-flex items-center">
        <input type="radio" value="yes" {...register(name as any, { required })} className="peer sr-only" />
        <span className={base}>Yes</span>
      </label>
      <label className="inline-flex items-center">
        <input type="radio" value="no" {...register(name as any, { required })} className="peer sr-only" />
        <span className={base}>No</span>
      </label>
    </div>
  );
}

/** Submit button that reflects Server Action pending state */
function SubmitButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="button"
      onClick={onClick}
      className="rounded-lg bg-lime-300 text-black font-semibold hover:bg-lime-200 disabled:opacity-60"
      disabled={disabled || pending}
    >
      {pending ? "Submitting..." : "Submit"}
    </Button>
  );
}

export default function VCPartnersPage() {
  /* ===== Selections (cards) ===== */
  const [selectedPartners, setSelectedPartners] = useState<string[]>([]);
  const [selectedCompetitions, setSelectedCompetitions] = useState<string[]>([]);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]); // store PROGRAM NAMES

  const togglePartner = (id: string) =>
    setSelectedPartners((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleCompetition = (id: string) =>
    setSelectedCompetitions((prev) => {
      const set = new Set(prev);
      if (set.has(id)) set.delete(id);
      else if (set.size < 5) set.add(id);
      return Array.from(set);
    });
  const toggleProgram = (programName: string) =>
    setSelectedPrograms((prev) => (prev.includes(programName) ? prev.filter((x) => x !== programName) : [...prev, programName]));

  /* ===== Form ===== */
  const {
    register,
    control,
    reset,
    watch,
    setValue,
    formState,
    getValues,
    trigger, // <-- for programmatic validation
  } = useForm<FormValues>({
    defaultValues: {
      industry: [],
      fundraisingStage: "Seed",
      programs: [],
      competitions: [],
    },
  });

  useEffect(() => {
    setValue("competitions", selectedCompetitions);
  }, [selectedCompetitions, setValue]);

  useEffect(() => {
    setValue("programs", selectedPrograms);
  }, [selectedPrograms, setValue]);

  const elevatorPitch = watch("elevatorPitch") || "";
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const formRef = useRef<HTMLFormElement | null>(null);
  const hiddenSubmitRef = useRef<HTMLButtonElement | null>(null);

  // Build payload and submit natively to Server Action
  const handleSubmitClick = async () => {
    const isValid = await trigger(); // RHF validation
    if (!isValid || !formRef.current) return;

    const v = getValues();

    const payload = {
      partnersSelected: selectedPartners,
      competitionsSelected: selectedCompetitions,
      programsSelected: selectedPrograms,
      founder: {
        firstName: v.founderFirstName,
        lastName: v.founderLastName,
        email: v.founderEmail,
        phone: v.founderPhone,
      },
      company: {
        name: v.companyName,
        website: v.companyWebsite,
        industries: v.industry,
        region: v.companyRegion,
        elevatorPitch: v.elevatorPitch,
        deckLink: v.pitchDeckLink || null,
      },
      eligibility: {
        b2bSaaSWith3MoRunway: v.isB2BSaaSWithRunway === "yes",
        sellsPhysicalProduct: v.sellsPhysicalProduct === "yes",
        hasFounderOver50: v.hasFounderOver50 === "yes",
        hasBlackFounder: v.hasBlackFounder === "yes",
        hasFemaleFounder: v.hasFemaleFounder === "yes",
        isForeignBornFounderInUS: v.isForeignBornInUS === "yes",
        wantsOtherCompetitions: v.wantsOtherCompetitions === "yes",
      },
      financials: {
        fundraisingStage: v.fundraisingStage,
        raiseAmount: v.raiseAmount,
        valuation: v.valuation,
        mrr: v.mrr,
        burnRate: v.burnRate,
        previouslyRaised: v.previouslyRaised,
      },
      submittedAt: new Date().toISOString(),
    };

    // ensure single hidden input named "payload"
    const existing = formRef.current.querySelector('input[name="payload"]') as HTMLInputElement | null;
    if (existing) existing.value = JSON.stringify(payload);
    else {
      const hidden = document.createElement("input");
      hidden.type = "hidden";
      hidden.name = "payload";
      hidden.value = JSON.stringify(payload);
      formRef.current.appendChild(hidden);
    }

    // call the native submission using the hidden submitter that points to the Server Action
    formRef.current.requestSubmit(hiddenSubmitRef.current ?? undefined);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setValue("pitchDeckPdf", undefined);
  };

  const onError = (e: FieldErrors<FormValues>) => console.warn("Form errors", e);

  return (
    <main className="min-h-screen bg-[#111] text-white">
      <BackgroundFX mode="fixed" />
      <Navbar />

      <div className="mx-auto w-full max-w-6xl px-6 lg:px-0 pt-24 md:pt-28 pb-16">
        {/* widen left (7) and narrow right (5) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          {/* ================= LEFT: Cards ================= */}
          <div className="md:col-span-7 space-y-8">
            {/* VC partners */}
            <section>
              <h2 className="text-2xl font-semibold">VC Partners</h2>
              <Label className="text-neutral-400 text-xs uppercase tracking-wide">
                (Select the VCs you want to apply to *)
              </Label>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {partnersCards.map((p) => {
                  const isSelected = selectedPartners.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePartner(p.id)}
                      aria-pressed={isSelected}
                      className={`text-left rounded-xl border p-6 shadow-lg transition focus:outline-none focus:ring-2 focus:ring-lime-300
                        ${isSelected ? "border-lime-300 bg-[#1b1b1b]" : "border-neutral-800 bg-[#181818] hover:border-lime-300"}
                        flex flex-col justify-start h-full min-h-[260px]`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-lg font-semibold">{p.name}</h3>
                        {isSelected && (
                          <span className="shrink-0 rounded-md bg-lime-300 px-2 py-0.5 text-xs font-bold text-black">
                            Selected
                          </span>
                        )}
                      </div>
                      {p.blurb && <p className="text-sm text-neutral-400 mt-2">{p.blurb}</p>}
                      <div className="mt-3 grid gap-1 text-sm text-neutral-400">
                        {p.focus && (
                          <p>
                            <span className="text-neutral-300 font-medium">Sectors:</span> {p.focus}
                          </p>
                        )}
                        {p.regions && (
                          <p>
                            <span className="text-neutral-300 font-medium">Geography:</span> {p.regions}
                          </p>
                        )}
                        {p.stage && (
                          <p>
                            <span className="text-neutral-300 font-medium">Stage:</span> {p.stage}
                          </p>
                        )}
                        {p.cheque && (
                          <p>
                            <span className="text-neutral-300 font-medium">Cheque:</span> {p.cheque}
                          </p>
                        )}
                        {p.criteria && (
                          <p>
                            <span className="text-neutral-300 font-medium">Criteria:</span> {p.criteria}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Bootcamps */}
            <section>
              <h2 className="text-2xl font-semibold">LvlUp Ventures Bootcamps</h2>
              <Label className="text-neutral-400 text-xs uppercase tracking-wide">
                (select the ones that apply)
              </Label>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {bootcampCards.map((b) => {
                  const isSelected = selectedPrograms.includes(b.name);
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => toggleProgram(b.name)}
                      aria-pressed={isSelected}
                      className={`text-left rounded-xl border p-6 shadow-lg transition focus:outline-none focus:ring-2 focus:ring-lime-300
                        ${isSelected ? "border-lime-300 bg-[#1b1b1b]" : "border-neutral-800 bg-[#181818] hover:border-lime-300"}
                        flex flex-col justify-start h-full min-h-[260px]`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-lg font-semibold">{b.name}</h3>
                        {isSelected && (
                          <span className="shrink-0 rounded-md bg-lime-300 px-2 py-0.5 text-xs font-bold text-black">
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-400 mt-1">{b.subtitle}</p>
                      <p className="text-sm text-neutral-400 mt-2">{b.description}</p>
                      <ul className="mt-3 list-disc pl-5 text-sm text-neutral-400 space-y-1">
                        {b.features.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Perks */}
            <section>
              <h2 className="text-2xl font-semibold">LvlUp Applicant Exclusive Perks</h2>
              <Label className="text-neutral-400 text-xs uppercase tracking-wide">
                (select the options that apply)
              </Label>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {programsCards.map((pg) => {
                  const isSelected = selectedPrograms.includes(pg.name);
                  return (
                    <button
                      key={pg.id}
                      type="button"
                      onClick={() => toggleProgram(pg.name)}
                      aria-pressed={isSelected}
                      className={`text-left rounded-xl border p-6 shadow-lg transition focus:outline-none focus:ring-2 focus:ring-lime-300
                        ${isSelected ? "border-lime-300 bg-[#1b1b1b]" : "border-neutral-800 bg-[#181818] hover:border-lime-300"}
                        flex flex-col justify-start h-full min-h-[220px]`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-lg font-semibold">{pg.name}</h3>
                        {isSelected && (
                          <span className="shrink-0 rounded-md bg-lime-300 px-2 py-0.5 text-xs font-bold text-black">
                            Selected
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-neutral-400 mt-1">{pg.subtitle}</p>

                      {pg.perks.length > 0 && (
                        <ul className="mt-3 list-disc pl-5 text-sm text-neutral-400 space-y-1">
                          {pg.perks.map((line, i) => (
                            <li key={i}>{line}</li>
                          ))}
                        </ul>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          {/* ================= RIGHT: Form ================= */}
          <div className="md:col-span-5">
            <form
              ref={formRef}
              action={submitApplicationAction} // Server Action — DO NOT set encType/method; Next does it.
              // no onSubmit -> we drive validation+submit from the button
              className="space-y-8 rounded-xl border border-neutral-800 bg-[#181818] p-8 shadow-lg"
            >
              {/* hidden real submitter that points to our Server Action */}
              <button
                ref={hiddenSubmitRef}
                type="submit"
                formAction={submitApplicationAction}
                className="hidden"
                aria-hidden
                tabIndex={-1}
              />

              {/* Founder Contact */}
              <section>
                <h3 className="text-lg font-semibold">Founder Contact Information</h3>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-neutral-400 text-xs uppercase tracking-wide">Founder First Name *</Label>
                    <Input
                      {...register("founderFirstName", { required: true })}
                      className="mt-2 bg-black border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300"
                    />
                  </div>
                  <div>
                    <Label className="text-neutral-400 text-xs uppercase tracking-wide">Founder Last Name *</Label>
                    <Input
                      {...register("founderLastName", { required: true })}
                      className="mt-2 bg-black border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300"
                    />
                  </div>
                  <div>
                    <Label className="text-neutral-400 text-xs uppercase tracking-wide">Main Founder Email *</Label>
                    <Input
                      type="email"
                      {...register("founderEmail", { required: true })}
                      className="mt-2 bg-black border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300"
                    />
                  </div>
                  <div>
                    <Label className="text-neutral-400 text-xs uppercase tracking-wide">Founder Phone Number *</Label>
                    <Input
                      {...register("founderPhone", { required: true })}
                      placeholder="+1 555 123 4567"
                      className="mt-2 bg-black border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300"
                    />
                  </div>
                </div>
              </section>

              {/* Company Basic Info */}
              <section>
                <h3 className="text-lg font-semibold">Company Basic Information</h3>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-neutral-400 text-xs uppercase tracking-wide">Company Name *</Label>
                    <Input
                      {...register("companyName", { required: true })}
                      className="mt-2 bg-black border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300"
                    />
                  </div>
                  <div>
                    <Label className="text-neutral-400 text-xs uppercase tracking-wide">Company Website *</Label>
                    <Input
                      type="url"
                      {...register("companyWebsite", { required: true })}
                      placeholder="https://…"
                      className="mt-2 bg-black border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300"
                    />
                  </div>

                  {/* Industry: react-select multi (≤4) */}
                  <div className="sm:col-span-2">
                    <Label className="text-neutral-400 text-xs uppercase tracking-wide">
                      Industry (choose up to 4) *
                    </Label>
                    <Controller
                      control={control}
                      name="industry"
                      rules={{ validate: (v) => (v?.length ?? 0) > 0 && (v?.length ?? 0) <= 4 }}
                      render={({ field }) => {
                        const options = industryOptions.map((x) => ({ value: x, label: x }));
                        const value = options.filter((o) => (field.value || []).includes(o.value));
                        return (
                          <Select<OptionType, true, GroupBase<OptionType>>
                            isMulti
                            options={options}
                            styles={customStyles}
                            className="mt-2"
                            value={value}
                            onChange={(selected) => {
                              const vals = selected.map((s) => s.value).slice(0, 4);
                              field.onChange(vals);
                            }}
                            placeholder="Select industries…"
                            closeMenuOnSelect={false}
                          />
                        );
                      }}
                    />
                    <p className="mt-1 text-xs text-neutral-500">{(watch("industry") || []).length}/4 selected</p>
                  </div>

                  {/* Region: shadcn single-select */}
                  <div className="sm:col-span-2">
                    <Label className="text-neutral-400 text-xs uppercase tracking-wide">
                      Company Location (Region) *
                    </Label>
                    <Controller
                      control={control}
                      name="companyRegion"
                      rules={{ required: true }}
                      render={({ field }) => (
                        <ShadSelect onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="mt-2 ctrl text-white">
                            <SelectValue placeholder="Select region" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#111] border border-neutral-700 text-white">
                            {regionOptions.map((r) => (
                              <SelectItem key={r.value} value={r.value}>
                                {r.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </ShadSelect>
                      )}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label className="text-neutral-400 text-xs uppercase tracking-wide">
                      Elevator Pitch (300 chars) *
                    </Label>
                    <Textarea
                      rows={4}
                      maxLength={300}
                      {...register("elevatorPitch", { required: true, maxLength: 300 })}
                      placeholder="Tell us briefly about your business…"
                      className="mt-2 bg-black border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300"
                    />
                    <div className="mt-1 text-xs text-neutral-500">{elevatorPitch.length}/300</div>
                  </div>

                  <div className="sm:col-span-2 ">
                    <Label className="text-neutral-400 text-xs uppercase tracking-wide">Pitch Deck (PDF) *</Label>
                    <div className="relative mt-2">
                      <Input
                        type="file"
                        accept="application/pdf"
                        {...register("pitchDeckPdf", {
                          required: true,
                          onChange: (e) => {
                            const file = e.target.files?.[0] ?? null;
                            setSelectedFile(file);
                          },
                        })}
                        className="w-full bg-[#181818] border border-neutral-700 text-white
                                    file:rounded-md file:border-0 file:bg-lime-300
                                    file:px-3 file:py-2 file:text-black
                                    focus:border-lime-300 cursor-pointer pr-10"
                      />
                      {selectedFile && (
                        <button
                          type="button"
                          onClick={handleClearFile}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md
                                    bg-neutral-700 hover:bg-neutral-600 text-white
                                    px-1.5 py-0.5 transition"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-neutral-400 text-xs uppercase tracking-wide">Pitch Deck (Link)</Label>
                    <Input
                      type="url"
                      {...register("pitchDeckLink")}
                      placeholder="DocSend / Google Drive"
                      className="mt-2 bg-black border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300"
                    />
                  </div>
                </div>
              </section>

              {/* Eligibility */}
              <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label className="text-neutral-400 text-xs uppercase tracking-wide">
                    B2B SaaS with ≥3 months runway? *
                  </Label>
                  <div className="mt-2">
                    <PillYesNo name="isB2BSaaSWithRunway" register={register} />
                  </div>
                </div>
                <div>
                  <Label className="text-neutral-400 text-xs uppercase tracking-wide">
                    Sell a physical product on your website? *
                  </Label>
                  <div className="mt-2">
                    <PillYesNo name="sellsPhysicalProduct" register={register} />
                  </div>
                </div>
                <div>
                  <Label className="text-neutral-400 text-xs uppercase tracking-wide">
                    One or more founder above 50? *
                  </Label>
                  <div className="mt-2">
                    <PillYesNo name="hasFounderOver50" register={register} />
                  </div>
                </div>
                <div>
                  <Label className="text-neutral-400 text-xs uppercase tracking-wide">One or more black founders? *</Label>
                  <div className="mt-2">
                    <PillYesNo name="hasBlackFounder" register={register} />
                  </div>
                </div>

                {/* NEW questions */}
                <div>
                  <Label className="text-neutral-400 text-xs uppercase tracking-wide">
                    Do you have one or more female founders? *
                  </Label>
                  <div className="mt-2">
                    <PillYesNo name="hasFemaleFounder" register={register} />
                  </div>
                </div>
                <div>
                  <Label className="text-neutral-400 text-xs uppercase tracking-wide">
                    Are you a foreign-born founder living in the United States? *
                  </Label>
                  <div className="mt-2">
                    <PillYesNo name="isForeignBornInUS" register={register} />
                  </div>
                </div>
              </section>

              {/* Financials */}
              <section>
                <h3 className="text-lg font-semibold">Company Financial Information</h3>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-neutral-400 text-xs uppercase tracking-wide">Fundraising Stage *</Label>
                    <Controller
                      control={control}
                      name="fundraisingStage"
                      render={({ field }) => (
                        <ShadSelect onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="mt-2 ctrl text-white">
                            <SelectValue placeholder="Select stage" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#111] border border-neutral-700 text-white">
                            {stageSelect.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </ShadSelect>
                      )}
                    />
                  </div>

                  <div>
                    <Label className="text-neutral-400 text-xs uppercase tracking-wide">Raise Amount *</Label>
                    <Input
                      {...register("raiseAmount", { required: true })}
                      placeholder="$1,000,000"
                      className="mt-2 bg-black border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300"
                    />
                  </div>

                  <div>
                    <Label className="text-neutral-400 text-xs uppercase tracking-wide">Valuation *</Label>
                    <Input
                      {...register("valuation", { required: true })}
                      placeholder="$10,000,000 (pre/target)"
                      className="mt-2 bg-black border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300"
                    />
                  </div>

                  <div>
                    <Label className="text-neutral-400 text-xs uppercase tracking-wide">Company MRR *</Label>
                    <Input
                      {...register("mrr", { required: true })}
                      placeholder="$25,000"
                      className="mt-2 bg-black border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300"
                    />
                  </div>

                  <div>
                    <Label className="text-neutral-400 text-xs uppercase tracking-wide">Company Burn Rate *</Label>
                    <Input
                      {...register("burnRate", { required: true })}
                      placeholder="$40,000"
                      className="mt-2 bg-black border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300"
                    />
                  </div>

                  <div>
                    <Label className="text-neutral-400 text-xs uppercase tracking-wide">
                      Previously Raised Capital *
                    </Label>
                    <Input
                      {...register("previouslyRaised", { required: true })}
                      placeholder="$500,000"
                      className="mt-2 bg-black border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-300"
                    />
                  </div>
                </div>
              </section>

              {/* Other pitch competitions question */}
              <section>
                <Label className="text-neutral-400 text-xs uppercase tracking-wide">
                  Do you want to participate in other pitch competitions hosted by or in partnership with LvlUp Ventures? *
                </Label>
                <div className="mt-2">
                  <PillYesNo name="wantsOtherCompetitions" register={register} />
                </div>
              </section>

              {/* Status line BEFORE buttons */}
              <div className="text-sm text-neutral-500">
                {selectedPartners.length} partner{selectedPartners.length === 1 ? "" : "s"} •{" "}
                {selectedPrograms.length} program{selectedPrograms.length === 1 ? "" : "s"} •{" "}
                {selectedCompetitions.length}/5 competitions
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  className="rounded-lg border border-neutral-700 bg-transparent text-white hover:bg-neutral-900"
                  onClick={() => {
                    reset();
                    setSelectedPartners([]);
                    setSelectedCompetitions([]);
                    setSelectedPrograms([]);
                  }}
                >
                  Clear form
                </Button>

                {/* Visible submit that does RHF validation then native-submit to server action */}
                <SubmitButton onClick={handleSubmitClick} disabled={formState.isSubmitting} />
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}