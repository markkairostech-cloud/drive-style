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
            Using RightCar4Me
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#071d3b] sm:text-5xl">
            Terms and Conditions
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            These terms explain the basis on which RightCar4Me provides its
            Driving Lifestyle Assessment, Vehicle Needs Profiles, vehicle
            recommendations and related car-buying advisory services.
          </p>
        </div>
      </section>

      {/* Terms content */}
      <section className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="space-y-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_55px_rgba(15,40,80,0.06)] sm:p-10">
          <Section title="Acceptance of these terms">
            <p>
              By accessing the RightCar4Me web app, completing an assessment or
              requesting a service, you agree to these Terms and Conditions,
              our{" "}
              <Link
                href="/privacy"
                className="font-semibold text-[#087f8c] hover:underline"
              >
                Privacy Notice
              </Link>{" "}
              and the applicable service information presented to you.
            </p>

            <p>
              If you do not agree with these terms, you should not use the
              website or request a RightCar4Me service.
            </p>
          </Section>

          <Section title="About the service">
            <p>
              RightCar4Me provides independent vehicle-buying guidance intended
              to help South African motorists understand their requirements,
              compare suitable vehicles and make more informed purchasing
              decisions.
            </p>

            <p>
              Services may include a Driving Lifestyle Assessment, Vehicle
              Needs Profile, personalised vehicle recommendations, shortlisting,
              sourcing assistance, vehicle validation and additional
              car-buying support.
            </p>

            <p>
              The precise scope of a paid service will be described before the
              customer confirms and pays for that service.
            </p>
          </Section>

          <Section title="Who operates RightCar4Me">
            <p>
              RightCar4Me is operated by <strong>[Drive-Style.co.za]</strong>,
              registered in <strong>South Africa</strong>.
            </p>

            <p>
              Physical and legal-service address:{" "}
              <strong>Plot 126, Zwavelpoort, Pretoria, South Africa</strong>
              <br />
              Email:{" "}
              <a
                href="mailto:info@drive-style.co.za"
                className="font-semibold text-[#087f8c] hover:underline"
              >
                info@drive-style.co.za
              </a>
            </p>
          </Section>

          <Section title="Using RightCar4Me">
            <p>
              You must provide information that is accurate, current and
              complete to the best of your knowledge. You may not use
              RightCar4Me to impersonate another person, submit false or
              misleading information, interfere with the service or use
              information obtained through the service unlawfully.
            </p>

            <p>
              You must be at least 18 years old and legally capable of entering
              into the relevant agreements if you request a paid service or
              proceed with a vehicle transaction.
            </p>
          </Section>

          <Section title="Assessments, profiles and recommendations">
            <p>
              RightCar4Me uses the information supplied by the customer to
              develop a Vehicle Needs Profile and, where applicable, identify
              or compare vehicles that may suit those requirements.
            </p>

            <p>
              Results and recommendations are advisory in nature and depend on
              the accuracy of the information supplied, the information
              available to RightCar4Me and market conditions at the time.
            </p>

            <p>
              A recommendation does not guarantee that a vehicle will satisfy
              every customer requirement or remain available at a particular
              price.
            </p>
          </Section>

          <Section title="Paid services">
            <p>
              Before purchasing a paid service, the customer will be shown the
              applicable service description, price and any material
              limitations. The customer should review this information
              carefully before making payment.
            </p>

            <p>
              Work will be performed according to the scope of the selected
              service. Any assistance outside that scope may require a separate
              agreement or additional fee.
            </p>

            <p>
              Estimated completion or response times are not guaranteed where
              delays result from incomplete customer information, third-party
              availability, market conditions or circumstances outside
              RightCar4Me&apos;s reasonable control.
            </p>
          </Section>

          <Section title="Fees and payment">
            <p>
              Current fees will be displayed before a paid service is
              confirmed. Payments are processed using the payment options
              presented during the transaction.
            </p>

            <p>
              RightCar4Me does not intend to store full payment-card details.
              Card and payment information may be processed by the appointed
              payment provider under that provider&apos;s own security and
              privacy terms.
            </p>

            <p>
              The customer is responsible for ensuring that payment and contact
              details supplied during the transaction are correct.
            </p>
          </Section>

          <Section title="Cancellations and refunds">
            <p>
              Cancellation and refund eligibility may depend on the type of
              service purchased, whether work has commenced and the extent to
              which the service has already been delivered.
            </p>

            <p>
              Any service-specific cancellation or refund conditions will be
              presented before purchase or included in the applicable service
              confirmation. Nothing in these terms limits a customer&apos;s
              rights where a refund or other remedy is required by applicable
              law.
            </p>

            <p>
              To request a cancellation or refund, contact RightCar4Me promptly
              through the{" "}
              <Link
                href="/contact"
                className="font-semibold text-[#087f8c] hover:underline"
              >
                Contact page
              </Link>
              .
            </p>
          </Section>

          <Section title="Vehicle sourcing and validation">
            <p>
              Vehicle availability, prices, specifications and seller
              information may change without notice. RightCar4Me may recommend
              that a customer obtain an independent mechanical or technical
              inspection before purchasing a particular vehicle.
            </p>

            <p>
              Unless expressly included in the selected service, a vehicle
              recommendation does not include a physical inspection or
              confirmation of the vehicle&apos;s mechanical condition,
              accident history, ownership history or legal status.
            </p>

            <p>
              Additional limitations are explained in our{" "}
              <Link
                href="/disclaimer"
                className="font-semibold text-[#087f8c] hover:underline"
              >
                Disclaimer
              </Link>
              .
            </p>
          </Section>

          <Section title="Third-party services">
            <p>
              RightCar4Me may provide information about or facilitate contact
              with vehicle sellers, dealers, inspection providers, finance
              providers, insurers and other third parties.
            </p>

            <p>
              Unless expressly stated otherwise, those third parties operate
              independently and remain responsible for their own products,
              information, services, conduct and contractual obligations.
            </p>

            <p>
              Any agreement for the purchase, finance, insurance, inspection,
              repair or supply of a vehicle is subject to the terms agreed
              between the customer and the relevant third party.
            </p>
          </Section>

          <Section title="Electronic records and communications">
            <p>
              You agree that assessments, confirmations, notices, service
              information and transaction records may be created and
              communicated electronically.
            </p>

            <p>
              You are responsible for providing a working email address and
              retaining copies of information and documents that are important
              to you.
            </p>
          </Section>

          <Section title="Service availability and security">
            <p>
              We aim to keep RightCar4Me available and secure, but online
              services may experience maintenance, interruptions, third-party
              failures or events outside our reasonable control.
            </p>

            <p>
              We may suspend or restrict access where reasonably necessary to
              protect users, information, the website or the integrity of the
              service.
            </p>
          </Section>

          <Section title="Intellectual property">
            <p>
              The RightCar4Me name, branding, website design, software,
              assessment structure and original content are owned by or
              licensed to the operator of RightCar4Me unless stated otherwise.
            </p>

            <p>
              You may use your personal assessment results and documents
              supplied to you for their intended lawful purpose. You may not
              copy, reproduce, resell or commercially exploit the website,
              assessment, software or original content without prior written
              permission.
            </p>
          </Section>

          <Section title="Liability and consumer rights">
            <p>
              RightCar4Me will provide its services with reasonable care and
              skill. However, recommendations and market information are
              advisory and may be affected by changing prices, availability,
              incomplete information and third-party conduct.
            </p>

            <p>
              Nothing in these terms is intended to exclude, restrict or
              replace any right or remedy that cannot lawfully be excluded
              under applicable South African law.
            </p>

            <p>
              These terms must be read together with the RightCar4Me{" "}
              <Link
                href="/disclaimer"
                className="font-semibold text-[#087f8c] hover:underline"
              >
                Disclaimer
              </Link>
              .
            </p>
          </Section>

          <Section title="Suspension or termination">
            <p>
              RightCar4Me may suspend or terminate access to the service where
              a user acts unlawfully, provides fraudulent information, abuses
              the service, interferes with its operation or materially breaches
              these terms.
            </p>

            <p>
              Suspension or termination does not remove rights or obligations
              that arose before the suspension or termination.
            </p>
          </Section>

          <Section title="Changes to these terms">
            <p>
              We may update these terms as the service develops. The updated
              version will be published on this page with a revised effective
              date.
            </p>

            <p>
              Where required, the version in force when a transaction is
              concluded will continue to apply to that transaction.
            </p>
          </Section>

          <Section title="Governing law">
            <p>
              These terms are governed by the laws of the Republic of South
              Africa. Any dispute will be handled subject to applicable South
              African law and the rights available to consumers.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Questions about these terms or a RightCar4Me service can be sent
              through our{" "}
              <Link
                href="/contact"
                className="font-semibold text-[#087f8c] hover:underline"
              >
                Contact page
              </Link>
              .
            </p>

            <p>
              <strong>Effective date:</strong> 1 October 2026
            </p>
          </Section>
        </div>
      </section>

      <InfoFooter />
    </main>
  );
}