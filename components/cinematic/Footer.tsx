import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-white/10 mt-16">
      <div className="cine-container py-10 flex flex-col sm:flex-row gap-6 sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-semibold tracking-wide">DRIVESTYLE</div>
          <div className="text-xs text-white/60 mt-1">© {year} Drive Style. All rights reserved.</div>
        </div>
        <div className="flex items-center gap-5 text-sm text-white/70">
          <Link href="/#services" className="hover:text-white transition">Services</Link>
          <Link href="/quiz" className="hover:text-white transition">Quiz</Link>
        </div>
      </div>
    </footer>
  );
}
