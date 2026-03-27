import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getCountryBySlug, countries, cities } from "@/lib/data";
import HotelCard from "@/components/HotelCard";
import Breadcrumb from "@/components/Breadcrumb";
import { hotels } from "@/lib/data";
import { Globe, Landmark, TrendingUp, ShieldCheck, ArrowRight } from "lucide-react";

type Props = { params: Promise<{ country: string }> };

export async function generateStaticParams() {
  return countries.map((c) => ({ country: c.slug }));
}

function generateCountryMeta(slug: string, name: string) {
  switch (slug) {
    case "uae":
      return {
        title: "UAE Hotels 2026 – Dubai & Abu Dhabi | Compare 50+ Properties | Best Deals Daily",
        description:
          "Compare UAE hotel deals across Dubai and Abu Dhabi. Budget Deira stays to 7-star Palm Jumeirah resorts — verified prices from Booking.com, Agoda & direct. Updated daily.",
      };
    case "saudi-arabia":
      return {
        title: "Saudi Arabia Hotels 2026 – Makkah, Madinah & Riyadh | Pilgrim & Luxury Stays",
        description:
          "Verified hotel deals across Saudi Arabia. Pilgrim accommodation near Al Haram in Makkah, Masjid an-Nabawi in Madinah, and luxury business hotels in Riyadh — compare now.",
      };
    case "qatar":
      return {
        title: "Qatar Hotels 2026 – Doha Stays Near The Pearl & West Bay | Compare Rates",
        description:
          "Find the best hotel deals in Qatar. Luxury towers in West Bay, Pearl-Qatar villas, and value stays in Al Sadd — compare verified Doha hotels and book at the best rate.",
      };
    case "bahrain":
      return {
        title: "Bahrain Hotels 2026 – Manama Stays | Great Value vs Dubai | Compare & Book",
        description:
          "Hotel deals in Bahrain up to 40% cheaper than comparable Dubai properties. Manama stays for Saudi weekend escapes, Bahrain Grand Prix visitors & business travelers.",
      };
    case "kuwait":
      return {
        title: "Kuwait Hotels 2026 – Kuwait City Business & Leisure Stays | Compare Rates",
        description:
          "Compare verified Kuwait City hotels — Sharq business district to Salmiya waterfront. Find the best rates for corporate travel, family stays & Gulf holidays.",
      };
    case "oman":
      return {
        title: "Oman Hotels 2026 – Muscat Beach Resorts & Mountain Retreats | Compare Rates",
        description:
          "Discover Oman's finest hotels at a fraction of Dubai prices. Al Bustan Palace, Shangri-La Muscat & boutique retreats from OMR 45/night — compare and book your Oman escape.",
      };
    default:
      return {
        title: `Best Hotel Deals in ${name} 2026 – Compare & Book | Best Deals Daily`,
        description: `Find verified hotel deals in ${name}. Browse top properties from budget to 5-star luxury — updated daily.`,
      };
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country: countrySlug } = await params;
  const country = getCountryBySlug(countrySlug);
  if (!country) return {};

  const meta = generateCountryMeta(country.slug, country.name);

  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `https://besthoteldealsdaily.com/country/${country.slug}/` },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `https://besthoteldealsdaily.com/country/${country.slug}/`,
      images: [{ url: country.image, width: 1200, height: 630, alt: `Hotels in ${country.name}` }],
    },
  };
}

