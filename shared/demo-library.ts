import type { MediaItem } from "./types";
import { CREATOR_NAMES } from "./taxonomy";

/**
 * A bundled, royalty-cleared sample library.
 *
 * Pixora runs "free first": when no PIXABAY_API_KEY is configured — or when the
 * upstream provider is unreachable — the API serves this curated set so the
 * product is fully explorable with zero accounts, zero cost and zero downtime.
 * Replace it with your own licensed media for a production launch.
 */

type DemoEntry = {
  title: string;
  tags: string;
  category: string;
  ratio: [number, number];
};

const IMAGE_ENTRIES: DemoEntry[] = [
  {
    title: "Golden Hour Dunes",
    tags: "desert, dunes, golden hour, sand, landscape",
    category: "nature",
    ratio: [4, 5],
  },
  {
    title: "Concrete Cathedral",
    tags: "brutalism, architecture, concrete, geometry",
    category: "architecture",
    ratio: [3, 4],
  },
  {
    title: "Editorial Type Study",
    tags: "typography, editorial, layout, design, print",
    category: "design",
    ratio: [4, 5],
  },
  {
    title: "Misty Pine Ridge",
    tags: "forest, fog, pine, mountains, mist",
    category: "nature",
    ratio: [3, 2],
  },
  {
    title: "Neon Crossing",
    tags: "neon, night, city, rain, street photography",
    category: "photography",
    ratio: [2, 3],
  },
  {
    title: "Warm Minimal Interior",
    tags: "interior, minimal, warm, living room, lifestyle",
    category: "lifestyle",
    ratio: [4, 5],
  },
  {
    title: "Aerial Coastline",
    tags: "aerial, coast, ocean, drone, cliffs",
    category: "travel",
    ratio: [3, 2],
  },
  {
    title: "Analog Café Frame",
    tags: "analog, film, grain, cafe, people",
    category: "photography",
    ratio: [1, 1],
  },
  {
    title: "Studio Product Halo",
    tags: "product, studio, still life, minimal, design",
    category: "design",
    ratio: [1, 1],
  },
  {
    title: "Botanical Close-Up",
    tags: "botanical, leaves, macro, green, plant",
    category: "nature",
    ratio: [4, 5],
  },
  {
    title: "Desert Highway",
    tags: "road, highway, desert, travel, roadtrip",
    category: "travel",
    ratio: [3, 2],
  },
  {
    title: "Marble Stairwell",
    tags: "staircase, marble, architecture, minimal",
    category: "architecture",
    ratio: [2, 3],
  },
  {
    title: "Linen & Light",
    tags: "linen, texture, still life, warm, lifestyle",
    category: "lifestyle",
    ratio: [4, 5],
  },
  {
    title: "Harbour at Dusk",
    tags: "harbour, dusk, boats, water, travel",
    category: "travel",
    ratio: [3, 2],
  },
  {
    title: "Studio Portrait No. 4",
    tags: "portrait, studio, people, photography, light",
    category: "photography",
    ratio: [4, 5],
  },
  {
    title: "Swiss Poster Grid",
    tags: "poster, grid, swiss, typography, design",
    category: "design",
    ratio: [3, 4],
  },
  { title: "Glacier Blue", tags: "glacier, ice, blue, mountains, cold", category: "nature", ratio: [3, 2] },
  {
    title: "Terracotta Courtyard",
    tags: "courtyard, terracotta, architecture, travel, warm",
    category: "architecture",
    ratio: [4, 5],
  },
  {
    title: "Slow Morning Ritual",
    tags: "coffee, morning, ritual, lifestyle, table",
    category: "lifestyle",
    ratio: [1, 1],
  },
  {
    title: "Long Exposure Waves",
    tags: "waves, ocean, long exposure, seascape, minimal",
    category: "photography",
    ratio: [3, 2],
  },
  {
    title: "City Grid from Above",
    tags: "city, aerial, grid, aerial photography, urban",
    category: "photography",
    ratio: [1, 1],
  },
  {
    title: "Wildflower Meadow",
    tags: "wildflowers, meadow, summer, nature, colour",
    category: "nature",
    ratio: [4, 5],
  },
  {
    title: "Monochrome Corridor",
    tags: "monochrome, corridor, minimal, architecture, shadow",
    category: "architecture",
    ratio: [2, 3],
  },
  { title: "Kyoto Alleyway", tags: "kyoto, japan, alley, travel, night", category: "travel", ratio: [4, 5] },
  {
    title: "Ceramic Study",
    tags: "ceramics, pottery, still life, craft, design",
    category: "design",
    ratio: [1, 1],
  },
  {
    title: "Salt Flat Horizon",
    tags: "salt flat, horizon, minimal, desert, travel",
    category: "travel",
    ratio: [3, 2],
  },
  {
    title: "Reading Nook",
    tags: "reading, nook, books, cosy, interior",
    category: "lifestyle",
    ratio: [4, 5],
  },
  {
    title: "Rain on Glass",
    tags: "rain, glass, macro, texture, minimal",
    category: "photography",
    ratio: [2, 3],
  },
  {
    title: "Alpine Switchbacks",
    tags: "alpine, mountains, road, aerial, snow",
    category: "nature",
    ratio: [3, 2],
  },
  {
    title: "Colour Block Facade",
    tags: "facade, colour block, architecture, geometry, design",
    category: "architecture",
    ratio: [4, 5],
  },
  {
    title: "Film Still — Rooftop",
    tags: "film still, rooftop, cinematic, people",
    category: "film",
    ratio: [3, 2],
  },
  {
    title: "Handmade Paper Texture",
    tags: "paper, texture, craft, minimal, design",
    category: "design",
    ratio: [1, 1],
  },
  {
    title: "Lavender Rows",
    tags: "lavender, rows, field, provence, nature",
    category: "nature",
    ratio: [3, 2],
  },
  {
    title: "Night Market Glow",
    tags: "night market, street, food, travel, people",
    category: "travel",
    ratio: [4, 5],
  },
  {
    title: "Workspace Rituals",
    tags: "workspace, desk, productivity, minimal, lifestyle",
    category: "lifestyle",
    ratio: [3, 2],
  },
  {
    title: "Reflection Pool",
    tags: "reflection, water, pool, minimal, architecture",
    category: "architecture",
    ratio: [1, 1],
  },
  {
    title: "Dune Textures",
    tags: "dunes, texture, desert, sand, minimal",
    category: "nature",
    ratio: [4, 5],
  },
  {
    title: "Vintage Travel Poster",
    tags: "vintage, poster, travel, illustration, design",
    category: "design",
    ratio: [2, 3],
  },
  {
    title: "Harbour Cranes",
    tags: "cranes, harbour, industry, geometry, urban",
    category: "photography",
    ratio: [3, 2],
  },
  {
    title: "Quiet Breakfast",
    tags: "breakfast, food, morning, lifestyle, table",
    category: "lifestyle",
    ratio: [4, 5],
  },
];

