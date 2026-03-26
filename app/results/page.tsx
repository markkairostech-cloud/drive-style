"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PremiumShell from "@/components/PremiumShell";
import TopNav from "@/components/cinematic/TopNav";
import CineCard from "@/components/cinematic/CineCard";
import Footer from "@/components/cinematic/Footer";
import SubscribeCtas from "@/components/SubscribeCtas";
import EngagementModal, { PlanTier } from "@/components/EngagementModal";

type Advice = {
  intro: string;
  insights: { title: string; text: string }[];
  verdict?: string;
  models: { name: string; why: string; msrp?: number }[];
  closing: string;
};

type LoadState = "loading" | "ready" | "empty";
type SaveStatus = "idle" | "sending" | "sent" | "error";

const STORAGE = {
  advice: "driveStyleAdvice",
  email: "driveStyleEmail",
  name: "driveStyleName",
  phone: "driveStylePhone",
} as const;

export default function ResultsPage() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [advice, setAdvice] = useState<Advice | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanTier | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE.advice) || localStorage.getItem(STORAGE.advice);
    if (!raw) return setLoadState("empty");
    setAdvice(JSON.parse(raw));
    setLoadState("ready");
  }, []);

  const topModels = useMemo(() => (advice?.models || []).slice(0, 3), [advice]);

  return (
    <PremiumShell header={<TopNav ctaHref="/quiz" ctaLabel="New brief" />}>
      <section className="cine-container pt-12 pb-14">
        {loadState === "ready" && advice && (
          <div className="space-y-6">

            {/* HEADER */}
            <div>
              <div className="cine-pill">Your recommendation</div>
              <h1 className="cine-h1 mt-4">Here’s what I’d recommend</h1>
              <p className="mt-3 text-white/70 max-w-2xl">
                Based on your answers, these are the strongest matches for your situation.
              </p>
            </div>

            {/* INSIGHTS */}
            <CineCard className="p-6">
              <p className="text-white/80">{advice.intro}</p>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {advice.insights.map((i) => (
                  <CineCard key={i.title} glow={false} className="p-4">
                    <div className="font-semibold">{i.title}</div>
                    <div className="text-sm text-white/70 mt-2">{i.text}</div>
                  </CineCard>
                ))}
              </div>

              {advice.verdict && (
                <div className="mt-6 border border-teal-300/30 p-5 rounded-xl bg-teal-500/5">
                  <div className="font-semibold mb-2">Drive Style Verdict</div>
                  <div className="text-white/80 text-sm">{advice.verdict}</div>
                </div>
              )}
            </CineCard>

            {/* SHORTLIST */}
            <div>
              <h2 className="cine-h2">Your shortlist</h2>
              <div className="grid gap-4 mt-4">
                {topModels.map((m, i) => (
                  <CineCard key={m.name} className="p-5">
                    <div className="text-sm text-white/60">Option {i + 1}</div>
                    <div className="text-lg font-semibold mt-1">{m.name}</div>
                    <div className="text-sm text-white/70 mt-2">{m.why}</div>
                  </CineCard>
                ))}
              </div>
            </div>

            {/* CTA SECTION */}
            <CineCard className="p-7">
              <div className="text-white/80">{advice.closing}</div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">

                <PlanTile title="Silver" subtitle="More clarity" onSelect={() => setSelectedPlan("Silver")} />

                <PlanTile
                  title="Gold"
                  subtitle="Most popular choice"
                  highlight
                  onSelect={() => setSelectedPlan("Gold")}
                />

                <PlanTile title="Platinum" subtitle="Full premium support" onSelect={() => setSelectedPlan("Platinum")} />

              </div>
            </CineCard>
          </div>
        )}

        {loadState === "empty" && (
          <CineCard className="p-6">
            <h2>No results found</h2>
            <Link href="/quiz" className="cine-btn-primary mt-4 inline-block">
              Start again →
            </Link>
          </CineCard>
        )}

        <EngagementModal open={!!selectedPlan} tier={selectedPlan} onClose={() => setSelectedPlan(null)} />
      </section>

      <Footer />
    </PremiumShell>
  );
}

/* =========================
   PLAN TILE (Revised)
   ========================= */
function PlanTile({
  title,
  subtitle,
  onSelect,
  highlight,
}: {
  title: string;
  subtitle: string;
  onSelect: () => void;
  highlight?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`text-left rounded-2xl p-8 transition transform hover:-translate-y-1 ${
        highlight
          ? "border border-teal-200/80 bg-gradient-to-b from-teal-300/30 to-teal-500/12 shadow-[0_90px_220px_-80px_rgba(20,184,166,1)] scale-[1.08]"
          : "border border-teal-300/35 bg-gradient-to-b from-teal-400/12 to-teal-500/06 shadow-[0_55px_150px_-75px_rgba(20,184,166,0.75)] hover:border-teal-300/60 hover:shadow-[0_70px_180px_-70px_rgba(20,184,166,0.9)]"
      }`}
    >
      {highlight && (
        <div className="text-base text-teal-100 font-semibold mb-3">
          Recommended
        </div>
      )}

      <div className={`mb-2 ${highlight ? "text-base text-teal-100/90" : "text-base text-teal-200/80"}`}>
        {subtitle}
      </div>

      <div className={`font-semibold text-white ${highlight ? "text-3xl" : "text-2xl"}`}>
        {title}
      </div>

      <div className={`mt-5 ${highlight ? "text-lg text-white" : "text-lg text-white/90"}`}>
        Continue with {title} →
      </div>
    </button>
  );
}