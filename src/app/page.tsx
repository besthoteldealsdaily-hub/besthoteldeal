import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Building2, Wallet, MapPin, Flame, ShieldCheck, Star, Zap, Target, Shield, Diamond, Users, Tent } from "lucide-react";
import SmartSearch from "@/components/SmartSearch";
import TrustStrip from "@/components/TrustStrip";

import {
  cities,
  getFeaturedDeals,
  getFeaturedHotels,
  blogPosts,
  countries,
  landmarks,
  categories,
} from "@/lib/data";
import DealCard from "@/components/DealCard";
import HotelCard from "@/components/HotelCard";
import BlogCard from "@/components/BlogCard";

export const metadata: Metadata = {
  title: "Compare Hotel Deals in Dubai, Makkah & Middle East – Save Up To 50% | Updated Daily",
  description:
    "500+ verified hotels across the Middle East. Compare real prices from Booking.com, Agoda & Expedia in one place — Dubai, Makkah, Riyadh, Doha, Muscat & more. Free, no login needed.",
  alternates: {
    canonical: "https://besthoteldealsdaily.com/",
  },
  openGraph: {
    title: "Best Hotel Deals Middle East 2026 – Compare & Save | Updated Daily",
    description:
      "500+ verified hotels across Dubai, Makkah, Doha, Riyadh, Muscat & more. Real prices compared daily — no signup, no fees.",
    url: "https://besthoteldealsdaily.com/",
  },
};

const featuredCities = cities.slice(0, 6);
const featuredDeals = getFeaturedDeals();
const featuredHotels = getFeaturedHotels().slice(0, 4);
const latestBlogs = blogPosts.slice(0, 3);

