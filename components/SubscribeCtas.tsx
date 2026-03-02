import Link from "next/link";
import CineCard from "@/components/cinematic/CineCard";

export default function SubscribeCtas({
  title = "Upgrade your level of support",
  subtitle = "Choose how hands-on you want Drive Style to be.",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <CineCard className="p-7">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
        <div>
          <div className="text-lg font-semibold tracking-tight">{title}</div>
          <div className="mt-2 text-sm text-white/70 leading-relaxed">{subtitle}</div>
        </div>
        <Link href="/#services" className="cine-btn-secondary">
          View services
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Plan
          tag="Bronze"
          title="Guided shortlist"
          desc="Shortlist + reasoning, confidence in the basics."
        />
        <Plan
          tag="Platinum"
          title="Protected purchase"
          desc="Templates, finance guidance, stronger negotiation posture."
        />
        <Plan
          tag="Elite"
          title="Fully represented"
          desc="Hands-off support through verification and purchase."
        />
      </div>

      <div className="mt-7">
  <Link
    href="/quiz"
    className="cine-btn-primary w-full justify-center text-base py-4"
  >
    See my recommendation <span aria-hidden>→</span>
  </Link>
</div>
    </CineCard>
  );
}

function Plan({ tag, title, desc }: { tag: string; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="cine-pill">{tag}</div>
      <div className="mt-3 text-sm font-semibold">{title}</div>
      <div className="mt-2 text-sm text-white/70 leading-relaxed">{desc}</div>
    </div>
  );
}
