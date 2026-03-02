import React from "react";

/**
 * PremiumShell
 * - Full cinematic multi-layer background (blooms + starfield + vignette + grain)
 * - Shared across Landing / Quiz / Results
 */

type PremiumShellProps = {
  children: React.ReactNode;
  header?: React.ReactNode;
};

export default function PremiumShell({ children, header }: PremiumShellProps) {
  return (
    <main className="cine-page">
      {/* Background FX */}
      <div aria-hidden className="fixed inset-0 z-0 pointer-events-none">
        {/* Deep base */}
        <div className="absolute inset-0 bg-[#04060b]" />

        {/* Starfield specks */}
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 12% 18%, rgba(255,255,255,0.12) 0 1px, transparent 2px)," +
              "radial-gradient(circle at 72% 22%, rgba(255,255,255,0.10) 0 1px, transparent 2px)," +
              "radial-gradient(circle at 33% 62%, rgba(255,255,255,0.08) 0 1px, transparent 2px)," +
              "radial-gradient(circle at 86% 70%, rgba(255,255,255,0.08) 0 1px, transparent 2px)," +
              "radial-gradient(circle at 55% 40%, rgba(255,255,255,0.06) 0 1px, transparent 2px)",
            backgroundSize: "420px 420px",
          }}
        />

        {/* Cinematic blooms */}
        <div
          className="absolute inset-0 opacity-100"
          style={{
            background:
              "radial-gradient(1250px circle at 45% -14%, rgba(59,130,246,0.42), transparent 62%)," +
              "radial-gradient(1100px circle at 12% 22%, rgba(56,189,248,0.24), transparent 62%)," +
              "radial-gradient(1200px circle at 88% 26%, rgba(37,99,235,0.32), transparent 64%)," +
              "radial-gradient(1050px circle at 70% 92%, rgba(99,102,241,0.20), transparent 58%)",
          }}
        />

        {/* Light streak / sheen */}
        <div
          className="absolute -inset-28 opacity-80"
          style={{
            background:
              "conic-gradient(from 210deg at 60% 30%, rgba(56,189,248,0.0), rgba(56,189,248,0.26), rgba(59,130,246,0.0), rgba(99,102,241,0.16), rgba(56,189,248,0.0))",
            filter: "blur(28px)",
          }}
        />

        {/* Bottom roadway streaks */}
        <div
          className="absolute -bottom-40 left-[-10%] right-[-10%] h-[520px] opacity-80"
          style={{
            background:
              "radial-gradient(700px circle at 70% 35%, rgba(56,189,248,0.26), transparent 55%)," +
              "linear-gradient(15deg, rgba(56,189,248,0.0), rgba(56,189,248,0.22), rgba(56,189,248,0.0))," +
              "linear-gradient(-12deg, rgba(59,130,246,0.0), rgba(59,130,246,0.20), rgba(59,130,246,0.0))",
            filter: "blur(22px)",
            transform: "skewY(-6deg)",
          }}
        />

        {/* Vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 32%, rgba(0,0,0,0.92) 100%)",
          }}
        />

        {/* Grain */}
        <div className="cine-grain absolute inset-0 opacity-[0.22]" />
      </div>

      {/* Foreground */}
      <div className="relative z-10 min-h-screen">
        {header ? <div className="cine-header">{header}</div> : null}
        <div className="cine-content">{children}</div>
      </div>
    </main>
  );
}
