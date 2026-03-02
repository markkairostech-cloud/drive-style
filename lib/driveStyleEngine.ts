// ===============================
// Drive Style Advisor Engine v3.2 (SA Urban vs Rural bias + Roomy hard rules)
// FIXES (kept from v3.0 / v3.1):
// - Unknown msrp entries remain eligible inside budget filtering,
//   but are sorted AFTER priced entries when a budget is supplied.
//
// NEW (SA realism):
// - For city/suburb + urban driving: bias SUV/MPV, de-bias bakkies.
// - For mixed/long + rough roads + heavy duty: boost bakkies.
// - Deterministic, explainable, no external data.
//
// NEW (Your requirements):
// 1) Roomy + preference !== sedan: NEVER recommend small hatch/city cars
//    (implemented as: token exclusion where available + strong price-floor proxy penalty)
// 2) NEVER return zero vehicles (hard fallback pool in roomy mode)
// 3) Avoid fragile model-name blacklists (token/body heuristics + price proxy)
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

// -------------------------------------------
// Token heuristics
// -------------------------------------------

const ROOMY_OK_TOKENS = [
  "suv",
  "crossover",
  "crossover_suv",
  "crossover suv",
  "mpv",
  "van",
  "minibus",
  "bus",
  "peoplecarrier",
  "people carrier",
  "pickup",
  "bakkie",
  "doublecab",
  "double cab",
  "crew",
  "4x4",
];

const SMALL_DISALLOW_TOKENS = [
  "hatch",
  "hatchback",
  "city",
  "micro",
  "supermini",
  "compact_hatch",
  "compact hatch",
];

const NOT_ROOMY_BODY_TOKENS = ["coupe", "coupé", "convertible", "cabriolet", "roadster", "spyder", "targa"];

const ROOMY_FALLBACK_TOKENS = ["wagon", "estate", "touring", "shooting brake", "fastback", "liftback"];

// Cargo van / work van patterns (avoid in urban commuting shortlists)
const CARGO_VAN_TOKENS = [
  "panel van",
  "panelvan",
  "cargo",
  "delivery",
  "transporter",
  "workhorse",
  "work van",
  "commercial van",
  "lwb",
  "swb",
  "box van",
];

function hasAnyToken(v: any, toks: string[]) {
  const t = tokenText(v);
  return toks.some((tok) => t.includes(tok));
}

function isSmallDisallowed(v: any) {
  return hasAnyToken(v, SMALL_DISALLOW_TOKENS);
}

function isNotRoomyBody(v: any) {
  return hasAnyToken(v, NOT_ROOMY_BODY_TOKENS);
}

function isRoomyEligible(v: any) {
  return hasAnyToken(v, ROOMY_OK_TOKENS);
}

function isRoomyFallbackEligible(v: any) {
  if (isSmallDisallowed(v)) return false;
  if (isNotRoomyBody(v)) return false;
  return hasAnyToken(v, ROOMY_FALLBACK_TOKENS);
}

function isSedanish(v: any) {
  const t = tokenText(v);
  return t.includes("sedan") || t.includes("saloon");
}

function isCargoVanish(v: any) {
  const t = tokenText(v);
  if (!t.includes("van")) return false;
  return CARGO_VAN_TOKENS.some((tok) => t.includes(tok));
}

function isMpvish(v: any) {
  if (isCargoVanish(v)) return false;

  const t = tokenText(v);
  return (
    t.includes("mpv") ||
    t.includes("bus") ||
    t.includes("minibus") ||
    t.includes("peoplecarrier") ||
    t.includes("people carrier") ||
    // Keep "van" as MPV-ish only when it doesn't look like cargo/work van
    t.includes("van")
  );
}

function isBakkieish(v: any) {
  const t = tokenText(v);
  return t.includes("pickup") || t.includes("bakkie") || t.includes("doublecab") || t.includes("double cab");
}

function isSuvish(v: any) {
  const t = tokenText(v);
  return t.includes("suv") || t.includes("crossover");
}

const PERFORMANCE_TOKENS = [
  " amg",
  " amg ",
  " rs",
  " rs ",
  " m ",
  " m-",
  " gti",
  " type r",
  " sti",
  " abarth",
  " cupra",
  " svr",
  " competition",
  " track",
  " performance",
];

