import { NextRequest } from "next/server";
import { hotels, deals, cities, countries, blogPosts, landmarks, categories } from "@/lib/data";
import { umrahPackages } from "@/lib/umrah-data";
import { transferRoutes } from "@/lib/transfers-data";
import { ECOSYSTEM } from "@/lib/ecosystem";

/**
 * Growth Metrics API
 * Returns TAM/SAM/SOM, unit economics, and scaling projections
 * for investor presentations and due diligence.
 */
export async function GET(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const expectedToken = process.env.ADMIN_API_TOKEN;

  if (expectedToken && token !== expectedToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const totalListings = hotels.length + umrahPackages.length + transferRoutes.length;
  const totalPages =
    hotels.length + deals.length + cities.length + countries.length +
    blogPosts.length + landmarks.length + categories.length +
    umrahPackages.length + transferRoutes.length + 12;

  return Response.json({
    generatedAt: new Date().toISOString(),

    // ── Market Size ──────────────────────────────────────────────────────
    market: {
      tam: { value: "$133B", label: "Middle East Travel Market by 2028" },
      sam: { value: "$18B", label: "Middle East Online Hotel Booking Market" },
      som: { value: "$50M", label: "Addressable market with current geo/vertical focus" },
      pilgrimageMarket: { value: "$12B", label: "Annual Umrah & Hajj spending" },
      growthRate: "8-12% CAGR",
    },

    // ── Current Traction ────────────────────────────────────────────────
    traction: {
      livePlatforms: ECOSYSTEM.filter((p) => p.status === "live").length,
      totalPlatforms: ECOSYSTEM.length,
      totalListings,
      totalSEOPages: totalPages,
      citiesCovered: cities.length,
      countriesCovered: countries.length,
      revenueStreams: ["affiliate", "direct-booking", "lead-generation", "package-commission"],
      verticals: ECOSYSTEM.map((p) => ({
        id: p.id,
        name: p.name,
        status: p.status,
        revenueModel: p.revenueModel,
        listings: p.metrics?.listings || 0,
      })),
    },

    // ── Unit Economics ───────────────────────────────────────────────────
    unitEconomics: {
      affiliateCPA: { range: "$3-8", note: "Per booking via OTA partner programs" },
      directCommission: { range: "10-15%", note: "Per direct booking processed" },
      leadValue: { range: "$15-50", note: "WhatsApp leads for high-ticket properties" },
      supplyCostPerHotel: { range: "$0", note: "Self-serve onboarding pipeline" },
      contentCostPerPage: { range: "$0", note: "Programmatic generation from structured data" },
      marginalCostPerUser: { range: "~$0", note: "Static hosting + CDN (Vercel/Cloudflare)" },
    },

    // ── Scaling Projections ─────────────────────────────────────────────
    projections: {
      phase3: {
        timeline: "Q2-Q3 2026",
        targets: {
          hotels: 200,
          cities: 15,
          verticals: 5,
          seoPages: 500,
          monthlyTraffic: "50K-100K organic",
        },
        keyActions: [
          "Launch flights vertical",
          "Launch experiences vertical",
          "Expand to Egypt, Turkey, Morocco",
          "Hire content ops + partnerships + growth",
        ],
      },
      phase4: {
        timeline: "Q4 2026 - 2027",
        targets: {
          hotels: 1000,
          cities: 30,
          verticals: 7,
          seoPages: 2000,
          monthlyTraffic: "500K+ organic",
        },
        keyActions: [
          "Real-time pricing API integration",
          "Dynamic packaging (hotel + flight + transfer)",
          "Mobile app launch",
          "B2B white-label for travel agencies",
          "Central Asia expansion",
        ],
      },
    },

    // ── Competitive Moat ────────────────────────────────────────────────
    moat: {
      programmaticSEO: `${totalPages} auto-generated pages with schema markup`,
      seasonalIntelligence: "Ramadan, Hajj, Eid, summer/winter demand engine",
      multiVertical: `${ECOSYSTEM.length} verticals on shared infrastructure`,
      supplySide: "Self-serve partner onboarding, zero acquisition cost",
      aiSearchReady: "FAQ schemas, zero-click answers, AI crawler access",
      nicheFocus: "Only dedicated Middle East hotel comparison platform",
    },

    // ── Key Hires ───────────────────────────────────────────────────────
    hiringPlan: [
      { role: "Content Operations Manager", priority: 1, impact: "7x content output" },
      { role: "Partnerships Lead", priority: 1, impact: "200+ hotel partners" },
      { role: "Growth Marketer", priority: 2, impact: "10x organic traffic" },
    ],
  });
}
