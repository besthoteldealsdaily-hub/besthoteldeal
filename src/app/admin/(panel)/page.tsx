import type { Metadata } from "next";
import { hotels, deals, cities, countries, blogPosts, landmarks, categories } from "@/lib/data";
import { umrahPackages } from "@/lib/umrah-data";
import { transferRoutes } from "@/lib/transfers-data";
import { ECOSYSTEM } from "@/lib/ecosystem";
import { createServerClient, TABLES } from "@/lib/supabase";
import { Building2, Globe, TrendingUp, DollarSign, FileText, Users, MapPin, BarChart3, Shield, Layers, MoonStar, Car, Mail, MessageSquare } from "lucide-react";
import Link from "next/link";
import LogoutButton from "../LogoutButton";

export const metadata: Metadata = {
  title: "Platform Dashboard – Admin",
  robots: { index: false, follow: false },
};

function KPICard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 bg-navy-50 rounded-xl flex items-center justify-center text-navy-900">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-black text-navy-900">{value}</div>
      <div className="text-sm text-gray-500 font-medium">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

export default async function AdminDashboard() {
  // Live Supabase metrics
  let liveMetrics = {
    newsletterSubs: 0,
    partnerApps: 0,
    pendingApps: 0,
    bookingInquiries: 0,
    whatsappLeads: 0,
    engagementEvents: 0,
  };

  try {
    const db = createServerClient();
    const [
      { count: newsletterSubs },
      { count: partnerApps },
      { count: pendingApps },
      { count: bookingInquiries },
      { count: whatsappLeads },
      { count: engagementEvents },
    ] = await Promise.all([
      db.from(TABLES.NEWSLETTER).select("*", { count: "exact", head: true }).eq("active", true),
      db.from(TABLES.PARTNER_APPLICATIONS).select("*", { count: "exact", head: true }),
      db.from(TABLES.PARTNER_APPLICATIONS).select("*", { count: "exact", head: true }).eq("status", "pending"),
      db.from(TABLES.BOOKING_INQUIRIES).select("*", { count: "exact", head: true }),
      db.from(TABLES.WHATSAPP_LEADS).select("*", { count: "exact", head: true }),
      db.from(TABLES.ENGAGEMENT_EVENTS).select("*", { count: "exact", head: true }),
    ]);
    liveMetrics = {
      newsletterSubs:    newsletterSubs    || 0,
      partnerApps:       partnerApps       || 0,
      pendingApps:       pendingApps       || 0,
      bookingInquiries:  bookingInquiries  || 0,
      whatsappLeads:     whatsappLeads     || 0,
      engagementEvents:  engagementEvents  || 0,
    };
  } catch {
    // Non-critical — page still loads with zeros
  }


  const livePlatforms = ECOSYSTEM.filter((p) => p.status === "live");
  const totalListings = hotels.length + umrahPackages.length + transferRoutes.length;
  const totalPages =
    hotels.length + deals.length + cities.length + countries.length +
    blogPosts.length + landmarks.length + categories.length +
    umrahPackages.length + transferRoutes.length + 10;

  const affiliateHotels = hotels.filter((h) => h.listingType === "affiliate").length;
  const directHotels = hotels.filter((h) => h.listingType === "direct").length;
  const leadHotels = hotels.filter((h) => h.listingType === "lead").length;

  const activeDeals = deals.filter((d) => new Date(d.validUntil) >= new Date()).length;
  const avgDiscount = Math.round(deals.reduce((s, d) => s + d.discount, 0) / deals.length);
  const avgRating = (hotels.reduce((s, h) => s + h.rating, 0) / hotels.length).toFixed(1);
  const totalReviews = hotels.reduce((s, h) => s + h.reviewCount, 0);

  const hotelsByType = hotels.reduce<Record<string, number>>((acc, h) => {
    acc[h.type] = (acc[h.type] || 0) + 1;
    return acc;
  }, {});

  const cityCoverage = cities.map((c) => ({
    name: c.name,
    country: c.country,
    count: c.hotels.length,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-navy-950 pt-10 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl text-white">
                Platform Dashboard
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Business intelligence &amp; acquisition readiness metrics.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-4">
              <span className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Platform Live
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPI Grid */}
        <div>
          <h2 className="text-sm font-black text-navy-900 uppercase tracking-widest mb-4">
            Key Performance Indicators
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <KPICard icon={<Building2 className="w-5 h-5" />} label="Hotels" value={hotels.length} sub={`${cities.length} cities`} />
            <KPICard icon={<TrendingUp className="w-5 h-5" />} label="Active Deals" value={activeDeals} sub={`Avg ${avgDiscount}% off`} />
            <KPICard icon={<MoonStar className="w-5 h-5" />} label="Umrah Packages" value={umrahPackages.length} sub="Umrah + Hajj" />
            <KPICard icon={<Car className="w-5 h-5" />} label="Transfer Routes" value={transferRoutes.length} sub={`${transferRoutes.filter((t) => t.featured).length} featured`} />
            <KPICard icon={<FileText className="w-5 h-5" />} label="SEO Pages" value={totalPages} sub="All verticals" />
            <KPICard icon={<Globe className="w-5 h-5" />} label="Platforms" value={livePlatforms.length} sub={`${ECOSYSTEM.length} total`} />
            <KPICard icon={<Layers className="w-5 h-5" />} label="Total Listings" value={totalListings} sub="Cross-vertical" />
            <KPICard icon={<Users className="w-5 h-5" />} label="Avg Rating" value={avgRating} sub={`${totalReviews.toLocaleString()} reviews`} />
          </div>
        </div>

        {/* Live CRM Metrics */}
        <div>
          <h2 className="text-sm font-black text-navy-900 uppercase tracking-widest mb-4">
            Live CRM Data
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <KPICard icon={<Mail className="w-5 h-5" />} label="Newsletter Subs" value={liveMetrics.newsletterSubs} sub="Active subscribers" />
            <KPICard icon={<Users className="w-5 h-5" />} label="Partner Apps" value={liveMetrics.partnerApps} sub={`${liveMetrics.pendingApps} pending`} />
            <KPICard icon={<FileText className="w-5 h-5" />} label="Booking Inquiries" value={liveMetrics.bookingInquiries} sub="Direct bookings" />
            <KPICard icon={<MessageSquare className="w-5 h-5" />} label="WhatsApp Leads" value={liveMetrics.whatsappLeads} sub="Lead-gen taps" />
            <KPICard icon={<TrendingUp className="w-5 h-5" />} label="Engagement Events" value={liveMetrics.engagementEvents} sub="Tracked events" />
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
              <div className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-2">Export Data</div>
              <div className="space-y-2">
                <Link href="/api/admin/export?table=newsletter_subscribers" className="block text-xs text-navy-700 hover:text-gold-600 font-medium transition-colors">→ Newsletter CSV</Link>
                <Link href="/api/admin/export?table=partner_applications" className="block text-xs text-navy-700 hover:text-gold-600 font-medium transition-colors">→ Partner Apps CSV</Link>
                <Link href="/api/admin/export?table=booking_inquiries" className="block text-xs text-navy-700 hover:text-gold-600 font-medium transition-colors">→ Bookings CSV</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Model Breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:col-span-2">
            <h2 className="text-sm font-black text-navy-900 uppercase tracking-widest mb-6 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gold-500" /> Revenue Model Breakdown
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-navy-50 rounded-xl p-5">
                <div className="text-3xl font-black text-navy-900 mb-1">{affiliateHotels}</div>
                <div className="text-sm font-bold text-navy-700">Affiliate Hotels</div>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  CPA/CPC revenue via Booking.com, Agoda, and Expedia affiliate programs. Zero inventory risk.
                </p>
              </div>
              <div className="bg-gold-50 rounded-xl p-5">
                <div className="text-3xl font-black text-navy-900 mb-1">{directHotels}</div>
                <div className="text-sm font-bold text-navy-700">Direct Booking Hotels</div>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  10-15% commission on direct bookings processed through the platform. Higher margin revenue.
                </p>
              </div>
              <div className="bg-green-50 rounded-xl p-5">
                <div className="text-3xl font-black text-navy-900 mb-1">{leadHotels}</div>
                <div className="text-sm font-bold text-navy-700">Lead-Gen Hotels</div>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  WhatsApp and inquiry-based leads for high-ticket properties. VIP concierge model with premium conversion.
                </p>
              </div>
            </div>
          </div>

          {/* Content Inventory */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-black text-navy-900 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Layers className="w-4 h-4 text-gold-500" /> Content Assets
            </h2>
            <div className="space-y-3">
              {[
                { label: "Hotel Pages", count: hotels.length },
                { label: "Deal Pages", count: deals.length },
                { label: "City Guides", count: cities.length },
                { label: "Country Pages", count: countries.length },
                { label: "Blog Articles", count: blogPosts.length },
                { label: "Landmark Pages", count: landmarks.length },
                { label: "Collection Pages", count: categories.length },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className="text-sm font-black text-navy-900">{item.count}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <span className="text-sm font-bold text-navy-900">Total Indexed Pages</span>
                <span className="text-lg font-black text-gold-600">{totalPages}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* City Coverage Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-black text-navy-900 uppercase tracking-widest mb-6 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gold-500" /> City Coverage
            </h2>
            <div className="space-y-2">
              {cityCoverage.map((city) => (
                <div key={city.name} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <span className="text-sm font-bold text-navy-900">{city.name}</span>
                    <span className="text-xs text-gray-400 ml-2">{city.country}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-navy-900 h-2 rounded-full"
                        style={{ width: `${Math.min((city.count / Math.max(...cityCoverage.map((c) => c.count))) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-black text-navy-900 w-8 text-right">{city.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hotel Type Breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-black text-navy-900 uppercase tracking-widest mb-6 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-gold-500" /> Hotel Segments
            </h2>
            <div className="space-y-4">
              {Object.entries(hotelsByType).sort(([, a], [, b]) => b - a).map(([type, count]) => (
                <div key={type}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-navy-900 capitalize">{type}</span>
                    <span className="text-sm text-gray-500">{count} hotels ({Math.round((count / hotels.length) * 100)}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-navy-900 to-navy-700 h-3 rounded-full transition-all"
                      style={{ width: `${(count / hotels.length) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Defensible Moat */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-black text-navy-900 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Shield className="w-4 h-4 text-gold-500" /> Defensible Moat &amp; Competitive Advantages
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Programmatic SEO Engine",
                desc: `${totalPages}+ unique pages auto-generated from structured data. Each hotel, deal, city, country, landmark, and collection has its own optimized page with schema markup.`,
              },
              {
                title: "Multi-Revenue Architecture",
                desc: "Three concurrent revenue models (affiliate, direct booking, lead-gen) operating simultaneously. No single point of failure. Revenue diversification built into the data model.",
              },
              {
                title: "Seasonal Demand Engine",
                desc: "Automated content and sorting intelligence for Ramadan, Hajj, Eid, summer, and winter seasons. Badges, banners, and deal priority adapt to travel demand cycles.",
              },
              {
                title: "AI Search Optimization",
                desc: "FAQ schemas, zero-click answers, and structured data designed for Google AI Overviews and ChatGPT search. robots.txt allows GPTBot, Anthropic, and Perplexity crawlers.",
              },
              {
                title: "Internal Linking Topology",
                desc: "Cross-linked content network: city → landmark → collection → blog → deal pages. Every page reinforces the topical authority cluster around Middle East hotels.",
              },
              {
                title: "Partner Pipeline",
                desc: "Self-serve partner onboarding at /partner. Automated application flow with Supabase storage. Scalable supply-side growth without manual outreach.",
              },
            ].map((m) => (
              <div key={m.title} className="border border-gray-100 rounded-xl p-5">
                <h3 className="text-navy-900 text-[13px] mb-2">{m.title}</h3>
                <p className="text-[11px] text-gray-500 leading-relaxed font-normal">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* API Endpoints */}
        <div className="bg-navy-950 rounded-2xl p-6 text-white">
          <h2 className="text-sm font-black uppercase tracking-widest mb-4 text-gold-400">
            API Endpoints for Due Diligence
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="bg-white/5 rounded-xl p-4">
              <code className="text-gold-400 text-xs">GET /api/admin/metrics</code>
              <p className="text-gray-400 text-xs mt-1">Full platform KPIs and business metrics</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <code className="text-gold-400 text-xs">GET /api/admin/export</code>
              <p className="text-gray-400 text-xs mt-1">Export engagement and partner data</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <code className="text-gold-400 text-xs">POST /api/track</code>
              <p className="text-gray-400 text-xs mt-1">Engagement event tracking endpoint</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <code className="text-gold-400 text-xs">POST /api/partner</code>
              <p className="text-gray-400 text-xs mt-1">Partner application submission</p>
            </div>
          </div>
        </div>

        <div className="text-center py-4">
          <Link href="/" className="text-sm text-gray-400 hover:text-navy-900 transition-colors">
            ← Back to Platform
          </Link>
        </div>
      </div>
    </div>
  );
}
