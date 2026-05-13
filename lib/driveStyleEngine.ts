import { queryVehicles } from "./vehicleCatalog";

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
  fuelPreference?: "petrol" | "diesel" | "hybrid" | "electric" | "none";
};

export type Insight = {
  title: "Fit" | "Cost" | "Lifestyle";
  text: string;
};

export type Advice = {
  intro: string;
  insights: Insight[];
  verdict: string;
  models: { name: string; why: string; msrp?: number | null; tags?: string[] }[];
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

  cityScore?: number;
  familyScore?: number;
  comfortScore?: number;
  easyEntryScore?: number;
  bootScore?: number;
  runningCostScore?: number;
  roughRoadScore?: number;
  funScore?: number;
  premiumScore?: number;
  evSuitabilityScore?: number;

  ownershipTier?: number;
  familyRealism?: number;
  evMaturity?: number;
};

function getNumericScore(value: unknown, fallback = 5) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function cityScore(v: Vehicle) {
  return getNumericScore(v.cityScore);
}

function familyScore(v: Vehicle) {
  return getNumericScore(v.familyScore);
}

function comfortScore(v: Vehicle) {
  return getNumericScore(v.comfortScore);
}

function easyEntryScore(v: Vehicle) {
  return getNumericScore(v.easyEntryScore);
}

function bootScore(v: Vehicle) {
  return getNumericScore(v.bootScore);
}

function runningCostScore(v: Vehicle) {
  return getNumericScore(v.runningCostScore);
}

function roughRoadScore(v: Vehicle) {
  return getNumericScore(v.roughRoadScore);
}

function funScore(v: Vehicle) {
  return getNumericScore(v.funScore);
}

function premiumScore(v: Vehicle) {
  return getNumericScore(v.premiumScore);
}

function evScore(v: Vehicle) {
  return getNumericScore(v.evSuitabilityScore);
}

function ownershipTier(v: Vehicle) {
  return getNumericScore(v.ownershipTier);
}

function familyRealism(v: Vehicle) {
  return getNumericScore(v.familyRealism);
}

function evMaturity(v: Vehicle) {
  return getNumericScore(v.evMaturity);
}

function bodyStyle(v: Vehicle) {
  return String(v.bodyStyle || "").toLowerCase();
}

function fuelType(v: Vehicle) {
  return String(v.fuelType || "").toLowerCase();
}

function brand(v: Vehicle) {
  return String(v.brand || "").trim().toLowerCase();
}

function isElectric(v: Vehicle) {
  const fuel = fuelType(v);
  return fuel.includes("electric") || fuel === "ev";
}

function isHybrid(v: Vehicle) {
  return fuelType(v).includes("hybrid");
}

function isCommercial(v: Vehicle) {
  return String(v.vehicleType || "").toLowerCase().includes("commercial");
}

function modelFamily(v: Vehicle) {
  return String(v.model || v.name || "")
    .toLowerCase()
    .replace(/\b(auto|manual|awd|4wd|4x4|dsg|cvt|at|mt)\b/g, "")
    .replace(/\d+(\.\d+)?/g, "")
    .replace(/[^a-z]/g, "")
    .trim();
}

function parseBudgetAmountToNumber(inputBudgetAmount?: string, budgetType?: string): number | null {
  const raw = String(inputBudgetAmount || "").trim();

  if (!raw) return null;

  const lower = raw.toLowerCase();
  const type = String(budgetType || "purchase_price").trim().toLowerCase();
  const digits = lower.replace(/[^\d]/g, "");

  if (!digits) return null;

  let n = Number(digits);

  if (type !== "purchase_price") {
    n = n * 72;
  }

  if (!Number.isFinite(n) || n <= 0) return null;

  if (lower.includes("k") && n < 100000) {
    n = n * 1000;
  }

  return n;
}

function price(v: Vehicle) {
  const p = Number(v.msrp || 0);
  return Number.isFinite(p) && p > 0 ? p : null;
}

function expectedOwnershipTier(input: BriefInput) {
  let tier = 5;

  if (input.budget === "tight") tier -= 2;
  if (input.budget === "flexible") tier += 2;

  if (input.ownership === "appliance") tier -= 1;
  if (input.ownership === "loves_cars") tier += 1;

  if (input.drivingStyle === "enthusiastic") tier += 1;

  return Math.max(1, Math.min(10, tier));
}

