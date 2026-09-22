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
            We&apos;re here to help
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#071d3b] sm:text-5xl">
            Contact RightCar4Me
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Contact RightCar4Me if you have questions about the Driving
            Lifestyle Assessment, your Vehicle Needs Profile, our service
            options or how we can help you through your vehicle-buying journey.
          </p>
        </div>
      </section>

      {/* Contact information */}
      <section className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="space-y-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_55px_rgba(15,40,80,0.06)] sm:p-10">
          <Section title="General enquiries and support">
            <p>
              Email:{" "}
              <a
                href="mailto:info@drive-style.co.za"
                className="font-semibold text-[#087f8c] hover:underline"
              >
                info@drive-style.co.za
              </a>
              <br />
              Support hours:{" "}
              <strong>09:00–17:00 South African Standard Time</strong>
            </p>

            <p>
              When contacting us about an existing assessment or service,
              please include your full name and the email address you used when
              completing the assessment. Please do not send identity documents,
              financial records or other sensitive information by ordinary
              email unless RightCar4Me has specifically instructed you to use
              an approved secure channel.
            </p>
          </Section>

          <Section title="Questions about your assessment">
            <p>
              If you have a question about your Driving Lifestyle Assessment,
              Vehicle Needs Profile or recommendation journey, please explain
              the issue clearly and include any relevant reference information.
            </p>

            <p>
              RightCar4Me will review the enquiry and respond during normal
              support hours. Please remember that vehicle availability,
              specifications and pricing can change over time.
            </p>
          </Section>

          <Section title="Privacy and personal information">
            <p>
              For questions or requests concerning your personal information,
              contact the RightCar4Me Information Officer using the email
              address below:
            </p>

            <p>
              Email:{" "}
              <a
                href="mailto:info@drive-style.co.za"
                className="font-semibold text-[#087f8c] hover:underline"
              >
                info@drive-style.co.za
              </a>
            </p>
          </Section>

          <Section title="Business details">
            <p>
              RightCar4Me is operated by <strong>[RightCar4Me]</strong>.
              <br />
              Registration number: <strong>[To be added]</strong>
              <br />
              Physical address:{" "}
              <strong>Plot 126, Zwavelpoort, Pretoria</strong>
              <br />
              Address for service of legal documents:{" "}
              <strong>Plot 126, Zwavelpoort, Pretoria</strong>
            </p>
          </Section>

          <Section title="Urgent vehicle matters">
            <p>
              <strong>
                RightCar4Me is not a roadside-assistance, emergency or accident
                response service.
              </strong>{" "}
              If you require urgent assistance relating to an accident,
              breakdown, theft or personal safety, contact the appropriate
              emergency service, insurer or roadside-assistance provider
              directly.
            </p>
          </Section>

          <Section title="Complaints">
            <p>
              If you are unhappy with a RightCar4Me service, please contact us
              first so that we can investigate and attempt to resolve the
              matter. Provide your name, contact details, a clear description
              of the issue and any relevant reference information.
            </p>

            <p>
              Privacy complaints may also be submitted to South Africa&apos;s
              Information Regulator where applicable.
            </p>
          </Section>
        </div>
      </section>

      <InfoFooter />
    </main>
  );
}