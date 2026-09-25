"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

type Status = "idle" | "sending" | "error";
type CategoryId =
  | "family"
  | "adventure"
  | "city"
  | "performance"
  | "efficiency"
  | "comfort";

type Answers = {
  passengers: string;
  seatingRequirement: string;
  cargoNeed: string;
  rearSpace: string;
  environment: string;
  towingNeed: string;
  preference: string;
  distance: string;
  parkingPriority: string;
  drivingStyle: string;
  ownership: string;
  performanceImportance: string;
  fuelPreference: string;
  budgetAttitude: string;
  budgetType: string;
  budget: string;
  resaleImportant: string;
  comfortSpace: string;
  comfortNeeds: string[];
  manufacturerCommitted: string;
  preferredManufacturers: string[];
};

const initialAnswers: Answers = {
  passengers: "",
  seatingRequirement: "",
  cargoNeed: "",
  rearSpace: "",
  environment: "",
  towingNeed: "",
  preference: "",
  distance: "",
  parkingPriority: "",
  drivingStyle: "",
  ownership: "",
  performanceImportance: "",
  fuelPreference: "",
  budgetAttitude: "",
  budgetType: "",
  budget: "",
  resaleImportant: "",
  comfortSpace: "",
  comfortNeeds: [],
  manufacturerCommitted: "",
  preferredManufacturers: [],
};

const categories: Array<{
  id: CategoryId;
  title: string;
  description: string;
  image: string;
}> = [
  {
    id: "family",
    title: "Family & passengers",
    description: "Space and practicality for the people who travel with you.",
    image: "/images/quiz/quiz-family-passengers.png",
  },
  {
    id: "adventure",
    title: "Adventure & outdoors",
    description: "Roads, weekends away, towing and body-style needs.",
    image: "/images/quiz/quiz-adventure-outdoors.png",
  },
  {
    id: "city",
    title: "City & daily driving",
    description: "Your everyday routes, traffic and parking priorities.",
    image: "/images/quiz/quiz-city-daily.png",
  },
  {
    id: "performance",
    title: "Performance & driving",
    description: "How you like a car to feel when you are behind the wheel.",
    image: "/images/quiz/quiz-performance-driving.png",
  },
  {
    id: "efficiency",
    title: "Efficiency & running costs",
    description: "Fuel, budget, ownership costs and resale priorities.",
    image: "/images/quiz/quiz-efficiency-costs.png",
  },
  {
    id: "comfort",
    title: "Comfort & preferences",
    description: "Cabin comfort, must-have features and brand preferences.",
    image: "/images/quiz/quiz-comfort-preferences.png",
  },
];

const manufacturers = [
  "Audi",
  "BMW",
  "Chery",
  "Ford",
  "GWM",
  "Haval",
  "Honda",
  "Hyundai",
  "Isuzu",
  "Kia",
  "Lexus",
  "Mahindra",
  "Mazda",
  "Mercedes-Benz",
  "Mitsubishi",
  "Nissan",
  "Omoda",
  "Opel",
  "Renault",
  "Subaru",
  "Suzuki",
  "Toyota",
  "Volkswagen",
  "Volvo",
];

