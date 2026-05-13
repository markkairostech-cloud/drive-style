import { VehicleRecord } from "./vehicleCatalog";

type ScoreProfile = {
  cityScore: number;
  familyScore: number;
  comfortScore: number;
  easyEntryScore: number;
  bootScore: number;
  runningCostScore: number;
  roughRoadScore: number;
  funScore: number;
  premiumScore: number;
  evSuitabilityScore: number;

  ownershipTier: number;
  familyRealism: number;
  evMaturity: number;
};

function clampScore(v: number) {
  return Math.max(1, Math.min(10, Math.round(v)));
}

const BODY_STYLE_BASELINES: Record<string, ScoreProfile> = {
  hatchback: {
    cityScore: 9,
    familyScore: 3,
    comfortScore: 5,
    easyEntryScore: 3,
    bootScore: 3,
    runningCostScore: 9,
    roughRoadScore: 3,
    funScore: 5,
    premiumScore: 3,
    evSuitabilityScore: 8,
    ownershipTier: 2,
    familyRealism: 4,
    evMaturity: 5,
  },

  sedan: {
    cityScore: 6,
    familyScore: 6,
    comfortScore: 7,
    easyEntryScore: 4,
    bootScore: 6,
    runningCostScore: 6,
    roughRoadScore: 4,
    funScore: 6,
    premiumScore: 6,
    evSuitabilityScore: 7,
    ownershipTier: 5,
    familyRealism: 7,
    evMaturity: 5,
  },

  crossover: {
    cityScore: 7,
    familyScore: 8,
    comfortScore: 7,
    easyEntryScore: 8,
    bootScore: 7,
    runningCostScore: 6,
    roughRoadScore: 6,
    funScore: 5,
    premiumScore: 5,
    evSuitabilityScore: 7,
    ownershipTier: 5,
    familyRealism: 8,
    evMaturity: 6,
  },

  suv_mid: {
    cityScore: 6,
    familyScore: 8,
    comfortScore: 8,
    easyEntryScore: 8,
    bootScore: 8,
    runningCostScore: 5,
    roughRoadScore: 7,
    funScore: 5,
    premiumScore: 6,
    evSuitabilityScore: 6,
    ownershipTier: 6,
    familyRealism: 8,
    evMaturity: 5,
  },

  suv_large: {
    cityScore: 4,
    familyScore: 9,
    comfortScore: 8,
    easyEntryScore: 8,
    bootScore: 9,
    runningCostScore: 3,
    roughRoadScore: 8,
    funScore: 5,
    premiumScore: 7,
    evSuitabilityScore: 4,
    ownershipTier: 7,
    familyRealism: 8,
    evMaturity: 4,
  },

  mpv: {
    cityScore: 4,
    familyScore: 10,
    comfortScore: 8,
    easyEntryScore: 8,
    bootScore: 10,
    runningCostScore: 5,
    roughRoadScore: 5,
    funScore: 2,
    premiumScore: 4,
    evSuitabilityScore: 5,
    ownershipTier: 4,
    familyRealism: 9,
    evMaturity: 4,
  },

  pickup: {
    cityScore: 3,
    familyScore: 6,
    comfortScore: 5,
    easyEntryScore: 7,
    bootScore: 10,
    runningCostScore: 4,
    roughRoadScore: 10,
    funScore: 6,
    premiumScore: 5,
    evSuitabilityScore: 2,
    ownershipTier: 5,
    familyRealism: 5,
    evMaturity: 2,
  },
};

function applyBrandModifiers(scores: ScoreProfile, vehicle: VehicleRecord) {
  const brand = String(vehicle.brand || "").toLowerCase();

  if (["bmw", "audi", "mercedes-benz", "lexus", "volvo"].includes(brand)) {
    scores.premiumScore += 2;
    scores.funScore += 1;
    scores.runningCostScore -= 2;
    scores.ownershipTier += 2;
  }

  if (["porsche", "land rover", "jaguar"].includes(brand)) {
    scores.premiumScore += 3;
    scores.funScore += 2;
    scores.runningCostScore -= 3;
    scores.ownershipTier += 4;
    scores.familyRealism -= 2;
  }

  if (["toyota", "suzuki", "hyundai", "kia", "volkswagen"].includes(brand)) {
    scores.runningCostScore += 1;
    scores.familyRealism += 1;
  }

  if (["toyota", "suzuki"].includes(brand)) {
    scores.runningCostScore += 1;
  }

  if (["mahindra", "ford", "isuzu", "gwm"].includes(brand)) {
    scores.roughRoadScore += 1;
  }

  if (["byd", "tesla"].includes(brand)) {
    scores.evSuitabilityScore += 2;
    scores.evMaturity += 3;
    scores.ownershipTier += 1;
  }
}

function applyVehicleModifiers(scores: ScoreProfile, vehicle: VehicleRecord) {
  const fuel = String(vehicle.fuelType || "").toLowerCase();
  const transmission = String(vehicle.transmission || "").toLowerCase();
  const drivetrain = String(vehicle.drivetrain || "").toLowerCase();
  const body = String(vehicle.bodyStyle || "").toLowerCase();
  const type = String((vehicle as any).vehicleType || "").toLowerCase();

  if (fuel === "electric" || fuel === "ev") {
    scores.cityScore += 1;
    scores.runningCostScore += 2;
    scores.evSuitabilityScore += 4;
    scores.evMaturity += 4;
    scores.ownershipTier += 1;
  }

  if (fuel === "hybrid") {
    scores.runningCostScore += 2;
    scores.evSuitabilityScore += 2;
    scores.evMaturity += 2;
  }

  if (fuel === "diesel") {
    scores.roughRoadScore += 1;
    scores.runningCostScore += 1;
    scores.evSuitabilityScore -= 2;
    scores.evMaturity -= 2;
  }

  if (drivetrain.includes("4x4") || drivetrain.includes("awd")) {
    scores.roughRoadScore += 2;
  }

  if (vehicle.performance === "yes") {
    scores.funScore += 2;
    scores.runningCostScore -= 1;
    scores.ownershipTier += 1;
  }

  if (vehicle.luxury === "yes") {
    scores.premiumScore += 2;
    scores.comfortScore += 1;
    scores.ownershipTier += 2;
  }

  if (vehicle.fuelEfficiency === "yes") {
    scores.runningCostScore += 2;
  }

  if (transmission === "automatic") {
    scores.cityScore += 1;
    scores.comfortScore += 1;
  }

  if (type.includes("commercial")) {
    scores.familyRealism -= 4;
    scores.comfortScore -= 1;
    scores.premiumScore -= 1;
  }

  if (body === "mpv") {
    scores.familyRealism += 1;
  }
}

export function buildVehicleScores(vehicle: VehicleRecord): ScoreProfile {
  const bodyStyle = String(vehicle.bodyStyle || "").toLowerCase();

  const baseline = BODY_STYLE_BASELINES[bodyStyle] || BODY_STYLE_BASELINES["sedan"];

  const scores: ScoreProfile = {
    ...baseline,
  };

  applyBrandModifiers(scores, vehicle);
  applyVehicleModifiers(scores, vehicle);

  Object.keys(scores).forEach((k) => {
    const key = k as keyof ScoreProfile;
    scores[key] = clampScore(scores[key]);
  });

  return scores;
}