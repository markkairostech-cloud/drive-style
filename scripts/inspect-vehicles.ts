import { loadVehicleCatalog } from "../lib/vehicleCatalog";

const all = loadVehicleCatalog();

console.log("Total vehicles:", all.length);

if (all.length > 0) {
  console.log("Keys on first record:");
  console.log(Object.keys(all[0]).sort());

  console.log("\nExample record:");
  console.log(all[0]);
}