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
            Important information
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#071d3b] sm:text-5xl">
            RightCar4Me Disclaimer
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            RightCar4Me provides independent vehicle-buying guidance. This page
            explains the scope and limitations of that guidance and the
            responsibilities that remain with the customer and relevant
            third-party providers.
          </p>
        </div>
      </section>

      {/* Disclaimer content */}
      <section className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="space-y-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_55px_rgba(15,40,80,0.06)] sm:p-10">
          <Section title="Independent vehicle-buying guidance">
            <p>
              RightCar4Me provides information, assessments and advisory
              guidance intended to help customers make more informed vehicle
              decisions. Our recommendations are based on the information
              available to us and the needs, preferences and financial
              parameters supplied by the customer.
            </p>

            <p>
              A recommendation represents our assessment of suitability at the
              time it is prepared. It is not a guarantee that a vehicle will
              meet every customer requirement or remain the best available
              option indefinitely.
            </p>
          </Section>

          <Section title="Accuracy of customer information">
            <p>
              The quality and relevance of a Vehicle Needs Profile,
              recommendation or shortlist depend on the accuracy and
              completeness of the information supplied by the customer.
            </p>

            <p>
              Customers should provide honest, current and complete information
              about their budget, intended use, driving conditions, passenger
              requirements, preferences and other relevant circumstances.
            </p>
          </Section>

          <Section title="Vehicle information may change">
            <p>
              Vehicle prices, specifications, model ranges, availability,
              warranties, service plans, finance offers and promotional terms
              may change without notice. Information from manufacturers,
              dealers, marketplaces and other third parties may also contain
              errors, omissions or delays.
            </p>

            <p>
              Customers should confirm all important information directly with
              the relevant seller or service provider before signing an
              agreement or making payment.
            </p>
          </Section>

          <Section title="Vehicle condition and inspection">
            <p>
              A general vehicle recommendation does not confirm the mechanical,
              structural, electrical or cosmetic condition of a particular
              vehicle. This is especially important when considering a
              previously owned, demonstration or privately sold vehicle.
            </p>

            <p>
              Unless a specific validation or inspection service has been
              expressly included in the service purchased, customers should
              arrange an appropriate independent inspection before completing a
              transaction.
            </p>

            <p>
              Even where inspection or validation support is provided, hidden
              faults or incomplete vehicle histories may not always be
              detectable.
            </p>
          </Section>

          <Section title="No financial, insurance or legal advice">
            <p>
              RightCar4Me does not provide regulated financial, credit,
              insurance, tax or legal advice unless this is expressly stated
              and delivered by an appropriately authorised provider.
            </p>

            <p>
              Any affordability examples, repayment estimates or ownership-cost
              comparisons are illustrative only. Finance approval, interest
              rates, insurance cover and contractual terms are determined by
              the relevant authorised provider after its own assessment.
            </p>
          </Section>

          <Section title="Third-party sellers and service providers">
            <p>
              RightCar4Me may refer customers to dealers, private sellers,
              inspection services, finance providers, insurers, vehicle
              marketplaces or other third parties. These parties remain
              responsible for their own information, conduct, products,
              services and contractual obligations.
            </p>

            <p>
              A referral, listing or inclusion in a shortlist does not
              automatically constitute an endorsement or guarantee of that
              third party.
            </p>
          </Section>

          <Section title="Images, names and trademarks">
            <p>
              Vehicle images may be illustrative and may show specifications,
              colours, accessories or model variants that differ from vehicles
              available in South Africa.
            </p>

            <p>
              Manufacturer names, vehicle names, logos and trademarks belong to
              their respective owners. Their use for identification or
              comparison does not imply sponsorship, partnership or endorsement
              unless expressly stated.
            </p>
          </Section>

          <Section title="The final decision remains yours">
            <p>
              RightCar4Me aims to reduce uncertainty and help customers compare
              their options clearly. The final decision to inspect, finance,
              insure, purchase or enter into an agreement concerning a vehicle
              remains with the customer.
            </p>

            <p>
              Customers should read all contractual documents carefully and
              ask the relevant provider to explain any term they do not
              understand before accepting it.
            </p>
          </Section>

          <Section title="Consumer rights">
            <p>
              Nothing in this disclaimer is intended to exclude, restrict or
              replace any right or remedy that cannot lawfully be excluded
              under applicable South African law, including applicable consumer
              protection legislation.
            </p>
          </Section>

          <Section title="Questions">
            <p>
              Questions about the scope of a RightCar4Me service can be sent
              through our{" "}
              <Link
                href="/contact"
                className="font-semibold text-[#087f8c] hover:underline"
              >
                Contact page
              </Link>
              .
            </p>
          </Section>
        </div>
      </section>

      <InfoFooter />
    </main>
  );
}