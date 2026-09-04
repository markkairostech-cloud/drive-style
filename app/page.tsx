"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const newsItems = [
  {
    image: "/rightcar4me-carousel-1.jpg",
    alt: "Mitsubishi Pajero",
    title: "2027 Mitsubishi Pajero revealed and confirmed for South Africa",
    link: "https://www.carmag.co.za/news/new-models/2027-mitsubishi-pajero-revealed-and-confirmed-for-south-africa/",
  },
  {
    image: "/rightcar4me-carousel-2.jpg",
    alt: "Best-selling bakkies in South Africa",
    title: "Top 5 best-selling bakkies in South Africa",
    link: "https://www.carmag.co.za/news/industry-news/top-5-best-selling-bakkies-in-south-africa-august-2026/",
  },
  {
    image: "/rightcar4me-carousel-3.jpg",
    alt: "Best-selling passenger cars in South Africa",
    title: "Top 10 best-selling passenger cars in South Africa",
    link: "https://www.carmag.co.za/news/industry-news/top-10-best-selling-passenger-cars-in-south-africa-august-2026/",
  },
  {
    image: "/rightcar4me-carousel-4.jpg",
    alt: "South African-built Volkswagen compact SUV",
    title: "Exclusive first look at South Africa’s new Volkswagen compact SUV",
    link: "https://www.carmag.co.za/videos/watch-exclusive-first-look-at-sa-built-vw-tengo-compact-suv/",
  },
  {
    image: "/rightcar4me-carousel-5.jpg",
    alt: "GWM V8 bakkie",
    title: "Diesel is not dead—and long live the V8, says GWM",
    link: "https://www.carmag.co.za/news/diesel-is-not-dead-and-long-live-the-v8-says-gwm/",
  },
];

const heroImages = [
    {
      image: "/rightcar4me-hero-1.png",
      alt: "Lifestyle bakkie on a South African road",
      label: "Adventure",
      caption: "Built for work, weekends and the road beyond.",
    },
    {
      image: "/rightcar4me-hero-2.png",
      alt: "Performance sedan in the city",
      label: "Performance",
      caption: "Performance that still fits the life you lead.",
    },
    {
      image: "/rightcar4me-hero-3.png",
      alt: "Stylish compact car at a fuel station",
      label: "Compact",
      caption: "City-friendly, efficient and full of personality.",
    },
    {
      image: "/rightcar4me-hero-4.png",
      alt: "Family loading an SUV",
      label: "Family",
      caption: "Space, safety and practicality for family life.",
    },
  ];

