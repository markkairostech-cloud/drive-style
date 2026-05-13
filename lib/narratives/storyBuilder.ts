import { archetypes } from "./archetypes"

type StoryInput = {
  budget?: number
  family?: boolean
  imagePriority?: string
  drivingExcitement?: string
}

export function buildNarrative(input: StoryInput) {
  let selected = archetypes.rationalAchiever

  if (input.family) {
    selected = archetypes.familyPlanner
  }

  if (input.imagePriority === "high") {
    selected = archetypes.quietExecutive
  }

  if (input.drivingExcitement === "high") {
    selected = archetypes.enthusiast
  }

  let expandedStory = ""

  switch (selected.title) {
    case "Quiet Executive":
      expandedStory = `
You are entering a stage where the wrong vehicle becomes exhausting very quickly.

You value calm ownership, professional presence, and confidence without unnecessary attention. For you, the best vehicle is not the loudest or most aggressive option — it is the one that quietly reinforces competence every single day.

That is why your recommendations focus on vehicles that balance refinement, reliability, comfort, and long-term ownership confidence.

The goal is not simply to impress people for a few weeks. The goal is to still feel good about your decision two years from now when the novelty has faded and daily ownership becomes reality.
`
      break

    case "Driving Enthusiast":
      expandedStory = `
You care about more than specifications on paper.

The experience matters. The feeling matters. The right vehicle should make ordinary drives feel engaging rather than forgettable.

That is why your recommendations lean toward vehicles that create emotional connection while still remaining realistic to own and enjoy long term.

A vehicle for you should not feel numb or purely functional. It should reward you every time you sit behind the wheel while still fitting into your real-world lifestyle and responsibilities.
`
      break

    case "Family Planner":
      expandedStory = `
Your priorities are rooted in stability, predictability, and reducing unnecessary stress.

You are not looking for a vehicle that only looks impressive online. You need something that works consistently in real life — school runs, traffic, weekends away, safety, comfort, and long-term dependability.

That is why your recommendations prioritise practicality, ownership confidence, space, and ease of daily use.

The right decision for you is the one that makes life easier every single day, not more complicated.
`
      break

    case "Emerging Success":
      expandedStory = `
This purchase represents more than transportation.

You are entering a new phase of growth, confidence, and personal momentum. The right vehicle should reflect progress while still remaining financially intelligent and sustainable long term.

That is why your recommendations balance aspiration with realism.

You want something that feels rewarding to own without creating future regret, financial pressure, or unnecessary compromise.
`
      break

    default:
      expandedStory = `
You approach vehicle ownership logically and with long-term thinking.

You care about making a smart decision that balances enjoyment, practicality, ownership costs, and long-term satisfaction.

That is why your recommendations focus on vehicles that deliver strong overall value rather than chasing trends or unnecessary status.

The best ownership experience usually comes from making a decision that still feels intelligent long after the excitement of the purchase fades.
`
  }

  return {
    archetype: selected.title,
    identitySummary: selected.identitySummary,
    recommendationStory: expandedStory
  }
}