function priceRealismScore(v: Vehicle, input: BriefInput) {
  const p = price(v);
  const explicitBudget = parseBudgetAmountToNumber(input.budgetAmount, input.budgetType);

  if (!p && !explicitBudget) return 0;

  if (explicitBudget && p) {
    const ratio = p / explicitBudget;

    if (ratio > 1.15 && input.budget !== "flexible") return -20;
    if (ratio > 1.25) return -18;
    if (ratio > 1.1) return -8;

    if (ratio >= 0.85 && ratio <= 1.0) return 14;
    if (ratio >= 0.7 && ratio < 0.85) return 7;
    if (ratio >= 0.5 && ratio < 0.7) return 1;
    if (ratio < 0.5 && explicitBudget >= 600000) return -8;

    return 0;
  }

  if (!p) return 0;

  if (input.budget === "tight") {
    if (p <= 300000) return 8;
    if (p <= 450000) return 2;
    if (p <= 650000) return -4;
    return -12;
  }

  if (input.budget === "balanced") {
    if (p <= 650000) return 6;
    if (p <= 950000) return 1;
    if (p <= 1300000) return -5;
    return -14;
  }

  if (input.budget === "flexible") {
    if (p <= 1200000) return 5;
    if (p <= 1800000) return 1;
    if (input.ownership === "loves_cars") return -1;
    return -6;
  }

  return 0;
}

function scoreVehicle(v: Vehicle, input: BriefInput) {
  let s = 0;

  const targetTier = expectedOwnershipTier(input);
  const vehicleTier = ownershipTier(v);
  const tierGap = Math.abs(vehicleTier - targetTier);

  s -= tierGap * 1.5;
  s += priceRealismScore(v, input);

  if (input.passengers === "alone") {
    s += cityScore(v) * 0.8;
    s += runningCostScore(v) * 0.8;
  }

  if (input.passengers === "couple") {
    s += comfortScore(v) * 0.8;
    s += cityScore(v) * 0.4;
    s += funScore(v) * 0.3;
  }

  if (input.passengers === "family") {
    s += familyScore(v) * 1.4;
    s += familyRealism(v) * 1.2;
    s += comfortScore(v);
    s += bootScore(v) * 0.8;
  }

  if (input.passengers === "large_family") {
    s += familyScore(v) * 2;
    s += familyRealism(v) * 1.5;
    s += bootScore(v) * 1.4;
    s += comfortScore(v);
  }

  if (input.environment === "city") {
    s += cityScore(v);

    if (bodyStyle(v) === "pickup") {
      s -= 6;
    }
  }

  if (input.environment === "rough") {
    s += roughRoadScore(v) * 1.7;
  }

  if (input.distance === "very_short" || input.distance === "urban_daily") {
    s += cityScore(v) * 0.6;
    s += runningCostScore(v) * 0.5;
  }

  if (input.distance === "long_distance") {
    s += comfortScore(v) * 0.7;

    if (fuelType(v) === "diesel") {
      s += 4;
    }
  }

  if (input.comfortSpace === "roomy") {
    s += comfortScore(v);
    s += bootScore(v);
  }

  if (input.comfortSpace === "easy_entry") {
    s += easyEntryScore(v) * 1.5;
  }

  const needs = input.comfortNeeds || [];

  if (needs.includes("rear_legroom")) {
    s += familyScore(v) * 0.7;
    s += comfortScore(v) * 0.5;
  }

  if (needs.includes("big_boot")) {
    s += bootScore(v);
  }

  if (needs.includes("easy_in_out")) {
    s += easyEntryScore(v);
  }

  if (input.drivingStyle === "enthusiastic") {
    s += funScore(v) * 2;
    s += premiumScore(v);
  }

  if (input.drivingStyle === "heavy_duty") {
    s += roughRoadScore(v) * 2;
  }

  if (input.ownership === "loves_cars") {
    s += funScore(v) * 1.2;
    s += premiumScore(v);
  }

  if (input.ownership === "appliance") {
    s += runningCostScore(v) * 1.5;
    s -= premiumScore(v) * 0.5;
  }

  if (input.fuelPreference === "electric") {
    if (isElectric(v)) {
      s += 35;
    } else if (isHybrid(v)) {
      s += 14;
    } else {
      s -= 25;
    }

    s += evScore(v) * 1.5;
    s += evMaturity(v) * 1.2;
  }

  if (input.fuelPreference === "hybrid") {
    if (isHybrid(v)) {
      s += 18;
    } else if (isElectric(v)) {
      s += 8;
    } else {
      s -= 8;
    }
  }

  if (input.fuelPreference === "diesel") {
    if (fuelType(v) === "diesel") {
      s += 12;
    } else {
      s -= 4;
    }
  }

  if (input.fuelPreference === "petrol") {
    if (fuelType(v) === "petrol") {
      s += 10;
    } else {
      s -= 4;
    }
  }

  if (input.preference === "suv") {
    if (bodyStyle(v).includes("suv") || bodyStyle(v).includes("crossover")) s += 10;
    else s -= 4;
  }

  if (input.preference === "sedan") {
    if (bodyStyle(v).includes("sedan")) s += 10;
    else s -= 4;
  }

  if (input.preference === "hatch") {
    if (bodyStyle(v).includes("hatch")) s += 10;
    else s -= 4;
  }

  if (input.preference === "mpv") {
    if (bodyStyle(v).includes("mpv")) s += 14;
    else s -= 3;
  }

  if (input.preference === "pickup") {
    if (bodyStyle(v).includes("pickup")) s += 16;
    else s -= 8;
  }

  if (isCommercial(v)) {
    if (input.drivingStyle === "heavy_duty") {
      s += 2;
    } else if (input.passengers === "large_family") {
      s -= 8;
    } else {
      s -= 18;
    }
  }

  if ((input.passengers === "family" || input.passengers === "large_family") && vehicleTier >= 9) {
    if (input.budget !== "flexible" || input.ownership !== "loves_cars") {
      s -= 12;
    }
  }

  return s;
}

