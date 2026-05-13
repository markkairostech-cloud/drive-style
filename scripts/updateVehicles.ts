import fs from "fs";
import path from "path";

import { createVehicleMatchKey } from "../lib/vehicleIdentity";
import { buildVehicleScores } from "../lib/vehicleScoring";

type VehicleStatus =
  | "active"
  | "new_auto_added"
  | "needs_review"
  | "missing_this_month"
  | "discontinued";

type VehicleRecord = {
  id: string;
  name: string;
  brand: string;
  model: string;

  variant?: string;
  matchKey?: string;

  features: string[];

  msrp: number;

  bodyStyle: string;
  transmission: string;
  fuelType: string;
  drivetrain: string;

  performance: string;
  luxury: string;
  fuelEfficiency: string;

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

  active?: boolean;
  recommendable?: boolean;

  status?: VehicleStatus;

  lastSeen?: string;
};

const FULL_REFRESH = process.argv.includes("--full");

const root = process.cwd();

const currentPath = path.join(root, "data", "vehicles.json");

const latestPath = path.join(
  root,
  "data",
  "imports",
  "latestVehicles.json"
);

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function writeJson(filePath: string, data: unknown) {
  fs.writeFileSync(
    filePath,
    JSON.stringify(data, null, 2) + "\n",
    "utf8"
  );
}

function makeIdFromMatchKey(matchKey: string) {
  return matchKey.replace(/\|/g, "-");
}

function normaliseIncomingVehicle(v: any): VehicleRecord {
  const matchKey = createVehicleMatchKey(v);

  const scores = buildVehicleScores(v);

  return {
    id: v.id || makeIdFromMatchKey(matchKey),

    matchKey,

    name: String(v.name || "").trim(),
    brand: String(v.brand || "").trim(),
    model: String(v.model || "").trim(),
    variant: String(v.variant || "").trim(),

    features: Array.isArray(v.features) ? v.features : [],

    msrp: Number(v.msrp || 0),

    bodyStyle: String(v.bodyStyle || "")
      .trim()
      .toLowerCase(),

    transmission: String(v.transmission || "")
      .trim()
      .toLowerCase(),

    fuelType: String(v.fuelType || "")
      .trim()
      .toLowerCase(),

    drivetrain: String(v.drivetrain || "normal")
      .trim()
      .toLowerCase(),

    performance: String(v.performance || "no")
      .trim()
      .toLowerCase(),

    luxury: String(v.luxury || "no")
      .trim()
      .toLowerCase(),

    fuelEfficiency: String(v.fuelEfficiency || "no")
      .trim()
      .toLowerCase(),

    cityScore: scores.cityScore,
    familyScore: scores.familyScore,
    comfortScore: scores.comfortScore,
    easyEntryScore: scores.easyEntryScore,
    bootScore: scores.bootScore,
    runningCostScore: scores.runningCostScore,
    roughRoadScore: scores.roughRoadScore,
    funScore: scores.funScore,
    premiumScore: scores.premiumScore,
    evSuitabilityScore: scores.evSuitabilityScore,

    active: true,
    recommendable: false,

    status: "new_auto_added",

    lastSeen: new Date().toISOString().slice(0, 10),
  };
}

const current = readJson<VehicleRecord[]>(currentPath);
const latest = readJson<any[]>(latestPath);

const today = new Date().toISOString().slice(0, 10);

const currentByKey = new Map<string, VehicleRecord>();

for (const vehicle of current) {
  const key =
    vehicle.matchKey || createVehicleMatchKey(vehicle);

  currentByKey.set(key, {
    ...vehicle,
    matchKey: key,
  });
}

const seenKeys = new Set<string>();

const updated: VehicleRecord[] = [];

let addedCount = 0;
let updatedCount = 0;
let missingCount = 0;
let discontinuedCount = 0;

for (const raw of latest) {
  const incoming = normaliseIncomingVehicle(raw);

  if (!incoming.matchKey) continue;

  seenKeys.add(incoming.matchKey);

  const existing = currentByKey.get(incoming.matchKey);

  if (existing) {
    updated.push({
      ...existing,

      name: incoming.name || existing.name,
      brand: incoming.brand || existing.brand,
      model: incoming.model || existing.model,
      variant: incoming.variant || existing.variant,

      msrp:
        incoming.msrp > 0
          ? incoming.msrp
          : existing.msrp,

      bodyStyle:
        incoming.bodyStyle || existing.bodyStyle,

      transmission:
        incoming.transmission ||
        existing.transmission,

      fuelType:
        incoming.fuelType || existing.fuelType,

      drivetrain:
        incoming.drivetrain || existing.drivetrain,

      cityScore: incoming.cityScore,
      familyScore: incoming.familyScore,
      comfortScore: incoming.comfortScore,
      easyEntryScore: incoming.easyEntryScore,
      bootScore: incoming.bootScore,
      runningCostScore: incoming.runningCostScore,
      roughRoadScore: incoming.roughRoadScore,
      funScore: incoming.funScore,
      premiumScore: incoming.premiumScore,
      evSuitabilityScore:
        incoming.evSuitabilityScore,

      active: true,

      recommendable:
        existing.recommendable !== false,

      status: "active",

      lastSeen: today,
    });

    updatedCount++;

    continue;
  }

  updated.push(incoming);

  addedCount++;
}

for (const existing of currentByKey.values()) {
  const key =
    existing.matchKey || createVehicleMatchKey(existing);

  if (seenKeys.has(key)) continue;

  if (!FULL_REFRESH) {
    updated.push(existing);
    continue;
  }

  if (
    existing.status ===
    "missing_this_month"
  ) {
    updated.push({
      ...existing,
      active: false,
      recommendable: false,
      status: "discontinued",
    });

    discontinuedCount++;
  } else {
    updated.push({
      ...existing,
      active: existing.active !== false,
      recommendable: false,
      status: "missing_this_month",
    });

    missingCount++;
  }
}

updated.sort((a, b) => {
  const brandCompare = a.brand.localeCompare(
    b.brand
  );

  if (brandCompare !== 0) {
    return brandCompare;
  }

  const modelCompare = a.model.localeCompare(
    b.model
  );

  if (modelCompare !== 0) {
    return modelCompare;
  }

  return a.name.localeCompare(b.name);
});

writeJson(currentPath, updated);

console.log("");
console.log("================================");
console.log("Vehicle update complete");
console.log("================================");
console.log("");

console.log(
  `Mode: ${
    FULL_REFRESH
      ? "FULL REFRESH"
      : "SAFE UPDATE"
  }`
);

console.log("");

console.log(
  `Current catalogue: ${current.length}`
);

console.log(
  `Latest import rows: ${latest.length}`
);

console.log(
  `Final catalogue: ${updated.length}`
);

console.log("");

console.log(
  `Updated vehicles: ${updatedCount}`
);

console.log(
  `New vehicles added: ${addedCount}`
);

if (FULL_REFRESH) {
  console.log(
    `Missing vehicles: ${missingCount}`
  );

  console.log(
    `Discontinued vehicles: ${discontinuedCount}`
  );
}

console.log("");