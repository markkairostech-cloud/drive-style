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
            Your information matters
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#071d3b] sm:text-5xl">
            Privacy Notice
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            This notice explains how RightCar4Me collects, uses, stores and
            shares personal information when you use our assessment,
            recommendation and car-buying advisory services.
          </p>
        </div>
      </section>

      {/* Privacy content */}
      <section className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="space-y-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_55px_rgba(15,40,80,0.06)] sm:p-10">
          <Section title="Who is responsible for your information">
            <p>
              RightCar4Me is operated by <strong>[RightCar4Me]</strong>, which
              acts as the responsible party for personal information processed
              through the service.
            </p>

            <p>
              Email:{" "}
              <a
                href="mailto:info@rightcar4me.co.za"
                className="font-semibold text-[#087f8c] hover:underline"
              >
                info@rightcar4me.co.za
              </a>
              <br />
              Physical address:{" "}
              <strong>Plot 126, Zwavelpoort, Pretoria, South Africa</strong>
            </p>
          </Section>

          <Section title="Information we may collect">
            <p>
              Depending on how you use RightCar4Me, we may collect:
            </p>

            <ul className="list-disc space-y-2 pl-6">
              <li>Your name, email address and mobile number.</li>
              <li>
                Information about your lifestyle, household, passengers,
                occupation and intended vehicle use.
              </li>
              <li>
                Information about your driving habits, travel patterns,
                location type and expected annual usage.
              </li>
              <li>
                Your vehicle preferences, priorities, preferred features and
                brand attitudes.
              </li>
              <li>
                Budget ranges, affordability preferences, deposit information
                and sensitivity to running costs.
              </li>
              <li>
                Existing vehicle information, trade-in details or details of a
                vehicle you are considering.
              </li>
              <li>
                Assessment answers, Vehicle Needs Profiles, recommendations,
                shortlists and related advisory records.
              </li>
              <li>
                Enquiries, communications, service instructions and customer
                support records.
              </li>
              <li>
                Payment status, transaction references and service-purchase
                information.
              </li>
              <li>
                Technical information such as IP address, browser type, device
                information, timestamps, security logs and website activity.
              </li>
            </ul>

            <p>
              We do not intend to collect full payment-card details. Those
              details are processed by the payment provider used during the
              transaction.
            </p>
          </Section>

          <Section title="Why we process your information">
            <p>We may process personal information to:</p>

            <ul className="list-disc space-y-2 pl-6">
              <li>Provide and operate the RightCar4Me website.</li>
              <li>Administer the Driving Lifestyle Assessment.</li>
              <li>Create your Vehicle Needs Profile.</li>
              <li>
                Identify, score, compare and explain potentially suitable
                vehicles.
              </li>
              <li>
                Provide purchased advisory, sourcing, validation or concierge
                services.
              </li>
              <li>Respond to questions and provide customer support.</li>
              <li>Process and reconcile payments.</li>
              <li>
                Maintain transaction, service, security and audit records.
              </li>
              <li>Detect, investigate and prevent misuse or fraud.</li>
              <li>
                Improve the accuracy, usefulness and performance of our
                services.
              </li>
              <li>
                Meet applicable legal, regulatory and record-keeping
                obligations.
              </li>
            </ul>

            <p>
              Where information is necessary to provide a requested service,
              not supplying it may mean that RightCar4Me cannot complete the
              assessment, recommendation or service.
            </p>
          </Section>

          <Section title="Assessment and automated processing">
            <p>
              RightCar4Me may use rules, scoring and automated processing to
              analyse assessment answers, identify customer priorities, create
              a Vehicle Needs Profile and rank potentially suitable vehicles.
            </p>

            <p>
              Automated results are intended to support informed vehicle
              decisions. They do not complete a vehicle purchase, finance
              application or insurance agreement on your behalf.
            </p>

            <p>
              You may contact us if you would like an explanation of your
              assessment result or believe that relevant information was
              interpreted incorrectly.
            </p>
          </Section>

          <Section title="How we obtain information">
            <p>
              Most personal information is provided directly by you when you
              complete an assessment, contact us, purchase a service or
              communicate with an adviser.
            </p>

            <p>
              We may also obtain vehicle, market, pricing and listing
              information from manufacturers, dealers, marketplaces and other
              industry sources. Where a service involves a third party, we may
              receive information from that party concerning the progress or
              outcome of the service.
            </p>
          </Section>

          <Section title="When we may share information">
            <p>
              We may use carefully selected service providers to support
              hosting, data storage, security, communications, analytics,
              payment processing and the operation of the website.
            </p>

            <p>
              Where required to provide a service you have requested, we may
              also share relevant information with an adviser, vehicle seller,
              dealer, inspection provider, finance provider, insurer or other
              service provider.
            </p>

            <p>
              These parties should receive only the information reasonably
              required for their role. They may also process information under
              their own privacy notices where they act independently.
            </p>

            <p>
              We may disclose information where required by law, necessary to
              protect legitimate rights or required to investigate suspected
              fraud or unlawful activity.
            </p>

            <p>
              <strong>RightCar4Me does not sell personal information.</strong>
            </p>
          </Section>

          <Section title="Direct marketing">
            <p>
              RightCar4Me will only send direct electronic marketing where
              permitted by applicable law. Where consent is required, you will
              be given a choice before marketing communications are sent.
            </p>

            <p>
              You may unsubscribe from marketing communications at any time
              using the unsubscribe option provided or by contacting us.
              Service-related messages concerning an assessment, purchase or
              active request may still be sent where necessary.
            </p>
          </Section>

          <Section title="Payments">
            <p>
              Payments may be processed by an external payment provider.
              RightCar4Me may receive transaction references, payment status,
              amounts and related reconciliation information, but does not
              intend to receive or store full payment-card details.
            </p>

            <p>
              The payment provider processes payment information under its own
              terms and privacy notice.
            </p>
          </Section>

          <Section title="Storage, security and cross-border processing">
            <p>
              RightCar4Me uses reasonable technical and organisational
              safeguards designed to protect personal information against loss,
              unauthorised access, alteration, misuse or disclosure.
            </p>

            <p>
              Access should be limited to authorised people and service
              providers who require the information for legitimate operational
              purposes.
            </p>

            <p>
              Some technology or service providers may store or process
              information outside South Africa. Where cross-border processing
              occurs, RightCar4Me will take reasonable steps to ensure that the
              information is handled in accordance with applicable legal
              requirements and appropriate safeguards.
            </p>

            <p>
              No online service can guarantee absolute security. If we become
              aware of a qualifying security compromise, we will take
              appropriate steps in accordance with applicable law.
            </p>
          </Section>

          <Section title="Retention">
            <p>
              We retain personal information only for as long as reasonably
              necessary to provide the requested service, maintain appropriate
              business and audit records, resolve disputes and meet applicable
              legal, regulatory and contractual obligations.
            </p>

            <p>
              Different information may be retained for different periods.
              When information is no longer reasonably required, it may be
              securely deleted, destroyed or de-identified, subject to lawful
              retention requirements.
            </p>
          </Section>

          <Section title="Your rights">
            <p>
              Subject to applicable law, you may ask whether RightCar4Me holds
              personal information about you and request access to that
              information.
            </p>

            <p>You may also request, where applicable:</p>

            <ul className="list-disc space-y-2 pl-6">
              <li>Correction of inaccurate or incomplete information.</li>
              <li>
                Deletion or destruction of information that may no longer
                lawfully be retained.
              </li>
              <li>Restriction of certain processing.</li>
              <li>Objection to processing in appropriate circumstances.</li>
              <li>Withdrawal of consent where processing relies on consent.</li>
              <li>
                An explanation or review of relevant automated assessment
                results.
              </li>
            </ul>

            <p>
              Requests should be sent to{" "}
              <a
                href="mailto:info@rightcar4me.co.za"
                className="font-semibold text-[#087f8c] hover:underline"
              >
                info@rightcar4me.co.za
              </a>
              . We may need to verify your identity before acting on a request.
            </p>
          </Section>

          <Section title="Complaints">
            <p>
              If you have a privacy concern, or complaint of any other nature, please contact RightCar4Me first
              so that we can investigate and attempt to resolve it.
            </p>

            <p>
              You may also lodge a complaint with South Africa&apos;s
              Information Regulator where applicable.
            </p>
          </Section>

          <Section title="Cookies and technical information">
            <p>
              RightCar4Me may use essential cookies, browser storage, logs or
              similar technologies required for security, session management,
              assessment continuity and operation of the service.
            </p>

            <p>
              If non-essential analytics, advertising or tracking technologies
              are introduced, the website&apos;s notices and consent controls
              should be updated before those technologies are enabled.
            </p>
          </Section>

          <Section title="Third-party websites">
            <p>
              The RightCar4Me website may contain links to vehicle
              manufacturers, dealers, marketplaces, news publications and
              other third-party websites.
            </p>

            <p>
              RightCar4Me is not responsible for the privacy practices of those
              websites. You should review the privacy notice of any third-party
              service before submitting personal information.
            </p>
          </Section>

          <Section title="Updates to this notice">
            <p>
              We may update this notice when the service, our providers or
              applicable requirements change. The current version will be
              published on this page.
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