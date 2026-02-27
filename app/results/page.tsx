"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

type Advice = {
  intro: string;
  insights: { title: string; text: string }[];
  verdict?: string;
  models: { name: string; why: string }[];
  closing: string;
};

type SaveStatus = "idle" | "sending" | "sent" | "error";
type LoadState = "loading" | "ready" | "empty";

const STORAGE = {
  advice: "driveStyleAdvice",
  email: "driveStyleEmail",
  name: "driveStyleName",
  phone: "driveStylePhone",
} as const;

export default function ResultsPage() {
  const [advice, setAdvice] = useState<Advice | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");

  // Model cards
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Copy
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string>("");

  // Inline email capture
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string>("");
  const [saveName, setSaveName] = useState("");
  const [saveEmail, setSaveEmail] = useState("");
  const [savePhone, setSavePhone] = useState("");

  // "Receipt" row state
  const [storedEmail, setStoredEmail] = useState<string>("");
  const [storedName, setStoredName] = useState<string>("");

  // Sticky CTA behaviour
  const [showStickyCta, setShowStickyCta] = useState(false);
  const saveRef = useRef<HTMLDivElement | null>(null);

  const isMobile = useIsMobile(920);
  const prefersReducedMotion = usePrefersReducedMotion();
  const styles = useMemo(() => makeStyles(isMobile), [isMobile]);

  // ---- Basic tracking (console for now; swap for analytics later) ----
  function track(event: string, props?: Record<string, any>) {
    try {
      // eslint-disable-next-line no-console
      console.log("[DriveStyle]", event, props || {});
    } catch {
      // ignore
    }
  }

  function readLocalString(key: string) {
    try {
      return String(localStorage.getItem(key) || "").trim();
    } catch {
      return "";
    }
  }

  function writeLocalString(key: string, value: string) {
    try {
      if (!value) return;
      localStorage.setItem(key, value);
    } catch {
      // ignore
    }
  }

  // Persist results (session + local fallback)
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

      // keep localStorage synced for refresh persistence
      localStorage.setItem(STORAGE.advice, raw);

      // Pull any saved contact info (for “receipt” + prefill)
      const existingEmail = readLocalString(STORAGE.email);
      const existingName = readLocalString(STORAGE.name);
      const existingPhone = readLocalString(STORAGE.phone);

      if (existingEmail) setStoredEmail(existingEmail);
      if (existingName) setStoredName(existingName);

      // Prefill the save form if we already have contact info
      if (existingEmail) setSaveEmail(existingEmail);
      if (existingName) setSaveName(existingName);
      if (existingPhone) setSavePhone(existingPhone);

      track("results_loaded", {
        insights: parsed?.insights?.length ?? 0,
        models: parsed?.models?.length ?? 0,
        hasVerdict: !!parsed?.verdict,
        source: sessionStorage.getItem(STORAGE.advice) ? "session" : "local",
        hasStoredEmail: !!existingEmail,
      });
    } catch {
      setLoadState("empty");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sticky CTA: show once user has scrolled a bit, and hide if save block is visible
  useEffect(() => {
    if (!isMobile) {
      setShowStickyCta(false);
      return;
    }

    const onScroll = () => {
      try {
        const y = window.scrollY || 0;
        const engaged = y > 220;

        const saveEl = saveRef.current;
        let saveVisible = false;
        if (saveEl) {
          const rect = saveEl.getBoundingClientRect();
          const vh = window.innerHeight || 0;
          saveVisible = rect.top < vh - 120 && rect.bottom > 120;
        }

        setShowStickyCta(engaged && !saveVisible);
      } catch {
        // ignore
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll as any);
      window.removeEventListener("resize", onScroll as any);
    };
  }, [isMobile]);

  const shareText = useMemo(() => {
    if (!advice) return "";
    const models = (advice.models || [])
      .map((m, i) => `${i + 1}. ${m.name}\n   ${m.why}`)
      .join("\n\n");

    const insights = (advice.insights || []).map((i) => `• ${i.title}: ${i.text}`).join("\n");
    const verdictLine = advice.verdict ? `\n\nDrive Style Verdict:\n${advice.verdict}` : "";

    return `Drive Style Shortlist

Intro:
${advice.intro}

Insights:
${insights}${verdictLine}

Shortlist:
${models}

Closing:
${advice.closing}
`;
  }, [advice]);

  async function copyToClipboard(source: "header" | "save" | "sticky" = "header") {
    setCopyError("");
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
      track("results_copy", { source });
    } catch {
      setCopyError("Copy failed (browser blocked it). You can still select and copy manually.");
      track("results_copy_failed", { source });
    }
  }

  function scrollToSave(source: "hero" | "sticky" = "hero") {
    track("results_scroll_to_save", { source });

    const el = saveRef.current;
    if (!el) return;

    try {
      el.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });

      window.setTimeout(() => {
        const first = el.querySelector<HTMLInputElement>('input[type="email"], input[name="email"], input');
        first?.focus?.();
      }, prefersReducedMotion ? 0 : 250);
    } catch {
      window.location.hash = "save";
    }
  }

  function resetSaveForm() {
    setSaveStatus("idle");
    setSaveError("");
    setSaveName(storedName || "");
    setSaveEmail(storedEmail || "");
    setSavePhone(readLocalString(STORAGE.phone) || "");
    track("results_save_reset");
  }

  async function onSaveSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!advice) return;

    if (saveStatus === "sending") return;

    const email = saveEmail.trim().toLowerCase();
    if (!email) return;

    setSaveStatus("sending");
    setSaveError("");

    track("results_save_submit", { hasPhone: !!savePhone.trim(), prefilled: email === storedEmail });

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

      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.ok) {
        setSaveStatus("error");
        setSaveError(json.error || "Something went wrong. Please try again.");
        track("results_save_error", { message: json.error || "unknown" });
        return;
      }

      // Store contact info locally so we can show a “receipt” and prefill later
      writeLocalString(STORAGE.email, email);
      writeLocalString(STORAGE.name, saveName.trim());
      writeLocalString(STORAGE.phone, savePhone.trim());

      setStoredEmail(email);
      setStoredName(saveName.trim());

      setSaveStatus("sent");
      track("results_save_success");
    } catch (err: any) {
      setSaveStatus("error");
      setSaveError(err?.message || "Network error. Please try again.");
      track("results_save_error", { message: err?.message || "network" });
    }
  }

  function clearStoredAdvice() {
    try {
      sessionStorage.removeItem(STORAGE.advice);
      localStorage.removeItem(STORAGE.advice);
    } catch {
      // ignore
    }
    track("results_storage_cleared");
  }

  // ---- Loading skeleton (prevents “no advice found” flash) ----
  if (loadState === "loading") {
    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <div style={styles.headerRow}>
            <div>
              <div style={styles.brand}>Drive Style</div>
              <div style={styles.sub}>Your shortlist & guidance</div>
            </div>
            <div style={styles.headerActions}>
              <span style={styles.skelPill} />
              <span style={styles.skelBtn} />
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.skeletonStack}>
              <div style={styles.skelH1} />
              <div style={styles.skelLineWide} />
              <div style={styles.skelLine} />

              <div style={styles.skelGrid}>
                <div style={styles.skelCard} />
                <div style={styles.skelCard} />
                <div style={styles.skelCard} />
              </div>

              <div style={styles.skelSectionTitle} />
              <div style={styles.skelModels}>
                <div style={styles.skelModel} />
                <div style={styles.skelModel} />
                <div style={styles.skelModel} />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ---- Better empty state (with clear + recovery) ----
  if (loadState === "empty" || !advice) {
    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <div style={styles.card}>
            <h1 style={styles.h1}>No advice found</h1>
            <p style={styles.p}>
              This page needs your latest brief. If you refreshed or opened this page directly, your results may not be
              available.
            </p>

            <div style={styles.inlineActions}>
              <Link href="/#lead" style={styles.primaryBtn} onClick={() => track("results_empty_back_to_form")}>
                Back to the form
              </Link>
              <Link href="/" style={styles.secondaryBtn} onClick={() => track("results_empty_home")}>
                Home
              </Link>
            </div>

            <div style={styles.helpNote}>If this keeps happening, clear saved results and try again.</div>

            <button
              type="button"
              onClick={() => {
                clearStoredAdvice();
                window.location.href = "/#lead";
              }}
              style={styles.ghostBtn}
            >
              Clear saved results & restart
            </button>
          </div>
        </div>
      </main>
    );
  }

  const saveDisabled = saveStatus === "sending" || saveStatus === "sent";
  const showReceipt = loadState === "ready";

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        {/* Header bar */}
        <div style={styles.headerRow}>
          <div>
            <div style={styles.brand}>Drive Style</div>
            <div style={styles.sub}>Your shortlist & guidance</div>
          </div>

          <div style={styles.headerActions}>
            <button type="button" onClick={() => copyToClipboard("header")} style={styles.ghostBtn} aria-label="Copy summary">
              {copied ? "Copied" : "Copy"}
            </button>
            <Link href="/" style={styles.secondaryBtn} onClick={() => track("results_new_brief")}>
              New brief
            </Link>
          </div>
        </div>

        <div style={styles.card}>
          {/* Premium top section */}
          <div style={styles.topHeader}>
            <div>
              <h1 style={styles.h1}>Your shortlist is ready</h1>
              <p style={styles.topSub}>5 vehicles that match your budget and everyday needs — ranked by best fit.</p>
            </div>

            <div style={styles.topActions}>
              <button type="button" onClick={() => scrollToSave("hero")} style={styles.primaryBtnTight}>
                Email me this
              </button>
              <Link href="/" style={styles.secondaryBtn} onClick={() => track("results_refine_answers")}>
                Refine answers
              </Link>
            </div>
          </div>

          {/* “Receipt” row (premium reassurance) */}
          {showReceipt && (
            <div style={styles.receiptRow} role="status" aria-live="polite">
              <div style={styles.receiptLeft}>
                <span style={styles.receiptPillOk}>Shortlist generated</span>
                <span style={styles.receiptPillSoft}>Saved for this session</span>

                {storedEmail ? (
                  <span style={styles.receiptPillInfo} title={storedEmail}>
                    Email on file: {maskEmail(storedEmail)}
                  </span>
                ) : (
                  <button type="button" onClick={() => scrollToSave("hero")} style={styles.receiptLinkBtn}>
                    Want this emailed to you?
                  </button>
                )}
              </div>

              <div style={styles.receiptRight}>
                <button type="button" onClick={() => copyToClipboard("header")} style={styles.receiptGhostBtn}>
                  {copied ? "Copied" : "Copy summary"}
                </button>
              </div>
            </div>
          )}

          {/* Trust row */}
          <div style={styles.trustRow}>
            <span style={styles.trustPill}>Independent guidance</span>
            <span style={styles.trustDot} aria-hidden />
            <span style={styles.trustText}>Not a dealership</span>
            <span style={styles.trustDot} aria-hidden />
            <span style={styles.trustText}>No commission bias</span>
          </div>

          {/* Copy error (rare) */}
          {copyError && (
            <div style={styles.softWarn} role="status" aria-live="polite">
              {copyError}
            </div>
          )}

          {/* Intro */}
          <p style={styles.intro}>{advice.intro}</p>

          {/* Insights */}
          <div style={styles.grid}>
            {advice.insights?.map((ins) => (
              <div key={ins.title} style={styles.insight}>
                <div style={styles.insightTitle}>{ins.title}</div>
                <div style={styles.insightText}>{ins.text}</div>
              </div>
            ))}
          </div>

          {/* Verdict */}
          {advice.verdict && (
            <div style={styles.verdict}>
              <div style={styles.verdictTitle}>Drive Style Verdict</div>
              <div style={styles.verdictText}>{advice.verdict}</div>
            </div>
          )}

          {/* Shortlist */}
          <div style={styles.sectionHeaderRow}>
            <h2 style={styles.h2}>Shortlist options</h2>
            <div style={styles.sectionHint}>Tap “Read more” for details</div>
          </div>

          <div style={styles.models}>
            {advice.models?.map((m) => {
              const isExpanded = !!expanded[m.name];
              const shouldShowToggle = (m.why || "").trim().length > 180;

              return (
                <div
                  key={m.name}
                  style={styles.modelCard}
                  onMouseEnter={(e) => {
                    if (isMobile) return;
                    e.currentTarget.style.transform = "translateY(-6px)";
                    e.currentTarget.style.boxShadow = "0 18px 40px rgba(0,0,0,0.45)";
                  }}
                  onMouseLeave={(e) => {
                    if (isMobile) return;
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={styles.modelName}>{m.name}</div>

                  <div style={isExpanded || !shouldShowToggle ? styles.modelWhyExpanded : styles.modelWhyClamp}>{m.why}</div>

                  {shouldShowToggle && (
                    <button
                      type="button"
                      onClick={() => {
                        setExpanded((prev) => ({ ...prev, [m.name]: !prev[m.name] }));
                        track("results_model_toggle", { model: m.name, expanded: !isExpanded });
                      }}
                      style={styles.readMoreBtn}
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? "Show less" : "Read more"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Closing */}
          <div style={styles.closing}>{advice.closing}</div>

          {/* Save block with inline email capture */}
          <div id="save" ref={(n) => (saveRef.current = n)} style={styles.saveBlock}>
            <div style={styles.saveTitle}>Email me this shortlist</div>
            <div style={styles.saveText}>
              Add an email so we can keep your shortlist on file for follow-up. Optional: add your phone if you want WhatsApp help.
            </div>

            {saveStatus === "sent" ? (
              <div style={styles.saveSuccess} role="status" aria-live="polite">
                <div style={styles.saveSuccessTitle}>Saved ✅</div>
                <div style={styles.saveSmall}>
                  We’ve saved your shortlist request for{" "}
                  <span style={styles.inlineCode}>{storedEmail ? maskEmail(storedEmail) : saveEmail}</span>.
                </div>

                <div style={styles.inlineActions}>
                  <button type="button" onClick={() => copyToClipboard("save")} style={styles.secondaryBtn}>
                    {copied ? "Copied" : "Copy summary"}
                  </button>
                  <button type="button" onClick={resetSaveForm} style={styles.ghostBtn}>
                    Use a different email
                  </button>
                </div>

                <div style={styles.saveSmall2}>
                  Note: this logs your request to our internal list. Automated email sending is part of the launch rollout.
                </div>
              </div>
            ) : (
              <form onSubmit={onSaveSubmit} style={styles.saveForm} aria-busy={saveStatus === "sending"}>
                <div style={styles.saveGrid}>
                  <label style={styles.fieldLabel}>
                    Name (optional)
                    <input
                      value={saveName}
                      onChange={(e) => {
                        setSaveName(e.target.value);
                        writeLocalString(STORAGE.name, e.target.value.trim());
                        setStoredName(e.target.value.trim());
                      }}
                      style={styles.fieldInput}
                      autoComplete="name"
                      disabled={saveDisabled}
                    />
                  </label>

                  <label style={styles.fieldLabel}>
                    Email (required)
                    <input
                      value={saveEmail}
                      onChange={(e) => {
                        const v = e.target.value;
                        setSaveEmail(v);
                        // Store on change so “receipt” can show immediately after refresh, even before submit
                        writeLocalString(STORAGE.email, v.trim().toLowerCase());
                        setStoredEmail(v.trim().toLowerCase());
                      }}
                      style={styles.fieldInput}
                      type="email"
                      required
                      autoComplete="email"
                      disabled={saveDisabled}
                    />
                  </label>

                  <label style={styles.fieldLabel}>
                    Phone (optional)
                    <input
                      value={savePhone}
                      onChange={(e) => {
                        setSavePhone(e.target.value);
                        writeLocalString(STORAGE.phone, e.target.value.trim());
                      }}
                      style={styles.fieldInput}
                      autoComplete="tel"
                      inputMode="tel"
                      disabled={saveDisabled}
                    />
                  </label>
                </div>

                <div style={styles.inlineActions}>
                  <button
                    type="submit"
                    disabled={saveStatus === "sending"}
                    style={{
                      ...styles.primaryBtn,
                      ...(saveStatus === "sending" ? styles.btnDisabled : null),
                    }}
                  >
                    {saveStatus === "sending" ? "Saving..." : "Save my email"}
                  </button>

                  <button type="button" onClick={() => copyToClipboard("save")} style={styles.secondaryBtn}>
                    {copied ? "Copied" : "Copy summary"}
                  </button>
                </div>

                {saveStatus === "error" && (
                  <div style={styles.errorText} role="status" aria-live="polite">
                    Error: {saveError}
                  </div>
                )}

                <div style={styles.saveSmall}>No spam — just your shortlist and guidance.</div>
              </form>
            )}
          </div>

          <div style={{ marginTop: 18 }}>
            <Link href="/" style={styles.secondaryBtn} onClick={() => track("results_edit_answers")}>
              Edit my answers
            </Link>
          </div>
        </div>
      </div>

      {/* Sticky mobile CTA bar */}
      {isMobile && showStickyCta && (
        <div style={styles.stickyBar} role="region" aria-label="Quick actions">
          <div style={styles.stickyInner}>
            <button type="button" onClick={() => scrollToSave("sticky")} style={styles.stickyPrimary}>
              Email me this
            </button>
            <button type="button" onClick={() => copyToClipboard("sticky")} style={styles.stickySecondary}>
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

/** Helpers */
function maskEmail(email: string) {
  const e = String(email || "").trim();
  const at = e.indexOf("@");
  if (at <= 1) return e;
  const local = e.slice(0, at);
  const domain = e.slice(at + 1);
  const keep = Math.min(2, Math.max(1, local.length));
  const maskedLocal = local.slice(0, keep) + "•••";
  const dot = domain.indexOf(".");
  const maskedDomain =
    dot > 1 ? domain.slice(0, 1) + "•••" + domain.slice(dot) : domain.slice(0, 1) + "•••";
  return `${maskedLocal}@${maskedDomain}`;
}

/** Responsive helper */
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

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    try {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      const onChange = () => setReduced(!!mq.matches);
      onChange();
      mq.addEventListener?.("change", onChange);
      return () => mq.removeEventListener?.("change", onChange);
    } catch {
      // ignore
    }
  }, []);

  return reduced;
}

/** Styles */
function makeStyles(isMobile: boolean): Record<string, React.CSSProperties> {
  return {
    page: {
      minHeight: "100vh",
      background: "#0B1C2D",
      color: "rgba(255,255,255,0.92)",
      padding: isMobile ? "18px 0 84px" : "30px 0 60px", // extra bottom padding for sticky bar
    },
    container: { maxWidth: 940, margin: "0 auto", padding: "0 20px" },

    headerRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 18,
    },
    headerActions: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },

    brand: { fontWeight: 900, letterSpacing: 0.3, fontSize: 16 },
    sub: { opacity: 0.7, fontSize: 13, marginTop: 4 },

    card: {
      borderRadius: 24,
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(255,255,255,0.05)",
      padding: isMobile ? 18 : 24,
      boxShadow: "0 0 0 1px rgba(255,255,255,0.03) inset",
    },

    h1: { margin: 0, fontSize: isMobile ? 28 : 34, letterSpacing: -0.6, lineHeight: 1.15 },
    h2: { margin: 0, fontSize: 19, letterSpacing: -0.2 },

    p: { marginTop: 12, color: "rgba(255,255,255,0.72)", lineHeight: 1.6 },

    topHeader: {
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      alignItems: isMobile ? "flex-start" : "center",
      justifyContent: "space-between",
      gap: 14,
      paddingBottom: 16,
      borderBottom: "1px solid rgba(255,255,255,0.10)",
      marginBottom: 12,
    },
    topSub: {
      margin: "8px 0 0",
      fontSize: 14.5,
      color: "rgba(255,255,255,0.75)",
      lineHeight: 1.5,
      maxWidth: 560,
    },
    topActions: { display: "flex", gap: 10, flexWrap: "wrap" },

    // Receipt row
    receiptRow: {
      marginTop: 12,
      borderRadius: 18,
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(255,255,255,0.04)",
      padding: isMobile ? 12 : 14,
      display: "flex",
      gap: 10,
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
    },
    receiptLeft: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" },
    receiptRight: { display: "flex", gap: 10, alignItems: "center" },
    receiptPillOk: {
      fontSize: 12,
      padding: "6px 10px",
      borderRadius: 999,
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(34,197,94,0.10)",
      color: "rgba(255,255,255,0.90)",
      fontWeight: 850,
    },
    receiptPillSoft: {
      fontSize: 12,
      padding: "6px 10px",
      borderRadius: 999,
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(255,255,255,0.03)",
      color: "rgba(255,255,255,0.78)",
      fontWeight: 800,
    },
    receiptPillInfo: {
      fontSize: 12,
      padding: "6px 10px",
      borderRadius: 999,
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(96,165,250,0.10)",
      color: "rgba(255,255,255,0.88)",
      fontWeight: 800,
    },
    receiptLinkBtn: {
      background: "transparent",
      border: "1px solid rgba(255,255,255,0.12)",
      color: "rgba(255,255,255,0.92)",
      padding: "8px 10px",
      borderRadius: 12,
      fontWeight: 850,
      fontSize: 12.5,
      cursor: "pointer",
    },
    receiptGhostBtn: {
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.10)",
      color: "rgba(255,255,255,0.92)",
      padding: "10px 12px",
      borderRadius: 14,
      fontWeight: 850,
      cursor: "pointer",
    },

    trustRow: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, marginTop: 10, marginBottom: 8 },
    trustPill: {
      display: "inline-flex",
      alignItems: "center",
      fontSize: 12,
      padding: "6px 10px",
      borderRadius: 999,
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(255,255,255,0.06)",
      color: "rgba(255,255,255,0.86)",
      fontWeight: 750,
    },
    trustDot: {
      width: 4,
      height: 4,
      borderRadius: 999,
      background: "rgba(255,255,255,0.35)",
      display: isMobile ? "none" : "inline-block",
    },
    trustText: { fontSize: 12.5, color: "rgba(255,255,255,0.65)", fontWeight: 650 },

    softWarn: {
      marginTop: 10,
      borderRadius: 14,
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(255,255,255,0.04)",
      padding: 12,
      fontSize: 12.5,
      color: "rgba(255,255,255,0.72)",
      lineHeight: 1.5,
    },

    intro: { marginTop: 14, fontSize: isMobile ? 16 : 17, lineHeight: 1.75, color: "rgba(255,255,255,0.9)" },

    grid: {
      marginTop: 18,
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))",
      gap: 14,
    },
    insight: {
      borderRadius: 18,
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(255,255,255,0.04)",
      padding: 16,
      minHeight: isMobile ? "auto" : 120,
    },
    insightTitle: { fontWeight: 900, marginBottom: 6 },
    insightText: { color: "rgba(255,255,255,0.78)", lineHeight: 1.65, fontSize: 13.5 },

    verdict: {
      marginTop: 22,
      padding: 22,
      borderRadius: 22,
      border: "1px solid rgba(96,165,250,0.55)",
      background: "rgba(96,165,250,0.12)",
      boxShadow: "0 12px 32px rgba(37,99,235,0.15)",
    },
    verdictTitle: { fontWeight: 900, marginBottom: 8, fontSize: 15 },
    verdictText: { lineHeight: 1.7, fontSize: 15, color: "rgba(255,255,255,0.95)" },

    sectionHeaderRow: {
      marginTop: 26,
      marginBottom: 14,
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap",
    },
    sectionHint: { fontSize: 12.5, color: "rgba(255,255,255,0.55)", fontWeight: 650 },

    models: { display: "grid", gap: 14, gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))" },
    modelCard: {
      borderRadius: 22,
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(255,255,255,0.06)",
      padding: 20,
      transition: "transform 0.25s ease, box-shadow 0.25s ease",
      cursor: "default",
    },
    modelName: {
      fontWeight: 950,
      marginBottom: 8,
      fontSize: isMobile ? 16 : 15,
      letterSpacing: -0.2,
    },
    modelWhyClamp: {
      color: "rgba(255,255,255,0.75)",
      lineHeight: 1.65,
      fontSize: 13.5,
      display: "-webkit-box",
      WebkitLineClamp: 3,
      WebkitBoxOrient: "vertical" as any,
      overflow: "hidden",
    },
    modelWhyExpanded: { color: "rgba(255,255,255,0.75)", lineHeight: 1.65, fontSize: 13.5 },
    readMoreBtn: {
      marginTop: 10,
      background: "transparent",
      border: "1px solid rgba(255,255,255,0.12)",
      color: "rgba(255,255,255,0.92)",
      padding: "8px 10px",
      borderRadius: 12,
      fontWeight: 850,
      fontSize: 12.5,
      cursor: "pointer",
      width: isMobile ? "100%" : "auto",
      textAlign: "center" as const,
    },

    closing: { marginTop: 22, fontWeight: 850, fontSize: 15, color: "rgba(255,255,255,0.95)" },

    saveBlock: {
      marginTop: 22,
      padding: 18,
      borderRadius: 18,
      border: "1px solid rgba(255,255,255,0.10)",
      background: "rgba(255,255,255,0.04)",
    },
    saveTitle: { fontWeight: 950, marginBottom: 6, fontSize: 14.5 },
    saveText: { color: "rgba(255,255,255,0.72)", lineHeight: 1.55, fontSize: 13.5 },

    saveForm: { marginTop: 12, display: "grid", gap: 12 },
    saveGrid: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
      gap: 10,
      alignItems: "start",
    },
    fieldLabel: { display: "grid", gap: 6, fontSize: 12.5, color: "rgba(255,255,255,0.80)" },
    fieldInput: {
      width: "100%",
      padding: "10px 12px",
      borderRadius: 14,
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(0,0,0,0.25)",
      color: "rgba(255,255,255,0.92)",
      outline: "none",
    },

    inlineCode: {
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: 10,
      background: "rgba(0,0,0,0.22)",
      border: "1px solid rgba(255,255,255,0.10)",
      fontWeight: 850,
    },

    saveSuccess: { marginTop: 12 },
    saveSuccessTitle: { fontWeight: 950, marginBottom: 6 },
    saveSmall: { marginTop: 10, fontSize: 12, color: "rgba(255,255,255,0.55)" },
    saveSmall2: { marginTop: 10, fontSize: 12, color: "rgba(255,255,255,0.50)", lineHeight: 1.45 },

    inlineActions: { marginTop: 0, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" },
    helpNote: { marginTop: 12, fontSize: 12.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.45 },

    errorText: { marginTop: 6, color: "rgba(252,165,165,0.95)", fontSize: 13 },

    btnDisabled: { opacity: 0.7, cursor: "not-allowed" as const },

    primaryBtn: {
      display: "inline-block",
      padding: "12px 16px",
      borderRadius: 14,
      background: "rgba(255,255,255,0.92)",
      color: "#06080c",
      textDecoration: "none",
      fontWeight: 900,
      border: "1px solid rgba(255,255,255,0.18)",
      cursor: "pointer",
    },
    primaryBtnTight: {
      display: "inline-block",
      padding: "10px 14px",
      borderRadius: 14,
      background: "rgba(255,255,255,0.92)",
      color: "#06080c",
      textDecoration: "none",
      fontWeight: 950,
      border: "1px solid rgba(255,255,255,0.18)",
      cursor: "pointer",
    },
    secondaryBtn: {
      display: "inline-block",
      padding: "10px 14px",
      borderRadius: 14,
      background: "rgba(255,255,255,0.06)",
      color: "rgba(255,255,255,0.9)",
      textDecoration: "none",
      fontWeight: 800,
      border: "1px solid rgba(255,255,255,0.12)",
      cursor: "pointer",
    },

    ghostBtn: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "10px 12px",
      borderRadius: 14,
      background: "rgba(255,255,255,0.02)",
      color: "rgba(255,255,255,0.9)",
      border: "1px solid rgba(255,255,255,0.10)",
      fontWeight: 850,
      cursor: "pointer",
    },

    // Sticky CTA
    stickyBar: {
      position: "fixed",
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 50,
      padding: "10px 12px",
      background: "rgba(5,7,11,0.80)",
      backdropFilter: "blur(12px)",
      borderTop: "1px solid rgba(255,255,255,0.10)",
    },
    stickyInner: {
      maxWidth: 940,
      margin: "0 auto",
      display: "grid",
      gridTemplateColumns: "1.3fr 0.7fr",
      gap: 10,
      padding: "0 8px",
    },
    stickyPrimary: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: 14,
      background: "rgba(255,255,255,0.92)",
      color: "#06080c",
      border: "1px solid rgba(255,255,255,0.18)",
      fontWeight: 950,
      cursor: "pointer",
    },
    stickySecondary: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: 14,
      background: "rgba(255,255,255,0.06)",
      color: "rgba(255,255,255,0.92)",
      border: "1px solid rgba(255,255,255,0.12)",
      fontWeight: 850,
      cursor: "pointer",
    },

    // Skeleton
    skeletonStack: { display: "grid", gap: 12 },
    skelH1: {
      height: 36,
      borderRadius: 14,
      background: "rgba(255,255,255,0.08)",
      border: "1px solid rgba(255,255,255,0.08)",
      maxWidth: 420,
    },
    skelLineWide: {
      height: 14,
      borderRadius: 999,
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.06)",
      maxWidth: 620,
    },
    skelLine: {
      height: 14,
      borderRadius: 999,
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.06)",
      maxWidth: 520,
    },
    skelGrid: {
      marginTop: 8,
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))",
      gap: 14,
    },
    skelCard: {
      height: 110,
      borderRadius: 18,
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.08)",
    },
    skelSectionTitle: {
      marginTop: 10,
      height: 16,
      width: 180,
      borderRadius: 999,
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.06)",
    },
    skelModels: {
      display: "grid",
      gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))",
      gap: 14,
    },
    skelModel: {
      height: 140,
      borderRadius: 22,
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.08)",
    },
    skelPill: {
      width: 70,
      height: 36,
      borderRadius: 14,
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.08)",
    },
    skelBtn: {
      width: 90,
      height: 36,
      borderRadius: 14,
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.08)",
    },
  };
}