function looksPerformance(v: any) {
  const t = ` ${tokenText(v)} `;
  return PERFORMANCE_TOKENS.some((tok) => t.includes(tok));
}

// -------------------------------------------
// Price helpers
// -------------------------------------------

function getPrice(v: any): number | null {
  const p = Number(v?.msrp || 0);
  if (!Number.isFinite(p) || p <= 0) return null;
  return p;
}

// Roomy "price floor" proxy
function getRoomyPriceFloor(input: BriefInput, target: number | null) {
  const baseAbs =
    input.passengers === "large_family" ? 300_000 : input.passengers === "family" ? 250_000 : 200_000;

  if (!target) return baseAbs;

  const frac = Math.round(target * 0.7);
  return Math.max(baseAbs, frac);
}

function abovePriceFloor(v: any, floor: number) {
  const price = Number(v?.msrp || 0);
  if (!Number.isFinite(price) || price <= 0) return false;
  return price >= floor;
}

// Strong "too small for roomy" proxy (without model name blacklists)
function isTooSmallForRoomyByPrice(v: any, input: BriefInput, target: number | null) {
  const price = getPrice(v);
  if (price == null) return false; // unknown stays eligible
  const floor = getRoomyPriceFloor(input, target);
  return price < floor;
}

// -------------------------------------------
// Scoring
// -------------------------------------------

function scoreBasicFit(v: any, input: BriefInput, category: string) {
  let s = 0;

  const suv = isSuvish(v) || isRoomyEligible(v);
  const mpv = isMpvish(v);
  const bakkie = isBakkieish(v);
  const sedan = isSedanish(v);
  const cargoVan = isCargoVanish(v);

  if (category === "sedan" && sedan) s += 8;
  if ((category === "mid_suv" || category === "large_suv") && suv) s += 9;
  if (category === "mpv" && mpv) s += 11;
  if (category === "bakkie" && bakkie) s += 11;

  if (input.environment === "rough") s += bakkie || suv ? 4 : -5;
  if (input.passengers === "family" || input.passengers === "large_family") s += mpv || suv ? 3 : -2;

  if (input.preference === "suv") s += suv ? 2 : -2;
  if (input.preference === "sedan") s += sedan ? 2 : -2;

  const comfortSpace = getComfortSpace(input);
  const needs = getComfortNeeds(input);

  if (comfortSpace === "easy_entry") s += suv || mpv || bakkie ? 2 : -2;
  if (comfortSpace === "roomy") s += isRoomyEligible(v) ? 4 : -2;

  // ✅ Roomy + not sedan: push tiny/entry cars down (deterministic, price-floor proxy)
  const roomyMode = comfortSpace === "roomy" && input.preference !== "sedan";
  if (roomyMode) {
    const target = parseBudgetAmountToNumber(input.budgetAmount);
    if (isTooSmallForRoomyByPrice(v, input, target)) s -= 10;
  }

  if (needs.includes("rear_legroom")) s += mpv ? 2 : suv ? 1 : 0;
  if (needs.includes("big_boot")) s += suv || mpv ? 1 : 0;

  // Sporty/performance: penalise unless enthusiastic
  if (input.drivingStyle !== "enthusiastic" && looksPerformance(v)) s -= 12;
  if (input.drivingStyle === "enthusiastic" && looksPerformance(v)) s += 2;

  // --- SA realism: bakkies are not default for urban commuting ---
  const cityLike = input.environment === "city" || input.environment === "suburb";
  const urbanLike = input.distance === "urban_daily" || input.distance === "very_short";
  const mixedOrLong = input.distance === "mixed" || input.distance === "long_distance";
  const capabilityNeed = input.environment === "rough" || input.drivingStyle === "heavy_duty" || mixedOrLong;

  // City / urban: reward SUV/MPV, push bakkies down unless capability is needed
  if (cityLike && urbanLike) {
    if (suv) s += 3;
    if (mpv) s += 3;

    // ✅ Urban commuting: suppress cargo/work vans
    if (cargoVan) s -= 10;

    if (bakkie) s -= 6;
  }

  // Mixed / long / rough / heavy duty: bakkies become sensible
  if (capabilityNeed) {
    if (bakkie) s += 6;
    if (mpv) s += 1;
    if (suv) s += 1;

    // Still don't let cargo vans dominate
    if (cargoVan) s -= 6;
  }

  return s;
}

// -------------------------------------------
// Ranking (handles unknown msrp safely)
// -------------------------------------------

