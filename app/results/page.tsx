"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Advice = {
  intro: string;
  insights: { title: string; text: string }[];
  verdict?: string;
  models: { name: string; why: string }[];
  closing: string;
};

export default function ResultsPage() {
  const [advice, setAdvice] = useState<Advice | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("driveStyleAdvice");
      if (!raw) return;
      setAdvice(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  if (!advice) {
    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <div style={styles.card}>
            <h1 style={styles.h1}>No advice found</h1>
            <p style={styles.p}>
              It looks like you opened this page directly (or refreshed).
              Please go back and submit your brief again.
            </p>
            <Link href="/" style={styles.primaryBtn}>
              Back to the form
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={styles.headerRow}>
          <div>
            <div style={styles.brand}>Drive Style</div>
            <div style={styles.sub}>Your shortlist & guidance</div>
          </div>
          <Link href="/" style={styles.secondaryBtn}>
            New brief
          </Link>
        </div>

        <div style={styles.card}>
          <h1 style={styles.h1}>Your recommendations</h1>

          <p style={styles.intro}>{advice.intro}</p>

          <div style={styles.grid}>
            {advice.insights?.map((ins) => (
              <div key={ins.title} style={styles.insight}>
                <div style={styles.insightTitle}>{ins.title}</div>
                <div style={styles.insightText}>{ins.text}</div>
              </div>
            ))}
          </div>

          {/* Verdict Block */}
          {advice.verdict && (
            <div style={styles.verdict}>
              <div style={styles.verdictTitle}>Drive Style Verdict</div>
              <div style={styles.verdictText}>{advice.verdict}</div>
            </div>
          )}

          <h2 style={styles.h2}>Shortlist options</h2>

          <div style={styles.models}>
            {advice.models?.map((m) => (
              <div
                key={m.name}
                style={styles.modelCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-6px)";
                  e.currentTarget.style.boxShadow =
                    "0 18px 40px rgba(0,0,0,0.45)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={styles.modelName}>{m.name}</div>
                <div style={styles.modelWhy}>{m.why}</div>
              </div>
            ))}
          </div>

          <div style={styles.closing}>{advice.closing}</div>

          <div style={{ marginTop: 18 }}>
            <Link href="/" style={styles.secondaryBtn}>
              Edit my answers
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#0B1C2D",
    color: "rgba(255,255,255,0.92)",
    padding: "30px 0 60px",
  },
  container: {
    maxWidth: 940,
    margin: "0 auto",
    padding: "0 20px",
  },

  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    marginBottom: 18,
  },

  brand: {
    fontWeight: 900,
    letterSpacing: 0.3,
    fontSize: 16,
  },

  sub: {
    opacity: 0.7,
    fontSize: 13,
    marginTop: 4,
  },

  card: {
    borderRadius: 24,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.05)",
    padding: 24,
    boxShadow: "0 0 0 1px rgba(255,255,255,0.03) inset",
  },

  h1: {
    margin: 0,
    fontSize: 34,
    letterSpacing: -0.6,
  },

  h2: {
    margin: "26px 0 14px",
    fontSize: 19,
    letterSpacing: -0.2,
  },

  p: {
    marginTop: 12,
    color: "rgba(255,255,255,0.72)",
    lineHeight: 1.6,
  },

  intro: {
    marginTop: 16,
    fontSize: 17,
    lineHeight: 1.75,
    color: "rgba(255,255,255,0.9)",
  },

  grid: {
    marginTop: 20,
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 14,
  },

  insight: {
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    padding: 16,
  },

  insightTitle: {
    fontWeight: 900,
    marginBottom: 6,
  },

  insightText: {
    color: "rgba(255,255,255,0.75)",
    lineHeight: 1.65,
    fontSize: 13.5,
  },

  verdict: {
    marginTop: 26,
    padding: 22,
    borderRadius: 22,
    border: "1px solid rgba(96,165,250,0.55)",
    background: "rgba(96,165,250,0.12)",
    boxShadow: "0 12px 32px rgba(37,99,235,0.15)",
  },

  verdictTitle: {
    fontWeight: 900,
    marginBottom: 8,
    fontSize: 15,
  },

  verdictText: {
    lineHeight: 1.7,
    fontSize: 15,
    color: "rgba(255,255,255,0.95)",
  },

  models: {
    display: "grid",
    gap: 14,
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  },

  modelCard: {
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    padding: 20,
    transition: "transform 0.25s ease, box-shadow 0.25s ease",
    cursor: "default",
  },

  modelName: {
    fontWeight: 900,
    marginBottom: 8,
    fontSize: 15,
  },

  modelWhy: {
    color: "rgba(255,255,255,0.75)",
    lineHeight: 1.65,
    fontSize: 13.5,
  },

  closing: {
    marginTop: 22,
    fontWeight: 800,
    fontSize: 15,
    color: "rgba(255,255,255,0.95)",
  },

  primaryBtn: {
    display: "inline-block",
    marginTop: 14,
    padding: "12px 16px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.92)",
    color: "#06080c",
    textDecoration: "none",
    fontWeight: 800,
    border: "1px solid rgba(255,255,255,0.18)",
  },

  secondaryBtn: {
    display: "inline-block",
    padding: "10px 14px",
    borderRadius: 14,
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.9)",
    textDecoration: "none",
    fontWeight: 700,
    border: "1px solid rgba(255,255,255,0.12)",
  },
};