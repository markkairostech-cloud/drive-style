const fs = require("fs");
const path = require("path");

const filePath = path.join(process.cwd(), "data", "vehicles.json");
const raw = fs.readFileSync(filePath, "utf-8");
const all = JSON.parse(raw);

console.log("Total vehicles:", all.length);

if (all.length > 0) {
  console.log("\nKeys on first record:");
  console.log(Object.keys(all[0]).sort());

  console.log("\nExample record:");
  console.log(all[0]);
}