function sortByScoreThenBudgetDistance(items: any[], scoreMap: Map<string, number>, target: number | null) {
  return items
    .map((v) => {
      const id = getStableId(v) || String(v?.name ?? "");
      const score = scoreMap.get(id) ?? 0;

      const price = getPrice(v);
      const hasPrice = price != null;

      // Unknown prices should not be discarded; they just rank after priced ones when target exists
      const dist = target && hasPrice ? Math.abs((price as number) - target) : target ? 9_999_999 : 0;

      return { v, score, dist, hasPrice, name: String(v?.name ?? "") };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;

      // If we have a target budget, prefer entries that actually have a price
      if (target) {
        if (a.hasPrice !== b.hasPrice) return a.hasPrice ? -1 : 1;
      }

      if (a.dist !== b.dist) return a.dist - b.dist;
      return a.name.localeCompare(b.name);
    })
    .map((x) => x.v);
}

function buildWhy(v: any, input: BriefInput, comfortSpace: string, needs: string[]) {
  const bits: string[] = [];
  const type = prettyVehicleType(v.vehicleType);

  if (comfortSpace === "roomy") bits.push("Roomier body shape bias");
  if (comfortSpace === "easy_entry") bits.push("Higher seat / easier entry");
  if (needs.includes("rear_legroom")) bits.push("Rear-seat comfort bias");
  if (needs.includes("big_boot")) bits.push("Boot-friendly");

  if (comfortSpace === "roomy" && !isRoomyEligible(v) && input.preference !== "sedan") bits.push("Space trade-off");

  const cleaned = Array.from(new Set(bits)).slice(0, 2);
  if (!cleaned.length) return type;
  return `${type} — ${cleaned.join(" • ")}`;
}

// -------------------------------------------
// Budget widening
// Roomy mode: keep below-budget options (down to roomyFloor), widen upwards if needed
// -------------------------------------------

function getBudgetBands(attitude: BriefInput["budget"]) {
  if (attitude === "tight") return [0.12, 0.20, 0.30, 0.45, 0.65, 0.90];
  if (attitude === "balanced") return [0.18, 0.30, 0.45, 0.65, 0.90];
  return [0.30, 0.45, 0.65, 0.90, 1.20];
}

function applyBudgetBand(
  items: any[],
  target: number,
  band: number,
  widenUpOnly: boolean,
  roomyFloor: number
) {
  const rawMin = Math.round(target * (1 - band));
  const min = widenUpOnly ? Math.max(roomyFloor, rawMin) : rawMin;
  const max = Math.round(target * (1 + band));

  const inRange = items.filter((v: any) => {
    const price = getPrice(v);
    if (price == null) return true; // ✅ keep unknown-price entries eligible
    return price >= min && price <= max;
  });

  return { inRange, min, max };
}

// -------------------------------------------
// Shortlist
// -------------------------------------------

