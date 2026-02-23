// ===============================
// Drive Style Advisor Engine v1.1
// Adds: Verdict + clearer WHY
// ===============================

export type BriefInput = {
  passengers: "alone" | "couple" | "family" | "large_family";
  distance: "very_short" | "urban_daily" | "mixed" | "long_distance";
  budget: "tight" | "balanced" | "flexible";
  ownership: "loves_cars" | "neutral" | "appliance";
  risk: "certainty" | "risk_ok";
  environment: "city" | "suburb" | "rough";
  preference: "suv" | "sedan" | "none";
  drivingStyle: "relaxed" | "balanced" | "enthusiastic" | "heavy_duty";
};

export type Insight = {
  title: "Fit" | "Cost" | "Lifestyle";
  text: string;
};

export type Advice = {
  intro: string;
  insights: Insight[];
  verdict: string; // NEW
  models: { name: string; why: string }[];
  closing: string;
};

// ===============================
// Base Helpers
// ===============================

function pickFuel(distance: BriefInput["distance"]) {
  if (distance === "long_distance") return "diesel";
  if (distance === "mixed") return "hybrid";
  if (distance === "urban_daily") return "hybrid_or_ev";
  return "petrol";
}

function pickCategory(
  passengers: BriefInput["passengers"],
  environment: BriefInput["environment"],
  preference: BriefInput["preference"]
) {
  if (environment === "rough") return "bakkie";
  if (passengers === "large_family") return "mpv";
  if (passengers === "family") return "large_suv";
  if (preference === "sedan") return "sedan";
  return "mid_suv";
}

// ===============================
// Model Pools
// ===============================

const POOLS = {
  sedan: [
    { name: "BMW 3 Series", why: "Balanced performance and everyday usability" },
    { name: "Toyota Corolla Sedan", why: "Reliable and cost-effective long term" },
    { name: "Audi A3 Sedan", why: "Premium feel in a compact, easy format" },
  ],
  mid_suv: [
    { name: "Kia Sportage", why: "Comfort + practicality sweet spot" },
    { name: "VW Tiguan", why: "Solid middle ground with strong build quality" },
    { name: "Toyota Corolla Cross", why: "Reliable and easy to own" },
  ],
  large_suv: [
    { name: "Toyota Fortuner", why: "Reliable, strong resale, handles family life easily" },
    { name: "Ford Everest", why: "Space + presence, excellent for trips" },
    { name: "Kia Sorento", why: "Family packaging with long-distance comfort" },
  ],
  mpv: [
    { name: "VW Multivan", why: "Ultimate people and luggage flexibility" },
    { name: "Hyundai Staria", why: "Modern MPV comfort with space" },
    { name: "Toyota Quantum VX", why: "Maximum practicality for big families" },
  ],
  bakkie: [
    { name: "Toyota Hilux", why: "Proven workhorse with strong resale" },
    { name: "Ford Ranger", why: "Capability + comfort balance" },
    { name: "Isuzu D-Max", why: "Durable and built for SA conditions" },
  ],
};

// ===============================
// Scenario Overrides (Option A)
// ===============================

type ScenarioAdvice = Pick<Advice, "intro" | "insights" | "verdict" | "models">;

