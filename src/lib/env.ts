const rawSiteUrl = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "");

export const SITE_URL =
  rawSiteUrl && rawSiteUrl.length
    ? rawSiteUrl
    : typeof window !== "undefined"
      ? window.location.origin
      : "https://pixora.example.com";

export const IS_PRODUCTION = import.meta.env.PROD;
export const IS_DEVELOPMENT = import.meta.env.DEV;

export const SITE = {
  name: "Pixora",
  tagline: "Find your next big idea",
  description:
    "Pixora is a modern visual discovery platform for photographers, designers and the endlessly curious. Search, save and share the imagery that moves you.",
  twitter: "@pixora",
} as const;
