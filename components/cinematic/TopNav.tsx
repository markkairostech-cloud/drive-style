import Link from "next/link";
import DriveStyleLogo from "./DriveStyleLogo";

export default function TopNav({
  ctaHref = "/quiz",
  ctaLabel = "See my recommendation",
}: {
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#04060b]/60 backdrop-blur-xl">
      <div className="cine-container flex items-center justify-between py-4">
        <Link href="/" className="select-none">
          <DriveStyleLogo />
        </Link>

        <nav className="hidden sm:flex items-center gap-6 text-sm text-white/75">
          <Link href="/#services" className="hover:text-white transition">Services</Link>
          <Link href="/#services" className="hover:text-white transition">Plans</Link>
          <Link href={ctaHref} className="cine-btn-primary">
            {ctaLabel}
            <span aria-hidden>→</span>
          </Link>
        </nav>

        <div className="sm:hidden">
          <Link href={ctaHref} className="cine-btn-primary">
            Start
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
