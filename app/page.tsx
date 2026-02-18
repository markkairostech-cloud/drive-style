"use client";
import { useMemo, useState } from "react";

<input
  name="company"
  style={{ display: "none" }}
  tabIndex={-1}
  autoComplete="off"
/>


export default function Page() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");

    const form = e.currentTarget;
    const data = new FormData(form);

    const payload = {
      name: String(data.get("name") || ""),
      email: String(data.get("email") || ""),
      phone: String(data.get("phone") || ""),
      budget: String(data.get("budget") || ""),
      message: String(data.get("message") || ""),
      company: String(data.get("company") || ""),
      source: "homepage_form",
    };

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.ok) {
        setStatus("error");
        setError(json.error || "Something went wrong");
        return;
      }

      setStatus("sent");
      form.reset();
    } catch (err: any) {
      setStatus("error");
      setError(err?.message || "Network error");
    }
  }

  const year = useMemo(() => new Date().getFullYear(), []);

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

            <nav style={styles.nav}>
              <a href="#services" style={styles.navLink}>
                Services
              </a>
              <a href="#how" style={styles.navLink}>
                How it works
              </a>
              <a href="#lead" style={styles.navLink}>
                Get recommendations
              </a>
            </nav>
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
                Buy the right car with confidence — without the dealer headache.
              </h1>
              <p style={styles.lede}>
                Tell us your budget, needs, and preferences. We’ll send a shortlist that fits your
                lifestyle, with clear pros/cons and next steps — tuned for South Africa.
              </p>

              <div style={styles.heroCtas}>
                <a href="#lead" style={styles.primaryBtn}>
                  Get my shortlist
                </a>
                <a href="#how" style={styles.secondaryBtn}>
                  How it works
                </a>
              </div>

              <div style={styles.statsRow}>
                <Stat title="Shortlist" desc="2–5 options that match you" />
                <Stat title="Deal support" desc="Pricing & negotiation pointers" />
                <Stat title="Simple plan" desc="Test drives, checks, and next steps" />
              </div>
            </div>

            {/* Right-side card */}
            <div style={styles.card}>
              <div style={styles.cardTitleRow}>
                <div style={styles.cardTitle}>Get recommendations</div>
                <div style={styles.cardBadge}>Free</div>
              </div>
              <p style={styles.cardSub}>
                Fill this in and we’ll reply with tailored vehicle options and guidance.
              </p>
<RouteTestButton />
              <form id="lead" onSubmit={onSubmit} style={styles.form}>
