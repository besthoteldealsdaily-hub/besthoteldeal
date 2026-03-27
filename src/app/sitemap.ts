import { MetadataRoute } from "next";
import { cities, countries, deals, blogPosts, landmarks, categories } from "@/lib/data";
import { umrahPackages } from "@/lib/umrah-data";
import { transferRoutes } from "@/lib/transfers-data";

const BASE_URL = "https://besthoteldealsdaily.com";
const BUILD_DATE = new Date();

// ── Landmark slug → individual priority overrides ────────────────────────────
// Religious proximity pages capture the highest-value pilgrim search traffic
const LANDMARK_PRIORITY: Record<string, number> = {
  "masjid-al-haram-makkah": 0.93,          // #1 search intent: Haram-proximity hotels
  "al-masjid-an-nabawi-madinah": 0.91,      // #2: Nabawi-proximity hotels
  "abraj-al-bait-makkah": 0.87,             // Makkah Clock Tower — extremely high pilgrim search volume
  "burj-khalifa-dubai": 0.86,               // Highest tourism landmark in Gulf
  "palm-jumeirah-dubai": 0.85,              // Premium long-tail — beach/resort intent
  "yas-island-abu-dhabi": 0.84,             // F1 + theme park traffic spike
  "dubai-international-airport": 0.83,      // High volume transactional: "hotel near DXB"
  "dubai-mall-downtown-dubai": 0.82,
  "difc-dubai-financial-centre": 0.81,      // Business traveler intent
  "sheikh-zayed-grand-mosque-abu-dhabi": 0.80,
  "the-pearl-qatar-doha": 0.80,
  "saadiyat-island-abu-dhabi": 0.79,
  "souq-waqif-doha": 0.78,
  "museum-of-islamic-art-doha": 0.77,
  "sultan-qaboos-grand-mosque-muscat": 0.76,
};

// ── Cities with elevated priority ────────────────────────────────────────────
// Makkah/Madinah: pilgrim search is the #1 traffic source
// Dubai: highest tourism volume in the Gulf
// Abu Dhabi: full SEO content + landmark cluster + F1 seasonal spikes
const HIGH_PRIORITY_CITIES = new Set(["makkah", "madinah", "dubai", "abu-dhabi"]);

export default function sitemap(): MetadataRoute.Sitemap {

  // ── Tier 1: Core navigation hubs (highest priority) ──────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`,             lastModified: BUILD_DATE, changeFrequency: "daily",   priority: 1.0  },
    { url: `${BASE_URL}/deals/`,       lastModified: BUILD_DATE, changeFrequency: "daily",   priority: 0.95 },
    { url: `${BASE_URL}/umrah/`,       lastModified: BUILD_DATE, changeFrequency: "weekly",  priority: 0.90 },
    { url: `${BASE_URL}/transfers/`,   lastModified: BUILD_DATE, changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE_URL}/blog/`,        lastModified: BUILD_DATE, changeFrequency: "weekly",  priority: 0.82 },
    { url: `${BASE_URL}/about/`,       lastModified: BUILD_DATE, changeFrequency: "monthly", priority: 0.60 },
    { url: `${BASE_URL}/partner/`,     lastModified: BUILD_DATE, changeFrequency: "monthly", priority: 0.60 },
    { url: `${BASE_URL}/careers/`,     lastModified: BUILD_DATE, changeFrequency: "monthly", priority: 0.55 },
    { url: `${BASE_URL}/ventures/`,    lastModified: BUILD_DATE, changeFrequency: "monthly", priority: 0.50 },
    { url: `${BASE_URL}/flights/`,     lastModified: BUILD_DATE, changeFrequency: "monthly", priority: 0.40 },
    { url: `${BASE_URL}/experiences/`, lastModified: BUILD_DATE, changeFrequency: "monthly", priority: 0.40 },
  ];

  // ── Tier 2: Country hubs (topical authority nodes) ────────────────────────
  const countryPages: MetadataRoute.Sitemap = countries.map((c) => ({
    url: `${BASE_URL}/country/${c.slug}/`,
    lastModified: BUILD_DATE,
    changeFrequency: "weekly" as const,
    priority: 0.87,
  }));

  // ── Tier 3: City pages (primary traffic catchers) ─────────────────────────
  const cityPages: MetadataRoute.Sitemap = cities.map((c) => ({
    url: `${BASE_URL}/city/${c.slug}/`,
    lastModified: BUILD_DATE,
    changeFrequency: "daily" as const,
    priority: HIGH_PRIORITY_CITIES.has(c.slug) ? 0.95 : 0.85,
  }));

  // ── Tier 4: Landmark pages (geo-intent long-tail) ─────────────────────────
  // Individually prioritised by search volume and commercial intent.
  // Religious landmarks receive highest priority due to pilgrim search dominance.
  const landmarkPages: MetadataRoute.Sitemap = landmarks.map((l) => ({
    url: `${BASE_URL}/landmark/${l.slug}/`,
    lastModified: BUILD_DATE,
    changeFrequency: "weekly" as const,
    priority: LANDMARK_PRIORITY[l.slug] ?? 0.76,
  }));

  // ── Tier 5: Collection pages (intent-driven category hubs) ────────────────
  const collectionPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${BASE_URL}/collection/${cat.slug}/`,
    lastModified: BUILD_DATE,
    changeFrequency: "weekly" as const,
    priority: cat.slug === "near-haram" ? 0.88 : 0.76,
  }));

  // ── Tier 6: Deal detail pages (transactional, time-sensitive) ─────────────
  // Featured deals indexed more aggressively — these drive direct conversion.
  const dealPages: MetadataRoute.Sitemap = deals.map((d) => ({
    url: `${BASE_URL}/deals/${d.slug}/`,
    lastModified: new Date(d.lastUpdated),
    changeFrequency: "daily" as const,
    priority: d.featured ? 0.85 : 0.78,
  }));

  // ── Tier 7: Blog posts (topical authority builders) ───────────────────────
  // Higher read-time posts are more comprehensive — signal greater depth.
  const blogPages: MetadataRoute.Sitemap = blogPosts.map((b) => ({
    url: `${BASE_URL}/blog/${b.slug}/`,
    lastModified: new Date(b.updatedAt),
    changeFrequency: "weekly" as const,
    priority: b.readTime >= 8 ? 0.76 : 0.70,
  }));

  // ── Tier 8: Umrah package detail pages ────────────────────────────────────
  const umrahPages: MetadataRoute.Sitemap = umrahPackages.map((p) => ({
    url: `${BASE_URL}/umrah/${p.slug}/`,
    lastModified: BUILD_DATE,
    changeFrequency: "weekly" as const,
    priority: 0.82,
  }));

  // ── Tier 9: Transfer route detail pages ───────────────────────────────────
  const transferPages: MetadataRoute.Sitemap = transferRoutes.map((t) => ({
    url: `${BASE_URL}/transfers/${t.slug}/`,
    lastModified: BUILD_DATE,
    changeFrequency: "weekly" as const,
    priority: 0.76,
  }));

  return [
    ...staticPages,
    ...countryPages,
    ...cityPages,
    ...landmarkPages,
    ...collectionPages,
    ...dealPages,
    ...blogPages,
    ...umrahPages,
    ...transferPages,
  ];
}
