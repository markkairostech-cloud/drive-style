"use client";

import RouteTestButton from "./RouteTestButton";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Status = "idle" | "sending" | "sent" | "error";

export default function Page() {
  const router = useRouter();

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");

  const isMobile = useIsMobile(920);
  const styles = useMemo(() => makeStyles(isMobile), [isMobile]);

  function track(event: string, props?: Record<string, any>) {
    try {
      // eslint-disable-next-line no-console
      console.log("[DriveStyle]", event, props || {});
    } catch {
      // ignore
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;

    setStatus("sending");
    setError("");

    const form = e.currentTarget;
    const data = new FormData(form);

    // Lead capture (Sheets) — email is optional for conversion
    const payload = {
      name: String(data.get("name") || ""),
      email: String(data.get("email") || ""),
      phone: String(data.get("phone") || ""),
      budget: String(data.get("budget") || ""),
      message: String(data.get("message") || ""),
      company: String(data.get("company") || ""),
      source: "homepage_form",
    };

    // Comfort + space signals (non-sensitive framing)
    const comfortSpace = String(data.get("comfortSpace") || "standard");
    const comfortNeeds = data.getAll("comfortNeeds").map((v) => String(v));

    // Advice input
    const advicePayload = {
  passengers: String(data.get("passengers") || "couple"),
  distance: String(data.get("distance") || "urban_daily"),
  budget: String(data.get("budgetAttitude") || "balanced"),
  ownership: String(data.get("ownership") || "neutral"),
  risk: String(data.get("risk") || "certainty"),
  environment: String(data.get("environment") || "suburb"),
  preference: String(data.get("preference") || "suv"),
  drivingStyle: String(data.get("drivingStyle") || "relaxed"),
  budgetAmount: String(data.get("budget") || ""),

  // ✅ NEW: comfort/space signals
  comfortSpace: String(data.get("comfortSpace") || "standard"),
  comfortNeeds: data.getAll("comfortNeeds").map(String),
};

    track("homepage_submit_start", {
      hasEmail: !!payload.email,
      hasPhone: !!payload.phone,
      hasBudget: !!payload.budget,
      comfortSpace,
      comfortNeedsCount: comfortNeeds.length,
    });

    try {
      // 1) Save lead (Google Sheets)
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setStatus("error");
        setError(json.error || "Something went wrong");
        track("homepage_lead_error", { message: json.error || "unknown" });
        return;
      }

      track("homepage_lead_saved");

      // 2) Generate advice
      const adviceRes = await fetch("/api/advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(advicePayload),
      });

      const adviceJson = await adviceRes.json().catch(() => ({}));
      if (!adviceRes.ok) {
        setStatus("error");
        setError(adviceJson?.error || "Lead saved, but advice generation failed.");
        track("homepage_advice_error", { message: adviceJson?.error || "unknown" });
        return;
      }

      // 3) Store + redirect (session + local for resilience)
      try {
        const raw = JSON.stringify(adviceJson);
        sessionStorage.setItem("driveStyleAdvice", raw);
        localStorage.setItem("driveStyleAdvice", raw);
      } catch {
        // ignore
      }

      track("homepage_advice_success", {
        insights: adviceJson?.insights?.length ?? 0,
        models: adviceJson?.models?.length ?? 0,
      });

      setStatus("sent");
      router.push("/results");
    } catch (err: any) {
      setStatus("error");
      setError(err?.message || "Network error");
      track("homepage_submit_error", { message: err?.message || "network" });
    }
  }

  const year = useMemo(() => new Date().getFullYear(), []);
  const disableForm = status === "sending";

  return (
    <main style={styles.page}>
      {/* Top bar */}
      <header style={styles.header}>
        <div style={styles.container}>
          <div style={styles.headerRow}>
            <div style={styles.brand}>
              <div style={styles.brandMark} aria-hidden />
              <div>
                <div style={styles.brandName}>Drive Style</div>
                <div style={styles.brandTag}>Vehicle concierge advice • South Africa</div>
              </div>
            </div>

            {isMobile ? (
              <a href="#lead" style={styles.primaryBtnSmall}>
                Start
              </a>
            ) : (
              <nav style={styles.nav}>
                <a href="#services" style={styles.navLink}>
                  Services
                </a>
                <a href="#how" style={styles.navLink}>
                  How it works
                </a>
                <a href="#lead" style={styles.navLink}>
                  Start my vehicle brief
                </a>
              </nav>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroGlow} aria-hidden />
        <div style={styles.container}>
          <div style={styles.heroGrid}>
            <div>
              <div style={styles.pill}>Premium guidance • Friendly advisor</div>
              <h1 style={styles.h1}>
                Choose the right car for you, and for your lifestyle — before you ever step into a dealership.
              </h1>
              <p style={styles.lede}>
                Tell me your budget, how you drive, and what matters most. I’ll shortlist vehicles that actually fit
                your lifestyle — and explain the trade-offs clearly.
              </p>

              <div style={styles.heroCtas}>
                <div style={styles.heroPrimaryCta}>
                  <a href="#lead" style={styles.primaryBtn}>
                    Start my vehicle brief
                  </a>
                  <div style={styles.ctaNote}>
                    Takes ~60 seconds • Independent guidance • No calls unless you request one
                  </div>
                </div>

                <a href="#how" style={styles.secondaryBtn}>
                  How it works
                </a>
              </div>

              <div style={styles.statsRow}>
                <Stat title="Cars that suit your life" desc="Not just popular choices — real fit" />
                <Stat title="Avoid bad deals" desc="Know what to pay and what to skip" />
                <Stat title="Clear next steps" desc="Exactly how to buy safely" />
              </div>
            </div>

            {/* Right-side card */}
            <div style={styles.card}>
              <div style={styles.cardTitleRow}>
                <div style={styles.cardTitle}>Start my vehicle brief</div>
                <div style={styles.cardBadge}>No Cost</div>
              </div>
              <p style={styles.cardSub}>Answer a few quick questions and I’ll generate your shortlist instantly.</p>

              <RouteTestButton />

              {/* IMPORTANT: scroll target */}
              <form id="lead" onSubmit={onSubmit} style={{ ...styles.form, scrollMarginTop: 220 }}>
                {/* Honeypot field - hidden */}
                <input
                  id="company-trap"
                  name="company"
                  defaultValue=""
                  style={{ display: "none" }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                {/* Step 1 */}
                <div style={styles.formHeader}>
                  <div style={styles.stepPill}>Step 1 of 2</div>
                  <div style={styles.formH3}>Quick questions</div>
                  <div style={styles.formSub}>This helps me shortlist vehicles that fit your daily use and budget.</div>
                </div>

                <label style={styles.label}>
                  Passengers
                  <select
                    name="passengers"
                    defaultValue="couple"
                    style={styles.input as any}
                    required
                    disabled={disableForm}
                  >
                    <option value="alone">Mostly alone</option>
                    <option value="couple">Couple</option>
                    <option value="family">Family (3–4)</option>
                    <option value="large_family">Large family (5+)</option>
                  </select>
                </label>

                <label style={styles.label}>
                  Distance pattern
                  <select
                    name="distance"
                    defaultValue="urban_daily"
                    style={styles.input as any}
                    required
                    disabled={disableForm}
                  >
                    <option value="very_short">Very short (&lt; 5 km)</option>
                    <option value="urban_daily">Urban daily (traffic)</option>
                    <option value="mixed">Mixed use</option>
                    <option value="long_distance">Long distance / highway</option>
                  </select>
                </label>

                <div style={styles.twoCol}>
                  <label style={styles.label}>
                    Preference
                    <select
                      name="preference"
                      defaultValue="suv"
                      style={styles.input as any}
                      required
                      disabled={disableForm}
                    >
                      <option value="suv">I like SUVs</option>
                      <option value="sedan">I like sedans</option>
                      <option value="none">No strong preference</option>
                    </select>
                  </label>

                  <label style={styles.label}>
                    Environment
                    <select
                      name="environment"
                      defaultValue="suburb"
                      style={styles.input as any}
                      required
                      disabled={disableForm}
                    >
                      <option value="city">City</option>
                      <option value="suburb">Suburb</option>
                      <option value="rough">Rural / rough roads</option>
                    </select>
                  </label>
                </div>

                {/* Comfort & space (non-sensitive) */}
                <label style={styles.label}>
                  Driver comfort & space
                  <select
                    name="comfortSpace"
                    defaultValue="standard"
                    style={styles.input as any}
                    required
                    disabled={disableForm}
                  >
                    <option value="compact_ok">Compact is fine</option>
                    <option value="standard">Medium / typical</option>
                    <option value="roomy">Roomy / extra space please</option>
                    <option value="easy_entry">Easier entry (higher seat / wide opening)</option>
                  </select>
                  <div style={styles.helperText}>This is about comfort — not body type. Choose what feels right.</div>
                </label>

                <div style={styles.checkBlock}>
                  <div style={styles.checkTitle}>Any of these important? (optional)</div>
                  <label style={styles.checkRow}>
                    <input type="checkbox" name="comfortNeeds" value="easy_in_out" disabled={disableForm} />
                    Easier to get in/out (higher seat)
                  </label>
                  <label style={styles.checkRow}>
                    <input type="checkbox" name="comfortNeeds" value="wide_seats" disabled={disableForm} />
                    Wide seats / more shoulder room
                  </label>
                  <label style={styles.checkRow}>
                    <input type="checkbox" name="comfortNeeds" value="rear_legroom" disabled={disableForm} />
                    Extra rear legroom (passengers)
                  </label>
                  <label style={styles.checkRow}>
                    <input type="checkbox" name="comfortNeeds" value="big_boot" disabled={disableForm} />
                    Big boot space
                  </label>
                </div>

                <label style={styles.label}>
                  Budget attitude
                  <select
                    name="budgetAttitude"
                    defaultValue="balanced"
                    style={styles.input as any}
                    required
                    disabled={disableForm}
                  >
                    <option value="tight">Tight</option>
                    <option value="balanced">Balanced</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </label>

                <div style={styles.twoCol}>
                  <label style={styles.label}>
                    Driving style
                    <select
                      name="drivingStyle"
                      defaultValue="relaxed"
                      style={styles.input as any}
                      required
                      disabled={disableForm}
                    >
                      <option value="relaxed">Relaxed</option>
                      <option value="balanced">Balanced</option>
                      <option value="enthusiastic">Enthusiastic</option>
                      <option value="heavy_duty">Heavy duty / towing</option>
                    </select>
                  </label>

                  <label style={styles.label}>
                    Risk tolerance
                    <select
                      name="risk"
                      defaultValue="certainty"
                      style={styles.input as any}
                      required
                      disabled={disableForm}
                    >
                      <option value="certainty">I want certainty</option>
                      <option value="risk_ok">I’m ok with some risk</option>
                    </select>
                  </label>
                </div>

                <label style={styles.label}>
                  Ownership personality
                  <select
                    name="ownership"
                    defaultValue="neutral"
                    style={styles.input as any}
                    required
                    disabled={disableForm}
                  >
                    <option value="loves_cars">I love cars</option>
                    <option value="neutral">Neutral</option>
                    <option value="appliance">Just transport</option>
                  </select>
                </label>

                {/* Step 2 */}
                <div style={styles.formHeader}>
                  <div style={styles.stepPill}>Step 2 of 2</div>
                  <div style={styles.formH3}>Optional details</div>
                  <div style={styles.formSub}>
                    You’ll see your shortlist instantly. If you add an email, we can also keep it on file for follow-up.
                  </div>
                </div>

                <div style={styles.twoCol}>
                  <label style={styles.label}>
                    Budget (optional)
                    <input name="budget" placeholder="e.g. R300k" style={styles.input} disabled={disableForm} />
                  </label>

                  <label style={styles.label}>
                    Notes (optional)
                    <input
                      name="message"
                      placeholder="Any must-haves (e.g. boot space, fuel saving, automatic)"
                      style={styles.input}
                      disabled={disableForm}
                    />
                  </label>
                </div>

                <label style={styles.label}>
                  Email (optional)
                  <input
                    name="email"
                    type="email"
                    style={styles.input}
                    disabled={disableForm}
                    autoComplete="email"
                    placeholder="If you want your shortlist saved for later"
                  />
                </label>

                <div style={styles.twoCol}>
                  <label style={styles.label}>
                    Your name (optional)
                    <input name="name" style={styles.input} disabled={disableForm} autoComplete="name" />
                  </label>

                  <label style={styles.label}>
                    Phone (optional for WhatsApp help)
                    <input name="phone" style={styles.input} disabled={disableForm} autoComplete="tel" inputMode="tel" />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={status !== "idle"}
                  style={{ ...styles.submitBtn, ...(disableForm ? styles.btnDisabled : null) }}
                >
                  {status === "sending" ? "Generating your shortlist..." : "Get my shortlist"}
                </button>

                {status === "sending" && (
                  <div style={styles.sendingNote} aria-live="polite">
                    This usually takes a few seconds. Please don’t close this tab.
                  </div>
                )}

                {status === "error" && <p style={styles.error}>Error: {error}</p>}

                <div style={styles.trustRowMini}>
                  <span style={styles.trustPillMini}>Independent</span>
                  <span style={styles.trustTextMini}>Not a dealership</span>
                  <span style={styles.trustTextMini}>South Africa-specific</span>
                </div>

                <p style={styles.disclaimer}>
                  By submitting, you agree we can contact you about your request. No spam — just your shortlist and next steps.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Services (Monetisation positioning: risk reduction, Platinum as default) */}
      <section id="services" style={styles.section}>
        <div style={styles.container}>
          <h2 style={styles.h2}>Choose your level of protection</h2>
          <p style={styles.sectionLead}>
            From a quick shortlist to full purchase support — choose how much certainty you want before you commit.
          </p>

          <div style={styles.tiers}>
            <Tier
              name="Starter"
              price="R0"
              subtitle="For basic direction"
              bullets={["Shortlist based on your inputs", "General guidance on fit", "No negotiation support"]}
            />
            <Tier
              name="Guided"
              price="From R500"
              subtitle="For more confidence"
              bullets={["Shortlist with reasoning", "Budget alignment check", "Limited WhatsApp Q&A"]}
            />
            <Tier
              name="Protected"
              price="From R1,500"
              subtitle="Most chosen • Serious buyers"
              bullets={[
                "Deeper shortlist + trade-offs explained",
                "Dealer messaging templates",
                "Finance & pricing guidance",
                "Negotiation confidence support",
              ]}
              highlight
              recommended
            />
            <Tier
              name="Fully Represented"
              price="Custom"
              subtitle="For hands-off buyers"
              bullets={["End-to-end support", "Inspection & verification help", "Ongoing guidance until purchase"]}
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" style={styles.sectionAlt}>
        <div style={styles.container}>
          <h2 style={styles.h2}>How it works</h2>

          <div style={styles.steps}>
            <Step n="1" title="Answer quick questions" desc="A few details about your lifestyle and needs — so your shortlist fits you." />
            <Step n="2" title="We shortlist the best fits" desc="A clean set of options with clear pros/cons and watch-outs." />
            <Step n="3" title="You get a simple plan" desc="Test drives, checks, negotiation pointers, and next steps." />
          </div>

          <div style={styles.callout}>
            <div style={styles.calloutTitle}>Want faster help?</div>
            <div style={styles.calloutText}>
              Submit the form above and I’ll respond with recommendations. You can also add your phone number for WhatsApp follow-up.
            </div>
            <a href="#lead" style={styles.secondaryBtn}>
              Jump to the form
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.container}>
          <div style={styles.footerRow}>
            <div>
              <div style={styles.footerBrand}>Drive Style</div>
              <div style={styles.footerSmall}>© {year} Drive Style. All rights reserved.</div>
            </div>
            <div style={styles.footerLinks}>
              <a href="#services" style={styles.footerLink}>
                Services
              </a>
              <a href="#how" style={styles.footerLink}>
                How it works
              </a>
              <a href="#lead" style={styles.footerLink}>
                Start my vehicle brief
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

/** UI bits */
function Stat({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={stylesStatic.stat}>
      <div style={stylesStatic.statTitle}>{title}</div>
      <div style={stylesStatic.statDesc}>{desc}</div>
    </div>
  );
}

function Tier({
  name,
  price,
  subtitle,
  bullets,
  highlight,
  recommended,
}: {
  name: string;
  price: string;
  subtitle?: string;
  bullets: string[];
  highlight?: boolean;
  recommended?: boolean;
}) {
  return (
    <div style={{ ...stylesStatic.tier, ...(highlight ? stylesStatic.tierHighlight : null) }}>
      {recommended && <div style={stylesStatic.recommendedBadge}>Most chosen</div>}

      <div style={stylesStatic.tierTop}>
        <div>
          <div style={stylesStatic.tierName}>{name}</div>
          {subtitle && <div style={stylesStatic.tierSubtitle}>{subtitle}</div>}
        </div>
        <div style={stylesStatic.tierPrice}>{price}</div>
      </div>

      <ul style={stylesStatic.tierList}>
        {bullets.map((b) => (
          <li key={b} style={stylesStatic.tierLi}>
            <span style={stylesStatic.dot} />
            {b}
          </li>
        ))}
      </ul>

      <a href="#lead" style={highlight ? stylesStatic.primaryBtnSmall : stylesStatic.secondaryBtnSmall}>
        Choose {name}
      </a>
    </div>
  );
}

function Step({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div style={stylesStatic.step}>
      <div style={stylesStatic.stepN}>{n}</div>
      <div>
        <div style={stylesStatic.stepTitle}>{title}</div>
        <div style={stylesStatic.stepDesc}>{desc}</div>
      </div>
    </div>
  );
}

function useIsMobile(breakpointPx = 920) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpointPx);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpointPx]);

  return isMobile;
}

