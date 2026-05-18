"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import PremiumShell from "@/components/PremiumShell";
import TopNav from "@/components/cinematic/TopNav";
import CineCard from "@/components/cinematic/CineCard";
import Footer from "@/components/cinematic/Footer";
import EngagementModal, { PlanTier } from "@/components/EngagementModal";
import { buildNarrative } from "@/lib/narratives/storyBuilder";

type Advice = {
  intro: string;
  insights: { title: string; text: string }[];
  verdict?: string;
  models: {
    name: string;
    why: string;
    msrp?: number;
    tags?: string[];
  }[];
  closing: string;

  answers?: {
    family?: boolean;
    imagePriority?: string;
    drivingExcitement?: string;
  };
};

type LoadState = "loading" | "ready" | "empty";

const STORAGE = {
  advice: "driveStyleAdvice",
  email: "driveStyleEmail",
  name: "driveStyleName",
  phone: "driveStylePhone",
} as const;

function ResultsPageContent() {
  const searchParams = useSearchParams();

  const isPaidJourney = searchParams.get("paidJourney") === "true";

  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [advice, setAdvice] = useState<Advice | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanTier | null>(null);
  const [sendingReport, setSendingReport] = useState(false);
  const [sendingReport, setSendingReport] = useState(false);

  useEffect(() => {
    const raw =
      sessionStorage.getItem(STORAGE.advice) || localStorage.getItem(STORAGE.advice);

    if (!raw) {
      setLoadState("empty");
      return;
    }

    try {
      setAdvice(JSON.parse(raw));
      setLoadState("ready");
    } catch {
      setLoadState("empty");
    }
  }, []);

  async function sendRecommendation() {
  if (!advice || sendingReport) return;

  setSendingReport(true);

  try {
    const email =
      localStorage.getItem("driveStyleEmail") || "";

    const name =
      localStorage.getItem("driveStyleName") || "";

    await fetch(
      "/api/recommendation/send",
      {
        method: "POST",
        headers: {
          "Content-Type":"application/json",
        },
        body: JSON.stringify({
          email,
          name,
          tier: "paid",
          recommendation: advice,
        }),
      }
    );

    alert(
      "Drive Style recommendation request received."
    );

  } catch {
    alert(
      "Could not send recommendation"
    );
  }

  setSendingReport(false);
}

  const topModels = useMemo(() => (advice?.models || []).slice(0, 3), [advice]);

  const narrative = buildNarrative({
    family: advice?.answers?.family,
    imagePriority: advice?.answers?.imagePriority,
    drivingExcitement: advice?.answers?.drivingExcitement,
  });

  return (
    <PremiumShell header={<TopNav ctaHref="/quiz" ctaLabel="New brief" />}>
      <section className="cine-container pt-12 pb-10">
        {loadState === "ready" && advice && (
          <div className="space-y-7">
            {/* HERO / HEADER */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              <div className="xl:col-span-8">
                <div className="cine-pill">Your recommendation</div>

                <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[0.96] text-white max-w-4xl">
                  Here’s what I’d recommend
                </h1>

                <p className="mt-4 text-base sm:text-lg text-white/72 leading-relaxed max-w-2xl">
                  Based on your answers, these are the strongest matches for your
                  situation — balanced around fit, budget, and day-to-day usability.
                </p>
              </div>

              <div className="xl:col-span-4">
                <CineCard className="p-5 border border-teal-300/20 bg-white/[0.02]">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-teal-200/80">
                    Drive Style summary
                  </div>

                  <div className="mt-3 space-y-3 text-sm text-white/72">
                    <div>
                      <div className="text-white font-medium">Best next step</div>

                      <div className="mt-1 text-white/55">
                        {isPaidJourney
                          ? "Review your recommendation, then request your detailed report."
                          : "Review your shortlist, then choose the level of support you want from us."}
                      </div>
                    </div>

                    <div className="h-px bg-white/10" />

                    <div>
                      <div className="text-white font-medium">What this page does</div>

                      <div className="mt-1 text-white/55">
                        It turns your quiz answers into a clear recommendation, with
                        practical reasoning behind each option.
                      </div>
                    </div>
                  </div>
                </CineCard>
              </div>
            </div>

            {/* NARRATIVE SECTION */}
            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] px-8 py-10 sm:px-12 sm:py-14">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-400/[0.03] via-transparent to-transparent pointer-events-none" />

              <div className="relative z-10 max-w-4xl">
                <div className="text-[11px] uppercase tracking-[0.22em] text-teal-200/80">
                  Your Drive Style Profile
                </div>

                <h2 className="mt-5 text-5xl sm:text-6xl font-semibold tracking-tight leading-none text-white">
                  {narrative.archetype}
                </h2>

                <p className="mt-5 text-lg text-white/78 leading-relaxed max-w-2xl">
                  {narrative.identitySummary}
                </p>

                <div className="mt-8 h-px w-full bg-white/10" />

                <p className="mt-10 whitespace-pre-line text-white/70 leading-9 text-lg max-w-3xl">
                  {narrative.recommendationStory}
                </p>
              </div>
            </div>

            {/* INSIGHTS + VERDICT */}
            <CineCard className="p-6 sm:p-7 border border-white/8 bg-white/[0.02]">
              <div className="max-w-3xl">
                <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">
                  Why these vehicles
                </div>

                <p className="mt-4 text-white/80 leading-relaxed">{advice.intro}</p>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {advice.insights.map((insight) => (
                  <CineCard
                    key={insight.title}
                    glow={false}
                    className="p-5 border border-white/6 bg-white/[0.02]"
                  >
                    <div className="text-sm uppercase tracking-[0.16em] text-white/45">
                      {insight.title}
                    </div>

                    <div className="mt-3 text-sm text-white/72 leading-relaxed">
                      {insight.text}
                    </div>
                  </CineCard>
                ))}
              </div>

              {advice.verdict && (
                <div className="mt-6 rounded-2xl border border-teal-300/25 bg-teal-300/6 p-5 sm:p-6">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-teal-200/85">
                    Drive Style verdict
                  </div>

                  <div className="mt-3 text-white/88 leading-relaxed">
                    {advice.verdict}
                  </div>
                </div>
              )}
            </CineCard>

            {/* SHORTLIST */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <div className="cine-pill">Shortlist</div>

                  <h2 className="cine-h2 mt-3">Your strongest vehicle matches</h2>

                  <p className="mt-3 text-white/68 max-w-2xl">
                    These are the three options that best fit the needs you described.
                  </p>
                </div>

                {!isPaidJourney ? (
                  <Link href="/quiz" className="cine-btn-secondary">
                    Adjust my brief
                  </Link>
                ) : null}
              </div>

              <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
                {topModels.map((model, index) => (
                  <CineCard
                    key={model.name}
                    className={`p-0 overflow-hidden h-full transition-transform duration-300 hover:-translate-y-1 ${
                      index === 0
                        ? "border border-teal-300/40 bg-white/[0.045] shadow-[0_24px_70px_rgba(20,184,166,0.14)]"
                        : "border border-white/8 bg-white/[0.025]"
                    }`}
                  >
                    <div className="p-7 h-full flex flex-col">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.2em] text-white/42">
                            {index === 0
                              ? "Top recommendation"
                              : `Option ${index + 1}`}
                          </div>

                          <div className="mt-4 text-[30px] leading-[1.05] font-semibold tracking-tight text-white">
                            {model.name}
                          </div>
                        </div>

                        {index === 0 ? (
                          <span className="shrink-0 inline-flex items-center rounded-full border border-teal-300/25 bg-teal-300/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-teal-200">
                            Best fit
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-6 h-px w-full bg-white/10" />

                      <p className="mt-6 text-[15px] text-white/70 leading-7">
                        {model.why}
                      </p>

                      <div className="mt-6 flex flex-wrap gap-2">
                        {(model.tags || []).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-white/55"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {typeof model.msrp === "number" ? (
                        <div className="mt-8 text-sm text-white/50">
                          Indicative price:{" "}
                          <span className="text-white/82 font-medium">
                            R{model.msrp.toLocaleString("en-ZA")}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </CineCard>
                ))}
              </div>
            </div>

            {/* FINAL CTA */}
            {isPaidJourney ? (
              <CineCard className="p-7 border border-teal-300/20 bg-white/[0.02]">
                <div className="max-w-2xl">
                  <div className="cine-pill">Final step</div>

                  <h2 className="cine-h2 mt-4">
                    Receive your Drive Style recommendation
                  </h2>

                  <p className="mt-4 text-white/70 leading-relaxed">
                    Your personalised recommendation has been generated. Click below
                    to create and send your detailed Drive Style report.
                  </p>

                  <button
                    type="button"
                    onClick={sendRecommendation}
                    disabled={sendingReport}
                    className="cine-btn-primary mt-8"
                  >
                    {sendingReport
                      ? "Sending..."
                      : "Send me my Drive-Style Recommendation →"}
                  </button>

                </div>
              </CineCard>
            ) : (
              <CineCard className="p-6 sm:p-7 border border-white/8 bg-white/[0.02]">
                <div className="max-w-3xl">
                  <div className="cine-pill">Next step</div>

                  <h2 className="cine-h2 mt-4">Choose how much support you want</h2>

                  <p className="mt-3 text-white/72 leading-relaxed">
                    {advice.closing}
                  </p>
                </div>

                <div className="mt-7 grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
                  <PlanTile
                    title="Silver"
                    subtitle="Sharper guidance, more clarity"
                    description="A focused support layer for buyers who want better structure and practical next steps."
                    cta="Continue with Silver"
                    onSelect={() => setSelectedPlan("Silver")}
                  />

                  <PlanTile
                    title="Gold"
                    subtitle="More support, less effort"
                    description="Our most balanced option for buyers who want hands-on guidance without going fully end-to-end."
                    cta="Continue with Gold"
                    highlight
                    onSelect={() => setSelectedPlan("Gold")}
                  />

                  <PlanTile
                    title="Platinum"
                    subtitle="End-to-end premium guidance"
                    description="For buyers who want the most involved support across choice, finance, insurance, and final decision-making."
                    cta="Continue with Platinum"
                    onSelect={() => setSelectedPlan("Platinum")}
                  />
                </div>
              </CineCard>
            )}
          </div>
        )}

        {loadState === "loading" && (
          <CineCard className="p-6 border border-white/8 bg-white/[0.02]">
            <div className="cine-pill">Loading</div>

            <h2 className="cine-h2 mt-4">Preparing your recommendation</h2>

            <p className="mt-3 text-white/70">
              Just a moment while we load your results.
            </p>
          </CineCard>
        )}

        {loadState === "empty" && (
          <CineCard className="p-6 border border-white/8 bg-white/[0.02]">
            <div className="cine-pill">No results found</div>

            <h2 className="cine-h2 mt-4">
              We couldn’t find a saved recommendation
            </h2>

            <p className="mt-3 text-white/70 max-w-xl">
              Start a new brief and we’ll generate a fresh recommendation for you.
            </p>

            <Link href="/quiz" className="cine-btn-primary mt-6 inline-flex">
              Start again <span aria-hidden>→</span>
            </Link>
          </CineCard>
        )}

        <EngagementModal
          open={!!selectedPlan}
          tier={selectedPlan}
          onClose={() => setSelectedPlan(null)}
        />
      </section>

      <Footer />
    </PremiumShell>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={null}>
      <ResultsPageContent />
    </Suspense>
  );
}

function PlanTile({
  title,
  subtitle,
  description,
  cta,
  onSelect,
  highlight,
}: {
  title: string;
  subtitle: string;
  description: string;
  cta: string;
  onSelect: () => void;
  highlight?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`text-left rounded-2xl p-6 min-h-[250px] flex flex-col transition-transform duration-200 ${
        highlight
          ? "border border-teal-300/30 bg-white/[0.03] shadow-[0_20px_60px_rgba(20,184,166,0.08)] hover:-translate-y-1"
          : "border border-white/6 bg-white/[0.02] hover:-translate-y-0.5"
      }`}
    >
      <div className="min-h-[40px] flex flex-wrap items-center gap-2">
        {highlight ? (
          <span className="inline-flex items-center rounded-full border border-teal-300/25 bg-teal-300/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-teal-200">
            Most popular
          </span>
        ) : null}

        <span
          className={`text-[10px] sm:text-[11px] uppercase tracking-[0.22em] ${
            highlight ? "text-teal-200/85" : "text-white/40"
          }`}
        >
          {subtitle}
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="text-2xl font-semibold tracking-tight text-white">
          {title}
        </div>

        <div
          className={highlight ? "text-teal-300 text-lg" : "text-white/30 text-lg"}
          aria-hidden
        >
          →
        </div>
      </div>

      <div className="mt-5 h-px w-full bg-white/10" />

      <p className="mt-5 text-sm text-white/72 leading-relaxed">
        {description}
      </p>

      <div
        className={`mt-auto pt-6 text-sm ${
          highlight ? "text-teal-200" : "text-white/80"
        }`}
      >
        {cta}
      </div>
    </button>
  );
}