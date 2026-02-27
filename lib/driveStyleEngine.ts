// ===============================
// Drive Style Advisor Engine v2.2 (Roomy Hard Constraint)
// - If comfortSpace === "roomy" (and preference != sedan),
//   we ONLY return roomy-eligible body types (SUV/CROSSOVER/MPV/VAN/BAKKIE).
// - We DO NOT backfill with small cars. If not enough, we return fewer.
// ===============================
import { queryVehicles, prettyVehicleType } from "./vehicleCatalog";

export type BriefInput = {
  passengers: "alone" | "couple" | "family" | "large_family";
  distance: "very_short" | "urban_daily" | "mixed" | "long_distance";
  budget: "tight" | "balanced" | "flexible";
  budgetAmount?: string;
  ownership: "loves_cars" | "neutral" | "appliance";
  risk: "certainty" | "risk_ok";
  environment: "city" | "suburb" | "rough";
  preference: "suv" | "sedan" | "none";
  drivingStyle: "relaxed" | "balanced" | "enthusiastic" | "heavy_duty";

  comfortSpace?: "compact_ok" | "standard" | "roomy" | "easy_entry";
  comfortNeeds?: Array<"easy_in_out" | "wide_seats" | "rear_legroom" | "big_boot">;
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

  if (lower.includes("k") && n < 100000) n = n * 1000;
  return n;
}

function normStr(x: any) {
  return String(x ?? "").toLowerCase();
}

function tokenText(v: any) {
  const type = v.vehicleType ?? "";
  const id = v.id ?? "";
  const name = v.name ?? "";
  return normStr(`${type} ${id} ${name}`);
}

function getStableId(v: any): string {
  const id = v?.id ?? v?.ID ?? v?.uuid ?? v?.name;
  return String(id ?? "");
}

// -------------------------------
// Roomy-eligible filter (hard)
// -------------------------------
const ROOMY_OK_TOKENS = [
  "suv",
  "crossover",
  "crossover_suv",
  "mpv",
  "van",
  "bus",
  "pickup",
  "bakkie",
  "doublecab",
  "crew",
  "4x4",
];

function isRoomyEligible(v: any) {
  const t = tokenText(v);
  return ROOMY_OK_TOKENS.some((tok) => t.includes(tok));
}

function getComfortSpace(input: BriefInput): "compact_ok" | "standard" | "roomy" | "easy_entry" {
  const v = input.comfortSpace;
  if (v === "compact_ok" || v === "standard" || v === "roomy" || v === "easy_entry") return v;
  return "standard";
}

function getComfortNeeds(input: BriefInput): Array<"easy_in_out" | "wide_seats" | "rear_legroom" | "big_boot"> {
  const raw = input.comfortNeeds;
  if (!Array.isArray(raw)) return [];
  const set = new Set<"easy_in_out" | "wide_seats" | "rear_legroom" | "big_boot">();
  for (const x of raw) {
    if (x === "easy_in_out" || x === "wide_seats" || x === "rear_legroom" || x === "big_boot") set.add(x);
  }
  return Array.from(set);
}

function scoreBasicFit(v: any, input: BriefInput, category: string) {
  // Lightweight scoring: category alignment + rough roads + family/boot + preference
  let s = 0;
  const t = tokenText(v);

  const isSedan = t.includes("sedan") || t.includes("saloon");
  const isMpv = t.includes("mpv") || t.includes("van") || t.includes("bus");
  const isBakkie = t.includes("pickup") || t.includes("bakkie");
  const isSuvish = t.includes("suv") || t.includes("crossover");

  if (category === "sedan" && isSedan) s += 4;
  if ((category === "mid_suv" || category === "large_suv") && (isSuvish || isRoomyEligible(v))) s += 4;
  if (category === "mpv" && isMpv) s += 4;
  if (category === "bakkie" && isBakkie) s += 4;

  if (input.environment === "rough") s += isBakkie || isSuvish ? 3 : -3;
  if (input.passengers === "family" || input.passengers === "large_family") s += isMpv || isSuvish ? 2 : 0;

  if (input.preference === "suv") s += isSuvish ? 2 : 0;
  if (input.preference === "sedan") s += isSedan ? 2 : 0;

  return s;
}

function sortByScoreThenBudgetDistance(items: any[], scoreMap: Map<string, number>, target: number | null) {
  return items
    .map((v) => {
      const id = getStableId(v) || String(v?.name ?? "");
      const score = scoreMap.get(id) ?? 0;
      const price = Number(v?.msrp || 0);
      const dist = target ? Math.abs(price - target) : 0;
      return { v, score, dist, name: String(v?.name ?? "") };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.dist !== b.dist) return a.dist - b.dist;
      return a.name.localeCompare(b.name);
    })
    .map((x) => x.v);
}

function buildWhy(v: any, input: BriefInput, comfortSpace: string, needs: string[]) {
  const bits: string[] = [];
  const t = tokenText(v);

  if (comfortSpace === "roomy") bits.push("Roomier body shape");
  if (needs.includes("rear_legroom")) bits.push("Better chance of rear legroom");
  if (needs.includes("big_boot")) bits.push("Boot-friendly");

  // If it’s not actually roomy eligible (should not happen), signal trade-off
  if (comfortSpace === "roomy" && !isRoomyEligible(v) && input.preference !== "sedan") {
    bits.push("Space trade-off");
  }

  const type = prettyVehicleType(v.vehicleType);
  const cleaned = Array.from(new Set(bits)).slice(0, 2);
  if (!cleaned.length) return type;
  return `${type} — ${cleaned.join(" • ")}`;
}

