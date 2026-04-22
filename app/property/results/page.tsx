"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import type { PropertyInput, PropertyResult } from "@/lib/propertyEngine"
import { propertyPackages, type PropertyPackageKey } from "@/lib/propertyPackages"

type StoredPropertyRecommendation = {
  input: PropertyInput
  result: PropertyResult
}

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

function ResultCard({
  title,
  content,
}: {
  title: string
  content: string
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-7 text-slate-300">{content}</p>
    </div>
  )
}

function PackageCard({
  title,
  subtitle,
  priceLabel,
  buttonText,
  featured,
  loading,
  onClick,
}: {
  title: string
  subtitle: string
  priceLabel: string
  buttonText: string
  featured?: boolean
  loading?: boolean
  onClick: () => void
}) {
  return (
    <div
      className={`rounded-3xl border p-6 shadow-xl transition ${
        featured
          ? "border-emerald-400/40 bg-emerald-500/10"
          : "border-slate-800 bg-slate-900/70"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">{subtitle}</p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            featured
              ? "bg-emerald-400/10 text-emerald-300"
              : "bg-slate-800 text-slate-300"
          }`}
        >
          {priceLabel}
        </span>
      </div>

      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className={`mt-6 inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition ${
          featured
            ? "bg-emerald-400 text-slate-950 hover:bg-emerald-300"
            : "bg-white text-slate-950 hover:bg-slate-200"
        } disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {loading ? "Working..." : buttonText}
      </button>
    </div>
  )
}

export default function PropertyResultsPage() {
  const router = useRouter()
  const [data, setData] = useState<StoredPropertyRecommendation | null>(null)
  const [buyerProfile, setBuyerProfile] = useState<BuyerProfile | null>(null)
  const [busyPackage, setBusyPackage] = useState<PropertyPackageKey | null>(null)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const stored = localStorage.getItem("propertyRecommendation")

    if (!stored) {
      router.push("/property")
      return
    }

    try {
      const parsed = JSON.parse(stored) as StoredPropertyRecommendation
      setData(parsed)
    } catch {
      router.push("/property")
    }
  }, [router])

  const rightPanelText = useMemo(() => {
    if (!data) return null

    return {
      buyerType: data.result.buyerType,
      confidence: data.result.confidence,
    }
  }, [data])

  async function trackPackageSelection(packageKey: PropertyPackageKey) {
    if (!data) return

    await fetch("/api/property-engagement", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        packageKey,
        source: "property-results",
        buyerType: data.result.buyerType,
        location: data.input.location,
        budget: data.input.budget,
      }),
    })
  }

  async function handlePackageClick(packageKey: PropertyPackageKey) {
    if (!data) return

    setBusyPackage(packageKey)
    setError("")
    setMessage("")

    try {
      await trackPackageSelection(packageKey)

      if (packageKey === "buyer-profile") {
        const response = await fetch("/api/buyer-profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data.input),
        })

        const payload = await response.json()

        if (!response.ok || !payload.success) {
          throw new Error(payload.message || "Unable to generate buyer profile.")
        }

        setBuyerProfile(payload.buyerProfile)
        localStorage.setItem(
          "propertyBuyerProfile",
          JSON.stringify(payload.buyerProfile)
        )

        setMessage("Buyer Profile generated. You can now open the print-friendly version.")
        return
      }

      setMessage(
        `${packageKey.charAt(0).toUpperCase() + packageKey.slice(1)} selected. Payment wiring can be added next.`
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setBusyPackage(null)
    }
  }

  function openBuyerProfilePage() {
    router.push("/property/buyer-profile")
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6">
          <p className="text-slate-400">Loading your property recommendation...</p>
        </div>
      </main>
    )
  }

  const { input, result } = data

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="border-b border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <span className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                Your property recommendation
              </span>

              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Here’s what I’d recommend
              </h1>

              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
                Based on your answers, this is the strongest direction for your lifestyle,
                financial comfort, and day-to-day reality.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl">
              <h2 className="text-lg font-semibold text-white">Based on your answers</h2>
              <div className="mt-4 space-y-4 text-sm text-slate-300">
                <div>
                  <p className="text-slate-500">Buyer type</p>
                  <p className="mt-1 font-medium text-white">{rightPanelText?.buyerType}</p>
                </div>

                <div>
                  <p className="text-slate-500">Location focus</p>
                  <p className="mt-1 font-medium text-white">{input.location}</p>
                </div>

                <div>
                  <p className="text-slate-500">Budget range</p>
                  <p className="mt-1 font-medium text-white">{input.budget}</p>
                </div>

                <div>
                  <p className="text-slate-500">Confidence</p>
                  <p className="mt-1 font-medium capitalize text-white">
                    {rightPanelText?.confidence}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <ResultCard title="Fit" content={result.fit} />
          <ResultCard title="Cost" content={result.cost} />
          <ResultCard title="Lifestyle" content={result.lifestyle} />
        </div>

        <div className="mt-8 rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-8 shadow-xl">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
            Drive Style verdict
          </h2>
          <p className="mt-4 max-w-4xl text-xl leading-8 text-white">
            {result.verdict}
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white">Recommended direction</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              {result.direction.map((item) => (
                <li key={item} className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white">Watchouts</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              {result.watchouts.map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Next step options</h2>
              <p className="mt-2 text-sm text-slate-400">
                Property-only flow. No changes to the car app.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {propertyPackages.map((pkg) => (
              <PackageCard
                key={pkg.key}
                title={pkg.title}
                subtitle={pkg.subtitle}
                priceLabel={pkg.priceLabel}
                buttonText={pkg.cta}
                featured={pkg.featured}
                loading={busyPackage === pkg.key}
                onClick={() => handlePackageClick(pkg.key)}
              />
            ))}
          </div>
        </div>

        {message ? (
          <div className="mt-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="mt-8 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        {buyerProfile ? (
          <div className="mt-10 rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">{buyerProfile.title}</h2>
                <p className="mt-2 text-sm text-slate-400">
                  A structured brief for an estate agent based on this recommendation.
                </p>
              </div>

              <div className="flex gap-3">
                <span className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                  {buyerProfile.buyerType}
                </span>

                <button
                  type="button"
                  onClick={openBuyerProfilePage}
                  className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
                >
                  Open print view
                </button>
              </div>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                <p className="text-xs uppercase tracking-wide text-slate-500">Summary</p>
                <p className="mt-3 text-sm leading-7 text-slate-300">{buyerProfile.summary}</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                <p className="text-xs uppercase tracking-wide text-slate-500">Core brief</p>
                <div className="mt-3 space-y-2 text-sm text-slate-300">
                  <p><span className="text-slate-500">Location:</span> {buyerProfile.targetLocation}</p>
                  <p><span className="text-slate-500">Budget:</span> {buyerProfile.indicativeBudget}</p>
                  <p><span className="text-slate-500">Household:</span> {buyerProfile.householdContext}</p>
                  <p><span className="text-slate-500">Situation:</span> {buyerProfile.buyingPosition}</p>
                  <p><span className="text-slate-500">Environment:</span> {buyerProfile.preferredEnvironment}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                <h3 className="text-sm font-semibold text-white">Non-negotiables</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-300">
                  {buyerProfile.nonNegotiables.length ? (
                    buyerProfile.nonNegotiables.map((item) => <li key={item}>• {item}</li>)
                  ) : (
                    <li className="text-slate-500">No hard non-negotiables captured yet.</li>
                  )}
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                <h3 className="text-sm font-semibold text-white">Strong preferences</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-300">
                  {buyerProfile.strongPreferences.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                <h3 className="text-sm font-semibold text-white">Caution flags</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-300">
                  {buyerProfile.cautionFlags.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
              <h3 className="text-sm font-semibold text-white">Estate agent brief</h3>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-300">
                {buyerProfile.estateAgentBrief}
              </p>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  )
}