export default async function CountryPage({ params }: Props) {
  const { country: countrySlug } = await params;
  const country = getCountryBySlug(countrySlug);
  if (!country) notFound();

  const countryCities = cities.filter((c) => c.countrySlug === countrySlug);
  const countryHotels = hotels.filter((h) => h.country === countrySlug).slice(0, 8);
  const luxuryCount = countryHotels.filter(h => h.type === "luxury" || h.stars === 5).length;
  const budgetCount = countryHotels.filter(h => h.type === "budget" || h.priceFrom < 400).length;

  // Programmatic country context — unique insight per country
  const getCountryContext = (slug: string) => {
    switch (slug) {
      case "saudi-arabia":
        return {
          headline: "The Kingdom's Hospitality Ecosystem",
          overview: "Saudi Arabia is home to the two holiest cities in Islam — Makkah and Madinah — making it the single most visited country in the region for religious travelers. Beyond pilgrimage, Vision 2030 has triggered a massive expansion of luxury resorts, business hotels, and boutique properties across Riyadh, Jeddah, and NEOM.",
          travelProfile: "Pilgrims, business travelers, and increasingly, international tourists.",
          bookingTip: "During Hajj season, hotel rates in Makkah can surge 4-6x. Secure your accommodation 3–6 months in advance. Outside peak seasons, excellent deals are available.",
          faq: [
            { q: "Do I need a visa to visit Saudi Arabia for tourism?", a: "Yes. Saudi Arabia now offers e-Visas for citizens of 60+ countries. Hajj and Umrah require specific religious visas, available through licensed agents." },
            { q: "What is the currency in Saudi Arabia?", a: "The Saudi Riyal (SAR). Prices on this platform are displayed in SAR for Saudi properties." },
            { q: "Which city has the most luxury hotels in Saudi Arabia?", a: "Riyadh leads for corporate luxury (Four Seasons, Ritz-Carlton), while Makkah has the largest concentration of premium prayer-focused properties like Fairmont and Swissôtel." },
          ]
        };
      case "uae":
        return {
          headline: "The Global Hub of Modern Luxury",
          overview: "The UAE, and Dubai in particular, is synonymous with architectural ambition and world-class hospitality. The country is home to some of the most iconic hotels on earth — including the only 7-star property, Burj Al Arab. Abu Dhabi adds a layer of cultural depth with Yas Island mega-resorts and the tranquil Eastern Mangroves.",
          travelProfile: "International tourists, affluent business travelers, and MICE event groups.",
          bookingTip: "Winter months (November–March) are peak season with Dubai shopping festivals. Summer offers significantly lower rates with indoor resort packages. Book 2–4 weeks in advance.",
          faq: [
            { q: "Is Dubai visa-free for my nationality?", a: "Many nationalities receive a free 30-day visa on arrival in the UAE. Check the official UAE government portal for the full list." },
            { q: "What is the cheapest time to visit Dubai?", a: "June to August is the low season. Temperatures peak, but hotels offer massive discounts of 40–60% and indoor water parks are popular alternatives." },
            { q: "Are there dry hotels in Dubai (no alcohol)?", a: "Yes. Apartment hotels and many non-branded properties are alcohol-free. Larger international hotels serve alcohol in licensed areas." },
          ]
        };
      case "qatar":
        return {
          headline: "A Peninsula Transformed by Vision",
          overview: "Qatar has emerged as a must-visit destination following the FIFA World Cup 2022, which catalyzed a wave of world-class hotel developments. Doha now boasts an extraordinary mix of modern skyscraper hotels, boutique properties on The Pearl, and luxury desert resorts on the outskirts.",
          travelProfile: "MICE travelers, football fans, luxury tourists, and transit visitors.",
          bookingTip: "Peak travel aligns with international events and winter. Transit hotels near Hamad International Airport offer surprisingly strong value for layover guests.",
          faq: [
            { q: "Is Qatar family-friendly for tourists?", a: "Absolutely. Qatar has invested heavily in family entertainment, museums (especially MIA), and beach resorts to welcome international visitors." },
            { q: "What is the dress code in Qatar hotels?", a: "Hotel zones are generally relaxed. However, covering shoulders and knees in public areas including malls and souqs is expected and respectful." },
          ]
        };
      default:
        return {
          headline: `Discovering ${country.name}`,
          overview: country.description,
          travelProfile: "Leisure and business travelers visiting the Middle East.",
          bookingTip: "Booking 2–3 weeks in advance typically secures the best available rates across all platforms we monitor.",
          faq: [
            { q: `What are the top cities to stay in ${country.name}?`, a: `${country.cities.slice(0, 3).join(", ")} are among the most visited cities with the widest range of hotel options across all budgets.` },
            { q: `What is the best season to book hotels in ${country.name}?`, a: "The winter season from October to March typically offers the best weather and competitive pricing outside local peak events." },
          ]
        };
    }
  };

  const ctx = getCountryContext(countrySlug);

  // ── Structured Data (JSON-LD) ────────────────────────────────────────────
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: ctx.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Best Hotel Deals Daily",
    url: "https://besthoteldealsdaily.com",
    description: "The leading platform for comparing and booking hotel deals across the Middle East, including Dubai, Makkah, Madinah, Riyadh, Doha, and beyond.",
    sameAs: [
      "https://besthoteldealsdaily.com/blog/",
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://besthoteldealsdaily.com/" },
      { "@type": "ListItem", position: 2, name: `${country.name} Hotels`, item: `https://besthoteldealsdaily.com/country/${country.slug}/` },
    ],
  };

  return (
    <div className="min-h-screen pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c") }} />

      {/* Full-bleed hero with distinct pattern from city page */}
      <div className="relative pt-14 h-[50vh] min-h-[380px] max-h-[520px] flex items-end">
        <Image src={country.image} alt={`Hotel deals in ${country.name}`} fill className="object-cover" priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-900/75 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
          <Breadcrumb crumbs={[{ label: `${country.name} Hotels` }]} />
          <h1 className="font-display text-4xl md:text-5xl font-black text-white mt-4 leading-tight mb-3">
            Hotels in <span className="text-gold-gradient">{country.name}</span>
          </h1>
          <p className="text-gray-300 font-medium text-sm max-w-xl mb-6">
            {country.cities.length} Cities &middot; {countryHotels.length}+ Properties &middot; Verified Prices Updated Daily
          </p>
          {/* Quick Stats */}
          <div className="flex flex-wrap gap-3">
            <span className="bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl">
              {luxuryCount} Luxury Properties
            </span>
            <span className="bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl">
              {budgetCount} Budget Options
            </span>
            <span className="bg-gold-500 text-navy-900 text-xs font-black px-4 py-2 rounded-xl">
              Live Deal Tracker
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Authority Section */}
      <div className="bg-white py-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            <div className="lg:col-span-2">
              <div className="inline-flex items-center gap-2 text-xs font-black text-gold-600 uppercase tracking-widest mb-4">
                <Globe className="w-4 h-4" /> Country Overview
              </div>
              <h2 className="text-3xl font-black text-navy-900 font-display mb-6">{ctx.headline}</h2>
              <p className="text-gray-600 leading-relaxed text-sm">{ctx.overview}</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-5">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Typical Traveler</h3>
                <p className="text-navy-900 font-bold text-sm">{ctx.travelProfile}</p>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Booking Strategy</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{ctx.bookingTip}</p>
              </div>
              <Link href="/deals/" className="flex items-center justify-between bg-gold-500 text-navy-900 font-black text-xs px-4 py-3 rounded-xl group">
                View Today&apos;s Deals
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* City Grid (GEO Cluster Links) */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <Landmark className="w-6 h-6 text-navy-900" />
            <h2 className="text-2xl font-black text-navy-900 font-display">Top Hotel Cities in {country.name}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {countryCities.map((city) => (
              <Link
                key={city.slug}
                href={`/city/${city.slug}/`}
                className="group relative rounded-3xl overflow-hidden h-56 shadow-md hover:shadow-2xl transition-shadow"
              >
                <Image src={city.image} alt={`Hotel deals in ${city.name}`} fill className="object-cover group-hover:scale-110 transition-transform duration-700" sizes="(max-width: 640px) 100vw, 33vw" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-900/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="text-white font-display font-black text-xl group-hover:text-gold-400 transition-colors">{city.name}</div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-gold-400 text-xs font-bold">{city.hotels.length} Hotels</div>
                    <span className="text-white/50 text-xs group-hover:text-white transition-colors">View →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Hotels */}
      {countryHotels.length > 0 && (
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-5 h-5 text-navy-900" />
              <h2 className="text-2xl font-black text-navy-900 font-display">Top Rated Hotels in {country.name}</h2>
            </div>
            <p className="text-gray-500 text-xs mb-8 ml-8">Ranked by verified guest ratings and deal availability.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {countryHotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AISO-focused FAQ section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black text-navy-900 font-display mb-8">
            Traveler FAQs — {country.name}
          </h2>
          <div className="space-y-4">
            {ctx.faq.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-navy-900 text-sm mb-2 flex items-start gap-2">
                  <span className="text-gold-500 font-black shrink-0">Q:</span> {f.q}
                </h3>
                <p className="text-gray-600 text-xs leading-relaxed pl-5"><span className="font-black text-navy-900 mr-1">A:</span>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust Anchor + Cross Country Navigation */}
      <div className="bg-navy-950 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-12 items-start">

            {/* Trust Block */}
            <div className="md:w-72 shrink-0">
              <div className="flex items-center gap-2 text-gold-400 font-black text-xs uppercase tracking-widest mb-6">
                <ShieldCheck className="w-4 h-4" /> Our Promise
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">Every property on this platform is manually verified for authenticity of pricing, image integrity, and location signals. We never feature unverified listings.</p>
              <div className="mt-6 flex gap-3">
                <Link href="/deals/" className="btn-gold text-xs py-2 px-4">All Deals</Link>
                <Link href="/blog/" className="btn-navy text-xs py-2 px-4">Travel Guides</Link>
              </div>
            </div>

            {/* Lateral GEO cluster */}
            <div className="flex-1">
              <h3 className="text-white font-black font-display text-sm uppercase tracking-widest mb-6">Explore Other Destinations</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {countries.filter((c) => c.slug !== countrySlug).map((c) => (
                  <Link
                    key={c.slug}
                    href={`/country/${c.slug}/`}
                    className="group relative rounded-2xl overflow-hidden h-32"
                  >
                    <Image src={c.image} alt={`Hotels in ${c.name}`} fill className="object-cover group-hover:scale-110 transition-transform duration-500" sizes="200px" loading="lazy" />
                    <div className="absolute inset-0 bg-navy-950/65 group-hover:bg-navy-950/50 transition-all" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white font-black text-xs text-center group-hover:text-gold-400 transition-colors px-2">{c.name}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
