import fs from "fs/promises";

export async function sleep(ms: number) {
  return new Promise((resolve) =>
    setTimeout(resolve, ms)
  );
}

export function normaliseVehicleName(
  name: string
) {
  return name
    .toLowerCase()

    .replace(/\bauto\b/g, "")
    .replace(/\bmanual\b/g, "")
    .replace(/\bat\b/g, "")
    .replace(/\bmt\b/g, "")

    .replace(/\s+/g, " ")

    .trim();
}

export function confidenceScore(
  vehicleName: string,
  resultTitle: string
) {
  const sourceWords =
    normaliseVehicleName(
      vehicleName
    ).split(" ");

  const resultWords =
    normaliseVehicleName(
      resultTitle
    ).split(" ");

  let matches = 0;

  for (const word of sourceWords) {
    if (
      resultWords.includes(word)
    ) {
      matches++;
    }
  }

  return Math.round(
    (matches /
      sourceWords.length) *
      100
  );
}

export async function saveJson(
  path: string,
  data: unknown
) {
  await fs.writeFile(
    path,
    JSON.stringify(
      data,
      null,
      2
    )
  );
}