function sortVehicles(items: Vehicle[], input: BriefInput) {
  return items
    .map((vehicle) => ({
      vehicle,
      score: scoreVehicle(vehicle, input),
    }))
    .sort((a, b) => b.score - a.score);
}

function buildShortlist(ranked: { vehicle: Vehicle; score: number }[]) {
  const selected: Vehicle[] = [];
  const usedBrands = new Set<string>();
  const usedFamilies = new Set<string>();

  for (const item of ranked) {
    const v = item.vehicle;
    const b = brand(v);
    const f = modelFamily(v);

    if (usedBrands.has(b)) continue;
    if (usedFamilies.has(f)) continue;

    usedBrands.add(b);
    usedFamilies.add(f);
    selected.push(v);

    if (selected.length === 3) return selected;
  }

  for (const item of ranked) {
    const v = item.vehicle;
    const f = modelFamily(v);

    if (usedFamilies.has(f)) continue;
    if (selected.includes(v)) continue;

    usedFamilies.add(f);
    selected.push(v);

    if (selected.length === 3) return selected;
  }

  return selected;
}

function whyText(v: Vehicle, input: BriefInput) {
  if (input.fuelPreference === "electric" && (isElectric(v) || isHybrid(v))) {
    return `EV Fit ${evScore(v)}/10 • Running Costs ${runningCostScore(v)}/10 • Comfort ${comfortScore(v)}/10`;
  }

  if (input.passengers === "family" || input.passengers === "large_family") {
    return `Family ${familyScore(v)}/10 • Comfort ${comfortScore(v)}/10 • Practicality ${bootScore(v)}/10`;
  }

  if (input.drivingStyle === "heavy_duty") {
    return `Capability ${roughRoadScore(v)}/10 • Practicality ${bootScore(v)}/10 • Running Costs ${runningCostScore(v)}/10`;
  }

  if (input.drivingStyle === "enthusiastic" || input.ownership === "loves_cars") {
    return `Fun ${funScore(v)}/10 • Premium Feel ${premiumScore(v)}/10 • Comfort ${comfortScore(v)}/10`;
  }

  return `City ${cityScore(v)}/10 • Running Costs ${runningCostScore(v)}/10 • Comfort ${comfortScore(v)}/10`;
}

