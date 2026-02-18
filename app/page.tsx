export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#020617] to-[#071133] text-white">
      <section className="max-w-5xl mx-auto px-6 py-24">
        <h1 className="text-5xl font-semibold tracking-tight mb-6">
          Drive Style
        </h1>

        <p className="text-blue-400 text-lg mb-2">
          Confidence in Every Car Choice
        </p>

        <p className="text-gray-300 max-w-2xl mb-10">
          A premium vehicle concierge advisory service helping you choose the right car for your lifestyle, budget and real-world South African driving needs.
        </p>

        <div className="flex gap-4">
          <a
            href="#"
            className="px-6 py-3 rounded-xl bg-indigo-300 text-black font-medium hover:bg-indigo-200 transition"
          >
            WhatsApp Advisor
          </a>

          <a
            href="#"
            className="px-6 py-3 rounded-xl border border-blue-300 text-white hover:bg-white/10 transition"
          >
            Book Consultation
          </a>
        </div>
      </section>
    </main>
  );
}
