"use client";

import Link from "next/link";
import PremiumShell from "@/components/PremiumShell";
import CineCard from "@/components/cinematic/CineCard";
import Footer from "@/components/cinematic/Footer";

export default function HomePage() {
  return (
    <PremiumShell header={null}>
      <section className="relative">
        <div className="cine-container pt-4 sm:pt-6 pb-12">

          {/* TOP BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <img
                src="/drivestyle-logo.png"
                alt="DriveStyle"
                className="w-[80px] sm:w-[95px] h-auto"
              />

              <span className="text-white/70 text-lg sm:whitespace-nowrap">
                South African Car-buying Advisory and Concierge Service
              </span>

              <div className="flex items-center gap-6">
                <Link
                  href="#service-plans"
                  className="text-white/80 hover:text-white text-sm font-medium transition"
                >
                  Service Plans
                </Link>

                <Link
                  href="#our-team"
                  className="text-white/80 hover:text-white text-sm font-medium transition"
                >
                  Our Team
                </Link>
              </div>
            </div>

            {/* BUTTON 1 */}
            <Link href="/quiz" className="cine-btn-primary w-fit">
              Get your free recommendation!
            </Link>

          </div>

          {/* MAIN HEADER */}
          <h1 className="mt-3 text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[0.94] text-white">
            DriveStyle Car-buyer’s Guide
          </h1>

          <p className="mt-4 text-2xl sm:text-3xl font-semibold text-white/85">
            “Helping YOU choose what drives you!”
          </p>

          <p className="mt-10 text-3xl sm:text-4xl lg:text-5xl font-semibold text-yellow-300">
            • Giving <span className="font-bold">YOU</span> Confidence in your every Car Choice!
          </p>

          {/* MAIN CONTENT */}
          <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

            {/* LEFT COLUMN */}
            <div className="lg:col-span-7">
              <h2 className="text-4xl sm:text-5xl font-semibold text-white">
                How It Works...
              </h2>

              <div className="mt-6 space-y-6 text-yellow-300">
                <div>
                  <p className="font-bold text-xl">1. We get to know you</p>
                  <p className="text-lg">
                    Not just your budget — your lifestyle, routines,
                    preferences, priorities, personality, and dreams.
                  </p>
                </div>

                <div>
                  <p className="font-bold text-xl">2. We map your needs and style</p>
                  <p className="text-lg">
                    We combine practical reality with personal expression.
                  </p>
                </div>

                <div>
                  <p className="font-bold text-xl">3. We shortlist your smart-match options</p>
                  <p className="text-lg">
                    Complete with pros/cons, cost implications, risks,
                    comfort, performance, and maintenance considerations.
                  </p>
                </div>

                <div>
                  <p className="font-bold text-xl">
                    4. You make the choice that feels right
                  </p>
                  <p className="text-lg">
                    With clarity and confidence — not pressure or confusion.
                  </p>
                </div>
              </div>

              {/* BUTTON 3 */}
              <div className="mt-10">
                <Link href="/quiz" className="cine-btn-primary">
                  Get your free recommendation!
                </Link>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-5">

              {/* BUTTON 2 - DESKTOP/TABLET ONLY */}
              <div className="hidden md:flex justify-center mb-8">
                <Link href="/quiz" className="cine-btn-primary">
                  Get your free recommendation!
                </Link>
              </div>

              <CineCard glow={false} className="p-6">
                <img
                  src="/hero-car.png"
                  alt="Premium vehicle"
                  className="w-full h-auto rounded-[24px]"
                  style={{
                    filter: "brightness(0.95) contrast(1.05)",
                  }}
                />
              </CineCard>

            </div>

          </div>
        </div>
      </section>

      <Footer />
    </PremiumShell>
  );
}