function buildVehicleTags(v: Vehicle, input: BriefInput) {
  const tags: string[] = [];

  if (input.passengers === "family" || input.passengers === "large_family") {
    if (familyScore(v) >= 7) tags.push("Family ready");
    if (bootScore(v) >= 7) tags.push("Practical space");
    if (comfortScore(v) >= 7) tags.push("Daily comfort");
  }

  if (input.distance === "long_distance") {
    if (comfortScore(v) >= 7) tags.push("Long-distance comfort");
    if (fuelType(v) === "diesel" || runningCostScore(v) >= 7) tags.push("Efficient cruising");
  }

  if (input.environment === "city") {
    if (cityScore(v) >= 7) tags.push("City friendly");
    if (runningCostScore(v) >= 7) tags.push("Low running stress");
  }

  if (input.environment === "rough" || input.drivingStyle === "heavy_duty") {
    if (roughRoadScore(v) >= 7) tags.push("Road confidence");
    if (bootScore(v) >= 7) tags.push("Utility strength");
  }

  if (input.drivingStyle === "enthusiastic" || input.ownership === "loves_cars") {
    if (funScore(v) >= 7) tags.push("Driver appeal");
    if (premiumScore(v) >= 7) tags.push("Premium feel");
  }

  if (input.fuelPreference === "electric") {
    if (isElectric(v)) tags.push("Electric fit");
    if (isHybrid(v)) tags.push("Hybrid bridge");
    if (evMaturity(v) >= 7) tags.push("EV maturity");
  }

  if (input.ownership === "appliance") {
    if (runningCostScore(v) >= 7) tags.push("Low-fuss ownership");
    if (comfortScore(v) >= 7) tags.push("Easy daily use");
  }

  if (premiumScore(v) >= 8 && input.budget !== "tight") {
    tags.push("Executive presence");
  }

  if (tags.length === 0) {
    tags.push("Balanced fit", "Ownership confidence");
  }

  return Array.from(new Set(tags)).slice(0, 3);
}

export function generateAdvice(input: BriefInput): Advice {
  const vehicles = queryVehicles({}) as Vehicle[];
  const ranked = sortVehicles(vehicles, input);
  const shortlist = buildShortlist(ranked);

  const evMode = input.fuelPreference === "electric";
  const familyMode = input.passengers === "family" || input.passengers === "large_family";
  const heavyDutyMode = input.drivingStyle === "heavy_duty";

  return {
    intro:
      "Based on your answers, these are the vehicles that best balance lifestyle fit, ownership experience, comfort, and day-to-day usability.",

    insights: [
      {
        title: "Fit",
        text: evMode
          ? "Because you selected electric, the shortlist gives strong priority to EV and electrified ownership fit."
          : familyMode
          ? "Because passenger and practicality needs matter here, the shortlist balances space with realistic family ownership."
          : heavyDutyMode
          ? "Because capability matters, the shortlist favours vehicles with stronger rough-road and utility suitability."
          : "Your shortlist is based on ownership behaviour and real-world usability rather than simple category matching.",
      },
      {
        title: "Cost",
        text:
          "Drive Style now weighs budget mindset, ownership tier, likely running costs, and price realism when shaping the shortlist.",
      },
      {
        title: "Lifestyle",
        text:
          "Your recommendations are curated to avoid repetitive variants and provide different ownership directions worth considering.",
      },
    ],

    verdict: evMode
      ? "The best fit here should make electric or electrified ownership feel practical, not just interesting on paper."
      : familyMode
      ? "The best family choice is not simply the biggest vehicle — it should balance space, comfort, cost, and everyday liveability."
      : heavyDutyMode
      ? "The shortlist below prioritises capability, durability, and practical ownership confidence."
      : "The shortlist below balances intelligence, practicality, emotional ownership fit, and real-world suitability.",

    models: shortlist.map((v) => ({
      name: String(v.name || ""),
      why: whyText(v, input),
      msrp: v.msrp ?? null,
      tags: buildVehicleTags(v, input),
    })),

    closing:
      "Want me to refine this further around luxury feel, running costs, practicality, or long-term ownership?",
  };
}