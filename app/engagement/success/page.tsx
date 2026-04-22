export default function EngagementSuccessPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="max-w-xl w-full rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
        <h1 className="text-3xl font-semibold">Payment received</h1>
        <p className="mt-4 text-white/70">
          Thank you — your payment was successful and we’ll follow up with you shortly.
        </p>
      </div>
    </main>
  );
}