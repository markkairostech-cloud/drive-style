// ===============================
// Drive Style Advisor Engine v4.0
// Structured-data alignment update
//
// Key changes
// - Uses structured dataset fields directly: bodyStyle, fuelType, drivetrain,
//   transmission, performance, luxury, fuelEfficiency.
// - Removes token-heavy body classification from the core scoring path.
// - Strengthens quiz signals that map cleanly to the dataset.
// - Keeps deterministic shortlist generation, unique manufacturers,
//   body-style diversity, and budget-aware ranking.
// - Excludes pickup/MPV by default unless the use case clearly calls for them.
// ===============================

import { queryVehicles, prettyVehicleType } from "./vehicleCatalog";

export type BriefInput = {
  passengers: "alone" | "couple" | "family" | "large_family";
  distance: "very_short" | "urban_daily" | "mixed" | "long_distance";
  budget: "tight" | "balanced" | "flexible";
  budgetAmount?: string;
  budgetType?: "purchase_price" | "monthly_hp" | "monthly_lease";
  ownership: "loves_cars" | "neutral" | "appliance";
  environment: "city" | "suburb" | "rough";
  preference: "suv" | "sedan" | "hatch" | "mpv" | "pickup" | "none";
  drivingStyle: "relaxed" | "balanced" | "enthusiastic" | "heavy_duty";
  comfortSpace?: "compact_ok" | "standard" | "roomy" | "easy_entry";
  comfortNeeds?: Array<"easy_in_out" | "wide_seats" | "rear_legroom" | "big_boot">;
  fuelPreference?: "petrol" | "diesel" | "hybrid" | "none";
};

export type Insight = {
  title: "Fit" | "Cost" | "Lifestyle";
  text: string;
};

export type Advice = {
  intro: string;
  insights: Insight[];
  verdict: string;
  models: { name: string; why: string; msrp?: number | null }[];
  closing: string;
};

type Vehicle = {
  id?: string;
  name?: string;
  brand?: string;
  model?: string;
  features?: string[];
  msrp?: number;
  bodyStyle?: string;
  transmission?: string;
  fuelType?: string;
  drivetrain?: string;
  performance?: string;
  luxury?: string;
  fuelEfficiency?: string;
  vehicleType?: string;
};

type TargetCategory = "sedan" | "mid_suv" | "large_suv" | "mpv" | "bakkie";

function parseBudgetAmountToNumber(inputBudgetAmount?: string, budgetType?: string): number | null {
  const raw = String(inputBudgetAmount || "").trim();
  if (!raw) return null;

  const lower = raw.toLowerCase();
  const type = String(budgetType || "purchase_price").trim().toLowerCase();
  const digits = lower.replace(/[^\d]/g, "");
  if (!digits) return null;

  let n = Number(digits);
  if (type !== "purchase_price") {
  // rough conversion: monthly → total price estimate
  n = n * 72;
}
  if (!Number.isFinite(n) || n <= 0) return null;

  if (lower.includes("k") && n < 100000) n = n * 1000;
  return n;
}

function getStableId(v: Vehicle): string {
  return String(v?.id ?? v?.name ?? "");
}

function getStableBrand(v: Vehicle): string {
  const brand = String(v?.brand ?? "").trim().toLowerCase();
  if (brand) return brand;

  const name = String(v?.name ?? "").trim().toLowerCase();
  return name.split(" ")[0] || "";
}

function getPrice(v: Vehicle): number | null {
  const p = Number(v?.msrp || 0);
  if (!Number.isFinite(p) || p <= 0) return null;
  return p;
}

function normBodyStyle(v: Vehicle): string {
  return String(v?.bodyStyle || "").trim().toLowerCase();
}

function normFuelType(v: Vehicle): string {
  return String(v?.fuelType || "").trim().toLowerCase();
}

function normDrive(v: Vehicle): string {
  return String(v?.drivetrain || "").trim().toLowerCase();
}

function normTransmission(v: Vehicle): string {
  return String(v?.transmission || "").trim().toLowerCase();
}

function isPerformance(v: Vehicle): boolean {
  return String(v?.performance || "").toLowerCase() === "yes";
}

function isLuxury(v: Vehicle): boolean {
  return String(v?.luxury || "").toLowerCase() === "yes";
}

