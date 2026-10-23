import { Blocks, Gauge, Lock, Search, Share2, Wand2 } from "lucide-react";

export interface Feature {
  title: string;
  description: string;
  icon: typeof Search;
}

export const FEATURES: Feature[] = [
  {
    title: "Search that understands style",
    description:
      "Typed intent, not keywords. Pixora blends category, tags and creator signals so one query surfaces the whole mood.",
    icon: Search,
  },
  {
    title: "Boards that behave like a studio wall",
    description:
      "Group saved ideas into colour-coded boards, reorder by instinct and share a single board when the concept lands.",
    icon: Blocks,
  },
  {
    title: "Built for speed",
    description:
      "Edge-cached media responses, progressive images and a masonry layout that never blocks the main thread.",
    icon: Gauge,
  },
  {
    title: "Private by default",
    description:
      "Your library lives on your device first. Cloud sync is opt-in, keyed to your account and protected by row-level security.",
    icon: Lock,
  },
  {
    title: "Share in one tap",
    description:
      "Every item gets a clean permalink with social preview cards — perfect for client decks and mood boards.",
    icon: Share2,
  },
  {
    title: "Free first",
    description:
      "No subscription, no paid APIs and no upsells. Pixora runs entirely on free-tier infrastructure and open media.",
    icon: Wand2,
  },
];

export interface Faq {
  question: string;
  answer: string;
  category: "Getting started" | "Library" | "Accounts" | "Privacy";
}

export const FAQS: Faq[] = [
  {
    category: "Getting started",
    question: "Do I need an account to use Pixora?",
    answer:
      "No. Searching, browsing and saving all work instantly in your browser. Creating an account simply mirrors your library to the cloud so it follows you across devices.",
  },
  {
    category: "Getting started",
    question: "Where does the media come from?",
    answer:
      "Live results come from the Pixabay API through a server-side proxy, so the API key never reaches the browser. Without a key configured, Pixora serves its bundled sample library and labels the feed accordingly.",
  },
  {
    category: "Getting started",
    question: "Can I search videos as well as photos?",
    answer:
      "Yes — switch the feed to Videos on Explore or Discover. Video cards open a detail page with inline playback, related clips and the same save/share actions.",
  },
  {
    category: "Library",
    question: "How do boards work?",
    answer:
      "Create a board from any save dialog or the Boards page, then add items to one or many boards. Boards are stored locally and synced to your account when you're signed in.",
  },
  {
    category: "Library",
    question: "Can I export my library?",
    answer:
      "Settings → Data exports a JSON snapshot of every saved item, board and preference. Nothing is locked in — you can delete all local data from the same screen.",
  },
  {
    category: "Accounts",
    question: "I never received a confirmation email.",
    answer:
      "Check spam, then use Resend verification from the account dialog. Project owners should confirm the Supabase SMTP provider and site URL are configured.",
  },
  {
    category: "Accounts",
    question: "How do I sign in without a password?",
    answer:
      "Choose the magic-link tab in the account dialog. Pixora emails a one-time link that signs you in on the same device.",
  },
  {
    category: "Privacy",
    question: "What data does Pixora store?",
    answer:
      "Locally: your theme, preferences, saved items, boards and recent searches. In the cloud (only when you sign in and only if Supabase is configured): your account email, saved items and boards — never a service-role key, never the media API key.",
  },
  {
    category: "Privacy",
    question: "Does Pixora sell my data?",
    answer:
      "No. Pixora has no ad network, no third-party analytics and no data resale. See the Privacy page for the full breakdown.",
  },
];

export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  highlights: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "2.0.0",
    date: "2026-10-23",
    title: "The platform edition",
    highlights: [
      "Rebuilt on a routed, page-based architecture with shared layouts and server-side rendering friendly SEO.",
      "New design system: tokenised light/dark themes, motion-reduced animations and accessible focus states.",
      "Boards, likes, recent searches and cloud sync through Supabase with row-level security.",
      "Command palette (⌘K), global shortcuts, toasts and an offline-safe demo library.",
      "Hardened API layer: rate limiting, response caching, typed contracts and a zero-config demo fallback.",
    ],
  },
  {
    version: "1.0.0",
    date: "2026-10-19",
    title: "First release",
    highlights: [
      "Responsive masonry discovery feed with category filters and infinite scroll.",
      "Server-side Pixabay proxy, light/dark theme and Supabase email authentication.",
    ],
  },
];
