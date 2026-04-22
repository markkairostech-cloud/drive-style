"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type BuyerProfile = {
  title: string
  summary: string
  buyerType: string
  targetLocation: string
  indicativeBudget: string
  householdContext: string
  buyingPosition: string
  preferredEnvironment: string
  nonNegotiables: string[]
  strongPreferences: string[]
  cautionFlags: string[]
  estateAgentBrief: string
}

export default function BuyerProfilePage() {
  const router = useRouter()
  const [buyerProfile, setBuyerProfile] = useState<BuyerProfile | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("propertyBuyerProfile")

    if (!stored) {
      router.push("/property/results")
      return
    }

    try {
      const parsed = JSON.parse(stored) as BuyerProfile
      setBuyerProfile(parsed)
    } catch {
      router.push("/property/results")
    }
  }, [router])

  if (!buyerProfile) {
    return (
      <main className="min-h-screen bg-white text-slate-900">
        <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6">
          <p className="text-slate-500">Loading buyer profile...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-5xl px-6 py-10 print:px-0">
        <div className="mb-8 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between print:hidden">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Drive Style Property
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">
              Buyer Profile
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Print or save as PDF to share with an estate agent.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Print / Save as PDF
            </button>

            <button
              type="button"
              onClick={() => router.push("/property/results")}
              className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back to results
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
          <div className="border-b border-slate-200 pb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Drive Style Property
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-3xl font-semibold text-slate-950">
                  {buyerProfile.title}
                </h2>
                <p className="mt-2 text-base leading-7 text-slate-600">
                  {buyerProfile.summary}
                </p>
              </div>

              <span className="inline-flex w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                {buyerProfile.buyerType}
              </span>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Core brief
              </h3>
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <p><span className="font-medium text-slate-900">Location:</span> {buyerProfile.targetLocation}</p>
                <p><span className="font-medium text-slate-900">Budget:</span> {buyerProfile.indicativeBudget}</p>
                <p><span className="font-medium text-slate-900">Household:</span> {buyerProfile.householdContext}</p>
                <p><span className="font-medium text-slate-900">Situation:</span> {buyerProfile.buyingPosition}</p>
                <p><span className="font-medium text-slate-900">Preferred environment:</span> {buyerProfile.preferredEnvironment}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Agent summary
              </h3>
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700">
                {buyerProfile.estateAgentBrief}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Non-negotiables
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                {buyerProfile.nonNegotiables.length ? (
                  buyerProfile.nonNegotiables.map((item) => <li key={item}>• {item}</li>)
                ) : (
                  <li className="text-slate-500">No hard non-negotiables captured yet.</li>
                )}
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Strong preferences
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                {buyerProfile.strongPreferences.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Caution flags
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                {buyerProfile.cautionFlags.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-200 pt-6">
            <p className="text-xs leading-6 text-slate-500">
              This buyer profile is an advisory brief generated from the client’s answers and
              recommendation flow. It is intended to improve the relevance of initial
              property matches shown by an estate agent.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}