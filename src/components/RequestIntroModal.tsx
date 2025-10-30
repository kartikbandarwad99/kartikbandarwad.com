"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import RequestIntroForm from "@/components/RequestIntroForm";

interface RequestIntroModalProps {
  open: boolean;
  onClose: () => void;
  targetId: number | null;
  targetType: "founder" | "investor" | null;
}

export default function RequestIntroModal({
  open,
  onClose,
  targetId,
  targetType,
}: RequestIntroModalProps) {
  async function submitForm(data: any) {
    console.log("Intro request submitted", { targetId, targetType, ...data });
    // API call here
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-[#111] border border-neutral-800 text-white">
        <DialogHeader>
          <DialogTitle>Request an Introduction</DialogTitle>
          <DialogDescription className="text-neutral-500">
            We’ll review and approve intros to ensure a good fit.
          </DialogDescription>
        </DialogHeader>
        <RequestIntroForm onSubmitForm={submitForm} />
      </DialogContent>
    </Dialog>
  );
}