/**
 * Ecosystem Configuration
 *
 * Central registry of all portfolio platforms and verticals.
 * Used for cross-linking, navigation, admin dashboard, and portfolio presentation.
 */

export interface EcosystemPlatform {
  id: string;
  name: string;
  tagline: string;
  description: string;
  href: string;
  status: "live" | "coming-soon" | "planned";
  icon: string; // Lucide icon name reference
  color: string; // Tailwind color for branding
  revenueModel: string[];
  cities: string[];
  metrics?: {
    listings?: number;
    cities?: number;
    label?: string;
  };
}

export const ECOSYSTEM: EcosystemPlatform[] = [
  {
    id: "hotels",
    name: "Best Hotel Deals Daily",
    tagline: "Compare & book the best hotel rates across the Middle East",
    description:
      "The flagship platform — comparing 500+ verified hotel deals across Dubai, Makkah, Doha, Riyadh, and 8 cities. Multi-revenue model with affiliate, direct bookings, and lead generation.",
    href: "/",
    status: "live",
    icon: "Building2",
    color: "navy",
    revenueModel: ["affiliate", "direct-booking", "lead-generation"],
    cities: ["Dubai", "Makkah", "Madinah", "Riyadh", "Doha", "Manama", "Kuwait City", "Muscat"],
    metrics: { listings: 30, cities: 8, label: "Hotels" },
  },
  {
    id: "umrah",
    name: "Best Umrah Deals Daily",
    tagline: "Verified Umrah & Hajj packages from trusted operators",
    description:
      "Complete Umrah and Hajj package comparison — covering flights, hotels near Haram, ground transport, and visa assistance. Connects pilgrims with verified travel operators across the Gulf.",
    href: "/umrah/",
    status: "live",
    icon: "MoonStar",
    color: "emerald",
    revenueModel: ["lead-generation", "affiliate", "package-commission"],
    cities: ["Makkah", "Madinah", "Jeddah"],
    metrics: { listings: 12, cities: 3, label: "Packages" },
  },
  {
    id: "transfers",
    name: "Best Transfer Deals Daily",
    tagline: "Airport transfers & car rentals across the Middle East",
    description:
      "Airport pickup, hotel transfers, and inter-city transport comparison. Pre-book verified drivers and rental cars for seamless Middle East travel.",
    href: "/transfers/",
    status: "live",
    icon: "Car",
    color: "blue",
    revenueModel: ["lead-generation", "affiliate"],
    cities: ["Dubai", "Jeddah", "Riyadh", "Doha", "Muscat"],
    metrics: { listings: 8, cities: 5, label: "Routes" },
  },
  {
    id: "flights",
    name: "Best Flight Deals Daily",
    tagline: "Cheap flights to and within the Middle East",
    description:
      "Flight deal aggregation for routes to/from Dubai, Jeddah, Doha, and key Middle East hubs. Focused on Umrah season routes, business travel corridors, and budget carriers.",
    href: "/flights/",
    status: "coming-soon",
    icon: "Plane",
    color: "sky",
    revenueModel: ["affiliate", "meta-search"],
    cities: ["Dubai", "Jeddah", "Doha", "Riyadh", "Kuwait City"],
  },
  {
    id: "experiences",
    name: "Best Experience Deals Daily",
    tagline: "Tours, activities & local experiences",
    description:
      "Curated local experiences — desert safaris in Dubai, historical tours in Riyadh, dhow cruises in Doha, and cultural experiences across the Gulf.",
    href: "/experiences/",
    status: "coming-soon",
    icon: "Compass",
    color: "amber",
    revenueModel: ["affiliate", "commission"],
    cities: ["Dubai", "Riyadh", "Doha", "Muscat"],
  },
];

/**
 * Get only live platforms for active cross-linking.
 */
export function getLivePlatforms(): EcosystemPlatform[] {
  return ECOSYSTEM.filter((p) => p.status === "live");
}

/**
 * Get platforms relevant to a specific city.
 */
export function getPlatformsForCity(city: string): EcosystemPlatform[] {
  return ECOSYSTEM.filter(
    (p) => p.status === "live" && p.cities.some((c) => c.toLowerCase() === city.toLowerCase())
  );
}

/**
 * Get cross-sell platforms (exclude a given platform ID).
 */
export function getCrossSellPlatforms(excludeId: string): EcosystemPlatform[] {
  return ECOSYSTEM.filter((p) => p.id !== excludeId && p.status === "live");
}
