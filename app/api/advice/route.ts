import { NextResponse } from "next/server";
import { generateAdvice } from "@/lib/driveStyleEngine";

/**
 * /api/advice
 * - Normalises defaults so the engine always receives a valid BriefInput shape
 * - Ensures comfortSpace + comfortNeeds are always present (so “roomy” logic actually runs)
 * - Adds lightweight debug logging in dev (helps verify payload in terminal)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    // ---- Helpers ----
    const asString = (v: any, fallback: string) => {
      const s = typeof v === "string" ? v : v == null ? "" : String(v);
      return s.trim() ? s.trim() : fallback;
    };

    const oneOf = <T extends string>(v: any, allowed: readonly T[], fallback: T): T => {
      const s = asString(v, fallback);
      return (allowed as readonly string[]).includes(s) ? (s as T) : fallback;
    };

    const arrayOfAllowed = <T extends string>(v: any, allowed: readonly T[]): T[] => {
      const arr = Array.isArray(v) ? v : [];
      const cleaned = arr.map((x) => String(x).trim()).filter(Boolean);
      const out: T[] = [];
      for (const item of cleaned) {
        if ((allowed as readonly string[]).includes(item) && !out.includes(item as T)) out.push(item as T);
      }
      return out;
    };

    // ---- Allowed enums (keeps engine stable) ----
    const passengersAllowed = ["alone", "couple", "family", "large_family"] as const;
    const distanceAllowed = ["very_short", "urban_daily", "mixed", "long_distance"] as const;
    const budgetAllowed = ["tight", "balanced", "flexible"] as const;
    const ownershipAllowed = ["loves_cars", "neutral", "appliance"] as const;
    const riskAllowed = ["certainty", "risk_ok"] as const;
    const environmentAllowed = ["city", "suburb", "rough"] as const;
    const preferenceAllowed = ["suv", "sedan", "none"] as const;
    const drivingStyleAllowed = ["relaxed", "balanced", "enthusiastic", "heavy_duty"] as const;

    const comfortSpaceAllowed = ["compact_ok", "standard", "roomy", "easy_entry"] as const;
    const comfortNeedsAllowed = ["easy_in_out", "wide_seats", "rear_legroom", "big_boot"] as const;

    // ---- Normalise into expected BriefInput shape ----
    const normalized = {
      passengers: oneOf(body?.passengers, passengersAllowed, "couple"),
      distance: oneOf(body?.distance, distanceAllowed, "urban_daily"),
      budget: oneOf(body?.budget, budgetAllowed, "balanced"),
      ownership: oneOf(body?.ownership, ownershipAllowed, "neutral"),
      risk: oneOf(body?.risk, riskAllowed, "certainty"),
      environment: oneOf(body?.environment, environmentAllowed, "suburb"),
      preference: oneOf(body?.preference, preferenceAllowed, "suv"),
      drivingStyle: oneOf(body?.drivingStyle, drivingStyleAllowed, "relaxed"),
      budgetAmount: asString(body?.budgetAmount, ""),

      // ✅ Comfort & space signals (critical for “roomy” logic)
      comfortSpace: oneOf(body?.comfortSpace, comfortSpaceAllowed, "standard"),
      comfortNeeds: arrayOfAllowed(body?.comfortNeeds, comfortNeedsAllowed),
    };

    // ---- Dev-only debug (helps confirm payload is arriving) ----
    // Remove anytime after you verify it once.
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.log("[/api/advice] comfortSpace:", normalized.comfortSpace, "comfortNeeds:", normalized.comfortNeeds);
    }

    const advice = generateAdvice(normalized);
    return NextResponse.json(advice);
  } catch (error) {
    console.error("Advice generation failed:", error);
    return NextResponse.json({ error: "Advice generation failed." }, { status: 500 });
  }
}