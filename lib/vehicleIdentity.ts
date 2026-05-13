export function slugifyVehiclePart(value: string | undefined | null) {
  return String(value || "")
    .toLowerCase()
    .replace(/\+/g, "plus")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normaliseTransmission(value: string | undefined | null) {
  const v = String(value || "").toLowerCase();

  if (v.includes("auto") || v === "at" || v.includes("cvt")) return "automatic";
  if (v.includes("manual") || v === "mt") return "manual";

  return slugifyVehiclePart(v);
}

export function normaliseFuelType(value: string | undefined | null) {
  const v = String(value || "").toLowerCase();

  if (v.includes("electric") || v === "ev" || v === "bev") return "electric";
  if (v.includes("hybrid") || v === "hev") return "hybrid";
  if (v.includes("diesel")) return "diesel";
  if (v.includes("petrol") || v.includes("gasoline")) return "petrol";

  return slugifyVehiclePart(v);
}

export function createVehicleMatchKey(vehicle: {
  brand?: string;
  model?: string;
  variant?: string;
  transmission?: string;
  fuelType?: string;
}) {
  return [
    slugifyVehiclePart(vehicle.brand),
    slugifyVehiclePart(vehicle.model),
    slugifyVehiclePart(vehicle.variant || ""),
    normaliseTransmission(vehicle.transmission),
    normaliseFuelType(vehicle.fuelType),
  ]
    .filter(Boolean)
    .join("|");
}