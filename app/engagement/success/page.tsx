"use client";

import { useRouter } from "next/navigation";

export default function EngagementSuccessPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="max-w-2xl w-full rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">

        <div className="inline-flex px-3 py-1 rounded-full border border-teal-300/20 bg-teal-300/10 text-teal-200 text-xs uppercase tracking-[0.18em]">
          Drive Style Package Activated
        </div>

        <h1 className="mt-6 text-3xl sm:text-4xl font-semibold">
          Thank you for your purchase
        </h1>

        <p className="mt-6 text-white/70 leading-relaxed max-w-xl mx-auto">
          You will now be taken back to the Drive Style quiz.
        </p>

        <p className="mt-4 text-white/55 leading-relaxed max-w-xl mx-auto">
          Please complete the quiz carefully and answer every question where
          possible. Your personalised Drive Style recommendation and detailed
          report will be generated from these answers.
        </p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left">
          <div className="text-sm text-white/80 font-medium">
            What happens next
          </div>

          <ul className="mt-4 space-y-3 text-sm text-white/60">
            <li>1. Complete your questionnaire</li>
            <li>2. Review your personalised recommendations</li>
            <li>3. Click "Send me my Drive Style Recommendation"</li>
            <li>4. Receive your detailed report via email</li>
          </ul>
        </div>

        <button
          onClick={() => router.push("/quiz?paidJourney=true")}
          className="mt-8 cine-btn-primary w-full"
        >
          Continue to Quiz →
        </button>
      </div>
    </main>
  );
}