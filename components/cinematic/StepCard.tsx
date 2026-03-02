import CineCard from "./CineCard";

function StepIcon({ kind }: { kind: "guide" | "search" | "drive" | "deliver" }) {
  const common = "h-6 w-6";
  switch (kind) {
    case "guide":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
          <path d="M7 8.5c0-2.5 2-4.5 5-4.5s5 2 5 4.5S15 13 12 13 7 11 7 8.5Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M5.5 20c1.2-3.8 4-6 6.5-6s5.3 2.2 6.5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M15.5 4.7l2.2-1.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "search":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
          <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M7.7 8.4c.7-1.4 2.1-2.3 3.8-2.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "drive":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
          <path d="M6 14.5h12l-1.4-6.2A2 2 0 0 0 14.7 6.8H9.3a2 2 0 0 0-1.9 1.5L6 14.5Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M7.5 18.2a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M16.5 18.2a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M6.7 12.2h10.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "deliver":
    default:
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" aria-hidden>
          <path d="M5.5 7.5h10v10h-10v-10Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M15.5 10h3.2l1.8 2.2V17.5h-5V10Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M8 19.2a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M18 19.2a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
  }
}

function kindFromIndex(index: string) {
  if (index === "01") return "guide" as const;
  if (index === "02") return "search" as const;
  if (index === "03") return "drive" as const;
  return "deliver" as const;
}

export default function StepCard({
  index,
  title,
  desc,
}: {
  index: string;
  title: string;
  desc: string;
}) {
  const kind = kindFromIndex(index);
  return (
    <CineCard className="p-6">
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center gap-3">
          <div className="cine-pill">{index}</div>

          <div
            className="h-12 w-12 rounded-2xl grid place-items-center border border-white/12 bg-white/[0.04]"
            style={{
              boxShadow:
                "0 0 0 1px rgba(255,255,255,0.05) inset, 0 0 40px rgba(56,189,248,0.22)",
            }}
          >
            <div className="text-sky-100 drop-shadow-[0_0_18px_rgba(56,189,248,0.45)]">
              <StepIcon kind={kind} />
            </div>
          </div>
        </div>

        <div>
          <div className="text-base font-semibold tracking-tight">{title}</div>
          <div className="mt-2 text-sm text-white/75 leading-relaxed">{desc}</div>
        </div>
      </div>
    </CineCard>
  );
}
