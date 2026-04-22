export type PropertyPackageKey = "silver" | "gold" | "platinum" | "buyer-profile"

export type PropertyPackage = {
  key: PropertyPackageKey
  title: string
  subtitle: string
  cta: string
  priceLabel: string
  featured?: boolean
}

export const propertyPackages: PropertyPackage[] = [
  {
    key: "silver",
    title: "Silver",
    subtitle: "Sharper direction and clearer next steps.",
    cta: "Choose Silver",
    priceLabel: "Paid upgrade",
  },
  {
    key: "gold",
    title: "Gold",
    subtitle: "More support, better filtering, less wasted time.",
    cta: "Choose Gold",
    priceLabel: "Paid upgrade",
    featured: true,
  },
  {
    key: "platinum",
    title: "Platinum",
    subtitle: "Higher-touch property guidance and strategic support.",
    cta: "Choose Platinum",
    priceLabel: "Paid upgrade",
  },
  {
    key: "buyer-profile",
    title: "Buyer Profile",
    subtitle:
      "Generate a structured brief you can share with an estate agent so they show you better-matched homes.",
    cta: "Generate Buyer Profile",
    priceLabel: "Paid upgrade",
  },
]