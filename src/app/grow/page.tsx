import type { Metadata } from "next";
import Link from "next/link";
import { hotels, deals, cities, countries, blogPosts, landmarks, categories } from "@/lib/data";
import { umrahPackages } from "@/lib/umrah-data";
import { transferRoutes } from "@/lib/transfers-data";
import { ECOSYSTEM } from "@/lib/ecosystem";
import {
  TrendingUp, Globe, DollarSign, Users, Building2, Shield, Target,
  BarChart3, Layers, Zap, ArrowRight, CheckCircle, MoonStar, Car, Plane, Compass
} from "lucide-react";

export const metadata: Metadata = {
  title: "Growth & Investment – Best Deals Daily Ecosystem",
  description:
    "Best Deals Daily is building the Middle East's leading travel platform ecosystem. Learn about our market opportunity, traction, and growth roadmap.",
  alternates: { canonical: "https://besthoteldealsdaily.com/grow/" },
  robots: { index: false, follow: false },
};

export default function GrowPage() {
  const totalListings = hotels.length + umrahPackages.length + transferRoutes.length;
  const totalPages =
    hotels.length + deals.length + cities.length + countries.length +
    blogPosts.length + landmarks.length + categories.length +
    umrahPackages.length + transferRoutes.length + 12;
  const livePlatforms = ECOSYSTEM.filter((p) => p.status === "live").length;

  return (
    <div className="min-h-screen bg-white pt-14">
      {/* Hero */}
      <div className="bg-navy-950 pt-20 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-gold-500/15 border border-gold-500/30 rounded-full px-3 py-1 mb-6">
            <TrendingUp className="w-3 h-3 text-gold-400" />
            <span className="text-gold-400 text-[10px] font-black uppercase tracking-widest">
              Growth &amp; Investment
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black text-white leading-tight mb-6">
            Building the Middle East&apos;s Travel{" "}
            <span className="text-gold-gradient">Super Platform</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
            A multi-vertical travel ecosystem purpose-built for the world&apos;s
            fastest-growing travel market. Programmatic SEO, AI content systems,
            hybrid monetization — scaling from {livePlatforms} live platforms to
            full market coverage.
          </p>
        </div>
      </div>

      {/* Key Metrics Strip */}
      <div className="bg-navy-900 border-t border-navy-800">
        <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
          {[
            { value: `${livePlatforms}`, label: "Live Platforms", sub: `${ECOSYSTEM.length} total` },
            { value: `${totalListings}+`, label: "Listings", sub: "Hotels + Packages + Routes" },
            { value: `${totalPages}+`, label: "SEO Pages", sub: "Indexed & ranking" },
            { value: `${cities.length}`, label: "Cities", sub: `${countries.length} countries` },
            { value: "3+", label: "Revenue Streams", sub: "Affiliate · Direct · Leads" },
          ].map((m) => (
            <div key={m.label}>
              <div className="text-3xl font-black text-gold-400 font-display">{m.value}</div>
              <div className="text-white text-sm font-bold mt-1">{m.label}</div>
              <div className="text-gray-500 text-xs">{m.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Opportunity */}
      <div className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-black text-navy-900 mb-4">
              The Market Opportunity
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              The Middle East travel market is projected to reach $133B by 2028.
              Religious tourism alone drives 20M+ pilgrims annually.
              No dominant vertical player exists.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Globe className="w-7 h-7" />,
                stat: "$133B",
                label: "Middle East Travel Market by 2028",
                desc: "Driven by Vision 2030, Dubai tourism strategy, and Qatar/Bahrain diversification. Growing 8-12% annually — outpacing global travel growth.",
              },
              {
                icon: <MoonStar className="w-7 h-7" />,
                stat: "20M+",
                label: "Annual Pilgrims (Umrah + Hajj)",
                desc: "Saudi Arabia targets 30M Umrah visitors by 2030. Each pilgrim spends $3,000-$8,000 on accommodation, transport, and services.",
              },
              {
                icon: <Target className="w-7 h-7" />,
                stat: "No #1",
                label: "Regional Vertical Leader",
                desc: "Booking.com and Agoda treat MENA as a global afterthought. No dedicated platform owns the Middle East hotel comparison vertical.",
              },
            ].map((item) => (
              <div key={item.label} className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                <div className="w-14 h-14 bg-navy-50 rounded-2xl flex items-center justify-center text-navy-900 mb-4">
                  {item.icon}
                </div>
                <div className="text-3xl font-black text-navy-900 font-display mb-1">{item.stat}</div>
                <div className="text-sm font-bold text-navy-900 mb-3">{item.label}</div>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Growth Levers */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-black text-navy-900 mb-4 text-center">
            Growth Levers
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            Proven systems ready for capital-accelerated scaling.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "Programmatic SEO Machine",
                desc: `${totalPages}+ pages already indexed. Each new hotel, package, or route automatically generates an optimized page with schema markup, internal links, and AI-search answers. Content scales linearly with data input.`,
                metric: `${totalPages}+ pages`,
              },
              {
                title: "Multi-Vertical Expansion",
                desc: `${livePlatforms} live verticals (Hotels, Umrah, Transfers) with 2 more in pipeline (Flights, Experiences). Each vertical reuses the same SEO engine, tracking infrastructure, and monetization framework.`,
                metric: `${ECOSYSTEM.length} verticals`,
              },
              {
                title: "Hybrid Revenue Model",
                desc: "Affiliate commissions (Booking.com, Agoda, Expedia), direct booking fees (10-15%), WhatsApp lead generation for high-ticket properties, and package commissions. Revenue diversification built into the architecture.",
                metric: "3+ streams",
              },
              {
                title: "Seasonal Demand Engine",
                desc: "Automated content prioritization based on Ramadan, Hajj, Eid, and regional events. Deals, badges, and sorting adapt in real-time — capturing demand spikes that generic platforms miss.",
                metric: "5 seasons tracked",
              },
              {
                title: "Supply-Side Pipeline",
                desc: "Self-serve partner onboarding at /partner. Hotel owners submit applications, verified within 48 hours. Reduces CAC to near-zero for supply acquisition.",
                metric: "0 CAC",
              },
              {
                title: "AI & Automation Ready",
                desc: "Schema markup designed for Google AI Overviews and ChatGPT search. FAQ schemas serve zero-click answers. Platform is built to capture traffic from AI-driven search evolution.",
                metric: "AI-optimized",
              },
            ].map((lever) => (
              <div key={lever.title} className="bg-white rounded-2xl border border-gray-100 p-6 flex gap-4">
                <div className="shrink-0">
                  <div className="bg-gold-100 text-gold-700 text-[9px] font-black px-2 py-1 rounded-full">
                    {lever.metric}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-navy-900 mb-2">{lever.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{lever.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scaling Roadmap */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-black text-navy-900 mb-12 text-center">
            Scaling Roadmap
          </h2>

          <div className="space-y-0">
            {[
              {
                phase: "Phase 1 — Foundation",
                status: "complete",
                timeline: "Done",
                items: [
                  "Hotel comparison platform with 30+ properties across 8 cities",
                  "Programmatic SEO engine generating 70+ indexed pages",
                  "Hybrid monetization: affiliate + direct booking + lead gen",
                  "Seasonal demand engine for Ramadan, Hajj, Eid cycles",
                  "Partner onboarding pipeline + engagement analytics",
                ],
              },
              {
                phase: "Phase 2 — Multi-Vertical",
                status: "complete",
                timeline: "Done",
                items: [
                  "Umrah & Hajj packages vertical (6 packages, 3 tiers)",
                  "Airport transfers & car rentals (8 routes, 5 cities)",
                  "Cross-platform linking and shared ecosystem infrastructure",
                  "Portfolio hub page showcasing all verticals",
                  "Admin dashboard with cross-vertical KPI tracking",
                ],
              },
              {
                phase: "Phase 3 — Scale",
                status: "next",
                timeline: "Q2-Q3 2026",
                items: [
                  "Launch Flights vertical — Umrah routes + business corridors",
                  "Launch Experiences vertical — desert safaris, city tours, water activities",
                  "Expand hotel inventory to 200+ properties across 15 cities",
                  "Add Egypt (Cairo, Sharm), Turkey (Istanbul), and Morocco (Marrakech)",
                  "Hire: 1 content ops, 1 partnerships, 1 growth marketer",
                ],
              },
              {
                phase: "Phase 4 — Dominance",
                status: "planned",
                timeline: "Q4 2026 – 2027",
                items: [
                  "1,000+ hotel listings with real-time pricing API",
                  "Dynamic packaging: hotel + flight + transfer bundles",
                  "Mobile app launch (React Native, shared data layer)",
                  "B2B channel: white-label for travel agencies",
                  "Expansion into Central Asia (Uzbekistan, Kazakhstan)",
                ],
              },
            ].map((phase, i) => (
              <div key={phase.phase} className="flex gap-6">
                {/* Timeline line */}
                <div className="flex flex-col items-center shrink-0">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    phase.status === "complete" ? "bg-green-500 border-green-500" :
                    phase.status === "next" ? "bg-gold-500 border-gold-500" :
                    "bg-gray-200 border-gray-300"
                  }`} />
                  {i < 3 && <div className="w-0.5 flex-1 bg-gray-200 my-1" />}
                </div>
                {/* Content */}
                <div className="pb-10">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-display text-lg font-black text-navy-900">{phase.phase}</h3>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                      phase.status === "complete" ? "bg-green-100 text-green-700" :
                      phase.status === "next" ? "bg-gold-100 text-gold-700" :
                      "bg-gray-100 text-gray-500"
                    }`}>
                      {phase.timeline}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {phase.items.map((item) => (
                      <div key={item} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${
                          phase.status === "complete" ? "text-green-500" : "text-gray-300"
                        }`} />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Unit Economics */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-black text-navy-900 mb-12 text-center">
            Unit Economics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Affiliate Revenue",
                metric: "$3-8 CPA",
                desc: "Per booking via Booking.com, Agoda, Expedia programs. Zero inventory risk. Scales with traffic.",
                growth: "Scales with SEO pages",
              },
              {
                title: "Direct Booking Commission",
                metric: "10-15%",
                desc: "Commission on direct bookings processed through the platform. Higher margin than affiliate.",
                growth: "Scales with supply",
              },
              {
                title: "Lead Generation",
                metric: "$15-50/lead",
                desc: "WhatsApp and inquiry leads for high-ticket properties (luxury, Umrah, VIP). Premium pilgrimage packages generate highest CPL.",
                growth: "Scales with demand",
              },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="text-2xl font-black text-navy-900 font-display mb-1">{item.metric}</div>
                <h3 className="font-bold text-navy-900 text-sm mb-3">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-3">{item.desc}</p>
                <div className="text-[10px] font-bold text-gold-600 uppercase tracking-wider">{item.growth}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Hires */}
      <div className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-black text-navy-900 mb-4 text-center">
            Key Hires for Scale
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            Three strategic hires to accelerate from current foundation to market leadership.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                role: "Content Operations Manager",
                focus: "Scale from 70 to 500+ pages. Manage hotel data pipeline, editorial calendar, and content automation workflows.",
                impact: "7x content output",
              },
              {
                role: "Partnerships Lead",
                focus: "Hotel supply acquisition across UAE, Saudi, and Qatar. Negotiate direct listing agreements and Umrah operator partnerships.",
                impact: "200+ hotel partners",
              },
              {
                role: "Growth Marketer",
                focus: "SEO execution, paid acquisition testing, email/push retention loops. Own CAC and LTV optimization across all verticals.",
                impact: "10x organic traffic",
              },
            ].map((hire) => (
              <div key={hire.role} className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-bold text-navy-900 mb-2">{hire.role}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-3">{hire.focus}</p>
                <div className="text-[10px] font-black text-gold-600 uppercase tracking-wider bg-gold-50 px-2 py-1 rounded-full inline-block">
                  Target Impact: {hire.impact}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-navy-950 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl font-bold text-white mb-4">
            Ready to Discuss?
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Whether you&apos;re an investor, strategic partner, or potential
            acquirer — we&apos;d love to share our growth story.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="mailto:invest@besthoteldealsdaily.com" className="btn-gold">
              Contact for Investment
            </a>
            <Link href="/ventures/" className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full font-bold text-sm transition-colors">
              View Portfolio
            </Link>
            <Link href="/admin/" className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full font-bold text-sm transition-colors">
              Platform Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
