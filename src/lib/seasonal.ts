/**
 * Seasonal Demand Engine
 *
 * Detects current travel season/period and returns contextual data
 * for dynamic content, trending badges, and priority sorting.
 *
 * Islamic dates (Ramadan, Eid, Hajj) shift ~11 days earlier each
 * Gregorian year. This module uses a lookup table of approximate
 * Gregorian dates for each Islamic event, covering 2025-2030.
 * Beyond that range, it falls back to the secular calendar seasons
 * (summer low / winter peak) which are fixed.
 *
 * To extend: add a new year entry to ISLAMIC_DATES.
 */

import { getCurrentDate } from "@/lib/config";

export interface SeasonalContext {
  id: string;
  label: string;
  description: string;
  priorityCities: string[];
  trendingCategories: string[];
  demandLevel: "peak" | "high" | "moderate" | "low";
  bannerMessage: string;
  badgeText: string;
}

// ── Approximate Gregorian dates for Islamic events (add years as needed) ──
const ISLAMIC_DATES: Record<number, { ramadanStart: string; ramadanEnd: string; hajjStart: string; hajjEnd: string }> = {
  2025: { ramadanStart: "02-28", ramadanEnd: "03-30", hajjStart: "06-05", hajjEnd: "06-10" },
  2026: { ramadanStart: "02-17", ramadanEnd: "03-19", hajjStart: "05-26", hajjEnd: "05-31" },
  2027: { ramadanStart: "02-07", ramadanEnd: "03-09", hajjStart: "05-15", hajjEnd: "05-20" },
  2028: { ramadanStart: "01-27", ramadanEnd: "02-26", hajjStart: "05-04", hajjEnd: "05-09" },
  2029: { ramadanStart: "01-15", ramadanEnd: "02-14", hajjStart: "04-23", hajjEnd: "04-28" },
  2030: { ramadanStart: "01-05", ramadanEnd: "02-04", hajjStart: "04-12", hajjEnd: "04-17" },
};

type SeasonDef = { start: string; end: string; context: SeasonalContext };

/**
 * Build the season calendar for a given year.
 * Combines Islamic events (year-specific) with fixed secular seasons.
 */