<input id="company-trap" name="company" defaultValue="" style={{ display: "none" }} />

                <label style={styles.label}>
                  Name
                  <input name="name" required style={styles.input} />
                </label>

                <label style={styles.label}>
                  Email
                  <input name="email" type="email" required style={styles.input} />
                </label>

                <div style={styles.twoCol}>
                  <label style={styles.label}>
                    Phone (optional)
                    <input name="phone" style={styles.input} />
                  </label>

                  <label style={styles.label}>
                    Budget (optional)
                    <input name="budget" placeholder="e.g. R300k" style={styles.input} />
                  </label>
                </div>

                <label style={styles.label}>
                  Notes (optional)
                  <textarea name="message" rows={4} style={styles.textarea} />
                </label>

                <button type="submit" disabled={status === "sending"} style={styles.submitBtn}>
                  {status === "sending" ? "Sending..." : "Get recommendations"}
                </button>

                {status === "sent" && <p style={styles.success}>Thanks — we’ve received your details.</p>}
                {status === "error" && <p style={styles.error}>Error: {error}</p>}

                <p style={styles.disclaimer}>
                  By submitting, you agree we can contact you about your request. No spam — just your
                  shortlist and next steps.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" style={styles.section}>
        <div style={styles.container}>
          <h2 style={styles.h2}>Services</h2>
          <p style={styles.sectionLead}>
            Choose how much help you want — from quick guidance to end-to-end concierge support.
          </p>

          <div style={styles.tiers}>
            <Tier
              name="Free"
              price="R0"
              bullets={["Guided intake", "Shortlist starter", "General advice"]}
            />
            <Tier
              name="Bronze"
              price="From R499"
              bullets={["Shortlist + reasoning", "Budget fit check", "WhatsApp Q&A (limited)"]}
            />
            <Tier
              name="Platinum"
              price="From R1,499"
              bullets={["Deeper options + trade-offs", "Dealer messaging templates", "Finance guidance"]}
              highlight
            />
            <Tier
              name="Elite"
              price="Custom"
              bullets={["End-to-end support", "Inspections & verification help", "Decision support until purchase"]}
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" style={styles.sectionAlt}>
        <div style={styles.container}>
          <h2 style={styles.h2}>How it works</h2>

          <div style={styles.steps}>
            <Step n="1" title="Tell us what matters" desc="Budget, lifestyle, commute, brand preferences, and non-negotiables." />
            <Step n="2" title="We shortlist the best fits" desc="A clean set of options with clear pros/cons and “watch-outs”." />
            <Step n="3" title="You get a simple plan" desc="Test drives, checks, negotiation pointers, and next steps." />
          </div>

          <div style={styles.callout}>
            <div style={styles.calloutTitle}>Want faster help?</div>
            <div style={styles.calloutText}>
              Submit the form above and we’ll respond with recommendations. You can also add your phone number for WhatsApp follow-up.
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
              <a href="#services" style={styles.footerLink}>Services</a>
              <a href="#how" style={styles.footerLink}>How it works</a>
              <a href="#lead" style={styles.footerLink}>Get recommendations</a>
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
    <div style={styles.stat}>
      <div style={styles.statTitle}>{title}</div>
      <div style={styles.statDesc}>{desc}</div>
    </div>
  );
}

function Tier({
  name,
  price,
  bullets,
  highlight,
}: {
  name: string;
  price: string;
  bullets: string[];
  highlight?: boolean;
}) {
  return (
    <div style={{ ...styles.tier, ...(highlight ? styles.tierHighlight : null) }}>
      <div style={styles.tierTop}>
        <div style={styles.tierName}>{name}</div>
        <div style={styles.tierPrice}>{price}</div>
      </div>
      <ul style={styles.tierList}>
        {bullets.map((b) => (
          <li key={b} style={styles.tierLi}>
            <span style={styles.dot} />
            {b}
          </li>
        ))}
      </ul>
      <a href="#lead" style={highlight ? styles.primaryBtnSmall : styles.secondaryBtnSmall}>
        Choose {name}
      </a>
    </div>
  );
}

function Step({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div style={styles.step}>
      <div style={styles.stepN}>{n}</div>
      <div>
        <div style={styles.stepTitle}>{title}</div>
        <div style={styles.stepDesc}>{desc}</div>
      </div>
    </div>
  );
}