export function generateAdvice(input: BriefInput): Advice {
  const comfortSpace = getComfortSpace(input);
  const comfortNeeds = getComfortNeeds(input);

  let category = pickCategory(input.passengers, input.environment, input.preference);
  const fuel = pickFuel(input.distance);

  // Easy entry: lean away from sedan unless explicitly chosen
  if (comfortSpace === "easy_entry" && input.preference !== "sedan" && category === "sedan") {
    category = "mid_suv";
  }

  const intro =
    "Thanks — based on your answers, here’s the direction that best fits your day-to-day and the ownership experience you’re aiming for.";

  const comfortClause =
    comfortSpace === "roomy"
      ? " You also said you’d prefer a roomier driver space, so I’m only showing roomier body shapes."
      : comfortSpace === "easy_entry"
      ? " You also said you’d like easier entry, so I’m leaning toward a higher seating position."
      : "";

  const insights: Insight[] = [
    {
      title: "Fit",
      text:
        (category === "sedan"
          ? "Because your passenger/practical needs are lighter, a sedan keeps life simple — easy to park, easy to run, and comfortable for daily driving."
          : category === "mid_suv"
          ? "Because you want flexibility without bulk, a mid-size SUV is the sweet spot — boot space and ride height, without the size penalty of a big SUV."
          : category === "large_suv"
          ? "Because your use leans toward passengers and carrying, a larger SUV reduces compromise — especially when the vehicle is actually full."
          : category === "mpv"
          ? "Because people + luggage adds up quickly, an MPV gives you space efficiency you can’t fake with an SUV."
          : "Because your environment/use leans rugged, a bakkie/4x4-capable option makes the most sense.") + comfortClause,
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
          ? "Because you like driving, we choose something that feels confident and responsive — enjoyable without being fragile."
          : input.drivingStyle === "heavy_duty"
          ? "Because capability matters, we prioritise stability and strength over ‘nice-to-have’ features."
          : "Because you want an easy daily experience, comfort and simplicity should be the priority.",
    },
  ];

  const verdictBase =
    category === "mid_suv"
      ? "This is the ‘smart middle’ choice — practical enough for real life, without paying for space you don’t use."
      : category === "sedan"
      ? "Keep it simple and predictable — you’ll win on ownership, not just purchase day."
      : category === "large_suv"
      ? "If you’re even slightly on the fence about space, go bigger — regret usually comes from undersizing."
      : category === "mpv"
      ? "If you need space, own it — MPV practicality is hard to beat when life gets busy."
      : "If your roads and use are rough, buy the right tool — capability pays you back later.";

  const verdict =
    comfortSpace === "roomy"
      ? `${verdictBase} I’m only showing roomier body shapes for your shortlist.`
      : comfortSpace === "easy_entry"
      ? `${verdictBase} I’m keeping the shortlist biased toward easier access and a higher seating position.`
      : verdictBase;

  // Pull a broad pool (PASSENGER by default)
  let candidates = queryVehicles({
    marketAnyOf: category === "bakkie" ? ["COMMERCIAL"] : ["PASSENGER"],
  });

  // Roomy hard constraint (unless they explicitly want sedan)
  if (comfortSpace === "roomy" && input.preference !== "sedan") {
    candidates = candidates.filter((v: any) => isRoomyEligible(v));
  }

  // Score
  const scoreMap = new Map<string, number>();
  for (const v of candidates) {
    const id = getStableId(v) || String(v?.name ?? "");
    scoreMap.set(id, scoreBasicFit(v, input, category));
  }

  // Budget anchoring (still applies)
  const target = parseBudgetAmountToNumber(input.budgetAmount);

  let ranked: any[] = [];

  if (target) {
    const band = input.budget === "tight" ? 0.15 : input.budget === "balanced" ? 0.3 : 0.5;
    const min = Math.round(target * (1 - band));
    const max = Math.round(target * (1 + band));

    const inRange = candidates.filter((v: any) => {
      const price = Number(v?.msrp || 0);
      return price >= min && price <= max;
    });

    ranked = sortByScoreThenBudgetDistance(inRange.length ? inRange : candidates, scoreMap, target);
  } else {
    ranked = sortByScoreThenBudgetDistance(candidates, scoreMap, null);
  }

  // IMPORTANT: in roomy mode we allow fewer than 5 (don’t backfill with small cars)
  const takeN = comfortSpace === "roomy" && input.preference !== "sedan" ? Math.min(5, ranked.length) : 5;

  const models = ranked.slice(0, takeN).map((v: any) => ({
    name: v.name,
    why: buildWhy(v, input, comfortSpace, comfortNeeds),
  }));

  const closing =
    comfortSpace === "roomy" && input.preference !== "sedan"
      ? models.length < 5
        ? "I can widen your budget range or adjust your body preference to find more roomy options — want me to do that?"
        : "Want me to narrow it down further (and focus even more on cabin space)?"
      : comfortSpace === "easy_entry"
      ? "Want me to narrow it down further (and prioritise easy entry even more)?"
      : "Want me to narrow it down further?";

  return { intro, insights, verdict, models, closing };
}