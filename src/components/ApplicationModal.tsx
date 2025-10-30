"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ApplicationModalProps {
  open: boolean;
  onClose: () => void;
  selectedVCs: string[];
}

export default function ApplicationModal({ open, onClose, selectedVCs }: ApplicationModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    startup: "",
    stage: "",
    industry: "",
    website: "",
    pitchDeck: "",
    additionalInfo: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitForm = async () => {
    console.log("Founder application submitted", { selectedVCs, ...formData });
    // TODO: API call to send data to backend/VC
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-[#111] border border-neutral-800 text-white">
        <DialogHeader>
          <DialogTitle>Apply to Selected VCs</DialogTitle>
          <DialogDescription className="text-neutral-500">
            Fill out your details and we’ll share them with the selected partners.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <p className="text-neutral-400 text-sm">
            Applying to: {selectedVCs.join(", ")}
          </p>

          <Input
            name="name"
            placeholder="Founder Name"
            value={formData.name}
            onChange={handleChange}
            className="bg-[#111] border border-neutral-800 text-white placeholder-neutral-500"
          />
          <Input
            name="startup"
            placeholder="Startup Name"
            value={formData.startup}
            onChange={handleChange}
            className="bg-[#111] border border-neutral-800 text-white placeholder-neutral-500"
          />
          <Input
            name="stage"
            placeholder="Stage (Seed, Series A...)"
            value={formData.stage}
            onChange={handleChange}
            className="bg-[#111] border border-neutral-800 text-white placeholder-neutral-500"
          />
          <Input
            name="industry"
            placeholder="Industry"
            value={formData.industry}
            onChange={handleChange}
            className="bg-[#111] border border-neutral-800 text-white placeholder-neutral-500"
          />
          <Input
            name="website"
            placeholder="Website URL"
            value={formData.website}
            onChange={handleChange}
            className="bg-[#111] border border-neutral-800 text-white placeholder-neutral-500"
          />
          <Input
            name="pitchDeck"
            placeholder="Pitch Deck URL (optional)"
            value={formData.pitchDeck}
            onChange={handleChange}
            className="bg-[#111] border border-neutral-800 text-white placeholder-neutral-500"
          />
          <textarea
            name="additionalInfo"
            placeholder="Additional Info (optional)"
            value={formData.additionalInfo}
            onChange={handleChange}
            className="w-full bg-[#111] border border-neutral-800 text-white placeholder-neutral-500 p-2 rounded"
            rows={4}
          />

          <Button
            onClick={submitForm}
            className="w-full bg-lime-300 text-black font-semibold hover:bg-lime-200"
          >
            Submit Application
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}