export default function HomePage() {
  const lastUpdated = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const homeFaqs = [
    { question: "How does Best Hotel Deals Daily find the cheapest hotel rates?", answer: "We scan Booking.com, Agoda, and Expedia at least twice daily and only list deals where the discounted price is genuinely lower than the standard rate across all three platforms." },
    { question: "Which Middle East cities are covered?", answer: "We cover Dubai, Makkah, Madinah, Riyadh, Doha, Manama (Bahrain), Kuwait City, and Muscat — with 500+ verified hotel listings across these destinations." },
    { question: "Are the hotel deals on this site verified?", answer: "Yes. Every deal is cross-checked against multiple booking platforms. We remove expired or inaccurate deals within 2 hours of detection. Prices are updated daily." },
    { question: "Can I book hotels near Masjid Al Haram in Makkah?", answer: "Yes. We maintain a dedicated 'Near Haram' collection with hotels verified to be within 1.5 km of Al Masjid Al Haram, including properties with direct Kaaba views and 24/7 shuttle services." },
    { question: "Is it free to use Best Hotel Deals Daily?", answer: "Completely free. We earn a small commission from booking partners when you complete a reservation — you never pay extra. No account or signup required." },
    { question: "Do you offer direct hotel bookings?", answer: "For selected properties, yes. We connect you directly with hotel management for a middleman-free booking experience. These are marked with a 'Direct' badge on our platform." },
  ];

  const homeSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Best Hotel Deals in Middle East – Best Hotel Deals Daily",
    url: "https://besthoteldealsdaily.com/",
    description:
      "Find best hotel deals across UAE, Saudi Arabia, Qatar, Bahrain and Kuwait.",
    dateModified: new Date().toISOString().split("T")[0],
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://besthoteldealsdaily.com/",
        },
      ],
    },
  };

  const homeFaqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: homeFaqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homeSchema).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homeFaqSchema).replace(/</g, "\\u003c"),
        }}
      />

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
        aria-label="Hero section"
      >
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src="https://cf.bstatic.com/xdata/images/hotel/max1024x768/675859513.jpg?k=cbb19bcc2fd1ab8b431d538e96cd0372c4738a46c69d9204d60649dcac98d843&o="
            alt="Dubai skyline – best hotel deals in the Middle East"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-navy-gradient opacity-85" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-14">
          {/* Last updated */}
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-3 py-1 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest">
              Updated: <strong>{lastUpdated}</strong>
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-white leading-[1.1] mb-6 tracking-tight">
            Compare & Book the{" "}
            <span className="text-gold-gradient">Best Hotel Deals</span>
            <br />
            in the Middle East
          </h1>

          <p className="text-white/70 text-sm md:text-base max-w-2xl mx-auto mb-8 leading-relaxed font-medium">
            Dubai · Makkah · Madinah · Doha · Riyadh — 500+ verified hotels.
            We scan Booking.com, Agoda & Expedia so you don&apos;t have to.
          </p>

          {/* Smart Search bar */}
          <div className="max-w-2xl mx-auto mb-10">
            <SmartSearch
              variant="hero"
              placeholder="Search hotels, cities, or landmarks…"
              className="shadow-2xl"
            />
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { label: "Dubai", href: "/city/dubai/" },
              { label: "Makkah", href: "/city/makkah/" },
              { label: "Madinah", href: "/city/madinah/" },
              { label: "Doha", href: "/city/doha/" },
              { label: "Bahrain", href: "/city/manama/" },
              { label: "Muscat", href: "/city/muscat/" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-full border border-white/20 transition-all hover:border-gold-400 hover:text-gold-400"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center p-1">
            <div className="w-1.5 h-3 bg-white/60 rounded-full" />
          </div>
        </div>
      </section>

      {/* ── STATS BAR ──────────────────────────────────────────────── */}
      <section className="bg-navy-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "500+", label: "Hotels Listed" },
              { value: countries.length.toString(), label: "Countries Covered" },
              { value: "Daily", label: "Price Updates" },
              { value: "50%", label: "Max Savings" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-gold-gradient font-display text-2xl font-bold mb-1">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ─────────────────────────────────────────────── */}
      <TrustStrip />

      {/* ── TOP DEALS TODAY ──────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50" aria-label="Top deals today">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
            <div>
              <div className="badge-gold mb-3 flex items-center gap-1">
                <Flame className="w-3 h-3" /> Top Deals Today
              </div>
              <h2 className="section-title">
                Best Hotel Deals Right Now
              </h2>
              <p className="text-gray-500 mt-2 text-sm">
                Updated: {lastUpdated} · All prices verified
              </p>
            </div>
            <Link href="/deals/" className="btn-navy shrink-0">
              View All Deals →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredDeals.slice(0, 3).map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        </div>
      </section>

      {/* ── LANDMARK DISCOVERY (GEO Optimization) ────────────────────── */}
      <section className="py-24 bg-white" aria-label="Landmark discovery">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-16">
            <div className="max-w-2xl">
              <div className="badge-navy mb-4"><MapPin className="w-3 h-3 inline-block mr-1" /> Location First</div>
              <h2 className="font-display text-2xl md:text-3xl font-black text-navy-900 leading-tight">
                Hotels Near <br />
                <span className="text-gold-gradient">Iconic Landmarks</span>
              </h2>
              <p className="text-gray-500 mt-4 text-lg">
                Save time on commute by staying closer to the sites you&apos;re visiting. Hand-verified locations for pilgrims, business travelers, and tourists.
              </p>
            </div>
            <Link href="/deals/" className="text-navy-900 font-bold hover:text-gold-600 transition-colors flex items-center gap-1 mb-2">
              Explore All Locations <span className="text-sm">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {landmarks.slice(0, 5).map((lm) => (
              <Link
                key={lm.slug}
                href={`/landmark/${lm.slug}/`}
                className="group relative rounded-3xl overflow-hidden h-72 card-hover shadow-xl border-4 border-white"
              >
                <Image src={lm.image} alt={`Hotels near ${lm.name}`} fill className="object-cover group-hover:scale-110 transition-transform duration-700" sizes="(max-width: 640px) 100vw, 20vw" loading="lazy" />
                <div className="absolute inset-0 bg-navy-gradient opacity-60 group-hover:opacity-40 transition-opacity" />
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className="text-gold-400 text-xs font-black uppercase tracking-widest mb-1">{lm.type}</div>
                  <div className="text-white font-display font-bold text-xl leading-tight group-hover:text-gold-400 transition-colors">{lm.name}</div>
                  <div className="text-white/60 text-sm mt-1">{lm.city}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRAVEL COLLECTIONS (Intent-Driven) ────────────────────────── */}
      <section className="py-24 bg-navy-950 text-white relative overflow-hidden" aria-label="Travel collections">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gold-400/5 blur-[120px] rounded-full -translate-y-1/2" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-black mb-6">
              Browse by <span className="text-gold-gradient">Your Travel Style</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-lg leading-relaxed">
              Whether it&apos;s luxury for a special occasion or a budget stay for a quick trip, we have handpicked the best for every intent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/collection/${cat.slug}/`}
                className="p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-[2.5rem] hover:border-gold-400 hover:bg-white/10 transition-all group"
              >
                <div className="mb-6">
                  {cat.slug === "luxury" ? <Diamond className="w-10 h-10 text-gold-400" /> :
                   cat.slug === "budget" ? <Wallet className="w-10 h-10 text-gold-400" /> :
                   cat.slug === "family" ? <Users className="w-10 h-10 text-gold-400" /> :
                   <Tent className="w-10 h-10 text-gold-400" />}
                </div>
                <h3 className="font-display text-2xl font-bold mb-3 group-hover:text-gold-400 transition-colors">{cat.name}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">{cat.description}</p>
                <span className="text-gold-400 text-sm font-bold flex items-center gap-2">View Collection <span className="text-lg">→</span></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── AUTHORITY & TRUST (Conversion Trigger) ───────────────────── */}
      <section className="py-24 bg-white" aria-label="Why book with us">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl">
                <Image src="https://cf.bstatic.com/xdata/images/hotel/max1024x768/675859513.jpg?k=cbb19bcc2fd1ab8b431d538e96cd0372c4738a46c69d9204d60649dcac98d843&o=" alt="Premium Middle East Hotel Experience" fill className="object-cover" />
              </div>
              <div className="absolute -bottom-10 -right-10 bg-navy-900 p-8 rounded-[2rem] shadow-2xl text-white max-w-xs border-4 border-white">
                <div className="text-gold-400 text-3xl font-black mb-2">1,200+</div>
                <div className="font-bold text-lg leading-tight mb-2">Verified Handpicked Properties</div>
                <div className="text-gray-400 text-xs italic leading-tight">We check multiple platforms to find you the absolute best rate.</div>
              </div>
            </div>
            <div>
              <div className="badge-navy mb-4 flex items-center gap-1 w-max">
                <ShieldCheck className="w-4 h-4" /> Trusted Partner
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-black text-navy-900 mb-8 leading-tight">
                A Reliable <span className="text-gold-gradient font-black">Travel Companion</span> for the Middle East
              </h2>
              <div className="space-y-8">
                {[
                  { title: "Direct Connectivity", desc: "For selected hotels, we bridge the gap between you and the hotel management for a seamless, middleman-free experience.", icon: <Zap className="w-6 h-6" /> },
                  { title: "Semantic Location Search", desc: "Our 'Hotels Near' directory is the most comprehensive for regional landmarks, religious sites, and business hubs.", icon: <Target className="w-6 h-6" /> },
                  { title: "24/7 Assistance", desc: "For lead-based bookings, our regional experts assist you throughout the process to ensure a confirmed stay.", icon: <Shield className="w-6 h-6" /> },
                ].map((item) => (
                  <div key={item.title} className="flex gap-6">
                    <div className="w-14 h-14 bg-navy-50 rounded-2xl flex items-center justify-center text-2xl shrink-0 group hover:bg-gold-400 transition-colors">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-navy-900 text-xl mb-1">{item.title}</h3>
                      <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED HOTELS ──────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50" aria-label="Featured hotels">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
            <div>
              <div className="badge-gold mb-3 flex items-center gap-1 w-max">
                <Star className="w-3 h-3" /> Editor&apos;s Picks
              </div>
              <h2 className="section-title">Featured Hotels in the Middle East</h2>
              <p className="text-gray-500 mt-2 text-sm">Hand-picked by our travel experts</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredHotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        </div>
      </section>

      {/* ── COUNTRIES ──────────────────────────────────────────────── */}
      <section className="py-20 bg-navy-gradient text-white" aria-label="Countries">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
              Explore by <span className="text-gold-gradient">Country</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Find hotel deals across 5 Middle East countries with verified prices.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {countries.map((country) => (
              <Link
                key={country.slug}
                href={`/country/${country.slug}/`}
                className="group relative rounded-2xl overflow-hidden h-40 card-hover"
              >
                <Image
                  src={country.image}
                  alt={`Best hotel deals in ${country.name}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-navy-950/60 group-hover:bg-navy-950/50 transition-all" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                  <div className="text-white font-display font-bold text-lg text-center group-hover:text-gold-400 transition-colors">
                    {country.name}
                  </div>
                  <div className="text-gold-400 text-xs mt-1">
                    {country.cities.length} {country.cities.length === 1 ? "city" : "cities"}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOG PREVIEW ──────────────────────────────────────────── */}
      <section className="py-20 bg-white" aria-label="Travel blog preview">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
            <div>
              <div className="badge-navy mb-3"> Travel Blog</div>
              <h2 className="section-title">Hotel Guides & Travel Tips</h2>
              <p className="text-gray-500 mt-2 text-sm">
                Expert advice on finding the best hotel deals in the Middle East
              </p>
            </div>
            <Link href="/blog/" className="btn-gold shrink-0">
              View All Articles →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestBlogs.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ (Zero-Click Optimization) ──────────────────────────── */}
      <section className="py-20 bg-gray-50" aria-label="Frequently asked questions">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-black text-navy-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Everything you need to know about finding and booking the best hotel deals in the Middle East.
            </p>
          </div>
          <div className="space-y-4">
            {homeFaqs.map((faq, i) => (
              <details
                key={i}
                className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <h3 className="font-bold text-navy-900 text-sm pr-4">{faq.question}</h3>
                  <span className="text-gold-500 shrink-0 group-open:rotate-180 transition-transform">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────────────────── */}
      <section className="py-20 relative overflow-hidden" aria-label="Call to action">
        <div className="absolute inset-0 bg-navy-gradient" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, #d4a017 0%, transparent 50%), radial-gradient(circle at 80% 50%, #1a4d99 0%, transparent 50%)",
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Find Your{" "}
            <span className="text-gold-gradient">Perfect Hotel Deal?</span>
          </h2>
          <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto">
            Compare hundreds of hotels across Dubai, Makkah, Doha, Bahrain and more.
            Our deals are verified and updated every day.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/deals/" className="btn-gold text-base px-8 py-4 w-full sm:w-auto justify-center">
               Check Latest Deals
            </Link>
            <Link href="/blog/" className="border border-white/30 text-white hover:border-gold-400 hover:text-gold-400 px-8 py-4 rounded-full font-semibold text-base transition-all w-full sm:w-auto text-center">
               Read Travel Guides
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
