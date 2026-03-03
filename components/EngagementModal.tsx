"use client";

import { useEffect, useMemo, useState } from "react";
import CineCard from "@/components/cinematic/CineCard";

export type PlanTier = "Silver" | "Gold" | "Platinum";

const PLAN_PRICES_ZAR: Record<PlanTier, number> = {
  Silver: 10,
  Gold: 20,
  Platinum: 30,
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

  // keep in sync when opening with prefilled values (results page)
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

  if (!open || !tier) return null;

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
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md">
        <CineCard className="p-6">
          <div className="cine-pill">Engagement</div>

          <div className="mt-3 text-lg font-semibold tracking-tight">
            {tier} — R{price}
          </div>

          <div className="mt-2 text-sm text-white/70 leading-relaxed">
            Confirm your details, then proceed to secure payment via PayFast.
          </div>

          <form onSubmit={startPayment} className="mt-5 space-y-4">
            <input
              className="cine-input"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              className="cine-input"
              placeholder="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              className="cine-input"
              placeholder="Telephone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />

            <button type="submit" className="cine-btn-primary w-full" disabled={status === "starting"}>
              {status === "starting" ? "Redirecting…" : "Pay securely with PayFast"}
              <span aria-hidden>→</span>
            </button>

            {error ? (
              <div className="rounded-xl border border-red-400/25 bg-red-500/10 p-4 text-sm text-red-100">
                {error}
              </div>
            ) : null}

            <button type="button" className="cine-btn-secondary w-full" onClick={onClose}>
              Cancel
            </button>
          </form>
        </CineCard>
      </div>
    </div>
  );
}