import path from "path";
import vehicles from "@/data/vehicles.json";
import * as cheerio from "cheerio";

import {
  sleep,
  confidenceScore,
  saveJson,
} from "./helpers";

type Vehicle = {
  id: string;
  name: string;
  brand: string;
  msrp?: number;
};

type LookupStatus =
  | "FOUND"
  | "LOW_CONFIDENCE"
  | "NOT_FOUND";

type LookupRecord = {
  id: string;
  name: string;
  brand: string;

  currentMsrp: number | null;

  foundMsrp: number | null;

  source: string | null;

  sourceUrl: string | null;

  confidence: number;

  status: LookupStatus;
};

const args = process.argv.slice(2);

const brandIndex =
  args.indexOf("--brand");

const allMode =
  args.includes("--all");

const brand =
  brandIndex >= 0
    ? args[brandIndex + 1]
    : null;

const allVehicles =
  vehicles as Vehicle[];

let selectedVehicles =
  allVehicles;

if (!allMode && brand) {
  selectedVehicles =
    allVehicles.filter(
      (v) =>
        v.brand.toLowerCase() ===
        brand.toLowerCase()
    );
}

async function lookupCars(
  vehicle: Vehicle
): Promise<{
  foundMsrp: number | null;
  source: string | null;
  sourceUrl: string | null;
  confidence: number;
  status: LookupStatus;
}> {
  try {

    const searchQuery =
      encodeURIComponent(
        `${vehicle.name} site:cars.co.za`
      );

    const url =
      `https://www.google.com/search?q=${searchQuery}`;

    console.log(
      `Searching: ${vehicle.name}`
    );

    const response =
      await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0"
        }
      });

    const html =
      await response.text();

    const $ =
      cheerio.load(html);

    const links =
      $("a").toArray();

    const carsLink =
      links.find((el) => {

        const href =
          $(el).attr("href");

        return (
          href &&
          href.includes(
            "cars.co.za"
          ) &&
          !href.includes(
            "/search?"
          ) &&
          !href.includes(
            "google"
          )
        );

      });

    if (!carsLink) {

      return {
        foundMsrp: null,
        source: null,
        sourceUrl: null,
        confidence: 0,
        status: "NOT_FOUND"
      };

    }

    let href =
      $(carsLink)
      .attr("href") || "";

    const title =
      $(carsLink)
      .text();

    if (
      href.includes(
        "/url?q="
      )
    ) {

      href =
        href
          .split(
            "/url?q="
          )[1]
          ?.split("&")[0] ||
        href;

    }

    const score =
      confidenceScore(
        vehicle.name,
        title
      );

    return {

      foundMsrp: null,

      source:
        "Cars.co.za",

      sourceUrl:
        href,

      confidence:
        score,

      status:
        score >= 85
          ? "FOUND"
          : "LOW_CONFIDENCE"

    };

  } catch {

    console.log(
      `Failed: ${vehicle.name}`
    );

    return {

      foundMsrp: null,

      source: null,

      sourceUrl: null,

      confidence: 0,

      status: "NOT_FOUND"

    };

  }
}

async function run() {

  const results:
    LookupRecord[] = [];

  let count = 0;

  console.log("");

  console.log(
    `Processing ${selectedVehicles.length} vehicles`
  );

  console.log("");

  for (
    const vehicle
    of selectedVehicles
  ) {

    count++;

    console.log(
      `[${count}/${selectedVehicles.length}]`
    );

    const lookup =
      await lookupCars(
        vehicle
      );

    results.push({

      id:
        vehicle.id,

      name:
        vehicle.name,

      brand:
        vehicle.brand,

      currentMsrp:
        vehicle.msrp ||
        null,

      ...lookup

    });

    if (
      count % 5 === 0
    ) {

      console.log(
        "Cooling down..."
      );

      await sleep(
        5000
      );

    }

  }

  const outputDir =
    path.join(
      process.cwd(),
      "data",
      "pricing",
      "lookup"
    );

  const filename =
    allMode
      ? "pricing-lookup-all.json"
      : `pricing-lookup-${brand}.json`;

  await saveJson(

    path.join(
      outputDir,
      filename
    ),

    results

  );

  console.log("");

  console.log(
    `Finished ${results.length} vehicles`
  );

  console.log(
    `Saved ${filename}`
  );

}

run();