function buildSeasons(year: number): SeasonDef[] {
  const seasons: SeasonDef[] = [];
  const islamic = ISLAMIC_DATES[year];

  if (islamic) {
    // Ramadan
    seasons.push({
      start: `${year}-${islamic.ramadanStart}`,
      end: `${year}-${islamic.ramadanEnd}`,
      context: {
        id: `ramadan-${year}`,
        label: `Ramadan ${year}`,
        description: "The holy month of Ramadan brings peak demand for hotels near Masjid Al Haram and Al-Masjid an-Nabawi. Many pilgrims perform Umrah during this period.",
        priorityCities: ["makkah", "madinah"],
        trendingCategories: ["near-haram"],
        demandLevel: "peak",
        bannerMessage: `Ramadan ${year} — Book Makkah & Madinah Hotels Early for Best Rates`,
        badgeText: "Ramadan Peak",
      },
    });

    // Eid Al Fitr (3 days after Ramadan ends)
    const eidStart = new Date(`${year}-${islamic.ramadanEnd}`);
    eidStart.setDate(eidStart.getDate() + 1);
    const eidEnd = new Date(eidStart);
    eidEnd.setDate(eidEnd.getDate() + 2);
    seasons.push({
      start: eidStart.toISOString().split("T")[0],
      end: eidEnd.toISOString().split("T")[0],
      context: {
        id: `eid-al-fitr-${year}`,
        label: `Eid Al Fitr ${year}`,
        description: "Eid Al Fitr marks the end of Ramadan. Hotels across all Gulf cities see a surge as families celebrate with travel and staycations.",
        priorityCities: ["dubai", "makkah", "doha", "manama"],
        trendingCategories: ["luxury", "family"],
        demandLevel: "peak",
        bannerMessage: "Eid Al Fitr — Celebrate with the Best Hotel Deals Across the Gulf",
        badgeText: "Eid Special",
      },
    });

    // Hajj
    seasons.push({
      start: `${year}-${islamic.hajjStart}`,
      end: `${year}-${islamic.hajjEnd}`,
      context: {
        id: `hajj-${year}`,
        label: `Hajj Season ${year}`,
        description: "Hajj is the largest annual pilgrimage. Makkah and Madinah experience maximum hotel demand with prices peaking 4-6x normal rates.",
        priorityCities: ["makkah", "madinah"],
        trendingCategories: ["near-haram", "budget"],
        demandLevel: "peak",
        bannerMessage: `Hajj ${year} — Secure Your Makkah Hotel Now Before Prices Surge`,
        badgeText: "Hajj Season",
      },
    });
  }

  // Fixed secular seasons (same every year)
  seasons.push(
    {
      start: `${year}-06-01`,
      end: `${year}-09-15`,
      context: {
        id: `summer-${year}`,
        label: "Summer Season",
        description: "Summer brings extreme heat across the Gulf but also the biggest discounts. Dubai indoor resorts and Bahrain beach hotels offer exceptional value.",
        priorityCities: ["dubai", "manama", "muscat"],
        trendingCategories: ["luxury", "family"],
        demandLevel: "low",
        bannerMessage: "Summer Sale — Up to 60% Off Dubai & Bahrain Hotels",
        badgeText: "Summer Deal",
      },
    },
    {
      start: `${year}-10-01`,
      end: `${year}-12-20`,
      context: {
        id: `winter-peak-${year}`,
        label: "Winter Peak Season",
        description: "The most popular travel season with ideal weather. Dubai Shopping Festival, Qatar events, and Riyadh Season drive high demand across the region.",
        priorityCities: ["dubai", "riyadh", "doha"],
        trendingCategories: ["luxury", "budget"],
        demandLevel: "high",
        bannerMessage: "Winter Season — Best Weather, Best Deals Across the Middle East",
        badgeText: "Peak Season",
      },
    },
  );

  return seasons;
}

/**
 * Get the current seasonal context based on today's date.
 * Falls back to a neutral context when no specific season matches.
 */
export function getSeasonalContext(date?: Date): SeasonalContext {
  const today = date || getCurrentDate();
  const todayStr = today.toISOString().split("T")[0];
  const year = today.getFullYear();

  // Check current year and adjacent years (Ramadan can span year boundaries)
  for (const y of [year, year - 1, year + 1]) {
    const seasons = buildSeasons(y);
    for (const season of seasons) {
      if (todayStr >= season.start && todayStr <= season.end) {
        return season.context;
      }
    }
  }

  // Default: no specific season
  return {
    id: "default",
    label: "Year-Round Deals",
    description: "Compare verified hotel deals across the Middle East, updated daily.",
    priorityCities: ["dubai", "makkah", "doha"],
    trendingCategories: [],
    demandLevel: "moderate",
    bannerMessage: "Best Hotel Deals Updated Daily — Compare & Save Up To 50%",
    badgeText: "",
  };
}

/**
 * Check if a specific city is currently trending based on seasonal demand.
 */
export function isCityTrending(citySlug: string, date?: Date): boolean {
  const ctx = getSeasonalContext(date);
  return ctx.priorityCities.includes(citySlug);
}

/**
 * Get a demand multiplier for smart sorting.
 * Higher values = higher seasonal demand = should appear first.
 */
export function getDemandMultiplier(citySlug: string, date?: Date): number {
  const ctx = getSeasonalContext(date);
  const baseLevels: Record<string, number> = {
    peak: 3.0,
    high: 2.0,
    moderate: 1.0,
    low: 0.7,
  };

  const base = baseLevels[ctx.demandLevel];
  const isTrending = ctx.priorityCities.includes(citySlug);
  return isTrending ? base * 1.5 : base;
}
