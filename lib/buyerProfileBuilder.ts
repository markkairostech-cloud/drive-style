import { PropertyInput, PropertyResult } from "./propertyEngine"

export type BuyerProfile = {
  title: string
  summary: string
  buyerType: string
  targetLocation: string
  indicativeBudget: string
  householdContext: string
  buyingPosition: string
  preferredEnvironment: string
  nonNegotiables: string[]
  strongPreferences: string[]
  cautionFlags: string[]
  estateAgentBrief: string
}

export function buildBuyerProfile(
  input: PropertyInput,
  result: PropertyResult
): BuyerProfile {
  const nonNegotiables: string[] = []
  const strongPreferences: string[] = []

  if (input.securityPreference === "Estate/complex only") {
    nonNegotiables.push("Secure estate / complex living")
  } else if (input.securityPreference === "Prefer secure") {
    strongPreferences.push("Good practical security")
  }

  if (input.loadShedding === "Must have backup power") {
    nonNegotiables.push("Backup power or inverter-ready setup")
  } else if (input.loadShedding === "Nice to have") {
    strongPreferences.push("Backup power capability")
  }

  if (input.commute === "Daily (short)" || input.commute === "Daily (long)") {
    strongPreferences.push("Realistic commuter access")
  }

  if (input.environment) {
    strongPreferences.push(input.environment)
  }

  for (const priority of input.priorities ?? []) {
    strongPreferences.push(priority)
  }

  for (const item of result.direction) {
    strongPreferences.push(item)
  }

  const uniqueStrongPreferences = [...new Set(strongPreferences)].slice(0, 8)
  const uniqueNonNegotiables = [...new Set(nonNegotiables)].slice(0, 5)

  const estateAgentBrief = [
    `This client presents as a ${result.buyerType.toLowerCase()}.`,
    `Their likely best fit is: ${result.verdict}`,
    `Focus the search around ${input.location}, within an indicative budget of ${input.budget}.`,
    uniqueNonNegotiables.length
      ? `Non-negotiables: ${uniqueNonNegotiables.join("; ")}.`
      : null,
    uniqueStrongPreferences.length
      ? `Strong preferences: ${uniqueStrongPreferences.join("; ")}.`
      : null,
    result.watchouts.length
      ? `Avoid: ${result.watchouts.join("; ")}.`
      : null,
  ]
    .filter(Boolean)
    .join(" ")

  return {
    title: "Buyer Profile",
    summary: result.verdict,
    buyerType: result.buyerType,
    targetLocation: input.location,
    indicativeBudget: input.budget,
    householdContext: input.household,
    buyingPosition: input.situation,
    preferredEnvironment: input.environment,
    nonNegotiables: uniqueNonNegotiables,
    strongPreferences: uniqueStrongPreferences,
    cautionFlags: result.watchouts,
    estateAgentBrief,
  }
}