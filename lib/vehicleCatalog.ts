import vehicles from "@/data/vehicles.json";

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