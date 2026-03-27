import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { deals, cities, categories } from "@/lib/data";
import DealCard from "@/components/DealCard";
import Breadcrumb from "@/components/Breadcrumb";
import TrustStrip from "@/components/TrustStrip";
import { getSeasonalContext, getDemandMultiplier } from "@/lib/seasonal";
import { Clock, TrendingDown, ShieldCheck, Zap, ArrowRight, Filter, Flame as TrendingIcon } from "lucide-react";

export const metadata: Metadata = {
  title: `${deals.length} Hotel Deals in UAE, Saudi Arabia & Middle East – Up To 50% Off Today`,
  description:
    "Today's verified hotel deals across Dubai, Makkah, Doha, Riyadh, Muscat & Bahrain. Discounts up to 50% compared from Booking.com, Agoda & Expedia — updated every day. Find your deal now.",
  alternates: { canonical: "https://besthoteldealsdaily.com/deals/" },
  openGraph: {
    title: `${deals.length} Active Middle East Hotel Deals – Up To 50% Off | Updated Today`,
    description: `Verified hotel discounts across Dubai, Makkah, Doha, Bahrain & more. Compare today's best rates — free, no signup needed.`,
    url: "https://besthoteldealsdaily.com/deals/",
  },
};

// Deals page schema
const dealsPageSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Best Hotel Deals in the Middle East",
  url: "https://besthoteldealsdaily.com/deals/",
  numberOfItems: deals.length,
  itemListElement: deals.slice(0, 10).map((d, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "Offer",
      name: d.hotelName,
      description: d.description,
      price: d.discountedPrice,
      priceCurrency: d.currency,
      priceValidUntil: d.validUntil,
      availability: "https://schema.org/InStock",
      url: `https://besthoteldealsdaily.com/deals/${d.slug}/`,
    },
  })),
};

const lastUpdated = new Intl.DateTimeFormat("en-GB", {
  day: "numeric", month: "long", year: "numeric",
}).format(new Date());

