import type { Metadata } from "next";
import Link from "next/link";
import { ECOSYSTEM } from "@/lib/ecosystem";
import { hotels, deals, blogPosts, cities, countries, landmarks, categories } from "@/lib/data";
import { umrahPackages } from "@/lib/umrah-data";
import { transferRoutes } from "@/lib/transfers-data";
import { Building2, MoonStar, Car, Plane, Compass, ArrowRight, TrendingUp, Globe, DollarSign, Shield, Layers, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Our Ventures – Best Deals Daily Portfolio",
  description:
    "Explore the Best Deals Daily ecosystem — a portfolio of travel platforms covering hotels, Umrah packages, airport transfers, flights, and experiences across the Middle East.",
  alternates: { canonical: "https://besthoteldealsdaily.com/ventures/" },
  robots: { index: true, follow: true },
};

const iconMap: Record<string, React.ReactNode> = {
  Building2: <Building2 className="w-6 h-6" />,
  MoonStar: <MoonStar className="w-6 h-6" />,
  Car: <Car className="w-6 h-6" />,
  Plane: <Plane className="w-6 h-6" />,
  Compass: <Compass className="w-6 h-6" />,
};

const colorMap: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  navy: { bg: "bg-navy-50", text: "text-navy-900", border: "border-navy-200", badge: "bg-navy-900 text-white" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", badge: "bg-emerald-600 text-white" },
  blue: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", badge: "bg-blue-600 text-white" },
  sky: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200", badge: "bg-sky-600 text-white" },
  amber: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", badge: "bg-amber-600 text-white" },
};

