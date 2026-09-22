"use client";

import { useRouter } from "next/navigation";

export default function EngagementSuccessPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 text-[#071d3b]">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg sm:p-10">
        <div className="inline-flex rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#087f8c]">
          RightCar4Me Package Activated
        </div>

        <h1 className="mt-6 text-3xl font-bold sm:text-4xl">
          Thank you for your purchase
        </h1>

        <p className="mx-auto mt-6 max-w-xl leading-relaxed text-slate-600">
          You are ready to continue with your RightCar4Me assessment.
        </p>

        <p className="mx-auto mt-4 max-w-xl leading-relaxed text-slate-500">
          Please complete the assessment carefully and answer every question
          where possible. Your personalised vehicle recommendations and
          detailed report will be generated from your answers.
        </p>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left">
          <p className="text-sm font-semibold text-[#071d3b]">
            What happens next
          </p>

          <ol className="mt-4 space-y-3 text-sm text-slate-600">
            <li>1. Complete your vehicle-needs assessment</li>
            <li>2. Review your personalised recommendations</li>
            <li>3. Select “Send me my RightCar4Me recommendation”</li>
            <li>4. Receive your detailed report via email</li>
          </ol>
        </div>

        <button
          type="button"
          onClick={() => router.push("/quiz?paidJourney=true")}
          className="mt-8 w-full rounded-xl bg-[#08aaa9] px-6 py-4 font-bold text-white shadow-md transition hover:bg-[#087f8c]"
        >
          Continue to Assessment →
        </button>
      </div>
    </main>
  );
}