function isFuelEfficient(v: Vehicle): boolean {
  return String(v?.fuelEfficiency || "").toLowerCase() === "yes";
}

function isSedan(v: Vehicle): boolean {
  return normBodyStyle(v) === "sedan";
}

function isHatch(v: Vehicle): boolean {
  return normBodyStyle(v) === "hatchback";
}

function isMpv(v: Vehicle): boolean {
  return normBodyStyle(v) === "mpv";
}

function isPickup(v: Vehicle): boolean {
  return normBodyStyle(v) === "pickup";
}

function isSuv(v: Vehicle): boolean {
  const body = normBodyStyle(v);
  return body === "crossover" || body === "suv_mid" || body === "suv_large";
}

function isLargeSuv(v: Vehicle): boolean {
  return normBodyStyle(v) === "suv_large";
}

function is4x4ish(v: Vehicle): boolean {
  const drive = normDrive(v);
  return drive === "4x4" || drive === "all-wheel";
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

function pickFuelNarrative(distance: BriefInput["distance"], fuelPreference?: BriefInput["fuelPreference"]) {
  if (fuelPreference && fuelPreference !== "none") return fuelPreference;
  if (distance === "long_distance") return "diesel";
  if (distance === "mixed") return "hybrid";
  if (distance === "urban_daily") return "hybrid_or_petrol";
  return "petrol";
}

function pickCategory(input: BriefInput): TargetCategory {

  // Respect explicit body-style preference first
  if (input.preference === "pickup") return "bakkie";
  if (input.preference === "mpv") return "mpv";

  if (input.drivingStyle === "heavy_duty" || input.environment === "rough") {
    if (input.passengers !== "large_family") return "bakkie";
  }

  if (input.passengers === "large_family") return "mpv";

  if (input.preference === "sedan" && input.comfortSpace !== "easy_entry" && input.passengers !== "family") {
    return "sedan";
  }

  if (input.passengers === "family") return "large_suv";

  if (input.preference === "suv" || input.comfortSpace === "easy_entry" || input.comfortSpace === "roomy") {
    return "mid_suv";
  }

  return "mid_suv";
}

function getCatalogQueryForCategory(category: TargetCategory) {
  if (category === "sedan") {
    return { bodyAnyOf: ["SEDAN"] };
  }

  if (category === "mid_suv") {
    return { bodyAnyOf: ["SUV", "CROSSOVER"] };
  }

  if (category === "large_suv") {
    return { bodyAnyOf: ["SUV"] };
  }

  if (category === "mpv") {
    return { bodyAnyOf: ["MPV"] };
  }

  if (category === "bakkie") {
    return { bodyAnyOf: ["PICKUP", "BAKKIE"] };
  }

  return {};
}

function getBudgetBands(attitude: BriefInput["budget"]) {
  if (attitude === "tight") return [0.12, 0.2, 0.3, 0.45, 0.65, 0.9];
  if (attitude === "balanced") return [0.18, 0.3, 0.45, 0.65, 0.9];
  return [0.3, 0.45, 0.65, 0.9, 1.2];
}

function applyBudgetBand(items: Vehicle[], target: number, band: number) {
  const min = Math.round(target * (1 - band));
  const max = target;

  const inRange = items.filter((v) => {
    const price = getPrice(v);
    if (price == null) return true;
    return price >= min && price <= max;
  });

  return { inRange, min, max };
}

function scoreCategoryFit(v: Vehicle, category: TargetCategory) {
  if (category === "sedan") {
    if (isSedan(v)) return 12;
    if (isHatch(v)) return 3;
    if (isSuv(v)) return -1;
    if (isMpv(v) || isPickup(v)) return -8;
  }

  if (category === "mid_suv") {
    if (isSuv(v)) return isLargeSuv(v) ? 9 : 12;
    if (isSedan(v)) return 1;
    if (isHatch(v)) return -2;
    if (isPickup(v) || isMpv(v)) return -4;
  }

  if (category === "large_suv") {
    if (isLargeSuv(v)) return 13;
    if (isSuv(v)) return 11;
    if (isMpv(v)) return 6;
    if (isSedan(v)) return -3;
    if (isHatch(v)) return -6;
    if (isPickup(v)) return -2;
  }

  if (category === "mpv") {
    if (isMpv(v)) return 14;
    if (isLargeSuv(v)) return 7;
    if (isSuv(v)) return 4;
    if (isSedan(v) || isHatch(v)) return -8;
    if (isPickup(v)) return -4;
  }

  if (category === "bakkie") {
    if (isPickup(v)) return 14;
    if (isSuv(v)) return 4;
    if (isMpv(v)) return 1;
    return -6;
  }

  return 0;
}

function scoreBasicFit(v: Vehicle, input: BriefInput, category: TargetCategory) {
  let s = 0;

  const comfortSpace = getComfortSpace(input);
  const needs = getComfortNeeds(input);
  const fuelType = normFuelType(v);
  const transmission = normTransmission(v);

  s += scoreCategoryFit(v, category);

  // Passengers
  if (input.passengers === "alone") {
    if (isHatch(v)) s += 3;
    if (isSedan(v)) s += 2;
    if (isMpv(v)) s -= 5;
  }

  if (input.passengers === "couple") {
    if (isSedan(v) || isSuv(v)) s += 2;
    if (isMpv(v)) s -= 3;
  }

  if (input.passengers === "family") {
    if (isSuv(v)) s += 4;
    if (isMpv(v)) s += 3;
    if (isHatch(v)) s -= 4;
  }

  if (input.passengers === "large_family") {
    if (isMpv(v)) s += 8;
    if (isLargeSuv(v)) s += 4;
    if (!isMpv(v) && !isLargeSuv(v)) s -= 8;
  }

  // Body style preference
  if (input.preference === "suv") {
    if (isSuv(v)) s += 5;
    if (isSedan(v)) s -= 2;
    if (isHatch(v)) s -= 2;
  }

  if (input.preference === "sedan") {
    if (isSedan(v)) s += 5;
    if (isSuv(v)) s -= 2;
    if (isPickup(v)) s -= 5;
  }

  // Environment
  if (input.environment === "city") {
    if (isHatch(v) || isSedan(v)) s += 2;
    if (isPickup(v)) s -= 5;
  }

  if (input.environment === "suburb") {
    if (isSuv(v)) s += 2;
    if (isSedan(v)) s += 1;
  }

  if (input.environment === "rough") {
    if (isPickup(v)) s += 6;
    if (isSuv(v)) s += 4;
    if (is4x4ish(v)) s += 4;
    if (isSedan(v)) s -= 4;
    if (isHatch(v)) s -= 6;
  }

  // Distance -> fuel type + efficiency
  if (input.distance === "very_short") {
    if (fuelType === "petrol") s += 3;
    if (fuelType === "diesel") s -= 4;
    if (isFuelEfficient(v)) s += 2;
  }

  if (input.distance === "urban_daily") {
    if (fuelType === "hybrid" || fuelType === "petrol") s += 2;
    if (fuelType === "diesel") s -= 2;
    if (isFuelEfficient(v)) s += 3;
    if (isPickup(v)) s -= 4;
  }

  if (input.distance === "mixed") {
    if (fuelType === "hybrid") s += 4;
    if (fuelType === "petrol") s += 1;
    if (isFuelEfficient(v)) s += 2;
  }

  if (input.distance === "long_distance") {
    if (fuelType === "diesel") s += 5;
    if (isFuelEfficient(v)) s += 2;
    if (isSedan(v) || isSuv(v)) s += 1;
  }

  // Explicit fuel preference
  if (input.fuelPreference === "petrol") {
    if (fuelType === "petrol") s += 6;
    else s -= 2;
  }

  if (input.fuelPreference === "diesel") {
    if (fuelType === "diesel") s += 7;
    else s -= 2;
  }

  if (input.fuelPreference === "hybrid") {
    if (fuelType === "hybrid") s += 8;
    else s -= 2;
  }

  // Comfort / practicality
  if (comfortSpace === "compact_ok") {
    if (isHatch(v)) s += 4;
    if (isMpv(v) || isPickup(v)) s -= 2;
  }

  if (comfortSpace === "roomy") {
    if (isMpv(v)) s += 6;
    if (isSuv(v)) s += 5;
    if (isSedan(v)) s += 2;
    if (isHatch(v)) s -= 8;
  }

  if (comfortSpace === "easy_entry") {
    if (isSuv(v) || isMpv(v) || isPickup(v)) s += 5;
    if (isSedan(v) || isHatch(v)) s -= 3;
  }

  if (needs.includes("easy_in_out")) {
    if (isSuv(v) || isMpv(v) || isPickup(v)) s += 4;
    else s -= 1;
  }

  if (needs.includes("wide_seats")) {
    if (isLargeSuv(v) || isMpv(v) || isPickup(v)) s += 4;
    else if (isSuv(v)) s += 2;
  }

  if (needs.includes("rear_legroom")) {
    if (isMpv(v)) s += 5;
    if (isSedan(v) || isSuv(v)) s += 2;
    if (isHatch(v)) s -= 2;
  }

  if (needs.includes("big_boot")) {
    if (isMpv(v)) s += 5;
    if (isPickup(v)) s += 4;
    if (isSuv(v)) s += 3;
    if (isSedan(v)) s += 1;
    if (isHatch(v)) s -= 1;
  }

  // Driving style -> performance + capability
  if (input.drivingStyle === "relaxed") {
    if (!isPerformance(v)) s += 2;
    if (isPerformance(v)) s -= 3;
  }

  if (input.drivingStyle === "balanced") {
    if (isPerformance(v)) s += 1;
  }

  if (input.drivingStyle === "enthusiastic") {
    if (isPerformance(v)) s += 6;
    if (transmission === "manual") s += 1;
    if (isMpv(v)) s -= 2;
  }

  if (input.drivingStyle === "heavy_duty") {
    if (isPickup(v)) s += 8;
    if (is4x4ish(v)) s += 5;
    if (fuelType === "diesel") s += 2;
  }

  // Ownership personality
  if (input.ownership === "loves_cars") {
    if (isPerformance(v)) s += 3;
    if (isLuxury(v)) s += 2;
  }

  if (input.ownership === "appliance") {
    if (isFuelEfficient(v)) s += 3;
    if (!isLuxury(v)) s += 1;
    if (isPerformance(v)) s -= 3;
  }

  return s;
}

function sortByScoreThenBudgetDistance(items: Vehicle[], scoreMap: Map<string, number>, target: number | null) {
  return items
    .map((v) => {
      const id = getStableId(v);
      const score = scoreMap.get(id) ?? 0;
      const price = getPrice(v);
      const hasPrice = price != null;
      const dist = target && hasPrice ? Math.abs((price as number) - target) : target ? 9_999_999 : 0;

      return { v, score, dist, hasPrice, name: String(v?.name ?? "") };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (target && a.hasPrice !== b.hasPrice) return a.hasPrice ? -1 : 1;
      if (a.dist !== b.dist) return a.dist - b.dist;
      return a.name.localeCompare(b.name);
    })
    .map((x) => x.v);
}

function shouldAllowMpv(input: BriefInput, category: TargetCategory) {
  const needs = getComfortNeeds(input);
  return (
    category === "mpv" ||
    input.passengers === "large_family" ||
    input.comfortSpace === "roomy" ||
    needs.includes("rear_legroom") ||
    needs.includes("big_boot")
  );
}

function shouldAllowPickup(input: BriefInput, category: TargetCategory) {
  return category === "bakkie" || input.environment === "rough" || input.drivingStyle === "heavy_duty";
}

function shortlistWithProgressiveFallback(input: BriefInput, category: TargetCategory) {
  const comfortSpace = getComfortSpace(input);
  const needs = getComfortNeeds(input);
  const customerBudget = parseBudgetAmountToNumber(input.budgetAmount, input.budgetType);
  const target = customerBudget ? Math.round(customerBudget * 0.9) : null;
  const bands = target ? getBudgetBands(input.budget) : [];

  const all = (queryVehicles(getCatalogQueryForCategory(category)) as Vehicle[]) || queryVehicles({});
    const base = all.filter((v) => {
    if (!shouldAllowPickup(input, category) && isPickup(v)) return false;
    if (!shouldAllowMpv(input, category) && isMpv(v)) return false;
    return true;
  });

  const budgetCapped = target
    ? base.filter((v) => {
        const price = getPrice(v);
        if (price == null) return true;
        return price <= target;
      })
    : base;

  const structuredRoomyBase =
    comfortSpace === "roomy" && input.preference !== "sedan"
      ? budgetCapped.filter((v) => !isHatch(v))
      : budgetCapped;

  const scoreMap = new Map<string, number>();
  for (const v of structuredRoomyBase) {
    scoreMap.set(getStableId(v), scoreBasicFit(v, input, category));
  }

  const categoryGate = structuredRoomyBase.filter((v) => {
    if (category === "sedan") return isSedan(v) || isHatch(v);
    if (category === "mid_suv") return isSuv(v) || isSedan(v);
    if (category === "large_suv") return isSuv(v) || isMpv(v);
    if (category === "mpv") return isMpv(v) || isLargeSuv(v) || isSuv(v);
    if (category === "bakkie") return isPickup(v) || isSuv(v);
    return true;
  });

  const sets: Vehicle[][] = [categoryGate, structuredRoomyBase, budgetCapped, base, all];

  function getStyleBucket(v: Vehicle) {
    const body = normBodyStyle(v);
    if (body === "crossover" || body === "suv_mid" || body === "suv_large") return "suv";
    return body || "other";
  }

  function rankAndTake(items: Vehicle[]) {
    const ranked = sortByScoreThenBudgetDistance(items, scoreMap, target);
    const chosen: Vehicle[] = [];
    const seenBrands = new Set<string>();
    const seenStyles = new Set<string>();

    for (const v of ranked) {
      const brand = getStableBrand(v);
      const style = getStyleBucket(v);
      if (!brand || seenBrands.has(brand)) continue;
      if (seenStyles.has(style)) continue;

      seenBrands.add(brand);
      seenStyles.add(style);
      chosen.push(v);

      if (chosen.length === 3) break;
    }

    if (chosen.length < 3) {
      for (const v of ranked) {
        const brand = getStableBrand(v);
        if (!brand || seenBrands.has(brand)) continue;

        seenBrands.add(brand);
        chosen.push(v);

        if (chosen.length === 3) break;
      }
    }

    if (chosen.length < 3) {
      for (const v of ranked) {
        if (chosen.includes(v)) continue;
        chosen.push(v);
        if (chosen.length === 3) break;
      }
    }

    return chosen;
  }

  if (!target) {
    for (const set of sets) {
      if (!set.length) continue;
      const chosen = rankAndTake(set);
      if (chosen.length) return { chosen, needs, comfortSpace };
    }
    return { chosen: [], needs, comfortSpace };
  }

  for (const set of sets) {
    if (!set.length) continue;

    for (const band of bands) {
      const { inRange } = applyBudgetBand(set, target, band);
      const chosen = rankAndTake(inRange);
      if (chosen.length) return { chosen, needs, comfortSpace };
    }

    const chosen = rankAndTake(set);
    if (chosen.length) return { chosen, needs, comfortSpace };
  }

  return { chosen: rankAndTake(all), needs, comfortSpace };
}

function buildWhy(v: Vehicle, input: BriefInput, comfortSpace: string, needs: string[]) {
  const bits: string[] = [];
  const type = prettyVehicleType?.(v.vehicleType || "") || prettyBodyStyle(v);

  if (isSuv(v)) bits.push("SUV / crossover shape");
  if (isSedan(v)) bits.push("sedan shape");
  if (isMpv(v)) bits.push("space-first body");
  if (isPickup(v)) bits.push("capability-first body");

  const fuelType = normFuelType(v);
  if (input.fuelPreference !== "none" && input.fuelPreference === fuelType) bits.push(`${fuelType} match`);
  else if (isFuelEfficient(v)) bits.push("good efficiency bias");

  if (comfortSpace === "roomy" && (isSuv(v) || isMpv(v) || isLargeSuv(v))) bits.push("roomier fit");
  if (comfortSpace === "easy_entry" && (isSuv(v) || isMpv(v) || isPickup(v))) bits.push("easier entry");
  if (needs.includes("rear_legroom") && (isSedan(v) || isSuv(v) || isMpv(v))) bits.push("rear-seat bias");
  if (needs.includes("big_boot") && (isSuv(v) || isMpv(v) || isPickup(v))) bits.push("boot-friendly");
  if (input.drivingStyle === "enthusiastic" && isPerformance(v)) bits.push("stronger performance bias");

  const cleaned = Array.from(new Set(bits)).slice(0, 2);
  if (!cleaned.length) return type;
  return `${type} — ${cleaned.join(" • ")}`;
}

function prettyBodyStyle(v: Vehicle) {
  const body = normBodyStyle(v);
  if (body === "crossover") return "Crossover";
  if (body === "suv_mid") return "Mid-size SUV";
  if (body === "suv_large") return "Large SUV";
  if (body === "mpv") return "MPV";
  if (body === "pickup") return "Pickup / bakkie";
  if (body === "sedan") return "Sedan";
  if (body === "hatchback") return "Hatchback";
  return "Vehicle";
}

export function generateAdvice(input: BriefInput): Advice {
  console.log("INPUT PREFERENCE:", input.preference);
  const category = pickCategory(input);
  console.log("CATEGORY SELECTED:", category);
  const fuelNarrative = pickFuelNarrative(input.distance, input.fuelPreference);
  const { chosen, needs, comfortSpace } = shortlistWithProgressiveFallback(input, category);

  const intro =
    "Thanks — based on your answers, here’s the direction that best fits your day-to-day use and the ownership experience you’re aiming for.";

  const fitText =
    category === "sedan"
      ? "A sedan bias makes sense here — simple to live with, comfortable enough for daily use, and aligned to lighter passenger and practicality needs."
      : category === "mid_suv"
      ? "A crossover / mid-size SUV is the sweet spot here — easier access, useful ride height, and everyday practicality without feeling oversized."
      : category === "large_suv"
      ? "Your answers lean toward a larger SUV — more flexibility for passengers, better day-to-day compromise for family life, and less risk of undersizing."
      : category === "mpv"
      ? "Your answers point clearly toward MPV practicality — when people and luggage add up, the shape matters more than image."
      : "Your answers point toward a capable pickup / bakkie-style shortlist — the use case is asking for durability and rough-road confidence.";

  const costText =
    fuelNarrative === "diesel"
      ? "Diesel is favoured here because your use leans longer-distance or more capability-focused, where relaxed cruising and range matter more."
      : fuelNarrative === "hybrid"
      ? "Hybrid is favoured here because your use pattern suits efficiency gains without forcing a big change in routine."
      : fuelNarrative === "hybrid_or_petrol"
      ? "For stop-start daily use, efficient petrols and hybrids make the most sense — easier to live with and better matched to urban driving."
      : "Petrol remains the simplest fit here — especially where trips are shorter or flexibility matters more than chasing the most specialised fuel type.";

  const lifestyleText =
    input.drivingStyle === "enthusiastic"
      ? "Because you enjoy driving, the shortlist gives more credit to vehicles with stronger performance character."
      : input.drivingStyle === "heavy_duty"
      ? "Because capability matters more than novelty here, the shortlist gives more credit to durability, drivetrain confidence, and working ability."
      : input.ownership === "appliance"
      ? "Because you want transport more than theatre, the shortlist leans toward simpler, easier ownership."
      : "Because this needs to work in real life first, the shortlist is biased toward sensible everyday fit rather than novelty.";

  const insights: Insight[] = [
    { title: "Fit", text: fitText },
    { title: "Cost", text: costText },
    { title: "Lifestyle", text: lifestyleText },
  ];

  const verdictBase =
    category === "sedan"
      ? "Keep it simple: a well-matched sedan should do the job without unnecessary complexity."
      : category === "mid_suv"
      ? "The smart middle ground here is a good crossover / SUV — practical, flexible, and less compromised for day-to-day life."
      : category === "large_suv"
      ? "Your brief is asking for genuine family-friendly space, so it makes sense to stay on the roomier side."
      : category === "mpv"
      ? "If space is truly part of the brief, owning that decision usually beats trying to fake it with a smaller shape."
      : "Buy the right tool for the job: when roads or workload get tougher, capability pays for itself later.";

  const verdict =
    comfortSpace === "roomy"
      ? `${verdictBase} I’m also keeping the shortlist biased away from small hatchback-style options.`
      : comfortSpace === "easy_entry"
      ? `${verdictBase} I’m also biasing the shortlist toward easier entry and a higher seating position.`
      : verdictBase;

  const models = chosen.map((v) => ({
    name: String(v.name ?? ""),
    why: buildWhy(v, input, comfortSpace, needs),
    msrp: v.msrp ?? null,
  }));

  const closing =
    comfortSpace === "roomy"
      ? "Want me to refine this further toward the most spacious options, or tighten it around best-value picks?"
      : comfortSpace === "easy_entry"
      ? "Want me to refine this even further around easier access and higher seating?"
      : "Want me to narrow this down even further?";

  return { intro, insights, verdict, models, closing };
}
