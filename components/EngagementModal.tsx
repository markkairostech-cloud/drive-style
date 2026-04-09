"use client";

import { useEffect, useMemo, useState } from "react";
import CineCard from "@/components/cinematic/CineCard";

export type PlanTier = "Silver" | "Gold" | "Platinum";

const PLAN_PRICES_ZAR: Record<PlanTier, number> = {
  Silver: 10,
  Gold: 20,
  Platinum: 30,
};

const PLAN_SUMMARY: Record<
  PlanTier,
  {
    label: string;
    intro: string;
    reassurance: string;
  }
> = {
  Silver: {
    label: "Sharper guidance, more clarity",
    intro:
      "A focused support option for buyers who want better structure, clearer next steps, and more confidence before speaking to sellers.",
    reassurance:
      "A strong fit if you want practical help without committing to full-service support.",
  },
  Gold: {
    label: "More support, less effort",
    intro:
      "A more hands-on concierge option for buyers who want stronger guidance, verification support, and a more confident path through the buying process.",
    reassurance:
      "This is the most balanced option for buyers who want meaningful support without going fully end-to-end.",
  },
  Platinum: {
    label: "End-to-end premium guidance",
    intro:
      "Our most involved option for buyers who want a fully supported journey across vehicle choice, finance, insurance, and final decision-making.",
    reassurance:
      "Best suited to buyers who want maximum clarity, reduced friction, and premium support throughout.",
  },
};

export default function EngagementModal({
  open,
  tier,
  onClose,
  defaultName = "",
  defaultEmail = "",
  defaultPhone = "",
}: {
  open: boolean;
  tier: PlanTier | null;
  onClose: () => void;
  defaultName?: string;
  defaultEmail?: string;
  defaultPhone?: string;
}) {
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [phone, setPhone] = useState(defaultPhone);

  useEffect(() => {
    if (open) {
      setName(defaultName || "");
      setEmail(defaultEmail || "");
      setPhone(defaultPhone || "");
    }
  }, [open, defaultName, defaultEmail, defaultPhone]);

  const [status, setStatus] = useState<"idle" | "starting" | "error">("idle");
  const [error, setError] = useState("");

  const price = useMemo(() => (tier ? PLAN_PRICES_ZAR[tier] : 0), [tier]);
  const planCopy = useMemo(() => (tier ? PLAN_SUMMARY[tier] : null), [tier]);

  if (!open || !tier || !planCopy) return null;

  async function startPayment(e: React.FormEvent) {
    e.preventDefault();
    if (status === "starting") return;

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    if (!cleanName || !cleanEmail || !cleanPhone) return;

    setStatus("starting");
    setError("");

    try {
      const res = await fetch("/api/payfast/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
        }),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Could not start payment");
      }

      const data = (await res.json()) as { redirectUrl?: string };
      if (!data?.redirectUrl) throw new Error("Missing redirect URL");

      window.location.href = data.redirectUrl;
    } catch (err: any) {
      setStatus("error");
      setError(err?.message || "Could not start payment. Please try again.");
      setStatus("idle");
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl">
        <CineCard className="p-0 overflow-hidden border border-white/10 bg-[#0b1116] shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
          <div className="p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="cine-pill">Engagement</div>
                <div className="mt-4 flex items-end gap-3 flex-wrap">
                  <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                    {tier}
                  </h3>
                  {tier === "Gold" ? (
                    <span className="inline-flex items-center rounded-full border border-teal-300/25 bg-teal-300/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-teal-200">
                      Most popular
                    </span>
                  ) : null}
                </div>
                <div className="mt-2 text-sm text-white/50">{planCopy.label}</div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-[11px] uppercase tracking-[0.18em] text-white/45">
                  One-time engagement
                </div>

                <div className="mt-1 text-3xl sm:text-4xl font-semibold tracking-tight text-white">
                   R{price}
                </div>

                <div className="mt-2 text-[12px] text-white/50">
                    No subscription · No hidden fees
                </div>
              </div>
            </div>

            <div className="mt-5 h-px w-full bg-white/10" />

            <div className="mt-5 space-y-3">
              <p className="text-sm text-white/72 leading-relaxed">{planCopy.intro}</p>
              <p className="text-sm text-white/55 leading-relaxed">{planCopy.reassurance}</p>
            </div>

            <div className="mt-5 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-white/45">
                What happens next
              </div>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-white/72">
                <div>
                  <div className="text-white font-medium">1. Confirm details</div>
                  <div className="mt-1 text-white/55">So we know who the engagement is for.</div>
                </div>
                <div>
                  <div className="text-white font-medium">2. Secure checkout</div>
                  <div className="mt-1 text-white/55">You will be redirected to PayFast.</div>
                </div>
                <div>
                  <div className="text-white font-medium">3. We follow up</div>
                  <div className="mt-1 text-white/55">We continue from your selected plan.</div>
                </div>
              </div>
            </div>

            <form onSubmit={startPayment} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  className="cine-input"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <input
                  className="cine-input"
                  placeholder="Telephone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <input
                className="cine-input"
                placeholder="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="rounded-2xl border border-teal-300/15 bg-teal-300/5 px-4 py-3 text-sm text-white/70">
                Your payment is handled securely via <span className="text-white/90">PayFast</span>.
              </div>

              {error ? (
                <div className="rounded-2xl border border-red-400/25 bg-red-500/10 p-4 text-sm text-red-100">
                  {error}
                </div>
              ) : null}

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-1">
                <button
                  type="button"
                  className="cine-btn-secondary w-full sm:w-auto"
                  onClick={onClose}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="cine-btn-primary w-full sm:flex-1"
                  disabled={status === "starting"}
                >
                  {status === "starting"
                    ? "Redirecting…"
                    : `Continue with ${tier} — R${price}`}
                  <span aria-hidden>→</span>
                </button>
              </div>
            </form>
          </div>
        </CineCard>
      </div>
    </div>
  );
}