"use client";

import Link from "next/link";
import { useState } from "react";
import PremiumShell from "@/components/PremiumShell";
import TopNav from "@/components/cinematic/TopNav";
import StepCard from "@/components/cinematic/StepCard";
import CineCard from "@/components/cinematic/CineCard";
import Footer from "@/components/cinematic/Footer";
import EngagementModal, { PlanTier } from "@/components/EngagementModal";

export default function HomePage() {
  const [selectedPlan, setSelectedPlan] = useState<PlanTier | null>(null);

  return (
    <PremiumShell header={<TopNav />}>
      
      {/* HERO */}
      <section className="relative">
        <div className="cine-container pt-16 sm:pt-20 pb-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* LEFT */}
            <div className="lg:col-span-5">
              <div className="cine-pill mb-5">Boutique vehicle concierge</div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[0.94] text-white">
                Confidence <span className="cine-italic-accent">in</span> Every Car Choice
              </h1>

              <p className="mt-5 text-lg leading-relaxed text-white/75 max-w-xl">
                Hundreds of models. Endless reviews. Dealer pressure.
                <span className="text-white/85"> Drive Style</span> gives you a calm, expert
                recommendation — built around your life, your budget, and South Africa’s market realities.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link href="/quiz" className="cine-btn-primary">
                  See my free recommendation →
                </Link>
                <Link href="#services" className="cine-btn-secondary">
                  Explore services
                </Link>
              </div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl">
                <CineCard glow={false} className="p-4">
                  <div className="text-xs text-white/60">Explainable</div>
                  <div className="mt-1 text-sm font-semibold">Deterministic engine</div>
                </CineCard>
                <CineCard glow={false} className="p-4">
                  <div className="text-xs text-white/60">Local</div>
                  <div className="mt-1 text-sm font-semibold">South Africa only</div>
                </CineCard>
                <CineCard glow={false} className="p-4">
                  <div className="text-xs text-white/60">Premium</div>
                  <div className="mt-1 text-sm font-semibold">Advisor tone</div>
                </CineCard>
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex justify-center lg:justify-end lg:col-span-7">
              <div
                className="w-full max-w-[640px] rounded-[28px]"
                style={{
                  boxShadow: "0 30px 80px rgba(0, 180, 160, 0.15)"
                }}
              >
                <img
                  src="/hero-car.png"
                  alt="Premium SUV in studio lighting"
                  className="w-full h-auto rounded-[28px]"
                  style={{
                    filter: "brightness(0.95) contrast(1.05)"
                  }}
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4 STEPS */}
      <section className="mt-0">
        <div className="cine-container py-10">
          <div className="flex items-end justify-between gap-6 flex-col sm:flex-row">
            <div>
              <div className="cine-pill">How it works</div>
              <h2 className="cine-h2 mt-3">
                Your personal car-buying concierge in <span className="text-teal-300">4</span> steps
              </h2>
              <p className="mt-3 text-white/70 max-w-2xl">
                A short quiz, a clear recommendation, and a shortlist you can act on — without noise.
              </p>
            </div>
            <Link href="/quiz" className="cine-btn-primary">
              See my free recommendation →
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StepCard index="01" title="Tell us your reality" desc="Lifestyle, budget, passengers, and roads — the essentials." />
            <StepCard index="02" title="We score the market" desc="Vehicles are ranked by fit, cost logic, and use-case bias." />
            <StepCard index="03" title="You get a shortlist" desc="A clear top pick plus alternatives — each explained." />
            <StepCard index="04" title="Next steps, simplified" desc="We help you move from shortlist to confidence." />
          </div>

          <div className="mt-8">
            <div className="cine-sep" />
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services">
        <div className="cine-container pb-8">
          <div className="max-w-3xl">
            <div className="cine-pill">Services</div>
            <h2 className="cine-h2 mt-3">Choose the level of guidance you need</h2>
            <p className="mt-3 text-white/70 max-w-2xl leading-relaxed">
              Start with a free recommendation, then step into deeper support only if you want it.
              Every option is designed to reduce uncertainty, protect your time, and help you make a confident decision without pressure.
            </p>
          </div>

          <div className="mt-7 grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            
            <CineCard className="p-0 overflow-hidden h-full border border-white/5">
              <button className="w-full h-full min-h-[250px] text-left p-6 flex flex-col" onClick={() => setSelectedPlan("Silver")}>
                <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">Best for independent buyers</div>
                <div className="mt-3 text-2xl font-semibold text-white">Silver</div>
                <p className="mt-5 text-sm text-white/70">Sharper shortlist and clearer next steps.</p>
              </button>
            </CineCard>

            <CineCard className="p-0 overflow-hidden h-full border border-teal-300/30 bg-white/[0.02]">
              <button className="w-full h-full min-h-[250px] text-left p-6 flex flex-col" onClick={() => setSelectedPlan("Gold")}>
                <div className="text-teal-300 text-[10px] uppercase">Most popular</div>
                <div className="mt-3 text-2xl font-semibold text-white">Gold</div>
                <p className="mt-5 text-sm text-white/70">More support, less effort.</p>
              </button>
            </CineCard>

            <CineCard className="p-0 overflow-hidden h-full border border-white/5">
              <button className="w-full h-full min-h-[250px] text-left p-6 flex flex-col" onClick={() => setSelectedPlan("Platinum")}>
                <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">Full service</div>
                <div className="mt-3 text-2xl font-semibold text-white">Platinum</div>
                <p className="mt-5 text-sm text-white/70">End-to-end premium guidance.</p>
              </button>
            </CineCard>

          </div>
        </div>
      </section>

      <EngagementModal open={!!selectedPlan} tier={selectedPlan} onClose={() => setSelectedPlan(null)} />
      <Footer />
    </PremiumShell>
  );
}