/** Styles (no Tailwind needed) */
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#05070b",
    color: "rgba(255,255,255,0.92)",
  },
  container: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "0 20px",
  },

  header: {
    position: "sticky",
    top: 0,
    zIndex: 20,
    backdropFilter: "blur(10px)",
    background: "rgba(5,7,11,0.72)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    padding: "14px 0",
  },
  brand: { display: "flex", alignItems: "center", gap: 12 },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 12,
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.02))",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 0 0 1px rgba(255,255,255,0.03) inset",
  },
  brandName: { fontWeight: 700, letterSpacing: 0.3 },
  brandTag: { fontSize: 12, opacity: 0.7, marginTop: 2 },
  nav: { display: "flex", gap: 14, alignItems: "center" },
  navLink: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    textDecoration: "none",
  },

  hero: { position: "relative", padding: "56px 0 36px" },
  heroGlow: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    opacity: 0.75,
    background:
      "radial-gradient(700px circle at 15% 20%, rgba(37,99,235,0.38), transparent 55%), radial-gradient(800px circle at 80% 25%, rgba(148,163,184,0.22), transparent 55%), radial-gradient(800px circle at 40% 90%, rgba(255,255,255,0.10), transparent 55%)",
  },
  heroGrid: {
    position: "relative",
    display: "grid",
    gap: 22,
    gridTemplateColumns: "1.2fr 0.9fr",
    alignItems: "start",
  },

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
  h1: {
    margin: "14px 0 10px",
    fontSize: 44,
    lineHeight: 1.12,
    letterSpacing: -0.6,
  },
  lede: {
    margin: 0,
    fontSize: 16,
    lineHeight: 1.6,
    color: "rgba(255,255,255,0.74)",
    maxWidth: 620,
  },
  heroCtas: { display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" },

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

  statsRow: {
    marginTop: 22,
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 10,
  },
  stat: {
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    padding: 14,
  },
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
  label: { display: "grid", gap: 6, fontSize: 12.5, color: "rgba(255,255,255,0.80)" },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.25)",
    color: "rgba(255,255,255,0.92)",
    outline: "none",
  },
  textarea: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.25)",
    color: "rgba(255,255,255,0.92)",
    outline: "none",
    resize: "vertical",
  },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },

  submitBtn: {
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.92)",
    color: "#06080c",
    cursor: "pointer",
    fontWeight: 800,
  },

  success: { margin: "6px 0 0", color: "rgba(134,239,172,0.95)", fontSize: 13 },
  error: { margin: "6px 0 0", color: "rgba(252,165,165,0.95)", fontSize: 13 },
  disclaimer: { margin: "6px 0 0", fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.45 },

  section: { padding: "44px 0" },
  sectionAlt: { padding: "44px 0", borderTop: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" },
  h2: { margin: 0, fontSize: 26, letterSpacing: -0.3 },
  sectionLead: { marginTop: 10, color: "rgba(255,255,255,0.70)", maxWidth: 720, lineHeight: 1.6 },

  tiers: { marginTop: 18, display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 },
  tier: {
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    padding: 14,
  },
  tierHighlight: {
    border: "1px solid rgba(37,99,235,0.35)",
    background: "rgba(37,99,235,0.10)",
  },
  tierTop: { display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" },
  tierName: { fontWeight: 800 },
  tierPrice: { fontSize: 12.5, color: "rgba(255,255,255,0.70)" },
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
    fontWeight: 800,
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
    fontWeight: 700,
    border: "1px solid rgba(255,255,255,0.10)",
    textAlign: "center",
  },

  steps: { marginTop: 18, display: "grid", gap: 12, gridTemplateColumns: "repeat(3, minmax(0, 1fr))" },
  step: {
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    padding: 14,
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
  },
  stepN: {
    width: 32,
    height: 32,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    background: "rgba(37,99,235,0.18)",
    border: "1px solid rgba(37,99,235,0.35)",
    fontWeight: 900,
  },
  stepTitle: { fontWeight: 800 },
  stepDesc: { marginTop: 6, fontSize: 13, color: "rgba(255,255,255,0.70)", lineHeight: 1.5 },

  callout: {
    marginTop: 18,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    padding: 16,
    display: "flex",
    gap: 14,
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  calloutTitle: { fontWeight: 900 },
  calloutText: { color: "rgba(255,255,255,0.70)", maxWidth: 680, lineHeight: 1.5 },

  footer: { padding: "26px 0", borderTop: "1px solid rgba(255,255,255,0.08)" },
  footerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" },
  footerBrand: { fontWeight: 900 },
  footerSmall: { fontSize: 12, color: "rgba(255,255,255,0.60)", marginTop: 4 },
  footerLinks: { display: "flex", gap: 12, alignItems: "center" },
  footerLink: { fontSize: 12.5, color: "rgba(255,255,255,0.70)", textDecoration: "none" },
};

/**
 * Responsive note:
 * This uses CSS grid with fixed columns; on small screens it may feel tight.
 * If you want it to stack nicely on mobile, tell me and I’ll add a tiny
 * “mobile breakpoint” using a simple CSS file or inline <style> tag.
 */