export default function VenturesPage() {
  const live = ECOSYSTEM.filter((p) => p.status === "live");
  const upcoming = ECOSYSTEM.filter((p) => p.status === "coming-soon");

  const totalPages =
    hotels.length + deals.length + cities.length + countries.length +
    blogPosts.length + landmarks.length + categories.length +
    umrahPackages.length + transferRoutes.length + 10;

  const totalListings = hotels.length + umrahPackages.length + transferRoutes.length;

  return (
    <div className="min-h-screen bg-white pt-14">
      {/* Hero */}
      <div className="bg-navy-950 pt-20 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-gold-500/15 border border-gold-500/30 rounded-full px-3 py-1 mb-6">
            <Layers className="w-3 h-3 text-gold-400" />
            <span className="text-gold-400 text-[10px] font-black uppercase tracking-widest">
              Portfolio
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black text-white leading-tight mb-6">
            The <span className="text-gold-gradient">Best Deals Daily</span> Ecosystem
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            A portfolio of specialized travel platforms — each focused on a
            specific vertical within the Middle East travel market. Shared
            technology, independent brands, diversified revenue.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-white text-sm font-bold">
            <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
              <Globe className="w-4 h-4 text-gold-400" /> {ECOSYSTEM.length} Platforms
            </span>
            <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
              <TrendingUp className="w-4 h-4 text-gold-400" /> {totalListings}+ Listings
            </span>
            <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
              <DollarSign className="w-4 h-4 text-gold-400" /> Multi-Revenue
            </span>
          </div>
        </div>
      </div>

      {/* Live Platforms */}
      <div className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-black text-navy-900 mb-4 text-center">
            Live Platforms
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            Operational platforms generating traffic and revenue. Each runs
            independently with its own content, SEO, and monetization.
          </p>
          <div className="space-y-6">
            {live.map((platform) => {
              const colors = colorMap[platform.color] || colorMap.navy;
              return (
                <Link
                  key={platform.id}
                  href={platform.href}
                  className={`block bg-white rounded-2xl border ${colors.border} shadow-sm hover:shadow-md transition-all p-6 sm:p-8 group`}
                >
                  <div className="flex flex-col sm:flex-row items-start gap-6">
                    <div className={`w-14 h-14 ${colors.bg} rounded-2xl flex items-center justify-center ${colors.text} shrink-0`}>
                      {iconMap[platform.icon]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-display text-xl font-black text-navy-900 group-hover:text-gold-600 transition-colors">
                          {platform.name}
                        </h3>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${colors.badge}`}>
                          LIVE
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm leading-relaxed mb-4">
                        {platform.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-xs">
                        <div>
                          <span className="text-gray-400 font-bold uppercase tracking-wider">Revenue Model</span>
                          <div className="flex gap-1 mt-1">
                            {platform.revenueModel.map((r) => (
                              <span key={r} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold capitalize">
                                {r.replace("-", " ")}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-400 font-bold uppercase tracking-wider">Cities</span>
                          <div className="text-gray-600 font-semibold mt-1">
                            {platform.cities.join(", ")}
                          </div>
                        </div>
                        {platform.metrics && (
                          <div>
                            <span className="text-gray-400 font-bold uppercase tracking-wider">{platform.metrics.label}</span>
                            <div className="text-navy-900 font-black text-lg mt-0.5">
                              {platform.metrics.listings}+
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-gold-500 transition-colors shrink-0 mt-2" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Coming Soon */}
      {upcoming.length > 0 && (
        <div className="py-16 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-3xl font-black text-navy-900 mb-4 text-center">
              Coming Soon
            </h2>
            <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
              Platforms in development. Infrastructure and content systems are
              being built using the proven framework from our live platforms.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcoming.map((platform) => {
                const colors = colorMap[platform.color] || colorMap.navy;
                return (
                  <div key={platform.id} className="bg-white rounded-2xl border border-gray-200 p-6 opacity-80">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center ${colors.text}`}>
                        {iconMap[platform.icon]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-navy-900">{platform.name}</h3>
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                            COMING SOON
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm">{platform.tagline}</p>
                        <div className="flex gap-1 mt-3">
                          {platform.revenueModel.map((r) => (
                            <span key={r} className="text-[9px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-semibold capitalize">
                              {r.replace("-", " ")}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Shared Infrastructure */}
      <div className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-black text-navy-900 mb-12 text-center">
            Shared Infrastructure
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Programmatic SEO Engine", desc: `${totalPages}+ indexed pages auto-generated from structured data across all platforms.` },
              { title: "Multi-Revenue Architecture", desc: "Affiliate, direct booking, lead generation, and package commission models running simultaneously." },
              { title: "Seasonal Demand Engine", desc: "Automated content and sorting for Ramadan, Hajj, Eid, and seasonal travel patterns." },
              { title: "AI Search Optimization", desc: "Schema markup, FAQ schemas, and zero-click answers designed for Google AI and ChatGPT search." },
              { title: "Engagement Analytics", desc: "Unified event tracking across all platforms — click attribution, source tracking, conversion metrics." },
              { title: "Partner Pipeline", desc: "Self-serve onboarding for hotels, operators, and transfer providers with Supabase-backed workflows." },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-navy-900 text-sm mb-1">{item.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Portfolio Metrics */}
      <div className="bg-navy-950 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-white mb-8 text-center">
            Portfolio at a Glance
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: `${live.length}`, label: "Live Platforms" },
              { value: `${totalListings}+`, label: "Total Listings" },
              { value: `${totalPages}+`, label: "SEO Pages" },
              { value: "3+", label: "Revenue Streams" },
            ].map((m) => (
              <div key={m.label}>
                <div className="text-3xl font-black text-gold-400 font-display">{m.value}</div>
                <div className="text-gray-400 text-sm mt-1">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-16 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-display text-2xl font-bold text-navy-900 mb-4">
            Interested in Partnership or Acquisition?
          </h2>
          <p className="text-gray-500 mb-6">
            Contact us to discuss strategic partnerships, licensing, or acquisition opportunities.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="mailto:partners@besthoteldealsdaily.com" className="btn-gold">
              Contact Us
            </a>
            <Link href="/about/" className="btn-navy">
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