/** Dynamic styles for responsiveness */
function makeStyles(isMobile: boolean): Record<string, React.CSSProperties> {
  return {
    ...stylesStatic,
    heroGrid: {
      ...stylesStatic.heroGrid,
      gridTemplateColumns: isMobile ? "1fr" : "1.2fr 0.9fr",
    },
    nav: {
      ...stylesStatic.nav,
      display: isMobile ? "none" : "flex",
    },
    h1: {
      ...stylesStatic.h1,
      fontSize: isMobile ? 34 : 44,
    },
    statsRow: {
      ...stylesStatic.statsRow,
      gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))",
    },
    twoCol: {
      ...stylesStatic.twoCol,
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
    },
    tiers: {
      ...stylesStatic.tiers,
      gridTemplateColumns: isMobile ? "1fr" : "repeat(4, minmax(0, 1fr))",
    },
    steps: {
      ...stylesStatic.steps,
      gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))",
    },
  };
}

/** Base styles (no Tailwind needed) */
const stylesStatic: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#0B1C2D", color: "rgba(255,255,255,0.92)" },
  container: { maxWidth: 1100, margin: "0 auto", padding: "0 20px" },

  header: {
    position: "sticky",
    top: 0,
    zIndex: 20,
    backdropFilter: "blur(10px)",
    background: "rgba(5,7,11,0.72)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  headerRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "14px 0" },
  brand: { display: "flex", alignItems: "center", gap: 12 },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 12,
    background: "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.02))",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 0 0 1px rgba(255,255,255,0.03) inset",
  },
  brandName: { fontWeight: 700, letterSpacing: 0.3 },
  brandTag: { fontSize: 12, opacity: 0.7, marginTop: 2 },
  nav: { display: "flex", gap: 14, alignItems: "center" },
  navLink: { fontSize: 13, color: "rgba(255,255,255,0.75)", textDecoration: "none" },

  hero: { position: "relative", padding: "56px 0 36px" },
  heroGlow: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    opacity: 0.75,
    background:
      "radial-gradient(700px circle at 15% 20%, rgba(37,99,235,0.38), transparent 55%), radial-gradient(800px circle at 80% 25%, rgba(148,163,184,0.22), transparent 55%), radial-gradient(800px circle at 40% 90%, rgba(255,255,255,0.10), transparent 55%)",
  },
  heroGrid: { position: "relative", display: "grid", gap: 22, gridTemplateColumns: "1.2fr 0.9fr", alignItems: "start" },

  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontSize: 12,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.78)",
  },
  h1: { margin: "14px 0 10px", fontSize: 44, lineHeight: 1.12, letterSpacing: -0.6 },
  lede: { margin: 0, fontSize: 16, lineHeight: 1.6, color: "rgba(255,255,255,0.74)", maxWidth: 620 },

  heroCtas: { display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap", alignItems: "flex-start" },
  heroPrimaryCta: { display: "grid", gap: 8 },
  ctaNote: { fontSize: 12.5, color: "rgba(255,255,255,0.65)", lineHeight: 1.35 },

  primaryBtn: {
    display: "inline-block",
    padding: "12px 16px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.92)",
    color: "#06080c",
    textDecoration: "none",
    fontWeight: 700,
    border: "1px solid rgba(255,255,255,0.18)",
  },
  secondaryBtn: {
    display: "inline-block",
    padding: "12px 16px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.86)",
    textDecoration: "none",
    fontWeight: 600,
    border: "1px solid rgba(255,255,255,0.10)",
  },

  statsRow: { marginTop: 22, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 },
  stat: { borderRadius: 16, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.04)", padding: 14 },
  statTitle: { fontWeight: 700, fontSize: 14 },
  statDesc: { marginTop: 4, fontSize: 12.5, color: "rgba(255,255,255,0.70)", lineHeight: 1.45 },

  card: {
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.05)",
    padding: 18,
    boxShadow: "0 0 0 1px rgba(255,255,255,0.03) inset",
  },
  cardTitleRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 },
  cardTitle: { fontWeight: 800, letterSpacing: -0.2 },
  cardBadge: {
    fontSize: 12,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(37,99,235,0.14)",
    color: "rgba(255,255,255,0.85)",
  },
  cardSub: { margin: "10px 0 0", fontSize: 13.5, color: "rgba(255,255,255,0.70)", lineHeight: 1.5 },

  form: { marginTop: 14, display: "grid", gap: 12 },
  formHeader: { display: "grid", gap: 6, marginTop: 4, marginBottom: 6 },
  formH3: { fontWeight: 900, letterSpacing: -0.2, fontSize: 16.5 },
  formSub: { fontSize: 13, color: "rgba(255,255,255,0.70)", lineHeight: 1.45 },

  stepPill: {
    display: "inline-flex",
    alignItems: "center",
    width: "fit-content",
    fontSize: 11.5,
    padding: "5px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.75)",
    fontWeight: 800,
  },

  label: { display: "grid", gap: 6, fontSize: 12.5, color: "rgba(255,255,255,0.80)" },
  helperText: { fontSize: 12, color: "rgba(255,255,255,0.62)", lineHeight: 1.4, marginTop: 2 },

  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.25)",
    color: "rgba(255,255,255,0.92)",
    outline: "none",
  },

  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },

  checkBlock: {
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    padding: 12,
    display: "grid",
    gap: 10,
  },
  checkTitle: { fontWeight: 900, fontSize: 13, color: "rgba(255,255,255,0.86)" },
  checkRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    lineHeight: 1.4,
  },

  submitBtn: {
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.92)",
    color: "#06080c",
    cursor: "pointer",
    fontWeight: 900,
  },
  btnDisabled: { opacity: 0.75, cursor: "not-allowed" },

  sendingNote: {
    fontSize: 12.5,
    color: "rgba(255,255,255,0.68)",
    lineHeight: 1.45,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    padding: 10,
  },

  error: { margin: "6px 0 0", color: "rgba(252,165,165,0.95)", fontSize: 13 },
  disclaimer: { margin: "6px 0 0", fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.45 },

  trustRowMini: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginTop: 2 },
  trustPillMini: {
    fontSize: 12,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.86)",
    fontWeight: 800,
  },
  trustTextMini: { fontSize: 12.5, color: "rgba(255,255,255,0.65)", fontWeight: 700 },

  section: { padding: "44px 0" },
  sectionAlt: { padding: "44px 0", borderTop: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" },
  h2: { margin: 0, fontSize: 26, letterSpacing: -0.3 },
  sectionLead: { marginTop: 10, color: "rgba(255,255,255,0.70)", maxWidth: 720, lineHeight: 1.6 },

  tiers: { marginTop: 18, display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 },
  tier: {
    position: "relative",
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    padding: 14,
  },
  tierHighlight: { border: "1px solid rgba(37,99,235,0.35)", background: "rgba(37,99,235,0.10)" },
  tierTop: { display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" },
  tierName: { fontWeight: 900 },
  tierSubtitle: { fontSize: 12.5, color: "rgba(255,255,255,0.65)", marginTop: 4, fontWeight: 700 },
  tierPrice: { fontSize: 12.5, color: "rgba(255,255,255,0.70)" },

  recommendedBadge: {
    position: "absolute",
    top: -12,
    right: 14,
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 900,
    background: "rgba(37,99,235,0.9)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.18)",
  },

  tierList: { margin: "12px 0 14px", padding: 0, listStyle: "none", display: "grid", gap: 8 },
  tierLi: { display: "flex", gap: 10, alignItems: "flex-start", color: "rgba(255,255,255,0.74)", fontSize: 13, lineHeight: 1.4 },
  dot: { width: 8, height: 8, borderRadius: 999, background: "rgba(96,165,250,0.9)", marginTop: 5 },

  primaryBtnSmall: {
    display: "inline-block",
    padding: "10px 12px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.92)",
    color: "#06080c",
    textDecoration: "none",
    fontWeight: 900,
    border: "1px solid rgba(255,255,255,0.18)",
    textAlign: "center",
  },
  secondaryBtnSmall: {
    display: "inline-block",
    padding: "10px 12px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.86)",
    textDecoration: "none",
    fontWeight: 800,
    border: "1px solid rgba(255,255,255,0.10)",
    textAlign: "center",
  },

  steps: { marginTop: 18, display: "grid", gap: 12, gridTemplateColumns: "repeat(3, minmax(0, 1fr))" },
  step: { borderRadius: 18, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.04)", padding: 14, display: "flex", gap: 12, alignItems: "flex-start" },
  stepN: { width: 32, height: 32, borderRadius: 12, display: "grid", placeItems: "center", background: "rgba(37,99,235,0.18)", border: "1px solid rgba(37,99,235,0.35)", fontWeight: 900 },
  stepTitle: { fontWeight: 800 },
  stepDesc: { marginTop: 6, fontSize: 13, color: "rgba(255,255,255,0.70)", lineHeight: 1.5 },

  callout: { marginTop: 18, borderRadius: 18, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.04)", padding: 16, display: "flex", gap: 14, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" },
  calloutTitle: { fontWeight: 900 },
  calloutText: { color: "rgba(255,255,255,0.70)", maxWidth: 680, lineHeight: 1.5 },

  footer: { padding: "26px 0", borderTop: "1px solid rgba(255,255,255,0.08)" },
  footerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" },
  footerBrand: { fontWeight: 900 },
  footerSmall: { fontSize: 12, color: "rgba(255,255,255,0.60)", marginTop: 4 },
  footerLinks: { display: "flex", gap: 12, alignItems: "center" },
  footerLink: { fontSize: 12.5, color: "rgba(255,255,255,0.70)", textDecoration: "none" },
};