const VIDEO_SOURCES = [
  "BigBuckBunny.mp4",
  "ElephantsDream.mp4",
  "ForBiggerBlazes.mp4",
  "ForBiggerEscapes.mp4",
  "ForBiggerFun.mp4",
  "ForBiggerJoyrides.mp4",
  "ForBiggerMeltdowns.mp4",
  "Sintel.mp4",
  "SubaruOutbackOnStreetAndDirt.mp4",
  "TearsOfSteel.mp4",
  "VolkswagenGTIReview.mp4",
  "WeAreGoingOnBullrun.mp4",
];

const VIDEO_ENTRIES: DemoEntry[] = [
  {
    title: "Slow Motion Shorebreak",
    tags: "waves, slow motion, ocean, cinematic",
    category: "film",
    ratio: [16, 9],
  },
  { title: "City in Motion", tags: "city, timelapse, urban, night", category: "film", ratio: [16, 9] },
  { title: "Studio Light Test", tags: "studio, light, test, cinematic", category: "film", ratio: [16, 9] },
  { title: "Mountain Drift", tags: "mountains, drone, aerial, nature", category: "film", ratio: [16, 9] },
  { title: "Desert Drive", tags: "desert, drive, road, travel", category: "film", ratio: [16, 9] },
  { title: "Rainy Window Loop", tags: "rain, window, loop, mood", category: "film", ratio: [16, 9] },
  { title: "Forest Canopy", tags: "forest, canopy, nature, green", category: "film", ratio: [16, 9] },
  { title: "Neon Streets", tags: "neon, streets, night, urban", category: "film", ratio: [16, 9] },
  { title: "Workshop Hands", tags: "craft, hands, workshop, documentary", category: "film", ratio: [16, 9] },
  { title: "Harbour Sunrise", tags: "harbour, sunrise, water, travel", category: "film", ratio: [16, 9] },
  { title: "Motion Study 01", tags: "motion, abstract, design, loop", category: "film", ratio: [16, 9] },
  { title: "Coastal Road", tags: "coast, road, drive, travel", category: "film", ratio: [16, 9] },
];

