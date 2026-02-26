// ===============================
// Drive Style Advisor Engine v1.5
// Catalogue shortlist: safe fallback + budget anchor + "closest price" fill
// ===============================
import { queryVehicles, prettyVehicleType } from "./vehicleCatalog";

export type BriefInput = {
  passengers: "alone" | "couple" | "family" | "large_family";
  distance: "very_short" | "urban_daily" | "mixed" | "long_distance";
  budget: "tight" | "balanced" | "flexible"; // attitude
  budgetAmount?: string; // e.g. "R300k", "300000"
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
  verdict: string;
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

function parseBudgetAmountToNumber(inputBudgetAmount?: string): number | null {
  const raw = String(inputBudgetAmount || "").trim();
  if (!raw) return null;

  const lower = raw.toLowerCase();
  const digits = lower.replace(/[^\d]/g, "");
  if (!digits) return null;

  let n = Number(digits);
  if (!Number.isFinite(n) || n <= 0) return null;

  // "300k" => 300000 (only if it looks like a small number)
  if (lower.includes("k") && n < 100000) n = n * 1000;

  return n;
}

function shuffle<T>(arr: T[]): T[] {
  return arr.slice().sort(() => Math.random() - 0.5);
}

// ===============================
// Main Engine
// ===============================

export function generateAdvice(input: BriefInput): Advice {
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

  // ===============================
  // Catalogue-driven shortlist
  // ===============================

  let candidates = queryVehicles({
    marketAnyOf: category === "bakkie" ? ["COMMERCIAL"] : ["PASSENGER"],
    bodyAnyOf:
      category === "sedan"
        ? ["SEDAN"]
        : category === "mid_suv"
        ? ["SUV", "CROSSOVER"]
        : category === "large_suv"
        ? ["SUV"]
        : category === "mpv"
        ? ["MPV", "VAN", "BUS"]
        : category === "bakkie"
        ? ["PICKUP", "BAKKIE"]
        : [],
  });

  // Fallback if body tokens don't match dataset exactly
  if (!candidates.length) {
    candidates = queryVehicles({
      marketAnyOf: category === "bakkie" ? ["COMMERCIAL"] : ["PASSENGER"],
    });
  }

  // -------------------------------
  // Budget anchoring:
  // 1) Take anything in-range
  // 2) If fewer than 5, fill the rest with closest MSRP to budget
  // -------------------------------
  const target = parseBudgetAmountToNumber(input.budgetAmount);

  let chosen: any[] = [];

  if (target) {
    const band = input.budget === "tight" ? 0.15 : input.budget === "balanced" ? 0.3 : 0.5;
    const min = Math.round(target * (1 - band));
    const max = Math.round(target * (1 + band));

    const inRange = candidates.filter((v: any) => {
      const price = Number(v.msrp || 0);
      return price >= min && price <= max;
    });

    // Start with in-range (randomised for variety)
    chosen = shuffle(inRange);

    // Fill remaining with closest by price (still within candidates)
    if (chosen.length < 5) {
      const remaining = candidates
        .filter((v: any) => !chosen.some((c) => c.id === v.id))
        .map((v: any) => ({ v, dist: Math.abs(Number(v.msrp || 0) - target) }))
        .sort((a, b) => a.dist - b.dist)
        .map((x) => x.v);

      chosen = chosen.concat(remaining);
    }
  } else {
    // No budget supplied: just shuffle candidates
    chosen = shuffle(candidates);
  }

  // Take 5 and render
  const models = chosen.slice(0, 5).map((v: any) => ({
    name: v.name,
    why: prettyVehicleType(v.vehicleType),
  }));

  return {
    intro,
    insights,
    verdict,
    models,
    closing: "Want me to narrow it down further?",
  };
}