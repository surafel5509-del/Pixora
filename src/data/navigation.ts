import {
  Bookmark,
  Compass,
  Folder,
  HelpCircle,
  LayoutGrid,
  Settings2,
  Sparkles,
  Upload,
  UserRound,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  description?: string;
  badge?: string;
  requiresAuth?: boolean;
}

export const PRIMARY_NAV: NavItem[] = [
  { label: "Discover", to: "/", icon: Compass, description: "Your daily inspiration feed" },
  { label: "Explore", to: "/explore", icon: LayoutGrid, description: "Search every category" },
  { label: "Saved", to: "/saved", icon: Bookmark, description: "Everything you've kept" },
  { label: "Boards", to: "/boards", icon: Folder, description: "Curated collections" },
];

export const SECONDARY_NAV: NavItem[] = [
  { label: "Contribute", to: "/contribute", icon: Upload, description: "Add media to the library" },
  { label: "Profile", to: "/profile", icon: UserRound, description: "Account and library stats" },
  { label: "Settings", to: "/settings", icon: Settings2, description: "Appearance and data" },
  { label: "Help", to: "/help", icon: HelpCircle, description: "Guides and answers" },
];

export const MOBILE_NAV: NavItem[] = [
  { label: "Discover", to: "/", icon: Sparkles },
  { label: "Explore", to: "/explore", icon: LayoutGrid },
  { label: "Saved", to: "/saved", icon: Bookmark },
  { label: "Boards", to: "/boards", icon: Folder },
  { label: "Profile", to: "/profile", icon: UserRound },
];

export const FOOTER_COLUMNS: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: "Discover",
    links: [
      { label: "Home feed", to: "/" },
      { label: "Explore", to: "/explore" },
      { label: "Saved ideas", to: "/saved" },
      { label: "Boards", to: "/boards" },
    ],
  },
  {
    title: "Create",
    links: [
      { label: "Contribute media", to: "/contribute" },
      { label: "Creator guidelines", to: "/help#guidelines" },
      { label: "Licensing", to: "/help#licensing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Pixora", to: "/about" },
      { label: "Changelog", to: "/about#changelog" },
      { label: "Help centre", to: "/help" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", to: "/privacy" },
      { label: "Terms", to: "/terms" },
      { label: "Security", to: "/privacy#security" },
    ],
  },
];
