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
  comfortNeeds?: Array<
    "easy_in_out" |
    "wide_seats" |
    "rear_legroom" |
    "big_boot"
  >;
  fuelPreference?:
    | "petrol"
    | "diesel"
    | "hybrid"
    | "electric"
    | "none";
};

export type Insight = {
  title: "Fit" | "Cost" | "Lifestyle";
  text: string;
};

export type Advice = {
  intro: string;
  insights: Insight[];
  verdict: string;
  models: {
    name: string;
    why: string;
    msrp?: number | null;
  }[];
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
};

function getNumericScore(value: unknown, fallback = 5) {
  const n = Number(value);

  if (!Number.isFinite(n)) {
    return fallback;
  }

  return n;
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

function isCommercial(v: Vehicle) {
  const type = String(v.vehicleType || "").toLowerCase();

  return type.includes("commercial");
}

function isElectric(v: Vehicle) {
  const fuel = String(v.fuelType || "").toLowerCase();

  return fuel.includes("electric") || fuel === "ev";
}

function isHybrid(v: Vehicle) {
  const fuel = String(v.fuelType || "").toLowerCase();

  return fuel.includes("hybrid");
}

function bodyStyle(v: Vehicle) {
  return String(v.bodyStyle || "").toLowerCase();
}

function brand(v: Vehicle) {
  return String(v.brand || "")
    .trim()
    .toLowerCase();
}

function modelFamily(v: Vehicle) {
  const raw = String(v.model || v.name || "")
    .toLowerCase()
    .replace(/\b(auto|manual|awd|4wd|4x4|dsg|cvt)\b/g, "")
    .replace(/\d+(\.\d+)?/g, "")
    .replace(/[^a-z]/g, "")
    .trim();

  return raw;
}

function scoreVehicle(v: Vehicle, input: BriefInput) {
  let s = 0;

  // PASSENGERS

  if (input.passengers === "alone") {
    s += cityScore(v) * 0.8;
    s += runningCostScore(v) * 0.7;
  }

  if (input.passengers === "couple") {
    s += comfortScore(v) * 0.7;
    s += cityScore(v) * 0.4;
  }

  if (input.passengers === "family") {
    s += familyScore(v) * 1.4;
    s += comfortScore(v);
    s += bootScore(v) * 0.8;
  }

  if (input.passengers === "large_family") {
    s += familyScore(v) * 2;
    s += bootScore(v) * 1.4;
    s += comfortScore(v);
  }

  // ENVIRONMENT

  if (input.environment === "city") {
    s += cityScore(v);

    if (bodyStyle(v) === "pickup") {
      s -= 5;
    }
  }

  if (input.environment === "rough") {
    s += roughRoadScore(v) * 1.5;
  }

  // COMFORT

  if (input.comfortSpace === "roomy") {
    s += comfortScore(v);
    s += bootScore(v);
  }

  if (input.comfortSpace === "easy_entry") {
    s += easyEntryScore(v) * 1.5;
  }

  // DRIVING STYLE

  if (input.drivingStyle === "enthusiastic") {
    s += funScore(v) * 2;
    s += premiumScore(v);
  }

  if (input.drivingStyle === "heavy_duty") {
    s += roughRoadScore(v) * 2;
  }

  // OWNERSHIP

  if (input.ownership === "loves_cars") {
    s += funScore(v) * 1.2;
    s += premiumScore(v);
  }

  if (input.ownership === "appliance") {
    s += runningCostScore(v) * 1.5;
  }

  // FUEL PREFERENCE

  if (input.fuelPreference === "electric") {
    if (isElectric(v)) {
      s += 20;
    } else if (isHybrid(v)) {
      s += 8;
    } else {
      s -= 6;
    }

    s += evScore(v);
  }

  if (input.fuelPreference === "diesel") {
    if (String(v.fuelType || "").toLowerCase() === "diesel") {
      s += 10;
    }
  }

  if (input.fuelPreference === "petrol") {
    if (String(v.fuelType || "").toLowerCase() === "petrol") {
      s += 8;
    }
  }

  // BODY STYLE PREFERENCE

  if (input.preference === "suv") {
    if (bodyStyle(v).includes("suv") || bodyStyle(v).includes("crossover")) {
      s += 10;
    }
  }

  if (input.preference === "sedan") {
    if (bodyStyle(v).includes("sedan")) {
      s += 10;
    }
  }

  if (input.preference === "hatch") {
    if (bodyStyle(v).includes("hatch")) {
      s += 10;
    }
  }

  if (input.preference === "pickup") {
    if (bodyStyle(v).includes("pickup")) {
      s += 14;
    }
  }

  // COMMERCIAL SUPPRESSION

  if (
    isCommercial(v) &&
    input.passengers !== "large_family" &&
    input.drivingStyle !== "heavy_duty"
  ) {
    s -= 12;
  }

  // EMOTIONAL BALANCING

  if (
    input.passengers === "family" ||
    input.passengers === "large_family"
  ) {
    if (isCommercial(v)) {
      s -= 5;
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

  // PASS 1
  // unique brand + unique model family

  for (const item of ranked) {
    const v = item.vehicle;

    const b = brand(v);
    const f = modelFamily(v);

    if (usedBrands.has(b)) {
      continue;
    }

    if (usedFamilies.has(f)) {
      continue;
    }

    usedBrands.add(b);
    usedFamilies.add(f);

    selected.push(v);

    if (selected.length === 3) {
      return selected;
    }
  }

  // PASS 2
  // allow same brand but not same model family

  for (const item of ranked) {
    const v = item.vehicle;

    const f = modelFamily(v);

    if (usedFamilies.has(f)) {
      continue;
    }

    usedFamilies.add(f);

    selected.push(v);

    if (selected.length === 3) {
      return selected;
    }
  }

  return selected;
}

function whyText(v: Vehicle) {
  const parts: string[] = [];

  parts.push(`Family ${familyScore(v)}/10`);
  parts.push(`Comfort ${comfortScore(v)}/10`);
  parts.push(`Running Costs ${runningCostScore(v)}/10`);

  return parts.join(" • ");
}

export function generateAdvice(input: BriefInput): Advice {
  const vehicles = queryVehicles({}) as Vehicle[];

  const ranked = sortVehicles(vehicles, input);

  const shortlist = buildShortlist(ranked);

  return {
    intro:
      "Based on your answers, these are the vehicles that best balance lifestyle fit, ownership experience, comfort, and day-to-day usability.",

    insights: [
      {
        title: "Fit",
        text:
          "Your shortlist is now based on ownership behaviour and real-world usability rather than simple category matching.",
      },
      {
        title: "Cost",
        text:
          "Drive Style now weighs running costs, practicality, and ownership suitability more intelligently.",
      },
      {
        title: "Lifestyle",
        text:
          "Your recommendations are curated to provide different ownership directions worth considering.",
      },
    ],

    verdict:
      "The shortlist below balances intelligence, practicality, emotional ownership fit, and real-world suitability.",

    models: shortlist.map((v) => ({
      name: String(v.name || ""),
      why: whyText(v),
      msrp: v.msrp ?? null,
    })),

    closing:
      "Want me to refine this further around luxury feel, running costs, practicality, or long-term ownership?",
  };
}
