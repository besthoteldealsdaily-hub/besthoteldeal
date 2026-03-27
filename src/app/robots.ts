import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // ── All crawlers: access indexable content, block admin/internal ───────
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",          // All API routes — not indexable content
          "/_next/",        // Next.js internals — never crawl
          "/book/",         // Booking confirmation forms — thin, not SEO content
          "/admin/",        // Internal platform dashboard — noindex
          "/grow/",         // Internal growth/investor page — noindex
        ],
      },

      // ── Googlebot: explicit path allowlist for crawl budget precision ──────
      // Only allow high-value content paths; disallow everything else
      {
        userAgent: "Googlebot",
        allow: [
          "/",
          "/city/",
          "/country/",
          "/landmark/",
          "/collection/",
          "/deals/",
          "/blog/",
          "/umrah/",
          "/transfers/",
          "/about/",
          "/partner/",
          "/careers/",
          "/ventures/",
          "/flights/",
          "/experiences/",
        ],
        disallow: [
          "/api/",
          "/_next/",
          "/book/",
          "/admin/",
          "/grow/",
        ],
      },

      // ── Bingbot: full access to indexable content ──────────────────────────
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/api/", "/_next/", "/book/", "/admin/", "/grow/"],
      },

      // ── AI crawlers: allowed to read public content for LLM citation ───────
      // Ensures platform content is citable by GPT, Claude, Perplexity, Gemini
      {
        userAgent: "GPTBot",
        allow: ["/", "/city/", "/country/", "/landmark/", "/collection/", "/deals/", "/blog/", "/umrah/", "/transfers/"],
        disallow: ["/api/", "/_next/", "/book/", "/admin/", "/grow/"],
      },
      {
        userAgent: "anthropic-ai",
        allow: ["/", "/city/", "/country/", "/landmark/", "/collection/", "/deals/", "/blog/", "/umrah/", "/transfers/"],
        disallow: ["/api/", "/_next/", "/book/", "/admin/", "/grow/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: ["/", "/city/", "/country/", "/landmark/", "/collection/", "/deals/", "/blog/", "/umrah/", "/transfers/"],
        disallow: ["/api/", "/_next/", "/book/", "/admin/", "/grow/"],
      },
      {
        userAgent: "Applebot",
        allow: ["/", "/city/", "/country/", "/deals/", "/blog/"],
        disallow: ["/api/", "/_next/", "/book/", "/admin/", "/grow/"],
      },

      // ── Heavyweight scrapers: rate-limit via disallow list ─────────────────
      // These bots add no indexing value and consume crawl budget
      {
        userAgent: "AhrefsBot",
        disallow: ["/api/", "/_next/", "/admin/", "/grow/", "/book/"],
      },
      {
        userAgent: "SemrushBot",
        disallow: ["/api/", "/_next/", "/admin/", "/grow/", "/book/"],
      },
      {
        userAgent: "MJ12bot",
        disallow: "/",
      },
      {
        userAgent: "DotBot",
        disallow: "/",
      },
    ],
    sitemap: "https://besthoteldealsdaily.com/sitemap.xml",
    host: "https://besthoteldealsdaily.com",
  };
}
