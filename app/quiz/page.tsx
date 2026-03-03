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
      message: String(data.get("message") || ""),
      company: String(data.get("company") || ""),
      source: "quiz",
    };

    const advicePayload = {
      passengers: String(data.get("passengers") || "couple"),
      distance: String(data.get("distance") || "urban_daily"),
      budget: String(data.get("budgetAttitude") || "balanced"),
      ownership: String(data.get("ownership") || "neutral"),
      risk: String(data.get("risk") || "certainty"),
      preference: String(data.get("preference") || "suv"),
      environment: String(data.get("environment") || "suburb"),
      comfortSpace: String(data.get("comfortSpace") || "standard"),
      drivingStyle: String(data.get("drivingStyle") || "relaxed"),
      enginePreference: String(data.get("enginePreference") || "petrol"),
      comfortNeeds: data.getAll("comfortNeeds").map(String),
    };

    try {
      // Submit lead (best-effort)
      if (leadPayload.email || leadPayload.phone || leadPayload.name) {
        fetch("/api/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(leadPayload),
        }).catch(() => undefined);
      }

      // Get advice
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

      // Persist for results page
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

  // Bigger controls + force dark native dropdown so options are readable
  const controlClass = "cine-input text-base sm:text-lg bg-white/5 text-white/90 [color-scheme:dark]";

  return (
    <PremiumShell header={<TopNav ctaLabel="See my recommendation" />}>
      <section className="cine-container pt-6 pb-14">
        <div className="max-w-3xl">
          <h1 className="cine-h1 mt-4">Answer some quick questions please</h1>
          <p className="mt-4 text-lg text-white/75 leading-relaxed">
            A few details about your lifestyle and needs — then you’ll get your shortlist and a simple plan.
          </p>
          <div className="mt-4 text-sm text-white/70">
            Want more hands-on help?{" "}
            <Link href="/#services" className="text-sky-200 hover:text-sky-100 transition">
              View support plans
            </Link>
          </div>
        </div>

        <div className="mt-10">
          <CineCard className="p-6">
            <form onSubmit={onSubmit} className="space-y-10">
              <input name="company" defaultValue="" className="hidden" tabIndex={-1} autoComplete="off" />

              <Section title="Basics" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Passengers">
                  <select
                    name="passengers"
                    defaultValue="couple"
                    className={`${controlClass} ds-select`}
                    disabled={disable}
                  >
                    <option value="alone">Mostly alone</option>
                    <option value="couple">Couple</option>
                    <option value="family">Family (3–4)</option>
                    <option value="large_family">Large family (5+)</option>
                  </select>
                </Field>

                <Field label="Distance pattern">
                  <select
                    name="distance"
                    defaultValue="urban_daily"
                    className={`${controlClass} ds-select`}
                    disabled={disable}
                  >
                    <option value="very_short">Very short (&lt; 5 km)</option>
                    <option value="urban_daily">Urban daily (traffic)</option>
                    <option value="mixed">Mixed use</option>
                    <option value="long_distance">Long distance / highway</option>
                  </select>
                </Field>

                <Field label="Preference">
                  <select
                    name="preference"
                    defaultValue="suv"
                    className={`${controlClass} ds-select`}
                    disabled={disable}
                  >
                    <option value="suv">I like SUVs</option>
                    <option value="sedan">I like sedans</option>
                    <option value="none">No strong preference</option>
                  </select>
                </Field>

                <Field label="Engine preference">
                  <select
                    name="enginePreference"
                    defaultValue="petrol"
                    className={`${controlClass} ds-select`}
                    disabled={disable}
                  >
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </Field>

                <Field label="Environment">
                  <select
                    name="environment"
                    defaultValue="suburb"
                    className={`${controlClass} ds-select`}
                    disabled={disable}
                  >
                    <option value="city">City</option>
                    <option value="suburb">Suburb</option>
                    <option value="rough">Rural / rough roads</option>
                  </select>
                </Field>
              </div>

              <Section title="Comfort and space" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="cine-card cine-card-metal cine-card-glow rounded-2xl p-4">
                  <div className="text-lg font-semibold">Driver comfort & space</div>
                  <div className="mt-4">
                    <select
                      name="comfortSpace"
                      defaultValue="standard"
                      className={`${controlClass} ds-select`}
                      disabled={disable}
                    >
                      <option value="compact_ok">Compact is fine</option>
                      <option value="standard">Medium / typical</option>
                      <option value="roomy">Roomy / extra space please</option>
                      <option value="easy_entry">Easier entry (higher seat / wide opening)</option>
                    </select>
                  </div>
                </div>

                <div className="cine-card cine-card-metal cine-card-glow rounded-2xl p-4">
                  <div className="text-lg font-semibold">Comfort extras (optional)</div>
                  <div className="mt-4 space-y-2 text-base sm:text-lg text-white/80">
                    <Check name="comfortNeeds" value="easy_in_out" disabled={disable}>
                      Easier to get in/out (higher seat)
                    </Check>
                    <Check name="comfortNeeds" value="wide_seats" disabled={disable}>
                      Wide seats / more shoulder room
                    </Check>
                    <Check name="comfortNeeds" value="rear_legroom" disabled={disable}>
                      Extra rear legroom
                    </Check>
                    <Check name="comfortNeeds" value="big_boot" disabled={disable}>
                      Big boot space
                    </Check>
                  </div>
                </div>
              </div>

              <Section title="Ownership & budget" hint="How you buy and how you drive." />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Budget attitude">
                  <select
                    name="budgetAttitude"
                    defaultValue="balanced"
                    className={`${controlClass} ds-select`}
                    disabled={disable}
                  >
                    <option value="tight">Tight</option>
                    <option value="balanced">Balanced</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </Field>

                <Field label="Ownership personality">
                  <select
                    name="ownership"
                    defaultValue="neutral"
                    className={`${controlClass} ds-select`}
                    disabled={disable}
                  >
                    <option value="loves_cars">I love cars</option>
                    <option value="neutral">Neutral</option>
                    <option value="appliance">Just transport</option>
                  </select>
                </Field>

                <Field label="Driving style">
                  <select
                    name="drivingStyle"
                    defaultValue="relaxed"
                    className={`${controlClass} ds-select`}
                    disabled={disable}
                  >
                    <option value="relaxed">Relaxed</option>
                    <option value="balanced">Balanced</option>
                    <option value="enthusiastic">Enthusiastic</option>
                    <option value="heavy_duty">Heavy duty / towing</option>
                  </select>
                </Field>

                <Field label="Risk tolerance">
                  <select
                    name="risk"
                    defaultValue="certainty"
                    className={`${controlClass} ds-select`}
                    disabled={disable}
                  >
                    <option value="certainty">I want certainty</option>
                    <option value="risk_ok">I’m ok with some risk</option>
                  </select>
                </Field>

                <Field label="Budget (optional)">
                  <input name="budget" placeholder="e.g. R300k" className={controlClass} disabled={disable} />
                </Field>

                <Field label="Notes (optional)">
                  <input
                    name="message"
                    placeholder="Must-haves (e.g. boot space, automatic)"
                    className={controlClass}
                    disabled={disable}
                  />
                </Field>
              </div>

              <Section title="Save my shortlist" hint="Optional: we’ll email it to you." />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Email (optional)">
                  <input
                    name="email"
                    type="email"
                    placeholder="If you want your shortlist saved"
                    className={controlClass}
                    disabled={disable}
                  />
                </Field>
                <Field label="Your name (optional)">
                  <input name="name" className={controlClass} disabled={disable} />
                </Field>
                <Field label="Phone (optional)">
                  <input name="phone" className={controlClass} disabled={disable} />
                </Field>
              </div>

              <div className="pt-2">
                <button type="submit" className="cine-btn-primary w-full text-base sm:text-lg" disabled={disable}>
                  {status === "sending" ? "Generating your recommendation..." : "See my recommendation"}
                  <span aria-hidden>→</span>
                </button>

                {status === "error" && (
                  <div className="mt-4 rounded-xl border border-red-400/25 bg-red-500/10 p-4 text-sm text-red-100">
                    Error: {error}
                  </div>
                )}

                <div className="mt-6 text-sm text-white/60">© {year} Drive Style • We don’t sell cars — we advise.</div>
              </div>
            </form>
          </CineCard>
        </div>
      </section>

      {/* Global style to make dropdown options readable */}
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