function scenarioOverrides(input: BriefInput): ScenarioAdvice | null {
  // 1️⃣ Family of 4 + mixed/urban + luggage reality
  if (input.passengers === "family" && (input.distance === "mixed" || input.distance === "urban_daily")) {
    return {
      intro:
        "This reads like real-world family life — school runs, errands, and the kind of weekends where the car is suddenly full.",
      insights: [
        {
          title: "Fit",
          text:
            "Because you’re carrying multiple passengers regularly (and not just occasionally), space stops being a luxury — it becomes a stress reducer. A proper large SUV gives you usable boot capacity, better second-row comfort, and fewer compromises when the vehicle is actually loaded.",
        },
        {
          title: "Cost",
          text:
            "Because this is frequent use, the smart money move is predictability: strong resale + manageable servicing. A hybrid *can* help in stop-start traffic, but only if the purchase price and service plan still make total cost of ownership make sense over 3–5 years.",
        },
        {
          title: "Lifestyle",
          text:
            "Because family driving is busy, you want the vehicle to feel effortless — stable, calm, and unbothered when it’s full. The right SUV makes the car disappear into the background (in the best way).",
        },
      ],
      verdict: "You’ll appreciate the extra space sooner than you think — don’t undersize this decision.",
      models: POOLS.large_suv,
    };
  }

  // 2️⃣ Enthusiast / loves cars (fun + disciplined)
  if (input.drivingStyle === "enthusiastic" || input.ownership === "loves_cars") {
    const sedanSet = [
      { name: "BMW 3 Series", why: "Engaging drive with real-world practicality" },
      { name: "VW Golf GTI", why: "Proper fun without being extreme" },
      { name: "Audi A3 Sedan", why: "Premium feel + responsive daily option" },
    ];

    const suvSet = [
      { name: "BMW X1", why: "Sharper drive feel in a practical SUV format" },
      { name: "VW Tiguan R-Line", why: "Sporty presence without sacrificing comfort" },
      { name: "Kia Sportage GT-Line", why: "Stylish and enjoyable to live with daily" },
    ];

    return {
      intro:
        "You clearly enjoy driving — so the goal is something that feels special daily, without turning ownership into a project.",
      insights: [
        {
          title: "Fit",
          text:
            "Because you want enjoyment *and* practicality, the sweet spot is ‘responsive and balanced’ — not extreme. A performance-leaning sedan (or a sharper crossover if you need space) gives you steering feel and composure, without punishing everyday usability.",
        },
        {
          title: "Cost",
          text:
            "Because performance comes with hidden costs (tyres, brakes, servicing), it needs to be disciplined. Proven models with a sensible service path keep it ‘fun today’ *and* ‘happy ownership later’ — that’s the trap we avoid.",
        },
        {
          title: "Lifestyle",
          text:
            "Because this purchase is emotional (in a good way), it should feel intentional — something you’re proud to drive, without feeling like you’ve overdone it.",
        },
      ],
      verdict: "Choose something engaging but disciplined — that’s where long-term satisfaction lives.",
      models: input.passengers === "alone" ? sedanSet : suvSet,
    };
  }

  // 3️⃣ Heavy duty / towing / capability
  if (input.drivingStyle === "heavy_duty") {
    const leanBakkie = input.environment === "rough" || input.distance === "long_distance";

    return {
      intro:
        "This is a capability-first profile. We choose the vehicle around what it must *do* — not what looks good in a brochure.",
      insights: [
        {
          title: "Fit",
          text:
            leanBakkie
              ? "Because towing/load/rough roads are real requirements, a bakkie is usually the most sensible answer in South Africa — strong chassis, better durability under load, and mature 4x4 capability."
              : "Because you want capability but still care about daily refinement, a large SUV can work — as long as we stay honest about towing limits and setup.",
        },
        {
          title: "Cost",
          text:
            "Because heavy-duty ownership gets expensive in the boring places (tyres, fuel, servicing), we prioritise durability and real-world running costs over badge and trim level.",
        },
        {
          title: "Lifestyle",
          text:
            "Because you want confidence under load, the right choice feels unshakeable — stable, planted, and built for the task.",
        },
      ],
      verdict: "Buy for the job first. If it’s truly heavy-duty, capability beats ‘SUV vibes’ every time.",
      models: leanBakkie ? POOLS.bakkie : POOLS.large_suv,
    };
  }

  return null;
}

// ===============================
// Main Engine
// ===============================

export function generateAdvice(input: BriefInput): Advice {
  const scenario = scenarioOverrides(input);

  if (scenario) {
    return {
      intro: scenario.intro,
      insights: scenario.insights,
      verdict: scenario.verdict,
      models: scenario.models,
      closing: "If you want, I can refine this shortlist further based on budget, brand preference, and must-have features.",
    };
  }

  // Default logic (fallback)
  const category = pickCategory(input.passengers, input.environment, input.preference);
  const fuel = pickFuel(input.distance);

  const intro =
    "Thanks — based on your answers, here’s the direction that best fits your day-to-day and the ownership experience you’re aiming for.";

  const insights: Insight[] = [
    {
      title: "Fit",
      text:
        category === "sedan"
          ? "Because your passenger/practical needs are lighter, a sedan keeps life simple — easy to park, easy to run, and comfortable for daily driving."
          : category === "mid_suv"
          ? "Because you want flexibility without bulk, a mid-size SUV is the sweet spot — boot space and ride height, without the size penalty of a big SUV."
          : category === "large_suv"
          ? "Because your use leans toward passengers and carrying, a larger SUV reduces compromise — especially when the vehicle is actually full."
          : category === "mpv"
          ? "Because people + luggage adds up quickly, an MPV gives you space efficiency you can’t fake with an SUV."
          : "Because your environment/use leans rugged, a bakkie/4x4-capable option makes the most sense.",
    },
    {
      title: "Cost",
      text:
        fuel === "diesel"
          ? "Because you do longer distances, diesel can make sense for relaxed cruising and real-world efficiency."
          : fuel === "hybrid"
          ? "Because your driving is mixed, a hybrid can reduce running costs without requiring you to change your habits."
          : fuel === "hybrid_or_ev"
          ? "Because stop-start traffic punishes fuel economy, hybrid (or EV if charging is truly easy for you) can lower monthly running costs."
          : "Because short trips are common, petrol is usually the simplest and most predictable to own.",
    },
    {
      title: "Lifestyle",
      text:
        input.drivingStyle === "enthusiastic"
          ? "Because you like driving, we choose something that feels responsive and confident — fun without being fragile."
          : input.drivingStyle === "heavy_duty"
          ? "Because capability matters, we prioritise stability and strength over ‘nice-to-have’ features."
          : "Because you want an easy daily experience, comfort and simplicity should be the priority.",
    },
  ];

  const verdict =
    category === "mid_suv"
      ? "This is the ‘smart middle’ choice — practical enough for real life, without paying for space you don’t use."
      : category === "sedan"
      ? "Keep it simple and predictable — you’ll win on ownership, not just purchase day."
      : category === "large_suv"
      ? "If you’re even slightly on the fence about space, go bigger — regret usually comes from undersizing."
      : category === "mpv"
      ? "If you need space, own it — MPV practicality is hard to beat when life gets busy."
      : "If your roads and use are rough, buy the right tool — capability pays you back later.";

  return {
    intro,
    insights,
    verdict,
    models: POOLS[category as keyof typeof POOLS],
    closing: "Want me to narrow it down further?",
  };
}