import React from "react";

export default function CineCard({
  children,
  className = "",
  glow = true,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={[
        "cine-card cine-card-metal",
        glow ? "cine-card-glow" : "",
        "relative overflow-hidden",
        className,
      ].join(" ")}
    >
      {/* subtle top highlight */}
      <div
        aria-hidden
        className="absolute -top-24 left-10 h-48 w-[32rem] rounded-full bg-sky-300/10 blur-3xl"
      />
      <div className="relative">{children}</div>
    </div>
  );
}