function shortlistWithProgressiveFallback(input: BriefInput, category: string) {
  const comfortSpace = getComfortSpace(input);
  const needs = getComfortNeeds(input);
  const roomyMode = comfortSpace === "roomy" && input.preference !== "sedan";

  const target = parseBudgetAmountToNumber(input.budgetAmount);
  const bands = target ? getBudgetBands(input.budget) : [];
  const priceFloor = roomyMode ? getRoomyPriceFloor(input, target) : 0;

  // NOTE: We intentionally start from the full dataset because many vehicleType strings
  // do not include explicit PASSENGER/COMMERCIAL tokens in your catalog.
  const all = queryVehicles({});

  // "Never recommend small hatch/city cars" (token-based where possible)
  const allNonSmall = all.filter((v: any) => !isSmallDisallowed(v));

  let base = all;

  if (roomyMode) {
    base = allNonSmall
      .filter((v: any) => !isNotRoomyBody(v))
      .filter((v: any) => {
        const t = tokenText(v);
        const sedanLike = t.includes("sedan") || t.includes("saloon");
        if (!sedanLike) return true;

        if (isRoomyFallbackEligible(v)) return true;
        return abovePriceFloor(v, priceFloor);
      });

    // ✅ Hard guarantee: NEVER return zero vehicles
    // If we over-filtered, relax to the safe pool (still excludes small tokens)
    if (!base.length) base = allNonSmall;
  }

  const wantMpv = category === "mpv";
  const wantSuv = category === "mid_suv" || category === "large_suv";
  const wantBakkie = category === "bakkie";
  const wantSedan = category === "sedan";

  const categoryGate = base.filter((v: any) => {
    if (wantMpv) return isMpvish(v);
    if (wantBakkie) return isBakkieish(v);
    if (wantSedan) return isSedanish(v);
    if (wantSuv) return isSuvish(v) || isRoomyEligible(v);
    return true;
  });

  const roomyStrict = roomyMode ? base.filter((v: any) => isRoomyEligible(v)) : base;
  const roomyFallback = roomyMode ? base.filter((v: any) => isRoomyFallbackEligible(v)) : base;

  const sets: { name: string; items: any[] }[] = [];
  if (roomyMode) {
    const catPlusStrict = categoryGate.filter((v: any) => roomyStrict.includes(v));
    sets.push({ name: "cat+roomy_strict", items: catPlusStrict });
    sets.push({ name: "roomy_strict", items: roomyStrict });
    sets.push({ name: "roomy_fallback", items: roomyFallback });
    sets.push({ name: "roomy_absolute_safe", items: base });
  } else {
    sets.push({ name: "category", items: categoryGate });
    sets.push({ name: "base", items: base });
  }

  const scoreMap = new Map<string, number>();
  for (const v of base) {
    const id = getStableId(v) || String(v?.name ?? "");
    scoreMap.set(id, scoreBasicFit(v, input, category));
  }

  function rankAndTake(items: any[]) {
    const ranked = sortByScoreThenBudgetDistance(items, scoreMap, target);
    return ranked.slice(0, Math.min(5, ranked.length));
  }

  if (!target) {
    for (const s of sets) {
      if (s.items.length) {
        const chosen = rankAndTake(s.items);
        if (chosen.length) return { chosen, needs, roomyMode, usedUpOnly: false, priceFloor };
      }
    }
    return { chosen: rankAndTake(base), needs, roomyMode, usedUpOnly: false, priceFloor };
  }

  for (const s of sets) {
    if (!s.items.length) continue;

    for (const band of bands) {
      const widenUpOnly = roomyMode;
      const { inRange } = applyBudgetBand(s.items, target, band, widenUpOnly, priceFloor);

      const chosen = rankAndTake(inRange);
      if (chosen.length) return { chosen, needs, roomyMode, usedUpOnly: widenUpOnly, priceFloor };
    }

    const chosen = rankAndTake(s.items);
    if (chosen.length) return { chosen, needs, roomyMode, usedUpOnly: roomyMode, priceFloor };
  }

  return { chosen: rankAndTake(base), needs, roomyMode, usedUpOnly: roomyMode, priceFloor };
}

// -------------------------------------------
// Main generator
// -------------------------------------------

export function generateAdvice(input: BriefInput): Advice {
  const comfortSpace = getComfortSpace(input);

  let category = pickCategory(input.passengers, input.environment, input.preference);
  const fuel = pickFuel(input.distance);

  if (comfortSpace === "easy_entry" && input.preference !== "sedan" && category === "sedan") {
    category = "mid_suv";
  }

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

  const { chosen, needs, roomyMode, usedUpOnly, priceFloor } = shortlistWithProgressiveFallback(input, category);

  const verdict =
    comfortSpace === "roomy" && roomyMode
      ? `${verdictBase} I’m avoiding small hatchback-style and sporty 2-door options. If your budget is tight, I’ll widen upwards to keep things roomy — and only allow sedan-type options above ~R${Math.round(
          priceFloor / 1000
        )}k as a last resort.`
      : comfortSpace === "easy_entry"
      ? `${verdictBase} I’m keeping the shortlist biased toward easier access and a higher seating position.`
      : verdictBase;

  const models = chosen.map((v: any) => ({
    name: v.name,
    why: buildWhy(v, input, comfortSpace, needs),
  }));

  const closing =
    comfortSpace === "roomy"
      ? usedUpOnly
        ? "Want me to widen your budget a bit more to unlock stronger roomy options, or refine this shortlist to the most practical 2–3?"
        : "Want me to narrow it down further (space-first), or widen your budget range to unlock better roomy options?"
      : comfortSpace === "easy_entry"
      ? "Want me to narrow it down further (and prioritise easy entry even more)?"
      : "Want me to narrow it down further?";

  return { intro, insights, verdict, models, closing };
}