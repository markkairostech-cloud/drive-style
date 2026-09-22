import Link from "next/link";

export default function EngagementCancelPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 text-[#071d3b]">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg sm:p-10">
        <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-600">
          Payment Cancelled
        </div>

        <h1 className="mt-6 text-3xl font-bold">
          No payment was completed
        </h1>

        <p className="mt-4 leading-relaxed text-slate-600">
          No problem—your payment was cancelled and you have not been charged.
          You can return to your results whenever you are ready.
        </p>

        <Link
          href="/results"
          className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-[#08aaa9] px-6 py-4 font-bold text-white shadow-md transition hover:bg-[#087f8c]"
        >
          Return to My Results
        </Link>

        <Link
          href="/"
          className="mt-4 inline-block font-semibold text-[#087f8c] hover:underline"
        >
          Back to RightCar4Me
        </Link>
      </div>
    </main>
  );
}