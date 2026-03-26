"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PremiumShell from "@/components/PremiumShell";
import TopNav from "@/components/cinematic/TopNav";
import CineCard from "@/components/cinematic/CineCard";
import Footer from "@/components/cinematic/Footer";

type Status = "idle" | "sending" | "error";

export default function QuizPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const disable = status === "sending";
  const year = useMemo(() => new Date().getFullYear(), []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;

    setStatus("sending");
    setError("");

    const form = e.currentTarget;
    const data = new FormData(form);

    const leadPayload = {
      name: String(data.get("name") || ""),
      email: String(data.get("email") || ""),
      phone: String(data.get("phone") || ""),
      budget: String(data.get("budget") || ""),
      budgetType: String(data.get("budgetType") || "purchase_price"),
      message: String(data.get("message") || ""),
      company: String(data.get("company") || ""),
      source: "quiz",
    };

    const advicePayload = {
      passengers: String(data.get("passengers") || "couple"),
      distance: String(data.get("distance") || "mixed"),
      budget: String(data.get("budgetAttitude") || "balanced"),
      budgetAmount: String(data.get("budget") || ""),
      ownership: String(data.get("ownership") || "neutral"),
      preference: String(data.get("preference") || "none"),
      environment: String(data.get("environment") || "suburb"),
      comfortSpace: String(data.get("comfortSpace") || "standard"),
      drivingStyle: String(data.get("drivingStyle") || "balanced"),
      fuelPreference: String(data.get("fuelPreference") || "none"),
      comfortNeeds: data.getAll("comfortNeeds").map(String),
    };

    try {
      if (leadPayload.email || leadPayload.phone || leadPayload.name) {
        fetch("/api/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(leadPayload),
        }).catch(() => undefined);
      }

      const res = await fetch("/api/advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(advicePayload),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Advice request failed");
      }

      const payload = await res.json();

      try {
        sessionStorage.setItem("driveStyleAdvice", JSON.stringify(payload));
        localStorage.setItem("driveStyleAdvice", JSON.stringify(payload));

        const email = String(data.get("email") || "").trim();
        const name = String(data.get("name") || "").trim();
        const phone = String(data.get("phone") || "").trim();
        if (email) localStorage.setItem("driveStyleEmail", email);
        if (name) localStorage.setItem("driveStyleName", name);
        if (phone) localStorage.setItem("driveStylePhone", phone);
      } catch {
        // ignore
      }

      router.push("/results");
    } catch (e: any) {
      setStatus("error");
      setError(e?.message || "Something went wrong");
      return;
    }

    setStatus("idle");
  }

  const controlClass = "cine-input text-base sm:text-lg bg-white/5 text-white/90 [color-scheme:dark]";

  return (
    <PremiumShell header={<TopNav ctaLabel="Back to home" />}>
      <section className="cine-container pt-8 pb-14">
        <div className="max-w-2xl">
          <div className="cine-pill">Vehicle brief</div>

          <h1 className="cine-h1 mt-4">
            Let’s find the right car <span className="cine-italic-accent">for your life</span>
          </h1>

          <p className="mt-4 text-lg text-white/75 leading-relaxed">
            This takes a couple of minutes. I’ll use your answers to build a shortlist that actually fits how you live and drive.
          </p>

          <div className="mt-3 text-base text-white/70">
            No pressure. No sales. Just a clear recommendation.
          </div>
        </div>

        <div className="mt-10">
          <CineCard className="p-6">
            <form onSubmit={onSubmit} className="space-y-10">
              <input name="company" defaultValue="" className="hidden" tabIndex={-1} autoComplete="off" />

              <Section title="Your situation" hint="Start with how you actually use your car." />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Who’s usually in the car?">
                  <select
                    name="passengers"
                    defaultValue="couple"
                    className={`${controlClass} ds-select`}
                    disabled={disable}
                  >
                    <option value="alone">Mostly just me</option>
                    <option value="couple">Me + partner</option>
                    <option value="family">Family (3–4)</option>
                    <option value="large_family">Large family (5+)</option>
                  </select>
                </Field>

                <Field label="Typical driving pattern">
                  <select
                    name="distance"
                    defaultValue="mixed"
                    className={`${controlClass} ds-select`}
                    disabled={disable}
                  >
                    <option value="very_short">Very short trips</option>
                    <option value="urban_daily">City / traffic daily</option>
                    <option value="mixed">Mixed use</option>
                    <option value="long_distance">Long distance / highway</option>
                  </select>
                </Field>

                <Field label="Where do you mainly drive?">
                  <select
                    name="environment"
                    defaultValue="suburb"
                    className={`${controlClass} ds-select`}
                    disabled={disable}
                  >
                    <option value="city">City</option>
                    <option value="suburb">Suburban</option>
                    <option value="rough">Rural / rough roads</option>
                  </select>
                </Field>

                <Field label="Any body style preference?">
                  <select
                    name="preference"
                    defaultValue="none"
                    className={`${controlClass} ds-select`}
                    disabled={disable}
                  >
                    <option value="none">No strong preference</option>
                    <option value="suv">SUV / crossover</option>
                    <option value="sedan">Sedan</option>
                    <option value="hatch">Hatchback</option>
                    <option value="mpv">7-seater / MPV</option>
                    <option value="pickup">Bakkie / pickup</option>
                  </select>
                </Field>

                <Field label="Fuel preference">
                  <select
                    name="fuelPreference"
                    defaultValue="none"
                    className={`${controlClass} ds-select`}
                    disabled={disable}
                  >
                    <option value="none">No preference</option>
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </Field>
              </div>

              <Section title="Comfort & space" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="cine-card cine-card-metal cine-card-glow rounded-2xl p-4">
                  <div className="text-lg font-semibold">Space & driving comfort</div>
                  <div className="mt-4">
                    <select
                      name="comfortSpace"
                      defaultValue="standard"
                      className={`${controlClass} ds-select`}
                      disabled={disable}
                    >
                      <option value="compact_ok">Compact is fine</option>
                      <option value="standard">Standard</option>
                      <option value="roomy">More space please</option>
                      <option value="easy_entry">Easy entry (higher seat)</option>
                    </select>
                  </div>
                </div>

                <div className="cine-card cine-card-metal cine-card-glow rounded-2xl p-4">
                  <div className="text-lg font-semibold">Any must-have comfort features?</div>
                  <div className="mt-4 space-y-2 text-base sm:text-lg text-white/80">
                    <Check name="comfortNeeds" value="easy_in_out" disabled={disable}>
                      Easier entry / exit
                    </Check>
                    <Check name="comfortNeeds" value="wide_seats" disabled={disable}>
                      Wider seats
                    </Check>
                    <Check name="comfortNeeds" value="rear_legroom" disabled={disable}>
                      Rear legroom
                    </Check>
                    <Check name="comfortNeeds" value="big_boot" disabled={disable}>
                      Large boot
                    </Check>
                  </div>
                </div>
              </div>

              <Section title="Budget & driving style" hint="How you buy and how you drive." />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Budget mindset">
                  <select
                    name="budgetAttitude"
                    defaultValue="balanced"
                    className={`${controlClass} ds-select`}
                    disabled={disable}
                  >
                    <option value="tight">Keep costs low</option>
                    <option value="balanced">Balanced</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </Field>

                <Field label="Driving style">
                  <select
                    name="drivingStyle"
                    defaultValue="balanced"
                    className={`${controlClass} ds-select`}
                    disabled={disable}
                  >
                    <option value="relaxed">Relaxed</option>
                    <option value="balanced">Balanced</option>
                    <option value="enthusiastic">Enjoy driving</option>
                    <option value="heavy_duty">Heavy duty / towing</option>
                  </select>
                </Field>

                <Field label="How do you see cars?">
                  <select
                    name="ownership"
                    defaultValue="neutral"
                    className={`${controlClass} ds-select`}
                    disabled={disable}
                  >
                    <option value="appliance">Just transport</option>
                    <option value="neutral">Neutral</option>
                    <option value="loves_cars">I enjoy cars</option>
                  </select>
                </Field>

                <Field label="Budget type">
                  <select
                    name="budgetType"
                    defaultValue="purchase_price"
                    className={`${controlClass} ds-select`}
                    disabled={disable}
                  >
                    <option value="purchase_price">Total price</option>
                    <option value="monthly_hp">Monthly (finance)</option>
                    <option value="monthly_lease">Monthly (lease)</option>
                  </select>
                </Field>

                <Field label="Budget (optional)">
                  <input
                    name="budget"
                    placeholder="e.g. R300k"
                    className={controlClass}
                    disabled={disable}
                  />
                </Field>

                <Field label="Anything else I should know?">
                  <input
                    name="message"
                    placeholder="Optional notes"
                    className={controlClass}
                    disabled={disable}
                  />
                </Field>
              </div>

              <Section title="Save your shortlist (optional)" hint="We’ll email it to you if you want a copy." />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Email">
                  <input
                    name="email"
                    type="email"
                    placeholder="Only if you want it saved"
                    className={controlClass}
                    disabled={disable}
                  />
                </Field>

                <Field label="Name">
                  <input
                    name="name"
                    className={controlClass}
                    disabled={disable}
                  />
                </Field>

                <Field label="Phone">
                  <input
                    name="phone"
                    className={controlClass}
                    disabled={disable}
                  />
                </Field>
              </div>

              <div className="pt-2">
                <button type="submit" className="cine-btn-primary w-full text-base sm:text-lg" disabled={disable}>
                  {status === "sending" ? "Building your recommendation..." : "See my recommendation"}
                  <span aria-hidden>→</span>
                </button>

                {status === "error" && (
                  <div className="mt-4 rounded-xl border border-red-400/25 bg-red-500/10 p-4 text-sm text-red-100">
                    Error: {error}
                  </div>
                )}

                <div className="mt-6 text-sm text-white/60">© {year} Drive Style</div>
              </div>
            </form>
          </CineCard>
        </div>
      </section>

      <style jsx global>{`
        select.ds-select option {
          color: #0b1220;
          background: #ffffff;
        }
        select.ds-select optgroup {
          color: #0b1220;
          background: #ffffff;
        }
      `}</style>

      <Footer />
    </PremiumShell>
  );
}

function Section({ title, hint }: { title: string; hint?: string }) {
  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="text-xl font-semibold tracking-tight whitespace-nowrap">{title}</div>
        <div className="cine-sep" />
      </div>
      {hint ? <div className="mt-1 text-sm text-white/60">{hint}</div> : null}
    </div>
  );
}

function Field({
  label,
  helper,
  children,
}: {
  label: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="text-lg text-white/90 mb-2">{label}</div>
      {children}
      {helper ? <div className="mt-2 text-sm text-white/60">{helper}</div> : null}
    </label>
  );
}

function Check({
  name,
  value,
  disabled,
  children,
}: {
  name: string;
  value: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-start gap-3 text-base sm:text-lg">
      <input
        type="checkbox"
        name={name}
        value={value}
        disabled={disabled}
        className="mt-0.5 h-4 w-4 rounded border border-white/25 bg-white/10"
      />
      <span className="leading-snug">{children}</span>
    </label>
  );
}