export type PropertyInput = {
  household: string
  location: string
  situation: string
  priorities: string[]
  commute: string
  environment: string
  securityPreference: string
  loadShedding: string
  budgetMindset: string
  budget: string
  deposit: string
  timeHorizon: string
  concern: string
  additionalNotes?: string
}

export type PropertyResult = {
  fit: string
  cost: string
  lifestyle: string
  verdict: string
  direction: string[]
  watchouts: string[]
  buyerType: string
  confidence: "high" | "medium" | "low"
}

function includesAny(values: string[] = [], targets: string[]) {
  return targets.some((target) => values.includes(target))
}

export function propertyEngine(input: PropertyInput): PropertyResult {
  const priorities = input.priorities ?? []

  const wantsSecurity =
    input.securityPreference === "Estate/complex only" ||
    includesAny(priorities, ["Security"])

  const wantsSpace = includesAny(priorities, ["Space"])
  const wantsLifestyle = includesAny(priorities, ["Lifestyle (restaurants, beach, etc.)"])
  const wantsSchools = includesAny(priorities, ["Schools"])
  const wantsQuiet = includesAny(priorities, ["Quiet / privacy"])

  const dailyCommute =
    input.commute === "Daily (short)" || input.commute === "Daily (long)"

  const longCommute = input.commute === "Daily (long)"
  const mustHavePower = input.loadShedding === "Must have backup power"
  const stretch = input.budgetMindset === "Willing to stretch"
  const conservative = input.budgetMindset === "Conservative"
  const shortStay = input.timeHorizon === "<3 years"
  const longStay = input.timeHorizon === "Long-term" || input.timeHorizon === "5–10 years"

  let buyerType = "Balanced buyer"

  if (wantsSecurity && (wantsSchools || input.household === "Family")) {
    buyerType = "Security-first family"
  } else if (input.environment === "Apartment / city living" && wantsLifestyle) {
    buyerType = "Urban professional"
  } else if (wantsSpace || input.environment === "Freehold suburban home") {
    buyerType = "Space seeker"
  } else if (input.environment === "Lifestyle / semi-rural") {
    buyerType = "Lifestyle relocator"
  }

  let fit =
    "A secure estate or well-managed complex is likely to give you the strongest overall balance of lifestyle, convenience, and lower-friction ownership."

  if (input.environment === "Apartment / city living") {
    fit =
      "A well-located apartment or secure sectional title option is likely to suit your lifestyle best, especially if convenience and access matter more than extra space."
  } else if (input.environment === "Freehold suburban home") {
    fit =
      "A suburban freehold home could suit you well if space and long-term flexibility matter most, but only if security and upkeep are properly factored in."
  } else if (input.environment === "Lifestyle / semi-rural") {
    fit =
      "A lifestyle-focused property could be a strong match if your day-to-day flexibility is high and you are intentionally prioritising space, calm, or location character over convenience."
  }

  let cost =
    "A balanced budget is likely the smartest route here: enough to access the right area and property type, without creating avoidable monthly pressure."

  if (conservative) {
    cost =
      "Keeping meaningful monthly headroom looks important for your profile, so a conservative budget stance is likely to serve you better than stretching for a more aspirational property."
  } else if (stretch) {
    cost =
      "You may be able to stretch into a stronger area or better-finished property, but doing so should be weighed carefully against interest-rate pressure and reduced flexibility."
  }

  let lifestyle =
    "Your day-to-day experience is likely to be shaped more by area fit, traffic, and practical convenience than by headline features alone."

  if (longCommute) {
    lifestyle =
      "Because commute friction can wear people down quickly, prioritising a well-connected area may improve daily quality of life more than gaining extra space further out."
  } else if (!dailyCommute && wantsQuiet) {
    lifestyle =
      "Because your commute is more flexible, you can afford to prioritise quieter, more spacious, or more lifestyle-led areas without taking the same weekday hit."
  }

  const direction: string[] = []
  const watchouts: string[] = []

  if (wantsSecurity) {
    direction.push("Secure estate, townhouse, or sectional title option")
    watchouts.push("Underestimating the value of managed security")
  } else {
    direction.push("Secure freehold or flexible suburban option")
    watchouts.push("Underestimating total security costs on freehold homes")
  }

  if (mustHavePower) {
    direction.push("Inverter-ready, solar-assisted, or backup-power-capable home")
    watchouts.push("Ignoring load shedding resilience")
  } else {
    direction.push("Property with practical power-upgrade potential")
  }

  if (dailyCommute) {
    direction.push("Area with strong route access and realistic weekday travel times")
    watchouts.push("Choosing value on paper over daily commute reality")
  } else {
    direction.push("Area that maximises lifestyle, space, or long-term fit")
  }

  if (wantsSchools) {
    direction.push("Family-oriented suburb or estate with school access")
  }

  if (wantsLifestyle) {
    direction.push("Area with strong amenity access and liveability")
  }

  if (wantsSpace) {
    direction.push("Property type with flexible room to grow")
  }

  if (stretch) {
    watchouts.push("Stretching too aggressively on monthly affordability")
  }

  if (shortStay) {
    watchouts.push("Buying too quickly for a short ownership horizon")
  }

  let verdict =
    "A secure, well-located property in a connected suburb is likely your strongest overall fit, even if it means giving up a little space to gain better daily liveability and lower decision risk."

  if (buyerType === "Urban professional") {
    verdict =
      "A secure apartment or compact sectional title home in a well-connected urban node is likely your best fit, with convenience and lifestyle outweighing the benefit of extra space."
  } else if (buyerType === "Security-first family") {
    verdict =
      "A secure family-oriented estate or townhouse environment is likely your strongest fit, balancing safety, practicality, and longer-term liveability."
  } else if (buyerType === "Space seeker") {
    verdict =
      "A suburban home with usable space and room for flexibility looks like your best fit, provided security and total monthly ownership costs are kept under control."
  } else if (buyerType === "Lifestyle relocator") {
    verdict =
      "A lifestyle-led property could be the right move for you, but only if you deliberately choose an area that supports how you actually live rather than how the move looks on paper."
  }

  const uniqueDirection = [...new Set(direction)].slice(0, 5)
  const uniqueWatchouts = [...new Set(watchouts)].slice(0, 4)

  const confidence: PropertyResult["confidence"] =
    input.household &&
    input.location &&
    input.environment &&
    input.budgetMindset &&
    input.securityPreference
      ? "high"
      : "medium"

  return {
    fit,
    cost,
    lifestyle,
    verdict,
    direction: uniqueDirection,
    watchouts: uniqueWatchouts,
    buyerType,
    confidence,
  }
}