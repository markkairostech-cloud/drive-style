"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PremiumShell from "@/components/PremiumShell";
import TopNav from "@/components/cinematic/TopNav";
import CineCard from "@/components/cinematic/CineCard";
import Footer from "@/components/cinematic/Footer";
import SubscribeCtas from "@/components/SubscribeCtas";

type Advice = {
  intro: string;
  insights: { title: string; text: string }[];
  verdict?: string;
  models: { name: string; why: string }[];
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

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string>("");
  const [saveName, setSaveName] = useState("");
  const [saveEmail, setSaveEmail] = useState("");
  const [savePhone, setSavePhone] = useState("");

  useEffect(() => {
    try {
      let raw = sessionStorage.getItem(STORAGE.advice);
      if (!raw) raw = localStorage.getItem(STORAGE.advice);
      if (!raw) {
        setLoadState("empty");
        return;
      }
      const parsed = JSON.parse(raw);
      setAdvice(parsed);
      setLoadState("ready");
      localStorage.setItem(STORAGE.advice, raw);

      const existingEmail = String(localStorage.getItem(STORAGE.email) || "").trim();
      const existingName = String(localStorage.getItem(STORAGE.name) || "").trim();
      const existingPhone = String(localStorage.getItem(STORAGE.phone) || "").trim();
      if (existingEmail) setSaveEmail(existingEmail);
      if (existingName) setSaveName(existingName);
      if (existingPhone) setSavePhone(existingPhone);
    } catch {
      setLoadState("empty");
    }
  }, []);

  const shareText = useMemo(() => {
    if (!advice) return "";
    const models = (advice.models || [])
      .map((m, i) => `${i + 1}. ${m.name}\n   ${m.why}`)
      .join("\n\n");

    const insights = (advice.insights || []).map((i) => `• ${i.title}: ${i.text}`).join("\n");
    const verdictLine = advice.verdict ? `\n\nDrive Style Verdict:\n${advice.verdict}` : "";

    return `Drive Style Shortlist\n\nIntro:\n${advice.intro}\n\nInsights:\n${insights}${verdictLine}\n\nShortlist:\n${models}\n\nClosing:\n${advice.closing}\n`;
  }, [advice]);

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  function clearStoredAdvice() {
    try {
      sessionStorage.removeItem(STORAGE.advice);
      localStorage.removeItem(STORAGE.advice);
    } catch {
      // ignore
    }
  }

  async function onSaveSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!advice) return;

    const email = saveEmail.trim().toLowerCase();
    if (!email) return;

    if (saveStatus === "sending") return;
    setSaveStatus("sending");
    setSaveError("");

    const payload = {
      name: saveName.trim(),
      email,
      phone: savePhone.trim(),
      budget: "",
      message: `Save shortlist request.\n\n${shareText}`,
      company: "",
      source: "results_save",
    };

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Save failed");
      }

      try {
        localStorage.setItem(STORAGE.email, email);
        if (saveName.trim()) localStorage.setItem(STORAGE.name, saveName.trim());
        if (savePhone.trim()) localStorage.setItem(STORAGE.phone, savePhone.trim());
      } catch {
        // ignore
      }

      setSaveStatus("sent");
    } catch (err: any) {
      setSaveStatus("error");
      setSaveError(err?.message || "Could not save. Please try again.");
    }
  }

  return (
    <PremiumShell header={<TopNav ctaHref="/quiz" ctaLabel="New brief" />}>
      <section className="cine-container pt-12 pb-14">
        {/* Loading */}
        {loadState === "loading" && (
          <CineCard className="p-6">
            <div className="cine-pill">Generating</div>
            <div className="mt-4 h-8 w-64 rounded-lg bg-white/10" />
            <div className="mt-3 h-4 w-full rounded-lg bg-white/10" />
            <div className="mt-2 h-4 w-4/5 rounded-lg bg-white/10" />
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="h-24 rounded-2xl bg-white/10" />
              <div className="h-24 rounded-2xl bg-white/10" />
              <div className="h-24 rounded-2xl bg-white/10" />
            </div>
          </CineCard>
        )}

        {/* Empty */}
        {loadState === "empty" && (
          <CineCard className="p-7">
            <div className="cine-pill">No results</div>
            <h1 className="cine-h2 mt-4">No advice found</h1>
            <p className="mt-3 text-white/70 max-w-2xl">
              This page needs your latest brief. If you refreshed or opened this page directly, your results may not be available.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link href="/quiz" className="cine-btn-primary">
                Back to the quiz <span aria-hidden>→</span>
              </Link>
              <Link href="/" className="cine-btn-secondary">
                Home
              </Link>
            </div>

            <button
              type="button"
              className="mt-6 text-sm text-white/70 hover:text-white transition underline underline-offset-4"
              onClick={() => {
                clearStoredAdvice();
                window.location.href = "/quiz";
              }}
            >
              Clear saved results & restart
            </button>

            <div className="mt-8">
              <SubscribeCtas />
            </div>
          </CineCard>
        )}

        {/* Ready */}
        {loadState === "ready" && advice && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div>
                <div className="cine-pill">Your shortlist</div>
                <h1 className="cine-h1 mt-4">Your shortlist is ready</h1>
                <p className="mt-3 text-white/70 max-w-2xl">
                  5 vehicles that match your brief — ranked by best fit.
                </p>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={copyToClipboard} className="cine-btn-secondary">
                  {copied ? "Copied" : "Copy summary"}
                </button>
                <Link href="/quiz" className="cine-btn-primary">
                  New brief <span aria-hidden>→</span>
                </Link>
              </div>
            </div>

            {/* Intro + Insights */}
            <CineCard className="p-6">
              <p className="text-white/80 leading-relaxed">{advice.intro}</p>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                {(advice.insights || []).map((ins) => (
                  <CineCard key={ins.title} glow={false} className="p-5">
                    <div className="text-sm font-semibold">{ins.title}</div>
                    <div className="mt-2 text-sm text-white/70 leading-relaxed">{ins.text}</div>
                  </CineCard>
                ))}
              </div>

              {advice.verdict ? (
                <div className="mt-8 rounded-2xl border border-sky-300/20 bg-gradient-to-b from-sky-400/15 to-blue-500/5 p-6 shadow-[0_55px_160px_-120px_rgba(59,130,246,1)]">
                  <div className="text-sm font-semibold text-white">Drive Style Verdict</div>
                  <div className="mt-2 text-sm text-white/80 leading-relaxed">{advice.verdict}</div>
                </div>
              ) : null}
            </CineCard>

            {/* Shortlist */}
            <div className="flex items-center gap-4">
              <h2 className="cine-h2">Shortlist options</h2>
              <div className="cine-sep" />
              <div className="hidden sm:block text-xs text-white/60">Tap “Read more” for details</div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {(advice.models || []).map((m, idx) => {
                const isExpanded = !!expanded[m.name];
                const long = (m.why || "").trim().length > 180;
                const text = !long || isExpanded ? m.why : `${m.why.slice(0, 180).trim()}…`;

                return (
                  <CineCard key={m.name} className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div>
                        <div className="cine-pill">#{String(idx + 1).padStart(2, "0")}</div>
                        <div className="mt-3 text-lg font-semibold tracking-tight">{m.name}</div>
                        <div className="mt-2 text-sm text-white/70 leading-relaxed">{text}</div>
                      </div>
                      <div className="flex gap-3 sm:flex-col sm:items-stretch">
                        {long && (
                          <button
                            type="button"
                            className="cine-btn-secondary"
                            onClick={() => setExpanded((s) => ({ ...s, [m.name]: !s[m.name] }))}
                          >
                            {isExpanded ? "Show less" : "Read more"}
                          </button>
                        )}
                      </div>
                    </div>
                  </CineCard>
                );
              })}
            </div>

            {/* Closing + Save */}
            <CineCard className="p-7">
              <div className="text-sm text-white/80 leading-relaxed">{advice.closing}</div>

              <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7">
                  <div className="text-sm font-semibold">Email me this shortlist</div>
                  <div className="mt-2 text-sm text-white/70">
                    Enter your email and we’ll save your shortlist to your inbox.
                  </div>

                  <form onSubmit={onSaveSubmit} className="mt-5 space-y-4">
                    <input
                      className="cine-input"
                      placeholder="Email"
                      type="email"
                      value={saveEmail}
                      onChange={(e) => setSaveEmail(e.target.value)}
                      required
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        className="cine-input"
                        placeholder="Name (optional)"
                        value={saveName}
                        onChange={(e) => setSaveName(e.target.value)}
                      />
                      <input
                        className="cine-input"
                        placeholder="Phone (optional)"
                        value={savePhone}
                        onChange={(e) => setSavePhone(e.target.value)}
                      />
                    </div>

                    <button type="submit" className="cine-btn-primary w-full" disabled={saveStatus === "sending"}>
                      {saveStatus === "sending" ? "Saving…" : saveStatus === "sent" ? "Saved" : "Save + email me"}
                      <span aria-hidden>→</span>
                    </button>

                    {saveStatus === "error" && (
                      <div className="rounded-xl border border-red-400/25 bg-red-500/10 p-4 text-sm text-red-100">
                        {saveError}
                      </div>
                    )}

                    <div className="text-xs text-white/60">
                      Tip: you can also <button type="button" className="underline underline-offset-4" onClick={copyToClipboard}>copy</button> and send it to yourself.
                    </div>
                  </form>
                </div>

                <div className="lg:col-span-5">
                  <div className="text-sm font-semibold">Want hands-on concierge support?</div>
                  <div className="mt-2 text-sm text-white/70 leading-relaxed">
                    If you’d like help turning this shortlist into a confident purchase, explore the support plans.
                  </div>
                  <div className="mt-5">
                    <Link href="/#services" className="cine-btn-secondary w-full">
                      View support plans
                    </Link>
                  </div>
                </div>
              </div>
            </CineCard>
          </div>
        )}
      </section>

      <Footer />
    </PremiumShell>
  );
}

function maskEmail(email: string) {
  const [u, d] = email.split("@");
  if (!u || !d) return email;
  if (u.length <= 2) return `**@${d}`;
  return `${u.slice(0, 2)}***@${d}`;
}
