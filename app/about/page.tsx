import Image from "next/image";
import Link from "next/link";

function InfoHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link href="/" aria-label="RightCar4Me home">
          <Image
            src="/rightcar4me-logo.png"
            alt="RightCar4Me independent car-buying advisory"
            width={230}
            height={100}
            className="h-20 w-auto object-contain"
            priority
          />
        </Link>

        <Link
          href="/"
          className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-[#071d3b] transition hover:border-[#00a9a5] hover:text-[#087f8c]"
        >
          Back to RightCar4Me
        </Link>
      </div>
    </header>
  );
}

function InfoFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-sm text-slate-500 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
        <span>
          © 2026 RightCar4Me · Independent car-buying advice for South
          African motorists.
        </span>

        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/about" className="hover:text-[#087f8c]">
            About
          </Link>

          <Link href="/contact" className="hover:text-[#087f8c]">
            Contact
          </Link>

          <Link href="/disclaimer" className="hover:text-[#087f8c]">
            Disclaimer
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
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-slate-200 pt-7 first:border-0 first:pt-0">
      <h2 className="text-xl font-bold text-[#071d3b] sm:text-2xl">
        {title}
      </h2>

      <div className="mt-3 space-y-3 text-base leading-7 text-slate-700">
        {children}
      </div>
    </section>
  );
}

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <InfoHeader />

      {/* Page introduction */}
      <section className="border-b border-slate-200 bg-[linear-gradient(135deg,#ffffff,#eefafa)]">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-20">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#087f8c]">
            RightCar4Me
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#071d3b] sm:text-5xl">
            About RightCar4Me
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            RightCar4Me is an independent car-buying advisory service that
            helps South African motorists understand what they genuinely need
            from a vehicle before making one of life&apos;s biggest purchasing
            decisions.
          </p>
        </div>
      </section>

      {/* About content */}
      <section className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="space-y-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_55px_rgba(15,40,80,0.06)] sm:p-10">
          <Section title="Why RightCar4Me exists">
            <p>
              Buying a vehicle can be confusing. There are hundreds of models,
              conflicting opinions, complicated finance choices and strong
              sales pressure—often while a significant amount of money is at
              stake.
            </p>

            <p>
              RightCar4Me exists to simplify that decision. We help customers
              move beyond advertisements, assumptions and popular choices to
              understand which vehicles are genuinely suited to their
              lifestyle, priorities and budget.
            </p>
          </Section>

          <Section title="We start with you—not the car">
            <p>
              A conventional vehicle marketplace begins by asking what make,
              model or body type you want. RightCar4Me begins by asking how you
              live, where you drive, what you need to carry, what you value and
              what you can comfortably afford.
            </p>

            <p>
              Our Driving Lifestyle Assessment considers practical needs,
              financial priorities, driving habits, personal preferences and
              the emotional factors that influence a vehicle purchase.
            </p>
          </Section>

          <Section title="How RightCar4Me helps">
            <p>
              Your journey begins with a short assessment designed to create a
              clear Vehicle Needs Profile. This helps explain the type of
              vehicle that is likely to suit you and the factors that should
              guide your decision.
            </p>

            <p>
              Depending on the level of assistance you choose, RightCar4Me can
              then help with personalised vehicle matches, shortlisting,
              sourcing, validation and further support through the buying
              process.
            </p>
          </Section>

          <Section title="Independent guidance">
            <p>
              RightCar4Me is designed to place the customer&apos;s needs at the
              centre of the recommendation. Our role is to help you understand
              the trade-offs between your options and make a more informed,
              confident decision.
            </p>

            <p>
              We explain why a vehicle may suit you, where compromises may
              exist and why an expected or popular choice may not necessarily
              be your strongest match.
            </p>
          </Section>

          <Section title="What RightCar4Me does not do">
            <p>
              RightCar4Me does not guarantee the condition, availability,
              pricing or suitability of any specific vehicle. Our guidance
              does not replace an independent mechanical inspection, finance
              assessment, insurance advice or professional legal advice.
            </p>

            <p>
              Final purchasing decisions and agreements remain between the
              customer and the relevant seller, dealer, finance provider,
              insurer or other service provider.
            </p>
          </Section>

          <Section title="Built for South African motorists">
            <p>
              RightCar4Me is designed around South African driving conditions,
              vehicle choices, ownership considerations and customer needs.
              Whether you need practicality, family space, performance,
              efficiency, work capability or weekend adventure, our aim is to
              help you identify what you should actually be looking for.
            </p>

            <p>
              Our purpose is simple:{" "}
              <strong className="text-[#071d3b]">
                to help you buy the right car with greater clarity and
                confidence.
              </strong>
            </p>
          </Section>

          <Section title="Start your journey">
            <p>
              Begin with the free Driving Lifestyle Assessment and discover
              what matters most in finding the right vehicle for you.
            </p>

            <Link
              href="/quiz"
              className="mt-3 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#00a9a5] px-6 py-3 font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#008f91]"
            >
              Start My 60-Second Match
            </Link>
          </Section>
        </div>
      </section>

      <InfoFooter />
    </main>
  );
}