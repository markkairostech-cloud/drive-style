import vehicles from "@/data/vehicles.json";

export function parseVehicleType(vehicleType: string) {
  const parts = (vehicleType || "").split("_").filter(Boolean);

  const transmission =
    parts.includes("MANUAL") ? "MANUAL" : parts.includes("AUTO") ? "AUTO" : undefined;

  const market =
    parts.includes("PASSENGER") ? "PASSENGER" : parts.includes("COMMERCIAL") ? "COMMERCIAL" : undefined;

  const body = parts
    .filter((p) => p !== "MANUAL" && p !== "AUTO" && p !== "PASSENGER" && p !== "COMMERCIAL")
    .join("_") || undefined;

  return { transmission, market, body };
}

export function prettyVehicleType(vehicleType: string) {
  const t = parseVehicleType(vehicleType);

  const parts: string[] = [];
  if (t.market) parts.push(t.market === "PASSENGER" ? "Passenger" : "Commercial");
  if (t.body) parts.push(t.body.replaceAll("_", " "));
  if (t.transmission) parts.push(t.transmission === "AUTO" ? "Automatic" : "Manual");

  return parts.filter(Boolean).join(" • ");
}

export function queryVehicles(q: {
  transmissionAnyOf?: Array<"MANUAL" | "AUTO">;
  marketAnyOf?: Array<"PASSENGER" | "COMMERCIAL">;
  bodyAnyOf?: string[]; // e.g. ["SUV", "SEDAN"]
}) {
  const all = getVehicleCatalog(); 
  return all.filter((v: any) => {
    const t = parseVehicleType(v.vehicleType);

    if (q.transmissionAnyOf?.length && (!t.transmission || !q.transmissionAnyOf.includes(t.transmission))) {
      return false;
    }
    if (q.marketAnyOf?.length && (!t.market || !q.marketAnyOf.includes(t.market))) {
      return false;
    }
    if (q.bodyAnyOf?.length) {
      const body = String(t.body || "").toUpperCase();
      if (!q.bodyAnyOf.some((b) => body.includes(b.toUpperCase()))) return false;
    }
    return true;
  });
}

export type VehicleType =
  | "MANUAL_PASSENGER_SEDAN"
  | "AUTOMATIC_SEDAN"
  | "ESTATE_MPV"
  | "CROSSOVER_SUV"
  | "PICKUP_BAKKIE";

export type VehicleRecord = {
  id: string;
  name: string;
  vehicleType: VehicleType;
  msrp: number;
};

export function getVehicleCatalog(): VehicleRecord[] {
  return vehicles as VehicleRecord[];
}