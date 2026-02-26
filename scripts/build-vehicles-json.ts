import fs from "node:fs";
import path from "node:path";
import xlsx from "xlsx";

type VehicleType =
  | "MANUAL_PASSENGER_SEDAN"
  | "AUTOMATIC_SEDAN"
  | "ESTATE_MPV"
  | "CROSSOVER_SUV"
  | "PICKUP_BAKKIE";

type VehicleRecord = {
  id: string;
  name: string;
  vehicleType: VehicleType;
  msrp: number; // ZAR
};

function slug(s: string) {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parsePrice(raw: unknown): number {
  const digits = String(raw ?? "").replace(/[^\d]/g, "");
  const n = Number(digits);
  return Number.isFinite(n) ? n : 0;
}

// Tab 1..5 => vehicleType
const sheetTypeMap: VehicleType[] = [
  "MANUAL_PASSENGER_SEDAN",
  "AUTOMATIC_SEDAN",
  "ESTATE_MPV",
  "CROSSOVER_SUV",
  "PICKUP_BAKKIE",
];

const sourcePath = path.join(process.cwd(), "data", "vehicles.source.xlsx");
const outPath = path.join(process.cwd(), "data", "vehicles.json");

const wb = xlsx.readFile(sourcePath);
const first5 = wb.SheetNames.slice(0, 5);

const all: VehicleRecord[] = [];

for (let i = 0; i < first5.length; i++) {
  const sheetName = first5[i];
  const sheet = wb.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json<any[]>(sheet, {
    header: 1,
    defval: "",
    blankrows: false,
  });

  const vehicleType = sheetTypeMap[i];

  // Skip header row (row 1)
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r] ?? [];

    // Based on your sample: index 1 is "Vehicle Make / Model", index 2 is "Price"
    const name = String(row[1] ?? "").trim();
    const msrp = parsePrice(row[2]);

    if (!name || !msrp) continue; // ignore bad/missing rows (including your “one record”)

    const id = `${vehicleType}|${slug(name)}`;

    all.push({ id, name, vehicleType, msrp });
  }
}

// De-dupe by id (keep highest msrp if duplicates exist)
const map = new Map<string, VehicleRecord>();
for (const v of all) {
  const existing = map.get(v.id);
  if (!existing || v.msrp >= existing.msrp) map.set(v.id, v);
}
const vehicles = Array.from(map.values()).sort((a, b) => a.msrp - b.msrp);

fs.writeFileSync(outPath, JSON.stringify(vehicles, null, 2), "utf8");

console.log(`✅ Wrote ${vehicles.length} vehicles to data/vehicles.json`);