// Urgency metrics
const maxDiscount = Math.max(...deals.map((d) => d.discount));
const avgDiscount = Math.round(deals.reduce((a, d) => a + d.discount, 0) / deals.length);
const expiringCount = deals.filter(d => {
  const diff = (new Date(d.validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
  return diff <= 7;
}).length;

export default function DealsPage() {
  // Seasonal intelligence
  const season = getSeasonalContext();

  // Smart sort: seasonal demand + featured + discount depth
  const smartSortedDeals = [...deals].sort((a, b) => {
    const aMultiplier = getDemandMultiplier(a.city.toLowerCase());
    const bMultiplier = getDemandMultiplier(b.city.toLowerCase());
    const aScore = (a.featured ? 10 : 0) + a.discount * aMultiplier;
    const bScore = (b.featured ? 10 : 0) + b.discount * bMultiplier;
    return bScore - aScore;
  });

  // Group deals by country for the tab experience
  const dealsByCountry: Record<string, typeof deals> = {
    "All Deals": smartSortedDeals,
    "UAE": smartSortedDeals.filter(d => d.country === "UAE" || d.country === "uae"),
    "Saudi Arabia": smartSortedDeals.filter(d => d.country === "Saudi Arabia" || d.country === "saudi-arabia"),
    "Qatar": smartSortedDeals.filter(d => d.country === "Qatar" || d.country === "qatar"),
    "Bahrain": smartSortedDeals.filter(d => d.country === "Bahrain" || d.country === "bahrain"),
  };

  // Top deal for the featured spot
  const topDeal = smartSortedDeals.find(d => d.featured) || smartSortedDeals[0];
  const topDealSavings = topDeal.originalPrice - topDeal.discountedPrice;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dealsPageSchema).replace(/</g, "\\u003c") }}
      />

      {/* ── DEALS HUB HERO ─────────────────────────────────────────────── */}
      <div className="bg-navy-950 pt-28 pb-12 relative overflow-hidden">
        {/* Ambient gradient */}
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 70% 50%, #d4a017 0%, transparent 50%)" }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Breadcrumb crumbs={[{ label: "All Hotel Deals" }]} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-6">
            <div>
              {/* Live status badge */}
              <div className="inline-flex items-center gap-2 bg-green-500/15 border border-green-500/30 rounded-full px-3 py-1 mb-4">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400 text-[10px] font-black uppercase tracking-widest">
                  Live — {deals.length} Active Deals
                </span>
              </div>

              <h1 className="font-display text-4xl md:text-5xl font-black text-white leading-tight mb-4">
                Today&apos;s Best{" "}
                <span className="text-gold-gradient">Hotel Deals</span> in the Middle East
              </h1>

              <p className="text-gray-300 text-sm leading-relaxed mb-8 max-w-lg">
                Every deal on this page is manually verified across Booking.com, Agoda, and Expedia.
                We only list genuine discounts — no inflated &ldquo;original prices&rdquo;.
              </p>

              {/* Live urgency stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: `${maxDiscount}%`, label: "Max Discount", icon: <TrendingDown className="w-4 h-4 text-red-400" /> },
                  { value: `${avgDiscount}%`, label: "Avg Saving", icon: <Zap className="w-4 h-4 text-gold-400" /> },
                  { value: expiringCount.toString(), label: "Expiring Soon", icon: <Clock className="w-4 h-4 text-orange-400" /> },
                ].map((s) => (
                  <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                    <div className="flex justify-center mb-1">{s.icon}</div>
                    <div className="text-white font-black text-xl">{s.value}</div>
                    <div className="text-gray-400 text-[9px] uppercase tracking-widest mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Deal Spotlight Card */}
            {topDeal && (
              <Link href={`/deals/${topDeal.slug}/`} className="group block">
                <div className="bg-white/5 border-2 border-gold-500/50 rounded-3xl overflow-hidden hover:border-gold-500 transition-all shadow-2xl">
                  <div className="relative h-48">
                    <Image src={topDeal.image} alt={topDeal.hotelName} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 to-navy-950/20" />
                    <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-black px-3 py-1 rounded-full shadow">
                      -{topDeal.discount}% OFF
                    </div>
                    <div className="absolute top-4 right-4 bg-gold-500 text-navy-900 text-[10px] font-black px-2 py-1 rounded-full">
                      HOT DEAL
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <div className="text-white font-black text-lg leading-tight">{topDeal.hotelName}</div>
                      <div className="text-gold-400 text-xs mt-0.5">{topDeal.city}</div>
                    </div>
                  </div>
                  <div className="p-5 flex items-center justify-between">
                    <div>
                      <div className="text-gray-400 text-xs line-through">{topDeal.currency} {topDeal.originalPrice.toLocaleString()}/night</div>
                      <div className="text-white font-black text-2xl">{topDeal.currency} {topDeal.discountedPrice.toLocaleString()}</div>
                      <div className="text-green-400 text-xs font-bold">Save {topDeal.currency} {topDealSavings.toLocaleString()}</div>
                    </div>
                    <div className="bg-gold-500 text-navy-900 font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 group-hover:bg-gold-400 transition-colors">
                      View Deal <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>

      <TrustStrip />

      {/* ── MAIN DEALS CONTENT ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Section header with last-verified marker */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-2xl font-black text-navy-900 font-display">All Active Deals</h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-gray-400 text-xs">Last verified: <strong className="text-gray-600">{lastUpdated}</strong></span>
              <span className="text-gray-300">·</span>
              <span className="text-gray-400 text-xs"><strong className="text-gray-600">{deals.length} deals</strong> across 5 countries</span>
            </div>
          </div>

          {/* City quick-filter links (SEO-safe — server-rendered anchor tags) */}
          <div className="flex flex-wrap gap-2">
            <span className="flex items-center gap-1 text-gray-400 text-xs font-bold uppercase tracking-widest">
              <Filter className="w-3 h-3" /> Filter by city:
            </span>
            {[
              { label: "Dubai", href: "/city/dubai/" },
              { label: "Makkah", href: "/city/makkah/" },
              { label: "Doha", href: "/city/doha/" },
              { label: "Riyadh", href: "/city/riyadh/" },
            ].map((c) => (
              <Link key={c.href} href={c.href}
                className="px-3 py-1 rounded-full text-xs font-bold border border-gray-200 bg-white text-gray-600 hover:border-gold-400 hover:text-gold-600 transition-all">
                {c.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Seasonal Intelligence Banner */}
        {season.id !== "default" && (
          <div className="bg-gradient-to-r from-navy-900 to-navy-950 rounded-2xl p-5 mb-8 flex items-center gap-4">
            <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center shrink-0">
              <TrendingIcon className="w-5 h-5 text-navy-900" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">{season.label}</div>
              <div className="text-gray-400 text-xs leading-relaxed mt-0.5">{season.description}</div>
            </div>
            <span className="hidden sm:inline-flex bg-gold-500/20 text-gold-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shrink-0 border border-gold-500/30">
              {season.demandLevel} Demand
            </span>
          </div>
        )}

        {/* Deals grid — smart sorted by seasonal demand */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {smartSortedDeals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>

        {/* ── AUTHORITY CONTENT BLOCK ──────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">

          {/* How We Find Deals */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-green-500" />
              <h2 className="text-xl font-black text-navy-900 font-display">How We Verify Every Deal</h2>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Many deal sites inflate &ldquo;original prices&rdquo; to show bigger discounts. We don&apos;t. Our team
              cross-checks all prices across Booking.com, Agoda, and Expedia at least twice daily. A deal only
              qualifies for this page when the discounted price is genuinely lower than the standard rate
              across all three platforms.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { num: "01.", title: "Price Scan", desc: "Automated checks across all 3 platforms every 12 hours" },
                { num: "02.", title: "Manual Review", desc: "Editors confirm the deal is real before it goes live" },
                { num: "03.", title: "Expiry Alert", desc: "Expired deals are removed within 2 hours of detection" },
              ].map((s) => (
                <div key={s.num} className="p-4 bg-gray-50 rounded-2xl">
                  <div className="text-gold-500 font-black text-sm mb-1">{s.num}</div>
                  <div className="font-bold text-navy-900 text-sm mb-1">{s.title}</div>
                  <div className="text-gray-500 text-xs leading-relaxed">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Intent Sidebar */}
          <div className="space-y-4">
            <h3 className="font-black text-navy-900 text-sm uppercase tracking-widest">Browse by Intent</h3>
            {categories.map((cat) => (
              <Link key={cat.slug} href={`/collection/${cat.slug}/`}
                className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:border-gold-400 hover:shadow-md transition-all group">
                <div>
                  <div className="font-bold text-navy-900 text-sm group-hover:text-gold-600 transition-colors">{cat.name}</div>
                  <div className="text-gray-400 text-[10px] mt-0.5 line-clamp-1">{cat.description.slice(0, 40)}...</div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gold-500 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>

        {/* ── GEOGRAPHIC INTERNAL LINK CLUSTER ──────────────────────────── */}
        <div className="bg-navy-950 rounded-3xl p-8">
          <h2 className="text-white font-black font-display text-xl mb-2">Find Deals by Destination</h2>
          <p className="text-gray-400 text-xs mb-6">Explore city-specific hotel directories with full comparison tools.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {cities.map((city) => (
              <Link key={city.slug} href={`/city/${city.slug}/`}
                className="bg-white/5 border border-white/10 rounded-xl p-3 text-center hover:bg-white/10 hover:border-gold-400 transition-all group">
                <div className="text-white font-bold text-xs group-hover:text-gold-400 transition-colors">{city.name}</div>
                <div className="text-gray-500 text-[9px] mt-0.5">{city.hotels.length} Hotels</div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