export default function HomePage() {
  const [newsIndex, setNewsIndex] = useState(0);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const newsTimer = window.setInterval(() => {
      setNewsIndex((current) => (current + 1) % newsItems.length);
    }, 5000);

    return () => window.clearInterval(newsTimer);
  }, []);

  useEffect(() => {
    const heroTimer = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % heroImages.length);
    }, 30000);

    return () => window.clearInterval(heroTimer);
  }, []);

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-6 px-5 py-5 sm:px-8 lg:grid-cols-[280px_1fr] lg:gap-10">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center justify-center rounded-2xl bg-white px-4 py-3 lg:justify-start"
          >
            <img
              src="/rightcar4me-logo.png"
              alt="RightCar4Me independent car-buying advisory"
              className="h-auto w-full max-w-[230px]"
            />
          </Link>

          {/* News carousel */}
          <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <a
              href={newsItems[newsIndex].link}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block aspect-[16/8] overflow-hidden bg-slate-900"
            >
              {newsItems.map((item, index) => (
                <img
                  key={item.image}
                  src={item.image}
                  alt={item.alt}
                  className={`absolute inset-0 h-full w-full object-cover transition-all duration-1000 group-hover:scale-[1.02] ${
                    index === newsIndex
                      ? "opacity-100"
                      : "pointer-events-none opacity-0"
                  }`}
                />
              ))}

              {/* News label and changing headline */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/55 to-transparent px-4 pb-3 pt-12">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300 sm:text-xs">
                  Motoring news
                </p>

                <p className="text-sm font-semibold leading-snug text-white sm:text-base">
                  {newsItems[newsIndex].title}
                </p>
              </div>
            </a>

            {/* Carousel controls */}
            <div className="flex justify-center gap-2 bg-white py-2">
              {newsItems.map((item, index) => (
                <button
                  key={item.image}
                  type="button"
                  aria-label={`Show news image ${index + 1}`}
                  onClick={() => setNewsIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === newsIndex
                      ? "w-7 bg-[#00a9a5]"
                      : "w-2 bg-slate-300 hover:bg-slate-400"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -right-24 top-20 h-72 w-72 rounded-full bg-cyan-100/70 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Main copy */}
            <div>
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-[#087f8c]">
                Independent car-buying advice
              </p>

              <h1 className="max-w-none text-4xl font-bold leading-tight tracking-tight text-[#071d3b] sm:text-5xl lg:text-5xl">
                Buying a car shouldn&apos;t feel like a gamble.
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl">
                So many choices. Too much conflicting advice. So much money at
                stake—and one big question:
              </p>

              <p className="mt-5 max-w-xl text-2xl font-bold leading-snug text-[#071d3b] sm:text-3xl">
                How do I know I&apos;m buying the right car?
              </p>

              <div className="mt-8 rounded-2xl border-l-4 border-[#00a9a5] bg-slate-50 p-5">
                <p className="text-lg font-semibold leading-7 text-[#071d3b]">
                  Stop guessing. Seven questions can reveal which cars actually
                  fit your lifestyle, needs and budget.
                </p>
              </div>
              <div className="mt-6">
                <Link
                  href="/quiz"
                  className="inline-flex min-h-14 items-center justify-center rounded-xl bg-[#00a9a5] px-8 py-4 text-base font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#008f91] focus:outline-none focus:ring-4 focus:ring-cyan-300/40"
                >
                  Start My 60-Second Match
                </Link>

                <p className="mt-3 text-sm font-medium text-slate-600">
                  7 quick questions · No dealer calls · No obligation
                </p>
              </div>
            </div>
            
            {/* Hero carousel */}
            <div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-slate-100 shadow-2xl shadow-slate-300/60">
                {heroImages.map((item, index) => (
                  <img
                    key={item.image}
                    src={item.image}
                    alt={item.alt}
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                      index === heroIndex
                        ? "opacity-100"
                        : "pointer-events-none opacity-0"
                    }`}
                  />
                ))}

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#071d3b]/80 to-transparent px-6 pb-6 pt-20">
                  <p className="max-w-md text-lg font-semibold text-white">
                    {heroImages[heroIndex].caption}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {heroImages.map((item, index) => (
                  <button
                    key={item.image}
                    type="button"
                    aria-label={`Show ${item.label} lifestyle`}
                    onClick={() => setHeroIndex(index)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      index === heroIndex
                        ? "border-[#00a9a5] bg-[#00a9a5] text-white"
                        : "border-slate-300 bg-white text-slate-600 hover:border-[#00a9a5] hover:text-[#087f8c]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Assessment offer */}
            <div className="mt-16 overflow-hidden rounded-[2rem] border border-slate-200 bg-white px-6 py-10 text-center shadow-xl shadow-slate-200/70 sm:px-10 lg:px-16">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#087f8c]">
                Free driving lifestyle assessment
              </p>

              <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-bold tracking-tight text-black sm:text-4xl">
                Find the cars that fit your real life
              </h2>

              <p className="mx-auto mt-5 max-w-4xl text-xl font-medium leading-8 text-slate-800">
                We match your lifestyle, driving habits and real budget to three
                suitable vehicles—with one clearly recommended as your strongest
                overall match.
              </p>

              <p className="mx-auto mt-6 max-w-4xl text-lg leading-8 text-slate-1100">
                Take our quick seven-question assessment to unlock your personal
                vehicle-needs profile. No pushy salespeople—just clear,
                independent guidance.
              </p>

              <Link
                href="/quiz"
                className="mt-8 inline-flex min-h-14 items-center justify-center rounded-xl bg-[#00a9a5] px-8 py-4 text-base font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#008f91] focus:outline-none focus:ring-4 focus:ring-cyan-300/40"
              >
                Start My 60-Second Match
              </Link>

              <p className="mt-5 text-lg font-bold text-slate-800 sm:text-xl">
                No spam. No dealer calls. Just your personal top matches.
              </p>
            </div>
          </div>
        </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-center sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:text-left">
          <div>
            <p className="font-semibold text-[#071d3b]">
              RightCar4Me
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Independent car-buying advice for South African motorists.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-slate-600">
            <Link href="/quiz" className="hover:text-[#087f8c]">
              Free assessment
            </Link>

            <Link href="/services" className="hover:text-[#087f8c]">
              Our services
            </Link>

            <Link href="/contact" className="hover:text-[#087f8c]">
              Contact us
            </Link>

            <Link href="/terms" className="hover:text-[#087f8c]">
              Terms
            </Link>

            <Link href="/privacy" className="hover:text-[#087f8c]">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}