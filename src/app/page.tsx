"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Github, Linkedin } from "lucide-react";
import Image from "next/image";
import BackgroundFX from "@/components/BackgroundFX";
import Navbar from "@/components/Navbar";

const MediumIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1043.63 592.71"
    fill="currentColor"
    {...props}
  >
    <path d="M588.67 296.35c0 163.61-131.21 296.35-293.74 296.35C132.4 592.7 1.18 459.96 1.18 296.35S132.4 0 294.93 0c162.53 0 293.74 132.74 293.74 296.35m296.04 0c0 155.1-65.61 280.82-146.55 280.82-80.94 0-146.55-125.72-146.55-280.82S657.22 15.53 738.16 15.53c80.94 0 146.55 125.72 146.55 280.82m158.92 0c0 139.3-23.4 252.27-52.27 252.27-28.87 0-52.27-112.97-52.27-252.27 0-139.3 23.4-252.27 52.27-252.27 28.87 0 52.27 112.97 52.27 252.27" />
  </svg>
);
export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
        
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#111] text-white flex items-center min-h-screen px-6">
        <BackgroundFX mode="section" />

        <div className="relative z-10 max-w-6xl mx-auto w-full flex flex-col justify-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-bold leading-tight mb-6"
          >
            Hi, I’m Kartik. <br />
            VC Scout & Startup Enthusiast.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-lg text-neutral-400 max-w-2xl mb-8"
          >
            I help founders connect with the right investors. Partnered with VC firms and angel networks, 
            I aim to streamline the path from pitch to partnership.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex gap-4"
          >
            <Link href="/founders/submit">
              <button className="bg-lime-300 text-black font-semibold px-6 py-3 rounded-lg hover:bg-lime-200 transition-colors">
                Submit Your Pitch
              </button>
            </Link>
            <Link href="/network">
              <button className="border border-lime-300 text-lime-300 font-semibold px-6 py-3 rounded-lg hover:bg-lime-300 hover:text-black transition-colors">
                View My Network
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* About Me Section */}
        <section id="about" className="bg-[#f8f8f8] text-black py-32 px-6">
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                {/* Profile Image with Animation */}
                <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="flex justify-center md:justify-start"
                >
                <Image
                    src="/profile.JPG"
                    alt="Profile photo of Kartik Bandarwad"
                    width={400}   // adjust size as needed
                    height={400}  // adjust size as needed
                    className="rounded-xl object-cover shadow-lg"
                    priority
                />
                </motion.div>

                {/* About Text with Animation */}
                <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                >
                {/* <h2 className="text-4xl font-bold mb-6">About Me</h2> */}
                <span className="inline-block text-2xl mb-16 font-medium text-neutral-700 tracking-wide ">
                  ■ ABOUT ME
                </span>
                <p className="text-lg text-neutral-600 mb-8">
                    Currently scouting for LvlUp Ventures, I’ve built a deal flow of 20+ startups 
                    that have collectively raised over $30M and generate $11M ARR. 
                    Selected as 1 of 260 fellows from 1,700+ applicants at Venture Institute, 
                    I’ve conducted deep due diligence, financial modeling, and market validation 
                    for early-stage startups.
                </p>
                <p className="text-lg text-neutral-600">
                    My curiosity drives me to explore multiple layers of the tech stack — from 
                    front-end frameworks like React and Next.js to backend systems in Python, 
                    C++, and cloud deployments. This breadth gives me perspective when 
                    evaluating startups and their products.
                </p>
                </motion.div>
            </div>
        </section>

      <section className="relative overflow-hidden">
      
      <BackgroundFX mode="section" />

      {/* How It Works Section */}
        <section id="how-it-works" className="bg-[#111] text-white py-32 px-6">
          <div className="max-w-6xl mx-auto">
            {/* <h2 className="text-4xl font-bold mb-16">How It Works</h2> */}
            <span className="inline-block text-gray-300 text-2xl mb-16 font-medium tracking-wide ">
              ■ HOW IT WORKS
            </span>
            {/* 3-up on md+; stacks on mobile */}
            <div className="grid md:grid-cols-3 gap-12">
              {/* For Founders */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="bg-[#181818] p-8 rounded-xl border border-neutral-800 flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-2xl font-semibold mb-4">For Founders</h3>
                  <p className="text-neutral-400 mb-6">
                    Submit your pitch to join my founder network and be visible to a
                    curated pool of investors. If you’re fundraising, apply to my VC partners
                    directly via the dedicated form.
                  </p>
                </div>
                <Link href="/founders/submit">
                  <button className="mt-auto border border-lime-300 text-lime-300 px-6 py-3 rounded-lg hover:bg-lime-300 hover:text-black transition">
                    Join as Founder
                  </button>
                </Link>
              </motion.div>

              {/* Apply to LvlUp Ventures (VC I scout for) */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-[#181818] p-8 rounded-xl border border-neutral-800 flex flex-col justify-between"
              >
                <div>
                  {/* <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-lime-300" /> New
                  </div> */}
                  <h3 className="text-2xl font-semibold mb-4">Apply to LvlUp Ventures</h3>
                  <p className="text-neutral-400 mb-6">
                    I actively scout for LvlUp Ventures. If your company fits our thesis,
                    you can apply here for a direct review. I’ll prioritize relevant
                    submissions and help with context where useful.
                  </p>
                </div>
                <Link href="/vc/apply">
                  {/* change href to your actual route or external form */}
                  <button className="mt-auto bg-lime-300 text-black px-6 py-3 rounded-lg font-semibold hover:bg-lime-200 transition">
                    Apply to LvlUp
                  </button>
                </Link>
              </motion.div>

              {/* For Investors */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-[#181818] p-8 rounded-xl border border-neutral-800 flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-2xl font-semibold mb-4">For Investors</h3>
                <p className="text-neutral-400 mb-6">
                    Join my investor directory to access high-quality deal flow.
                    I work closely with VCs and angels to ensure vetted introductions
                    and relevant startups that match your thesis.
                  </p>
                </div>
                <Link href="/investors/submit">
                  <button className="mt-auto border border-lime-300 text-lime-300 px-6 py-3 rounded-lg hover:bg-lime-300 hover:text-black transition">
                    Join as Investor
                  </button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>
      {/* SOCIALS / CONTACT */}
    {/* SOCIALS / CONTACT */}
        <section
        id="contact"
        className="bg-[#0f0f0f] text-white py-16 px-6 border-t border-neutral-800"
        >
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-8">
            
            {/* Intro text */}
            <div className="text-center max-w-2xl">
            <h2 className="text-3xl font-bold mb-3">Let’s Connect</h2>
            <p className="text-neutral-400">
                I’m always open to chatting about startups, venture capital, or new ideas.  
                Reach out through my socials below.
            </p>
            </div>

            {/* Icons */}
            <div className="flex items-center gap-8">
            <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-neutral-400 hover:text-lime-300 transition"
            >
                <Linkedin className="h-7 w-7" />
            </a>
            <a
                href="https://github.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-neutral-400 hover:text-lime-300 transition"
            >
                <Github className="h-7 w-7" />
            </a>
            <a
                href="https://medium.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Medium"
                className="text-neutral-400 hover:text-lime-300 transition"
            >
                <MediumIcon className="h-7 w-7" />
            </a>
            </div>
        </div>
        </section>  
        </section>  
        </div>
  );
}