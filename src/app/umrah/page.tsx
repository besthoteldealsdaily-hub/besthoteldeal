import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MoonStar, Plane, MapPin, CheckCircle, Star, Users, Clock, Shield, Building2, ArrowRight } from "lucide-react";
import { umrahPackages } from "@/lib/umrah-data";
import { getCrossSellPlatforms } from "@/lib/ecosystem";
import { whatsappLink } from "@/lib/config";

export const metadata: Metadata = {
  title: "Umrah & Hajj Packages 2026 – Verified Operators | Economy to VIP | Compare Now",
  description:
    "Compare Umrah and Hajj packages from verified operators. All-inclusive from Dubai, Riyadh, Doha & Kuwait — flights, Haram-proximity hotels, visa & transfers. Get a free quote via WhatsApp.",
  alternates: { canonical: "https://besthoteldealsdaily.com/umrah/" },
  robots: { index: true, follow: true },
};

const tierColors: Record<string, string> = {
  economy: "bg-green-100 text-green-700",
  standard: "bg-blue-100 text-blue-700",
  premium: "bg-purple-100 text-purple-700",
  vip: "bg-gold-100 text-gold-700",
};

export default function UmrahPage() {
  const featured = umrahPackages.filter((p) => p.featured);
  const hajjPackages = umrahPackages.filter((p) => p.type === "hajj");
  const umrahOnly = umrahPackages.filter((p) => p.type === "umrah");
  const crossSell = getCrossSellPlatforms("umrah");

  const umrahFaqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How much does an Umrah package cost from Dubai in 2026?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Umrah packages from Dubai range from AED 4,500 (economy, 10 nights) to AED 15,000+ (premium, 14 nights). Prices include flights, visa, hotels, and ground transport. Ramadan packages cost 30-50% more.",
        },
      },
      {
        "@type": "Question",
        name: "What is included in a standard Umrah package?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Standard Umrah packages typically include return flights, Umrah visa processing, hotel accommodation in both Makkah and Madinah, ground transport (airport transfers and inter-city), and guided Ziyarat tours. Meals and premium hotel upgrades are usually optional.",
        },
      },
      {
        "@type": "Question",
        name: "When is the best time to perform Umrah in 2026?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ramadan 2026 (Feb 17 – Mar 19) is the most spiritually rewarding time but also the most expensive. For budget travelers, the period from April to May and September to November offers lower prices and smaller crowds while maintaining pleasant weather.",
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white pt-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(umrahFaqSchema) }}
      />

      {/* Hero */}
      <div className="bg-emerald-950 pt-20 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 rounded-full px-3 py-1 mb-6">
            <MoonStar className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">
              Umrah &amp; Hajj Packages
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black text-white leading-tight mb-6">
            Best Umrah &amp; Hajj Packages{" "}
            <span className="text-emerald-400">2026</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Compare verified packages from trusted operators across the Gulf.
            Economy to VIP — flights, hotels near Haram, visa, and transfers
            all included.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-white text-sm font-bold">
            <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
              <Shield className="w-4 h-4 text-emerald-400" /> {umrahPackages.length} Verified Packages
            </span>
            <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
              <Plane className="w-4 h-4 text-emerald-400" /> Flights Included
            </span>
            <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
              <Building2 className="w-4 h-4 text-emerald-400" /> Hotels Near Haram
            </span>
          </div>
        </div>
      </div>

      {/* Featured Packages */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-black text-navy-900 mb-8 text-center">
            Featured Packages
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((pkg) => (
              <article key={pkg.id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 flex flex-col">
                <div className="relative h-48">
                  <Image src={pkg.image} alt={pkg.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`text-xs font-black px-2 py-1 rounded-full ${tierColors[pkg.tier]}`}>
                      {pkg.tier.toUpperCase()}
                    </span>
                    <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {pkg.type === "hajj" ? "Hajj" : "Umrah"}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 text-white">
                    <div className="font-bold text-sm">{pkg.makkahHotel}</div>
                    <div className="text-emerald-300 text-xs">{pkg.makkahDistance}</div>
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-display text-lg font-bold text-navy-900 mb-2">{pkg.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <MapPin className="w-3 h-3 text-emerald-500" />
                    {pkg.operatorCity} · {pkg.operator}
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2 flex-1">{pkg.description}</p>

                  <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <div className="font-black text-navy-900">{pkg.makkahNights}N</div>
                      <div className="text-gray-400">Makkah</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <div className="font-black text-navy-900">{pkg.madinahNights}N</div>
                      <div className="text-gray-400">Madinah</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {pkg.includesFlights && <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">Flights</span>}
                    {pkg.includesVisa && <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">Visa</span>}
                    {pkg.includesTransport && <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">Transport</span>}
                    {pkg.includesMeals && <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">Meals</span>}
                  </div>

                  <div className="flex items-end justify-between pt-3 border-t border-gray-100">
                    <div>
                      <div className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">From</div>
                      <div className="text-navy-900 font-black text-xl">{pkg.currency} {pkg.price.toLocaleString()}</div>
                      <div className="text-gray-400 text-[10px]">{pkg.priceNote}</div>
                    </div>
                    <a
                      href={whatsappLink(`I'm interested in the ${pkg.name} package (${pkg.currency} ${pkg.price.toLocaleString()}). Please share details.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-black rounded-xl transition-colors"
                    >
                      Inquire Now
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* All Packages */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-black text-navy-900 mb-4 text-center">
            All Umrah Packages
          </h2>
          <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">
            Compare packages by price, duration, and tier. All operators are verified and licensed.
          </p>

          <div className="space-y-4">
            {umrahOnly.map((pkg) => (
              <div key={pkg.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row items-start gap-5">
                <div className="relative w-full sm:w-40 h-32 rounded-xl overflow-hidden shrink-0">
                  <Image src={pkg.image} alt={pkg.name} fill className="object-cover" sizes="160px" />
                  <div className="absolute top-2 left-2">
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${tierColors[pkg.tier]}`}>
                      {pkg.tier.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-navy-900 text-lg mb-1">{pkg.name}</h3>
                  <div className="text-xs text-gray-500 mb-2">{pkg.operator} · {pkg.operatorCity} · {pkg.duration}</div>
                  <div className="text-sm text-gray-500 mb-3 line-clamp-2">{pkg.description}</div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="text-gray-500">{pkg.makkahNights}N Makkah ({pkg.makkahDistance})</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-gray-500">{pkg.madinahNights}N Madinah ({pkg.madinahDistance})</span>
                  </div>
                </div>
                <div className="text-right shrink-0 flex flex-col items-end gap-2">
                  <div>
                    <div className="text-navy-900 font-black text-xl">{pkg.currency} {pkg.price.toLocaleString()}</div>
                    <div className="text-gray-400 text-[10px]">{pkg.priceNote}</div>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <Star className="w-3 h-3 text-gold-500 fill-gold-500" />
                    <span className="font-bold text-navy-900">{pkg.rating}</span>
                    <span className="text-gray-400">({pkg.reviewCount})</span>
                  </div>
                  <a
                    href={whatsappLink(`I'm interested in: ${pkg.name} (${pkg.currency} ${pkg.price.toLocaleString()})`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-black rounded-xl transition-colors"
                  >
                    Get Quote
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hajj Section */}
      {hajjPackages.length > 0 && (
        <div className="py-16 bg-emerald-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl font-black text-navy-900 mb-4">
                Hajj 2026 Packages
              </h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                Hajj season is May–June 2026. Book early — packages sell out months in advance.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {hajjPackages.map((pkg) => (
                <div key={pkg.id} className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-full mb-2 inline-block">Hajj 2026</span>
                      <h3 className="font-bold text-navy-900 text-lg">{pkg.name}</h3>
                      <div className="text-xs text-gray-500 mt-1">{pkg.operator} · {pkg.duration}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-navy-900 font-black text-2xl">{pkg.currency} {pkg.price.toLocaleString()}</div>
                      <div className="text-gray-400 text-[10px]">{pkg.priceNote}</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">{pkg.description}</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {pkg.highlights.map((h) => (
                      <span key={h} className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> {h}
                      </span>
                    ))}
                  </div>
                  <a
                    href={whatsappLink(`I'm interested in: ${pkg.name} - Hajj (${pkg.currency} ${pkg.price.toLocaleString()})`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white w-full block text-center py-3 text-sm font-black rounded-xl transition-colors"
                  >
                    Reserve Hajj Spot
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FAQs */}
      <div className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-black text-navy-900 mb-8 text-center">
            Umrah &amp; Hajj FAQs
          </h2>
          <div className="space-y-3">
            {[
              { q: "How much does an Umrah package cost from Dubai in 2026?", a: "Economy packages start from AED 4,500 (10 nights, double sharing). Premium packages with 5-star Haram-view hotels range from AED 10,000–15,000. VIP Ramadan packages can exceed AED 25,000." },
              { q: "What is included in a standard Umrah package?", a: "Standard packages include return flights, Umrah visa, hotel accommodation in Makkah and Madinah, ground transport (airport + inter-city), and guided Ziyarat tours. Meals are usually optional." },
              { q: "When is the best time to perform Umrah in 2026?", a: "Ramadan (Feb 17 – Mar 19, 2026) offers the greatest spiritual reward but highest prices. April–May and September–November are ideal for budget travelers with lower crowds and pleasant weather." },
            ].map((faq) => (
              <details key={faq.q} className="bg-white border border-gray-100 rounded-xl overflow-hidden group">
                <summary className="px-5 py-4 cursor-pointer font-bold text-navy-900 text-sm hover:text-emerald-700 transition-colors list-none flex items-center justify-between">
                  {faq.q}
                  <ArrowRight className="w-4 h-4 text-gray-400 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </div>

      {/* Cross-Sell */}
      <div className="py-16 bg-navy-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-2xl font-bold text-white mb-8">
            Complete Your Journey
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {crossSell.map((p) => (
              <Link
                key={p.id}
                href={p.href}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 text-left transition-colors group"
              >
                <h3 className="font-bold text-white text-sm group-hover:text-gold-400 transition-colors mb-1">
                  {p.name}
                </h3>
                <p className="text-gray-400 text-xs">{p.tagline}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