/** Deterministic 32-bit hash so demo content is stable across requests. */
export function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

const PICSUM = "https://picsum.photos/seed";
const SAMPLE_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildImageItem(entry: DemoEntry, index: number): MediaItem {
  const seed = slugify(entry.title);
  const [rw, rh] = entry.ratio;
  const width = 1600;
  const height = Math.round((width * rh) / rw);
  const hash = hashString(seed);
  const tags = entry.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const creator = CREATOR_NAMES[hash % CREATOR_NAMES.length];

  return {
    id: `demo-img-${String(index + 1).padStart(3, "0")}`,
    type: "image",
    title: entry.title,
    description: `${entry.title} — a ${tags.slice(0, 2).join(" and ")} study from the Pixora sample library.`,
    tags,
    category: entry.category,
    creator,
    thumbnail: `${PICSUM}/${seed}/600/${Math.round((600 * rh) / rw)}`,
    preview: `${PICSUM}/${seed}/1000/${Math.round((1000 * rh) / rw)}`,
    full: `${PICSUM}/${seed}/${width}/${height}`,
    width,
    height,
    likes: 120 + (hash % 4800),
    views: 3200 + ((hash >> 3) % 120000),
    pageUrl: "https://pixabay.com/",
    source: "demo",
    attribution: "Pixora sample library",
  };
}

function buildVideoItem(entry: DemoEntry, index: number): MediaItem {
  const seed = slugify(entry.title);
  const [rw, rh] = entry.ratio;
  const width = 1280;
  const height = Math.round((width * rh) / rw);
  const hash = hashString(seed);
  const tags = entry.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const creator = CREATOR_NAMES[(hash >> 5) % CREATOR_NAMES.length];

  return {
    id: `demo-vid-${String(index + 1).padStart(3, "0")}`,
    type: "video",
    title: entry.title,
    description: `${entry.title} — a looping ${tags[0]} clip from the Pixora sample library.`,
    tags,
    category: entry.category,
    creator,
    thumbnail: `${PICSUM}/${seed}-poster/800/${Math.round((800 * rh) / rw)}`,
    preview: `${PICSUM}/${seed}-poster/1280/${height}`,
    full: `${PICSUM}/${seed}-poster/${width}/${height}`,
    video: `${SAMPLE_VIDEO}/${VIDEO_SOURCES[index % VIDEO_SOURCES.length]}`,
    width,
    height,
    likes: 80 + (hash % 2600),
    views: 1800 + ((hash >> 3) % 78000),
    pageUrl: "https://pixabay.com/",
    source: "demo",
    attribution: "Pixora sample library",
  };
}

export const DEMO_LIBRARY: MediaItem[] = [
  ...IMAGE_ENTRIES.map(buildImageItem),
  ...VIDEO_ENTRIES.map(buildVideoItem),
];