export default function QuizPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [activeCategory, setActiveCategory] = useState<CategoryId | null>(null);
  const [completed, setCompleted] = useState<CategoryId[]>([]);
  const [categoryError, setCategoryError] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const completedCount = completed.length;
  const allComplete = completedCount === categories.length;
  const disable = status === "sending";
  const activeDefinition = categories.find(
    (category) => category.id === activeCategory,
  );

  const progressLabel = useMemo(
    () => `${completedCount} of ${categories.length} completed`,
    [completedCount],
  );

  function updateAnswer<K extends keyof Answers>(key: K, value: Answers[K]) {
    setAnswers((current) => ({ ...current, [key]: value }));
    setCategoryError("");
  }

  function openCategory(id: CategoryId) {
    setActiveCategory(id);
    setCategoryError("");
    window.setTimeout(() => {
      document.getElementById("assessment")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 20);
  }

  function categoryIsValid(id: CategoryId) {
    switch (id) {
      case "family":
        return Boolean(
          answers.passengers &&
            answers.seatingRequirement &&
            answers.cargoNeed &&
            answers.rearSpace,
        );
      case "adventure":
        return Boolean(
          answers.environment && answers.towingNeed && answers.preference,
        );
      case "city":
        return Boolean(answers.distance && answers.parkingPriority);
      case "performance":
        return Boolean(
          answers.drivingStyle &&
            answers.ownership &&
            answers.performanceImportance,
        );
      case "efficiency":
        return Boolean(
          answers.fuelPreference &&
            answers.budgetAttitude &&
            answers.budgetType &&
            answers.resaleImportant,
        );
      case "comfort":
        return Boolean(
          answers.comfortSpace &&
            answers.comfortNeeds.length > 0 &&
            answers.manufacturerCommitted &&
            (answers.manufacturerCommitted === "no" ||
              (answers.preferredManufacturers.length >= 1 &&
                answers.preferredManufacturers.length <= 2)),
        );
      default:
        return false;
    }
  }

  function saveCategory() {
    if (!activeCategory) return;

    if (!categoryIsValid(activeCategory)) {
      setCategoryError(
        "Please answer all the required questions before completing this section.",
      );
      return;
    }

    setCompleted((current) =>
      current.includes(activeCategory) ? current : [...current, activeCategory],
    );
    setActiveCategory(null);
    setCategoryError("");
  }

  function toggleComfortNeed(value: string) {
    const next = answers.comfortNeeds.includes(value)
      ? answers.comfortNeeds.filter((item) => item !== value)
      : [...answers.comfortNeeds, value];
    updateAnswer("comfortNeeds", next);
  }

  function updateManufacturer(slot: 0 | 1, value: string) {
    const next = [...answers.preferredManufacturers];

    if (!value) {
      next.splice(slot, 1);
    } else {
      next[slot] = value;
    }

    updateAnswer(
      "preferredManufacturers",
      next
        .filter((item, index, list) => item && list.indexOf(item) === index)
        .slice(0, 2),
    );
  }

  async function submitAssessment() {
    if (!allComplete || status === "sending") return;

    setStatus("sending");
    setError("");

    const comfortNeeds = [...answers.comfortNeeds];
    if (answers.cargoNeed === "large" && !comfortNeeds.includes("big_boot")) {
      comfortNeeds.push("big_boot");
    }
    if (
      answers.rearSpace === "important" &&
      !comfortNeeds.includes("rear_legroom")
    ) {
      comfortNeeds.push("rear_legroom");
    }

    const advicePayload = {
      email: "",
      leadId: null,
      passengers: answers.passengers,
      distance: answers.distance,
      budget: answers.budgetAttitude,
      budgetAmount: answers.budget.trim(),
      budgetType: answers.budgetType,
      ownership: answers.ownership,
      preference: answers.preference,
      environment: answers.environment,
      comfortSpace: answers.comfortSpace,
      drivingStyle:
        answers.towingNeed === "yes" ? "heavy_duty" : answers.drivingStyle,
      fuelPreference: answers.fuelPreference,
      comfortNeeds,
      seatingRequirement: answers.seatingRequirement,
      resaleImportant: answers.resaleImportant,
      manufacturerCommitted: answers.manufacturerCommitted,
      preferredManufacturers:
        answers.manufacturerCommitted === "yes"
          ? answers.preferredManufacturers
          : [],
      parkingPriority: answers.parkingPriority,
      performanceImportance: answers.performanceImportance,
      message: "",
      source: "quiz",
    };

    try {
      if (process.env.NODE_ENV !== "production") {
        console.log("[quiz] advice payload:", advicePayload);
      }

      const response = await fetch("/api/advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(advicePayload),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Advice request failed");
      }

      const payload = await response.json();

      try {
        sessionStorage.setItem("driveStyleAdvice", JSON.stringify(payload));
        localStorage.setItem("driveStyleAdvice", JSON.stringify(payload));
        localStorage.setItem("rightCar4MeAssessment", JSON.stringify(answers));
      } catch {
        // Ignore browser storage errors and continue to the results page.
      }

      const paidJourney =
        typeof window !== "undefined" &&
        window.location.search.includes("paidJourney=true");

      router.push(paidJourney ? "/results?paidJourney=true" : "/results");
    } catch (caught: any) {
      setStatus("error");
      setError(caught?.message || "Something went wrong");
      return;
    }

    setStatus("idle");
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <QuizHeader />

      <section
        className="relative isolate overflow-hidden bg-slate-100 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/quiz/quiz-hero.png')" }}
      >
        <div className="relative z-10 mx-auto grid min-h-[820px] max-w-[1500px] items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[0.82fr_1.18fr] lg:px-10 lg:py-14">
          <div className="self-start pt-5 lg:pt-10">
            <div className="max-w-[500px] rounded-[2rem] bg-white/58 p-6 shadow-sm backdrop-blur-[2px] sm:p-8 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#087f8c]">
                Your RightCar4Me assessment
              </p>

              <h1 className="mt-5 text-5xl font-bold leading-[0.94] tracking-tight text-[#071d3b] drop-shadow-[0_1px_1px_rgba(255,255,255,0.35)] sm:text-6xl lg:text-7xl">
                Your car should fit your life.
              </h1>

              <div className="mt-6 h-1 w-20 rounded-full bg-[#00a9a5]" />

              <p className="mt-6 max-w-md text-lg font-medium leading-8 text-[#071d3b] drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)] sm:text-xl">
                Tell us what matters most so we can match you with the right car
                for your needs, lifestyle and budget.
              </p>
            </div>
          </div>

          <section
            id="assessment"
            className="scroll-mt-24 rounded-[1.75rem] bg-white/96 p-5 shadow-[0_24px_70px_rgba(7,29,59,0.22)] backdrop-blur sm:p-7 lg:p-8"
          >
            <Progress completed={completed} label={progressLabel} />

            {activeCategory && activeDefinition ? (
              <CategoryPanel
                id={activeCategory}
                title={activeDefinition.title}
                answers={answers}
                error={categoryError}
                updateAnswer={updateAnswer}
                toggleComfortNeed={toggleComfortNeed}
                updateManufacturer={updateManufacturer}
                onBack={() => {
                  setActiveCategory(null);
                  setCategoryError("");
                }}
                onSave={saveCategory}
              />
            ) : (
              <>
                <div className="mt-7">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#087f8c]">
                    Your RightCar4Me assessment
                  </p>
                  <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-[#071d3b] sm:text-4xl">
                    What does your next car need to do for you?
                  </h2>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                    Complete each section in any order. You can reopen a
                    completed section if you want to change an answer.
                  </p>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {categories.map((category) => {
                    const isComplete = completed.includes(category.id);

                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => openCategory(category.id)}
                        className={`group relative overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-cyan-200/70 ${
                          isComplete
                            ? "border-[#00a9a5] ring-2 ring-[#00a9a5]/15"
                            : "border-slate-200 hover:border-[#00a9a5]/70"
                        }`}
                      >
                        <div className="relative aspect-[2/1] overflow-hidden bg-slate-100">
                          <img
                            src={category.image}
                            alt=""
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                          />
                          {isComplete && (
                            <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#00a9a5] text-xl font-bold text-white shadow-md">
                              ✓
                            </span>
                          )}
                        </div>

                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            <CategoryIcon id={category.id} />
                            <div>
                              <h3 className="font-bold leading-snug text-[#071d3b]">
                                {category.title}
                              </h3>
                              <p className="mt-1 text-sm leading-5 text-slate-600">
                                {category.description}
                              </p>
                              <p
                                className={`mt-3 text-xs font-bold uppercase tracking-[0.12em] ${
                                  isComplete
                                    ? "text-[#087f8c]"
                                    : "text-slate-400"
                                }`}
                              >
                                {isComplete
                                  ? "Completed · Edit answers"
                                  : "Open section"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {allComplete ? (
                  <button
                    type="button"
                    onClick={submitAssessment}
                    disabled={disable}
                    className="mt-7 flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-[#00a9a5] px-8 py-4 text-base font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#008f91] focus:outline-none focus:ring-4 focus:ring-cyan-300/40 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {status === "sending"
                      ? "Building your recommendations..."
                      : "See my recommendations"}
                    <span aria-hidden>→</span>
                  </button>
                ) : (
                  <p className="mt-7 text-center text-sm font-semibold text-slate-600">
                    Open and complete each category above.
                  </p>
                )}

                {status === "error" && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    Error: {error}
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </section>

      <LandingFooter />
    </main>
  );
}

function QuizHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-6 px-5 py-2 sm:px-8 lg:px-10">
        <Link href="/" aria-label="RightCar4Me home" className="shrink-0">
          <img
            src="/rightcar4me-logo.png"
            alt="RightCar4Me independent car-buying advice"
            className="h-16 w-auto object-contain sm:h-20"
          />
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-semibold text-[#071d3b] lg:flex">
          <Link
            href="/#how-it-works"
            className="transition hover:text-[#087f8c]"
          >
            How it works
          </Link>
          <Link href="/about" className="transition hover:text-[#087f8c]">
            Why RightCar4Me
          </Link>
          <Link href="/about" className="transition hover:text-[#087f8c]">
            About
          </Link>
          <Link
            href="/#car-buying-tips"
            className="transition hover:text-[#087f8c]"
          >
            Car buying tips
          </Link>
        </nav>

        <a
          href="#assessment"
          className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#00a9a5] px-5 py-2 text-sm font-bold text-white shadow-md transition hover:bg-[#008f91] sm:px-6"
        >
          <span className="hidden sm:inline">Start My Assessment</span>
          <span className="sm:hidden">Start</span>
        </a>
      </div>
    </header>
  );
}

function Progress({
  completed,
  label,
}: {
  completed: CategoryId[];
  label: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-4 sm:px-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#071d3b]">
          Assessment progress
        </p>
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#087f8c]">
          {label}
        </p>
      </div>

      <div className="mt-4 flex items-center">
        {categories.map((category, index) => {
          const isComplete = completed.includes(category.id);
          return (
            <div
              key={category.id}
              className="flex flex-1 items-center last:flex-none"
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition ${
                  isComplete
                    ? "bg-[#00a9a5] text-white"
                    : "bg-slate-300 text-transparent"
                }`}
              >
                ✓
              </span>
              {index < categories.length - 1 && (
                <span
                  className={`h-0.5 flex-1 transition ${
                    isComplete ? "bg-[#00a9a5]" : "bg-slate-300"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CategoryPanel({
  id,
  title,
  answers,
  error,
  updateAnswer,
  toggleComfortNeed,
  updateManufacturer,
  onBack,
  onSave,
}: {
  id: CategoryId;
  title: string;
  answers: Answers;
  error: string;
  updateAnswer: <K extends keyof Answers>(key: K, value: Answers[K]) => void;
  toggleComfortNeed: (value: string) => void;
  updateManufacturer: (slot: 0 | 1, value: string) => void;
  onBack: () => void;
  onSave: () => void;
}) {
  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-bold text-[#087f8c] hover:text-[#071d3b]"
      >
        <span aria-hidden>←</span> Back to all sections
      </button>

      <div className="mt-4 flex items-center gap-3">
        <CategoryIcon id={id} large />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#087f8c]">
            Assessment section
          </p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight text-[#071d3b]">
            {title}
          </h2>
        </div>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {id === "family" && (
          <>
            <SelectField
              label="Who is usually in the car?"
              value={answers.passengers}
              onChange={(value) => updateAnswer("passengers", value)}
              options={[
                ["alone", "Mostly just me"],
                ["couple", "Me and my partner"],
                ["family", "Family of 3–4"],
                ["large_family", "Family of 5 or more"],
              ]}
            />
            <SelectField
              label="Total seating requirement"
              value={answers.seatingRequirement}
              onChange={(value) => updateAnswer("seatingRequirement", value)}
              options={[
                ["2", "2 seats"],
                ["4", "4 seats"],
                ["5", "5 seats"],
                ["7_plus", "7 seats or more"],
              ]}
            />
            <SelectField
              label="How much luggage or cargo space do you need?"
              value={answers.cargoNeed}
              onChange={(value) => updateAnswer("cargoNeed", value)}
              options={[
                ["light", "Only everyday bags"],
                ["medium", "Regular shopping and luggage"],
                ["large", "A large boot is essential"],
              ]}
            />
            <SelectField
              label="How important is rear passenger space?"
              value={answers.rearSpace}
              onChange={(value) => updateAnswer("rearSpace", value)}
              options={[
                ["not_important", "Not particularly important"],
                ["helpful", "Helpful to have"],
                ["important", "Very important"],
              ]}
            />
          </>
        )}

        {id === "adventure" && (
          <>
            <SelectField
              label="Where do you mainly drive?"
              value={answers.environment}
              onChange={(value) => updateAnswer("environment", value)}
              options={[
                ["city", "Mostly city roads"],
                ["suburb", "Suburban and open roads"],
                ["rough", "Rural, gravel or rough roads"],
                ["mixed", "A genuine mix of conditions"],
              ]}
            />
            <SelectField
              label="Will you tow or carry heavy equipment?"
              value={answers.towingNeed}
              onChange={(value) => updateAnswer("towingNeed", value)}
              options={[
                ["no", "No"],
                ["occasionally", "Occasionally"],
                ["yes", "Yes, regularly"],
              ]}
            />
            <SelectField
              label="Do you have a body-style preference?"
              value={answers.preference}
              onChange={(value) => updateAnswer("preference", value)}
              options={[
                ["none", "No strong preference"],
                ["suv", "SUV or crossover"],
                ["sedan", "Sedan or fastback"],
                ["hatch", "Hatchback"],
                ["mpv", "Seven-seater or MPV"],
                ["pickup", "Bakkie or pickup"],
              ]}
              wide
            />
          </>
        )}

        {id === "city" && (
          <>
            <SelectField
              label="What is your typical driving pattern?"
              value={answers.distance}
              onChange={(value) => updateAnswer("distance", value)}
              options={[
                ["very_short", "Mostly short local trips"],
                ["urban_daily", "Daily city and traffic driving"],
                ["mixed", "Mixed city and highway use"],
                ["long_distance", "Frequent long-distance driving"],
              ]}
            />
            <SelectField
              label="How important is easy parking and manoeuvrability?"
              value={answers.parkingPriority}
              onChange={(value) => updateAnswer("parkingPriority", value)}
              options={[
                ["low", "Not a major consideration"],
                ["medium", "Useful, but not essential"],
                ["high", "Extremely important"],
              ]}
            />
          </>
        )}

        {id === "performance" && (
          <>
            <SelectField
              label="How would you describe your driving style?"
              value={answers.drivingStyle}
              onChange={(value) => updateAnswer("drivingStyle", value)}
              options={[
                ["relaxed", "Relaxed and unhurried"],
                ["balanced", "Balanced"],
                ["enthusiastic", "I genuinely enjoy driving"],
                ["heavy_duty", "Capability matters most"],
              ]}
            />
            <SelectField
              label="How do you see cars?"
              value={answers.ownership}
              onChange={(value) => updateAnswer("ownership", value)}
              options={[
                ["appliance", "Primarily practical transport"],
                ["neutral", "A balance of practical and enjoyable"],
                ["loves_cars", "An important part of my lifestyle"],
              ]}
            />
            <SelectField
              label="How important is performance and driver enjoyment?"
              value={answers.performanceImportance}
              onChange={(value) => updateAnswer("performanceImportance", value)}
              options={[
                ["low", "Low — comfort and practicality come first"],
                ["medium", "Medium — I appreciate a capable car"],
                ["high", "High — the driving experience matters"],
              ]}
              wide
            />
          </>
        )}

        {id === "efficiency" && (
          <>
            <SelectField
              label="Fuel preference"
              value={answers.fuelPreference}
              onChange={(value) => updateAnswer("fuelPreference", value)}
              options={[
                ["none", "No preference"],
                ["petrol", "Petrol"],
                ["diesel", "Diesel"],
                ["hybrid", "Hybrid"],
                ["electric", "Electric"],
              ]}
            />
            <SelectField
              label="Budget mindset"
              value={answers.budgetAttitude}
              onChange={(value) => updateAnswer("budgetAttitude", value)}
              options={[
                ["tight", "Keep costs as low as possible"],
                ["balanced", "Balance value and quality"],
                ["flexible", "Flexible for the right vehicle"],
              ]}
            />
            <SelectField
              label="How do you think about your budget?"
              value={answers.budgetType}
              onChange={(value) => updateAnswer("budgetType", value)}
              options={[
                ["purchase_price", "Total purchase price"],
                ["monthly_hp", "Monthly finance payment"],
                ["monthly_lease", "Monthly lease payment"],
              ]}
            />
            <TextField
              label="Approximate budget (optional)"
              value={answers.budget}
              onChange={(value) => updateAnswer("budget", value)}
              placeholder="For example: R450 000 or R8 000/month"
            />
            <SelectField
              label="Is resale value a consideration?"
              value={answers.resaleImportant}
              onChange={(value) => updateAnswer("resaleImportant", value)}
              options={[
                ["yes", "Yes"],
                ["no", "No"],
              ]}
              wide
            />
          </>
        )}

        {id === "comfort" && (
          <>
            <SelectField
              label="What cabin and seating feel suits you?"
              value={answers.comfortSpace}
              onChange={(value) => updateAnswer("comfortSpace", value)}
              options={[
                ["compact_ok", "Compact is comfortable for me"],
                ["standard", "A conventional seating position"],
                ["roomy", "A roomy cabin is important"],
                ["easy_entry", "Easy entry and a higher seat"],
              ]}
              wide
            />

            <div className="sm:col-span-2">
              <FieldLabel label="Which comfort features matter to you?" />
              <p className="mb-3 text-sm text-slate-500">
                Select at least one.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["easy_in_out", "Easy entry and exit"],
                  ["wide_seats", "Supportive, wider seats"],
                  ["rear_legroom", "Generous rear legroom"],
                  ["big_boot", "A large boot"],
                  ["technology", "Modern safety and technology"],
                  ["premium_cabin", "A refined cabin finish"],
                ].map(([value, label]) => {
                  const selected = answers.comfortNeeds.includes(value);
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggleComfortNeed(value)}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
                        selected
                          ? "border-[#00a9a5] bg-cyan-50 text-[#071d3b]"
                          : "border-slate-200 bg-white text-slate-700 hover:border-[#00a9a5]/60"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs ${
                          selected
                            ? "border-[#00a9a5] bg-[#00a9a5] text-white"
                            : "border-slate-300 text-transparent"
                        }`}
                      >
                        ✓
                      </span>
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <SelectField
              label="Are you committed to particular manufacturers?"
              value={answers.manufacturerCommitted}
              onChange={(value) => {
                updateAnswer("manufacturerCommitted", value);
                if (value === "no") updateAnswer("preferredManufacturers", []);
              }}
              options={[
                ["no", "No — I am open to recommendations"],
                ["yes", "Yes"],
              ]}
              wide
            />

            {answers.manufacturerCommitted === "yes" && (
              <div className="grid gap-5 sm:col-span-2 sm:grid-cols-2">
                <SelectField
                  label="First manufacturer"
                  value={answers.preferredManufacturers[0] || ""}
                  onChange={(value) => updateManufacturer(0, value)}
                  options={manufacturers.map((manufacturer) => [
                    manufacturer,
                    manufacturer,
                  ])}
                />
                <SelectField
                  label="Second manufacturer (optional)"
                  value={answers.preferredManufacturers[1] || ""}
                  onChange={(value) => updateManufacturer(1, value)}
                  options={manufacturers
                    .filter(
                      (manufacturer) =>
                        manufacturer !== answers.preferredManufacturers[0],
                    )
                    .map((manufacturer) => [manufacturer, manufacturer])}
                  optional
                />
              </div>
            )}
          </>
        )}
      </div>

      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onBack}
          className="min-h-12 rounded-full border border-slate-300 px-6 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          className="min-h-12 rounded-full bg-[#00a9a5] px-7 py-3 font-bold text-white shadow-md transition hover:bg-[#008f91] focus:outline-none focus:ring-4 focus:ring-cyan-300/40"
        >
          Complete this section <span aria-hidden>→</span>
        </button>
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
  wide,
  optional,
}: {
  label: string;
  value: string;
  options: string[][];
  onChange: (value: string) => void;
  wide?: boolean;
  optional?: boolean;
}) {
  return (
    <label className={wide ? "block sm:col-span-2" : "block"}>
      <FieldLabel label={label} />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-[#071d3b] outline-none transition focus:border-[#00a9a5] focus:ring-4 focus:ring-cyan-100"
      >
        <option value="">{optional ? "None" : "Select an answer"}</option>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  wide,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  wide?: boolean;
}) {
  return (
    <label className={wide ? "block sm:col-span-2" : "block"}>
      <FieldLabel label={label} />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-[#071d3b] outline-none transition placeholder:text-slate-400 focus:border-[#00a9a5] focus:ring-4 focus:ring-cyan-100"
      />
    </label>
  );
}

function FieldLabel({ label }: { label: string }) {
  return (
    <span className="mb-2 block text-sm font-bold text-[#071d3b]">{label}</span>
  );
}

function CategoryIcon({
  id,
  large = false,
}: {
  id: CategoryId;
  large?: boolean;
}) {
  const className = `${large ? "h-12 w-12" : "h-9 w-9"} shrink-0 text-[#087f8c]`;

  const paths: Record<CategoryId, ReactNode> = {
    family: (
      <>
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="8" r="3" />
        <circle cx="13" cy="15" r="2.5" />
        <path d="M3 20c.4-4 2.2-6 6-6M21 20c-.4-4-2.2-6-6-6M8 22c.2-3.2 1.8-5 5-5s4.8 1.8 5 5" />
      </>
    ),
    adventure: <path d="M2 21 9 9l4 6 3-4 6 10H2Zm4.5-4h3l1.5-2.5" />,
    city: (
      <>
        <path d="M4 21V8h7v13M11 21V3h9v18M2 21h20" />
        <path d="M7 11h1M7 15h1M14 7h2M14 11h2M14 15h2" />
      </>
    ),
    performance: (
      <>
        <path d="M4 18a8 8 0 1 1 16 0" />
        <path d="m12 14 4-4M7 18h.01M17 18h.01" />
      </>
    ),
    efficiency: (
      <>
        <path d="M20 4C11 4 5 8 5 15c0 3 2 5 5 5 7 0 10-7 10-16Z" />
        <path d="M4 21c3-6 7-9 13-12" />
      </>
    ),
    comfort: (
      <path d="m12 2 3 6 7 .9-5 4.8 1.3 6.8L12 17l-6.3 3.5L7 13.7 2 8.9 9 8l3-6Z" />
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[id]}
    </svg>
  );
}

function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-4 text-center sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:text-left">
        <div>
          <p className="font-semibold text-[#071d3b]">RightCar4Me</p>
          <p className="mt-0.5 text-xs text-slate-500">
            Independent car-buying advice for South African motorists.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-slate-600">
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
