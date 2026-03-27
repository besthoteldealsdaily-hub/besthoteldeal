/**
 * Centralized Site Configuration
 *
 * Single source of truth for brand identity, contact info,
 * and business settings. Any value that appears in 3+ places
 * should live here instead of being hardcoded.
 */

export const SITE = {
  name: "Best Hotel Deals Daily",
  shortName: "BHDD",
  domain: "besthoteldealsdaily.com",
  url: "https://besthoteldealsdaily.com",
  tagline: "Compare & Book the Best Hotel Deals in the Middle East",
  description:
    "Your trusted source for the best hotel deals across the Middle East. Compare prices on Booking.com, Agoda, and Expedia — we find the best rates daily.",

  // Contact
  email: "info@besthoteldealsdaily.com",
  careersEmail: "careers@besthoteldealsdaily.com",
  whatsapp: "966569487569",

  // Social
  socials: {
    twitter: "",
    instagram: "",
    facebook: "",
  },

  // Business
  supportedCountries: ["UAE", "Saudi Arabia", "Qatar", "Bahrain", "Kuwait", "Oman"],
  primaryCurrencies: ["AED", "SAR", "QAR", "BHD", "KWD", "OMR", "USD"],

  // Affiliate partners
  affiliatePartners: ["Booking.com", "Agoda", "Expedia", "Hotels.com"],
} as const;

/** Build a WhatsApp deep link with a pre-filled message */
export function whatsappLink(message: string): string {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
}

/**
 * Dynamic Date Utilities
 *
 * All date references across the site should use these helpers
 * instead of hardcoded date strings. This ensures dates stay
 * current on each build or render.
 */

/** Current date — use instead of hardcoded date strings */
export function getCurrentDate(): Date {
  return new Date();
}

/** Format a date for user-facing display (e.g. "19 March 2026") */
export function formatDisplayDate(date?: Date): string {
  const d = date || getCurrentDate();
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/** Format a date for compact display (e.g. "19 Mar") */
export function formatShortDate(date?: Date): string {
  const d = date || getCurrentDate();
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/** Check if a deal/date is still valid (not expired) */
export function isNotExpired(dateStr: string): boolean {
  return new Date(dateStr) >= getCurrentDate();
}

/** Days until a future date (for urgency: "3 days left") */
export function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - getCurrentDate().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/** Check if a date is within N days from now */
export function isWithinDays(dateStr: string, days: number): boolean {
  const d = daysUntil(dateStr);
  return d >= 0 && d <= days;
}

/**
 * Business Logic: High-Ticket Lead Detection
 *
 * Hotels/deals in holy cities, luxury tier, or above a price threshold
 * are routed to WhatsApp lead gen instead of standard affiliate links.
 * Centralised here so the threshold is consistent across HotelCard,
 * DealCard, and any future surfaces.
 */
const HIGH_TICKET_CITIES = ["makkah", "madinah"];
const HIGH_TICKET_PRICE = 1000;

export function isHighTicketHotel(city: string, type: string, priceFrom: number): boolean {
  return HIGH_TICKET_CITIES.includes(city) || type === "luxury" || priceFrom >= HIGH_TICKET_PRICE;
}

export function isHighTicketDeal(city: string, discountedPrice: number): boolean {
  return HIGH_TICKET_CITIES.includes(city) || discountedPrice >= 800;
}
