/**
 * The editorial taxonomy that drives discovery: sidebar navigation, category
 * filters, trending topics, demo library tagging and search suggestions.
 * Shared so the API and the UI always agree on what a "category" is.
 */

export interface Category {
  slug: string;
  label: string;
  blurb: string;
  /** Default search term used when a category has no query of its own. */
  query: string;
  emoji: string;
}

export const CATEGORIES: Category[] = [
  {
    slug: "for-you",
    label: "For you",
    blurb: "A rotating mix tuned to what you save",
    query: "creative inspiration",
    emoji: "✳",
  },
  {
    slug: "photography",
    label: "Photography",
    blurb: "Light, shadow and the decisive moment",
    query: "photography",
    emoji: "◉",
  },
  {
    slug: "design",
    label: "Design",
    blurb: "Layout, type, colour and craft",
    query: "graphic design minimal",
    emoji: "▦",
  },
  {
    slug: "architecture",
    label: "Architecture",
    blurb: "Structure, space and material",
    query: "architecture building",
    emoji: "⌂",
  },
  {
    slug: "nature",
    label: "Nature",
    blurb: "Landscapes, botanicals and wild places",
    query: "nature landscape",
    emoji: "❋",
  },
  {
    slug: "travel",
    label: "Travel",
    blurb: "Cities, coastlines and far horizons",
    query: "travel city",
    emoji: "➤",
  },
  {
    slug: "lifestyle",
    label: "Lifestyle",
    blurb: "Interiors, people and everyday ritual",
    query: "lifestyle interior",
    emoji: "❍",
  },
  {
    slug: "film",
    label: "Film & motion",
    blurb: "Cinematic clips and looping footage",
    query: "cinematic",
    emoji: "▷",
  },
];

export const TRENDING_TOPICS: string[] = [
  "Golden hour portraits",
  "Brutalist concrete",
  "Editorial layout",
  "Misty mountains",
  "Neon night city",
  "Warm minimal interiors",
  "Aerial coastline",
  "Analog grain",
  "Studio product shots",
  "Botanical close-ups",
  "Desert highways",
  "Slow motion waves",
];

export const CREATOR_NAMES: string[] = [
  "Aster Studio",
  "Nova Field",
  "Ilse Bergman",
  "Kenji Watanabe",
  "Marta Ruiz",
  "Solomon Tadesse",
  "Lina Ostberg",
  "The Quiet Frame",
  "Aurora Collective",
  "Hana Kim",
  "Dario Melo",
  "Priya Nair",
  "Tomas Lindqvist",
  "Emeka Obi",
  "Clara Fontaine",
  "Yuki Tanabe",
  "Ravi Shankar",
  "Noor Haddad",
  "Bea Moreau",
  "Jonas Weber",
];

export function categoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((category) => category.slug === slug);
}

export function categoryLabel(slug: string): string {
  return categoryBySlug(slug)?.label ?? "Discovery";
}
