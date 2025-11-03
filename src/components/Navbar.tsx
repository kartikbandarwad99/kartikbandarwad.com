"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Linkedin, Copy, Check } from "lucide-react";

type Props = {
  fixed?: boolean;
  offsetTop?: boolean;
  useHashLinks?: boolean;
  brand?: string;
};

export default function Navbar({
  fixed = true,
  offsetTop = true,
  useHashLinks = true,
  brand = "Kartik Bandarwad",
}: Props) {
  const [open, setOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // TODO: replace with your real info
  const linkedinUrl = "https://www.linkedin.com/in/kartik-bandarwad/";
  const emailAddress = "kbandarwad@gmail.com";

  const prefix = useHashLinks ? "" : "/";

  const headerClasses = fixed
    ? "fixed top-0 left-0 w-full z-50 bg-[#111] text-white border-b border-neutral-800"
    : "relative w-full z-40 bg-[#111] text-white border-b border-neutral-800";

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(emailAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // no-op
    }
  };

  return (
    <>
      <header className={headerClasses}>
        <div className="mx-auto w-full max-w-6xl px-6 lg:px-0">
          <div className="h-20 flex items-center justify-between">
            {/* Brand */}
            <Link href="/" className="text-xl font-bold tracking-tight text-white">
              {brand}
              <span className="text-lime-300">.</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex gap-8 text-sm font-medium">
              {/* <Link href={`/about`} className="hover:text-lime-300 transition">About</Link> */}
              {/* <Link href={`/how-it-works`} className="hover:text-lime-300 transition">How It Works</Link> */}
              {/* <Link href={`/vc-partners`} className="hover:text-lime-300 transition">VC Partners</Link> */}
              {/* <Link href={`/network`} className="hover:text-lime-300 transition">Network</Link> */}
              {/* <Link href={`/Lvlup`} className="hover:text-lime-300 transition">Lvlup Ventures</Link> */}
              {/* <Link href={`/submit`} className="hover:text-lime-300 transition">Join the network</Link> */}


              {/* Contact opens dialog */}
              <Dialog open={contactOpen} onOpenChange={setContactOpen}>
                <DialogTrigger asChild>
                  <button className="hover:text-lime-300 transition">Contact</button>
                </DialogTrigger>
                <DialogContent className="bg-[#111] text-white border-neutral-800 !max-w-sm">
                  <DialogHeader>
                    <DialogTitle className="text-lime-300">Contact</DialogTitle>
                    <DialogDescription className="text-neutral-400">
                        Reach me via LinkedIn or Email.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 mt-2">
                    {/* LinkedIn with label */}
                    <div>
                        <label className="text-xs uppercase tracking-wide text-neutral-400">LinkedIn</label>
                        <a
                        href={linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 flex items-center justify-center gap-2 rounded-lg border border-neutral-700 bg-[#181818] px-4 py-3 hover:border-lime-300 transition"
                        aria-label="Open LinkedIn profile"
                        >
                        <Linkedin size={18} />
                        {/* <span>View Profile</span> */}
                        </a>
                    </div>

                    {/* Email read-only with copy */}
                    <div>
                        <label className="text-xs uppercase tracking-wide text-neutral-400">Email</label>
                        <div className="relative mt-1">
                        <Input
                            readOnly
                            value={emailAddress}
                            className="pr-12 bg-black border-neutral-700 text-white"
                        />
                        <Button
                            type="button"
                            onClick={handleCopyEmail}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-2 rounded-md bg-neutral-800 hover:bg-neutral-700 text-white"
                            aria-label="Copy Email Address"
                        >
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                        </Button>
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">Click the button to copy my email.</p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setOpen((v) => !v)}
              className="md:hidden border border-neutral-700 px-3 py-2 rounded-lg text-sm text-neutral-200 hover:text-lime-300 hover:border-lime-300 transition"
              aria-expanded={open}
              aria-label="Toggle menu"
            >
              Menu
            </button>
          </div>

          {/* Mobile dropdown */}
          {open && (
            <div className="md:hidden border-t border-neutral-800 pt-4 pb-6">
              <div className="flex flex-col gap-3 text-sm font-medium">
                {/* <Link href={`${prefix}#about`} onClick={() => setOpen(false)} className="hover:text-lime-300 transition">About</Link>
                <Link href={`${prefix}#how-it-works`} onClick={() => setOpen(false)} className="hover:text-lime-300 transition">How It Works</Link>
                <Link href={`${prefix}#vc-partners`} onClick={() => setOpen(false)} className="hover:text-lime-300 transition">VC Partners</Link>
                <Link href={`${prefix}#network`} onClick={() => setOpen(false)} className="hover:text-lime-300 transition">Network</Link> */}
                {/* <Link href={`/Lvlup`} className="hover:text-lime-300 transition">Lvlup Ventures</Link> */}
                {/* Contact opens same dialog; also close dropdown */}
                <button
                  className="text-left hover:text-lime-300 transition"
                  onClick={() => {
                    setOpen(false);
                    setContactOpen(true);
                  }}
                >
                  Contact
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {fixed && offsetTop && <div className="h-20" />}
    </>
  );
}