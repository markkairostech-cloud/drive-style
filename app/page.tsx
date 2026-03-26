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
        {/* Cinematic hero image (LOCKED BEHIND CONTENT) */}
        <div
          className="pointer-events-none absolute top-16 -z-10"
          style={{
            right: "max(1.25rem, calc((100vw - 72rem)/2 + 1.25rem))",
            width: "min(820px, 52vw)",
            opacity: 1,
          }}
        >
          <img
            src="/sa-bakkie-hero.png"
            alt=""
            className="w-full h-auto"
            style={{
              filter: "brightness(0.52) saturate(0.78) contrast(1.03)",
              WebkitMaskImage:
                "radial-gradient(140% 120% at 90% 50%, black 62%, transparent 92%)," +
                "linear-gradient(90deg, transparent 0%, black 52%, black 100%)",
              maskImage:
                "radial-gradient(140% 120% at 90% 50%, black 62%, transparent 92%)," +
                "linear-gradient(90deg, transparent 0%, black 52%, black 100%)",
            }}
          />

          {/* Softer teal-charcoal wash for calmer premium feel */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(6,10,12,1) 0%, rgba(6,10,12,0.84) 28%, rgba(10,30,30,0.30) 60%, rgba(10,30,30,0.0) 78%)," +
                "linear-gradient(180deg, rgba(6,10,12,0.0) 55%, rgba(7,20,22,0.52) 85%, rgba(6,10,12,0.82) 100%)",
            }}
          />
        </div>

        {/* Foreground content explicitly above */}
        <div className="cine-container pt-14 sm:pt-16 pb-10 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <div className="cine-pill mb-5">Boutique vehicle concierge</div>

              <h1 className="cine-h1">
                Confidence <span className="cine-italic-accent">in</span> Every Car Choice
              </h1>

              <p className="mt-5 text-lg leading-relaxed text-white/75 max-w-xl">
                Hundreds of models. Endless reviews. Dealer pressure.
                <span className="text-white/85"> Drive Style</span> gives you a calm, expert recommendation — built around
                your life, your budget, and South Africa’s market realities.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link href="/quiz" className="cine-btn-primary">
                  See my recommendation <span aria-hidden>→</span>
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
          </div>
        </div>
      </section>

      {/* 4 STEPS */}
      <section className="mt-2">
        <div className="cine-container py-12">
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
              See my recommendation <span aria-hidden>→</span>
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StepCard index="01" title="Tell us your reality" desc="Lifestyle, budget, passengers, and roads — the essentials." />
            <StepCard index="02" title="We score the market" desc="Vehicles are ranked by fit, cost logic, and use-case bias." />
            <StepCard index="03" title="You get a shortlist" desc="A clear top pick plus alternatives — each explained." />
            <StepCard index="04" title="Next steps, simplified" desc="We help you move from shortlist to confidence." />
          </div>

          <div className="mt-10">
            <div className="cine-sep" />
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services">
        <div className="cine-container pb-14">
          <div className="cine-pill">Services</div>
          <h2 className="cine-h2 mt-3">Vehicle concierge support</h2>
          <p className="mt-3 text-white/70 max-w-2xl">
            Start free with your recommendation, then choose the level of support you want.
          </p>

          <div className="mt-7 grid grid-cols-1 md:grid-cols-3 gap-4">
            <CineCard className="p-5">
              <button type="button" className="w-full text-left" onClick={() => setSelectedPlan("Silver")}>
                <div className="text-sm font-semibold">Silver</div>
                <div className="mt-2 text-sm text-white/70 leading-relaxed">
                  Deeper shortlist, messaging templates, finance guidance, negotiation confidence.
                </div>
              </button>
            </CineCard>

            <CineCard className="p-5">
              <button type="button" className="w-full text-left" onClick={() => setSelectedPlan("Gold")}>
                <div className="text-sm font-semibold">Gold</div>
                <div className="mt-2 text-sm text-white/70 leading-relaxed">
                  Hands-off support, verification help, guidance until purchase.
                </div>
              </button>
            </CineCard>

            <CineCard className="p-5">
              <button type="button" className="w-full text-left" onClick={() => setSelectedPlan("Platinum")}>
                <div className="text-sm font-semibold">Platinum</div>
                <div className="mt-2 text-sm text-white/70 leading-relaxed">
                  Finance and insurance guidance, plus a fully supported premium buying journey.
                </div>
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