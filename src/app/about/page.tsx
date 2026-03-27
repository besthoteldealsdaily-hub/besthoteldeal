import type { Metadata } from "next";
import Link from "next/link";
import { hotels, deals, cities, countries, blogPosts, landmarks } from "@/lib/data";
import { Shield, Globe, TrendingUp, Users, Building2, Zap, CheckCircle, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "About Best Hotel Deals Daily – The Middle East Hotel Comparison Platform",
  description:
    "Best Hotel Deals Daily is the leading hotel comparison platform for the Middle East. We compare 500+ verified hotel deals across Dubai, Makkah, Doha, Riyadh, and 8 cities daily.",
  alternates: { canonical: "https://besthoteldealsdaily.com/about/" },
  robots: { index: true, follow: true },
};

export default function AboutPage() {
  const totalPages =
    hotels.length + deals.length + cities.length + countries.length +
    blogPosts.length + landmarks.length + 4 + 3;

  return (
    <div className="min-h-screen bg-white pt-14">
      {/* Hero */}
      <div className="bg-navy-950 pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-gold-500/15 border border-gold-500/30 rounded-full px-3 py-1 mb-6">
            <Globe className="w-3 h-3 text-gold-400" />
            <span className="text-gold-400 text-[10px] font-black uppercase tracking-widest">
              About Us
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black text-white leading-tight mb-6">
            The Middle East&apos;s Dedicated{" "}
            <span className="text-gold-gradient">Hotel Comparison Platform</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
            We compare verified hotel deals across Dubai, Makkah, Doha, Riyadh,
            and {cities.length} cities daily — helping travelers find the best
            rates without the noise of generic global platforms.
          </p>
        </div>
      </div>

      {/* Numbers Strip */}
      <div className="bg-navy-900 border-t border-navy-800">
        <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: `${hotels.length}+`, label: "Hotels Compared" },
            { value: `${cities.length}`, label: "Cities Covered" },
            { value: `${countries.length}`, label: "Countries" },
            { value: "Daily", label: "Price Updates" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-black text-gold-400 font-display">{s.value}</div>
              <div className="text-gray-400 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission */}
      <div className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-black text-navy-900 mb-6 text-center">
            Why We Built This
          </h2>
          <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed space-y-4 text-center">
            <p>
              The Middle East hotel market is one of the fastest-growing in the
              world — driven by religious tourism to Makkah and Madinah, business
              travel to Dubai and Riyadh, and leisure demand across the Gulf.
            </p>
            <p>
              Yet most comparison platforms treat the region as an afterthought.
              Generic global tools lack the local pricing intelligence, seasonal
              awareness (Ramadan, Hajj, Eid), and cultural context that Middle
              East travelers need.
            </p>
            <p>
              Best Hotel Deals Daily was built to fill this gap. Every feature —
              from our seasonal demand engine to our city-specific content — is
              designed specifically for this market.
            </p>
          </div>
        </div>
      </div>

      {/* How We Work */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-black text-navy-900 mb-12 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <TrendingUp className="w-6 h-6" />,
                title: "Daily Price Monitoring",
                desc: "We compare rates from Booking.com, Agoda, Expedia, and direct hotel channels daily. Prices are verified and updated to reflect real availability.",
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Seasonal Intelligence",
                desc: "Our demand engine tracks Ramadan, Hajj, Eid, and peak seasons — surfacing the most relevant deals at the right time for each destination.",
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Verified Listings",
                desc: "Every hotel on our platform is reviewed for accuracy. Direct listing partners go through a verification process before going live.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
                <div className="w-14 h-14 bg-navy-50 rounded-2xl flex items-center justify-center text-navy-900 mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="font-bold text-navy-900 text-lg mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Coverage Map */}
      <div className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-black text-navy-900 mb-4 text-center">
            Market Coverage
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            We cover the most important hotel markets in the Middle East, with
            plans to expand into North Africa and Central Asia.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cities.map((city) => (
              <Link
                key={city.slug}
                href={`/city/${city.slug}/`}
                className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-navy-200 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-gold-500" />
                  <h3 className="font-bold text-navy-900 group-hover:text-gold-600 transition-colors">
                    {city.name}
                  </h3>
                </div>
                <p className="text-xs text-gray-400">{city.country}</p>
                <p className="text-xs text-gray-500 mt-1">{city.hotels.length} hotels</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Platform Capabilities */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-black text-navy-900 mb-12 text-center">
            Platform Capabilities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              "Programmatic SEO with " + totalPages + "+ indexed pages",
              "Structured data (Organization, FAQPage, LodgingBusiness, Offer schemas)",
              "AI search optimization — answers surfaced in Google AI Overviews",
              "Seasonal demand engine adapting to Ramadan, Hajj, and peak periods",
              "Multi-revenue model: affiliate, direct bookings, and lead generation",
              "Partner self-serve onboarding pipeline",
              "Engagement tracking and analytics infrastructure",
              "Mobile-first responsive design across all pages",
            ].map((cap) => (
              <div key={cap} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-gray-100">
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">{cap}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Partners CTA */}
      <div className="bg-navy-950 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="text-center sm:text-left">
              <h2 className="font-display text-2xl font-bold text-white mb-2">
                Own a Hotel in the Middle East?
              </h2>
              <p className="text-gray-400 text-sm">
                List your property for free and reach thousands of travelers.
              </p>
            </div>
            <Link href="/partner/" className="btn-gold shrink-0">
              <Building2 className="w-4 h-4" />
              List Your Hotel
            </Link>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-2xl font-bold text-navy-900 mb-4">
            Get in Touch
          </h2>
          <p className="text-gray-500 mb-2">
            For partnerships:{" "}
            <a href="mailto:partners@besthoteldealsdaily.com" className="text-gold-600 hover:underline">
              partners@besthoteldealsdaily.com
            </a>
          </p>
          <p className="text-gray-500">
            For general inquiries:{" "}
            <a href="mailto:hello@besthoteldealsdaily.com" className="text-gold-600 hover:underline">
              hello@besthoteldealsdaily.com
            </a>
          </p>
          <div className="mt-8">
            <Link href="/" className="text-sm text-gray-400 hover:text-navy-900 transition-colors">
              ← Back to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
