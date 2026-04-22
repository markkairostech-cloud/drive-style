"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { PropertyInput } from "@/lib/propertyEngine"

const initialForm: PropertyInput = {
  household: "",
  location: "",
  situation: "",
  priorities: [],
  commute: "",
  environment: "",
  securityPreference: "",
  loadShedding: "",
  budgetMindset: "",
  budget: "",
  deposit: "",
  timeHorizon: "",
  concern: "",
  additionalNotes: "",
}

const priorityOptions = [
  "Security",
  "Space",
  "Location",
  "Schools",
  "Lifestyle (restaurants, beach, etc.)",
  "Quiet / privacy",
]

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-2 block text-sm font-medium text-slate-200">{children}</label>
}

type SelectFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
}: SelectFieldProps) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-emerald-400"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}

type TextAreaFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: TextAreaFieldProps) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400"
      />
    </div>
  )
}

export default function PropertyPage() {
  const router = useRouter()
  const [form, setForm] = useState<PropertyInput>(initialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function updateField<K extends keyof PropertyInput>(key: K, value: PropertyInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function togglePriority(priority: string) {
    setForm((prev) => {
      const exists = prev.priorities.includes(priority)
      return {
        ...prev,
        priorities: exists
          ? prev.priorities.filter((item) => item !== priority)
          : [...prev.priorities, priority],
      }
    })
  }

  function validateForm() {
    if (!form.household) return "Please tell us who the property is for."
    if (!form.location) return "Please choose the area you are focusing on."
    if (!form.situation) return "Please select your current buying situation."
    if (form.priorities.length === 0) return "Please select at least one priority."
    if (!form.commute) return "Please select your commute pattern."
    if (!form.environment) return "Please select your preferred environment."
    if (!form.securityPreference) return "Please select your security preference."
    if (!form.loadShedding) return "Please select your backup power preference."
    if (!form.budgetMindset) return "Please select your budget mindset."
    if (!form.budget) return "Please select your budget range."
    if (!form.deposit) return "Please select your deposit position."
    if (!form.timeHorizon) return "Please select your expected time horizon."
    if (!form.concern) return "Please select your biggest concern."
    return ""
  }

  async function handleSubmit() {
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/property-advice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      })

      const payload = await response.json()

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Unable to generate property advice.")
      }

      localStorage.setItem(
        "propertyRecommendation",
        JSON.stringify({
          input: form,
          result: payload.result,
        })
      )

      router.push("/property/results")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="border-b border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <span className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                Drive Style Property • South Africa
              </span>

              <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Let’s find the right property for your life
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                Answer a few questions and get a recommendation shaped around your
                lifestyle, budget mindset, location priorities, and South African realities
                like security, commute, and backup power.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl">
              <h2 className="text-lg font-semibold text-white">What you’ll get</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li>• A clear property direction</li>
                <li>• A lifestyle and affordability view</li>
                <li>• Area and property-type guidance</li>
                <li>• Watchouts before you commit</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12 lg:px-8">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl sm:p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white">Property brief</h2>
            <p className="mt-2 text-sm text-slate-400">
              Keep it practical. We can refine detail later.
            </p>
          </div>

          <div className="space-y-10">
            <section>
              <SectionTitle
                title="Your situation"
                subtitle="Start with the basics of who this property is for and where you’re focused."
              />
              <div className="grid gap-6 md:grid-cols-2">
                <SelectField
                  label="Who is this property for?"
                  value={form.household}
                  onChange={(value) => updateField("household", value)}
                  options={["Just me", "Couple", "Family"]}
                />

                <SelectField
                  label="Where are you looking?"
                  value={form.location}
                  onChange={(value) => updateField("location", value)}
                  options={[
                    "Johannesburg",
                    "Cape Town",
                    "Durban",
                    "Pretoria",
                    "Garden Route",
                    "Other",
                  ]}
                />

                <div className="md:col-span-2">
                  <SelectField
                    label="What best describes your current situation?"
                    value={form.situation}
                    onChange={(value) => updateField("situation", value)}
                    options={[
                      "Renting",
                      "Living with family",
                      "Own and upgrading",
                      "Relocating",
                    ]}
                  />
                </div>
              </div>
            </section>

            <section>
              <SectionTitle
                title="Lifestyle and priorities"
                subtitle="Choose the things that really matter in your day-to-day life."
              />

              <div>
                <FieldLabel>What matters most?</FieldLabel>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {priorityOptions.map((priority) => {
                    const selected = form.priorities.includes(priority)
                    return (
                      <button
                        type="button"
                        key={priority}
                        onClick={() => togglePriority(priority)}
                        className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                          selected
                            ? "border-emerald-400 bg-emerald-500/10 text-emerald-200"
                            : "border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500"
                        }`}
                      >
                        {priority}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <SelectField
                  label="What does your commute look like?"
                  value={form.commute}
                  onChange={(value) => updateField("commute", value)}
                  options={[
                    "Remote",
                    "Hybrid",
                    "Daily (short)",
                    "Daily (long)",
                  ]}
                />

                <SelectField
                  label="What kind of environment do you prefer?"
                  value={form.environment}
                  onChange={(value) => updateField("environment", value)}
                  options={[
                    "Apartment / city living",
                    "Secure estate / complex",
                    "Freehold suburban home",
                    "Lifestyle / semi-rural",
                  ]}
                />
              </div>
            </section>

            <section>
              <SectionTitle
                title="Comfort and living style"
                subtitle="These are especially important for the South African market."
              />
              <div className="grid gap-6 md:grid-cols-2">
                <SelectField
                  label="Security preference"
                  value={form.securityPreference}
                  onChange={(value) => updateField("securityPreference", value)}
                  options={[
                    "Estate/complex only",
                    "Prefer secure",
                    "Flexible",
                  ]}
                />

                <SelectField
                  label="Load shedding / backup power"
                  value={form.loadShedding}
                  onChange={(value) => updateField("loadShedding", value)}
                  options={[
                    "Must have backup power",
                    "Nice to have",
                    "Not important",
                  ]}
                />
              </div>
            </section>

            <section>
              <SectionTitle
                title="Budget and financial comfort"
                subtitle="We’re not replacing a bond calculator. We’re framing decision comfort."
              />
              <div className="grid gap-6 md:grid-cols-2">
                <SelectField
                  label="Budget mindset"
                  value={form.budgetMindset}
                  onChange={(value) => updateField("budgetMindset", value)}
                  options={[
                    "Conservative",
                    "Balanced",
                    "Willing to stretch",
                  ]}
                />

                <SelectField
                  label="Budget range"
                  value={form.budget}
                  onChange={(value) => updateField("budget", value)}
                  options={[
                    "Under R1m",
                    "R1m – R1.5m",
                    "R1.5m – R2.5m",
                    "R2.5m – R4m",
                    "R4m+",
                  ]}
                />

                <div className="md:col-span-2">
                  <SelectField
                    label="Deposit position"
                    value={form.deposit}
                    onChange={(value) => updateField("deposit", value)}
                    options={[
                      "No deposit yet",
                      "Small deposit",
                      "Healthy deposit",
                      "Strong deposit position",
                    ]}
                  />
                </div>
              </div>
            </section>

            <section>
              <SectionTitle
                title="Time horizon and concerns"
                subtitle="This helps us judge fit, flexibility, and decision risk."
              />
              <div className="grid gap-6 md:grid-cols-2">
                <SelectField
                  label="How long do you expect to stay?"
                  value={form.timeHorizon}
                  onChange={(value) => updateField("timeHorizon", value)}
                  options={[
                    "<3 years",
                    "3–5 years",
                    "5–10 years",
                    "Long-term",
                  ]}
                />

                <SelectField
                  label="Biggest concern"
                  value={form.concern}
                  onChange={(value) => updateField("concern", value)}
                  options={[
                    "Overpaying",
                    "Wrong area",
                    "Monthly affordability",
                    "Future flexibility",
                  ]}
                />

                <div className="md:col-span-2">
                  <TextAreaField
                    label="Anything else we should know? (optional)"
                    value={form.additionalNotes || ""}
                    onChange={(value) => updateField("additionalNotes", value)}
                    placeholder="Family plans, school preferences, remote working needs, suburbs you’re considering..."
                  />
                </div>
              </div>
            </section>
          </div>

          {error ? (
            <div className="mt-8 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Generating recommendation..." : "Get my property recommendation →"}
            </button>

            <p className="text-sm text-slate-500">
              Separate from the car app. This only powers the property flow.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}