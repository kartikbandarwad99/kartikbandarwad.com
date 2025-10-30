"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function RequestIntroForm({ onSubmitForm }: { onSubmitForm: (data: any) => Promise<void> }) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    await onSubmitForm(data);
    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl bg-[#111] py-8  "
    >
      <div>
        <Label className="text-neutral-400 text-xs uppercase tracking-wide">Your Name</Label>
        <Input name="name" required className="mt-2 bg-black border border-neutral-700 text-white" />
      </div>
      <div>
        <Label className="text-neutral-400 text-xs uppercase tracking-wide">Your Email</Label>
        <Input type="email" name="email" required className="mt-2 bg-black border border-neutral-700 text-white" />
      </div>
      <div>
        <Label className="text-neutral-400 text-xs uppercase tracking-wide">LinkedIn</Label>
        <Input name="linkedin" placeholder="https://linkedin.com/in/…" className="mt-2 bg-black border border-neutral-700 text-white" />
      </div>
      <div>
        <Label className="text-neutral-400 text-xs uppercase tracking-wide">Reason for Intro</Label>
        <Textarea name="reason" rows={4} required className="mt-2 bg-black border border-neutral-700 text-white" />
      </div>
      <Button disabled={loading} type="submit" className="w-full bg-lime-300 text-black font-semibold">
        {loading ? "Submitting…" : "Submit Request"}
      </Button>
    </form>
  );
}