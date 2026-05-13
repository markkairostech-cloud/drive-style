import fs from "fs";
import path from "path";

import { buildVehicleScores } from "../lib/vehicleScoring";

type VehicleRecord = {
  [key: string]: any;
};

const root = process.cwd();
const vehiclesPath = path.join(root, "data", "vehicles.json");

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function writeJson(filePath: string, data: unknown) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
}

const vehicles = readJson<VehicleRecord[]>(vehiclesPath);

const enriched = vehicles.map((vehicle) => {
  const scores = buildVehicleScores(vehicle as any);

  return {
    ...vehicle,
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
  };
});

writeJson(vehiclesPath, enriched);

console.log("");
console.log("Vehicle enrichment complete");
console.log(`Vehicles enriched: ${enriched.length}`);
console.log("");