import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { umrahPackages } from "@/lib/umrah-data";
import { getCrossSellPlatforms } from "@/lib/ecosystem";
import { whatsappLink } from "@/lib/config";
import { MoonStar, MapPin, Star, CheckCircle, Plane, Building2, Clock, Users, Shield, ArrowLeft } from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return umrahPackages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pkg = umrahPackages.find((p) => p.slug === slug);
  if (!pkg) return {};
  return {
    title: `${pkg.name} – ${pkg.operator} | From ${pkg.currency} ${pkg.price.toLocaleString()}`,
    description: `${pkg.description} Departing from ${pkg.departureCities.join(", ")}. ${pkg.makkahNights} nights Makkah + ${pkg.madinahNights} nights Madinah.`,
    alternates: { canonical: `https://besthoteldealsdaily.com/umrah/${pkg.slug}/` },
    openGraph: {
      title: `${pkg.name} – ${pkg.currency} ${pkg.price.toLocaleString()}`,
      description: pkg.description,
      url: `https://besthoteldealsdaily.com/umrah/${pkg.slug}/`,
      images: [{ url: pkg.image, width: 1200, height: 630, alt: pkg.name }],
    },
  };
}

const tierColors: Record<string, string> = {
  economy: "bg-green-100 text-green-700",
  standard: "bg-blue-100 text-blue-700",
  premium: "bg-purple-100 text-purple-700",
  vip: "bg-gold-100 text-gold-700",
};

export default async function UmrahDetailPage({ params }: Props) {
  const { slug } = await params;
  const pkg = umrahPackages.find((p) => p.slug === slug);
  if (!pkg) notFound();

  const related = umrahPackages.filter((p) => p.slug !== slug && p.type === pkg.type).slice(0, 3);
  const crossSell = getCrossSellPlatforms("umrah");

  const packageSchema = {
    "@context": "https://schema.org",
    "@type": "TravelAction",
    name: pkg.name,
    description: pkg.description,
    agent: { "@type": "TravelAgency", name: pkg.operator, address: { "@type": "PostalAddress", addressLocality: pkg.operatorCity } },
    object: {
      "@type": "LodgingReservation",
      lodgingUnitDescription: `${pkg.makkahNights} nights in Makkah (${pkg.makkahHotel}) + ${pkg.madinahNights} nights in Madinah (${pkg.madinahHotel})`,
    },
    priceSpecification: {
      "@type": "PriceSpecification",
      price: pkg.price,
      priceCurrency: pkg.currency,
    },
  };

  return (
    <div className="min-h-screen bg-white pt-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(packageSchema) }}
      />

      {/* Hero Image */}
      <div className="relative h-64 sm:h-80">
        <Image src={pkg.image} alt={pkg.name} fill className="object-cover" sizes="100vw" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 to-transparent" />
        <div className="absolute bottom-6 left-0 right-0">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/umrah/" className="text-gray-300 text-xs hover:text-white transition-colors inline-flex items-center gap-1 mb-3">
              <ArrowLeft className="w-3 h-3" /> All Umrah Packages
            </Link>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-black px-2 py-1 rounded-full ${tierColors[pkg.tier]}`}>
                {pkg.tier.toUpperCase()}
              </span>
              <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                {pkg.type === "hajj" ? "Hajj 2026" : "Umrah"}
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-black text-white">{pkg.name}</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Operator & Duration */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-emerald-500" /> {pkg.operator} · {pkg.operatorCity}</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-emerald-500" /> {pkg.duration}</span>
              <span className="flex items-center gap-1"><Star className="w-4 h-4 text-gold-500 fill-gold-500" /> {pkg.rating} ({pkg.reviewCount} reviews)</span>
            </div>

            {/* Description */}
            <div>
              <h2 className="font-display text-xl font-black text-navy-900 mb-3">About This Package</h2>
              <p className="text-gray-600 leading-relaxed">{pkg.description}</p>
            </div>

            {/* Accommodation */}
            <div>
              <h2 className="font-display text-xl font-black text-navy-900 mb-4">Accommodation</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
                  <div className="flex items-center gap-2 mb-3">
                    <MoonStar className="w-5 h-5 text-emerald-700" />
                    <h3 className="font-bold text-navy-900">Makkah</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Hotel</span><span className="font-semibold text-navy-900">{pkg.makkahHotel}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Nights</span><span className="font-semibold text-navy-900">{pkg.makkahNights}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Distance</span><span className="font-semibold text-navy-900">{pkg.makkahDistance}</span></div>
                  </div>
                </div>
                <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="w-5 h-5 text-emerald-700" />
                    <h3 className="font-bold text-navy-900">Madinah</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Hotel</span><span className="font-semibold text-navy-900">{pkg.madinahHotel}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Nights</span><span className="font-semibold text-navy-900">{pkg.madinahNights}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Distance</span><span className="font-semibold text-navy-900">{pkg.madinahDistance}</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Inclusions */}
            <div>
              <h2 className="font-display text-xl font-black text-navy-900 mb-4">What&apos;s Included</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Flights", included: pkg.includesFlights, icon: <Plane className="w-4 h-4" /> },
                  { label: "Visa", included: pkg.includesVisa, icon: <Shield className="w-4 h-4" /> },
                  { label: "Transport", included: pkg.includesTransport, icon: <MapPin className="w-4 h-4" /> },
                  { label: "Meals", included: pkg.includesMeals, icon: <Users className="w-4 h-4" /> },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`rounded-xl p-3 text-center text-sm font-bold ${
                      item.included ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-50 text-gray-400 border border-gray-100"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      {item.icon}
                      {item.label}
                    </div>
                    <div className="text-[10px] mt-1">{item.included ? "Included" : "Not included"}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Highlights */}
            <div>
              <h2 className="font-display text-xl font-black text-navy-900 mb-4">Package Highlights</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {pkg.highlights.map((h) => (
                  <div key={h} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> {h}
                  </div>
                ))}
              </div>
            </div>

            {/* Departure Cities */}
            <div>
              <h2 className="font-display text-xl font-black text-navy-900 mb-3">Departure Cities</h2>
              <div className="flex flex-wrap gap-2">
                {pkg.departureCities.map((city) => (
                  <span key={city} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm font-medium">
                    {city}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar — Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 sticky top-28 space-y-5">
              <div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Starting From</div>
                <div className="text-navy-900 font-black text-3xl">{pkg.currency} {pkg.price.toLocaleString()}</div>
                <div className="text-gray-500 text-sm">{pkg.priceNote}</div>
              </div>

              <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
                <div className="flex justify-between"><span className="text-gray-500">Duration</span><span className="font-semibold text-navy-900">{pkg.duration}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="font-semibold text-navy-900 capitalize">{pkg.type}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Tier</span><span className="font-semibold text-navy-900 capitalize">{pkg.tier}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Valid</span><span className="font-semibold text-navy-900">{new Date(pkg.validFrom).toLocaleDateString("en-GB", { month: "short", year: "numeric" })} – {new Date(pkg.validUntil).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</span></div>
              </div>

              <a
                href={whatsappLink(`I'm interested in: ${pkg.name} (${pkg.currency} ${pkg.price.toLocaleString()}). Departing from: [city]. Travel dates: [dates].`)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white w-full block text-center py-3.5 text-sm font-black rounded-xl transition-colors"
              >
                Inquire via WhatsApp
              </a>

              <a
                href="mailto:umrah@besthoteldealsdaily.com"
                className="border border-emerald-200 text-emerald-700 hover:bg-emerald-50 w-full block text-center py-3 text-sm font-bold rounded-xl transition-colors"
              >
                Request by Email
              </a>

              <div className="text-[10px] text-gray-400 text-center pt-2 border-t border-gray-50">
                Verified by Best Hotel Deals Daily
              </div>
            </div>
          </div>
        </div>

        {/* Related Packages */}
        {related.length > 0 && (
          <div className="mt-16 pt-10 border-t border-gray-100">
            <h2 className="font-display text-2xl font-black text-navy-900 mb-6">Similar Packages</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/umrah/${r.slug}/`}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5 group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${tierColors[r.tier]}`}>{r.tier.toUpperCase()}</span>
                  </div>
                  <h3 className="font-bold text-navy-900 text-sm group-hover:text-emerald-700 transition-colors mb-1">{r.name}</h3>
                  <div className="text-xs text-gray-500 mb-3">{r.operator} · {r.duration}</div>
                  <div className="text-navy-900 font-black">{r.currency} {r.price.toLocaleString()}</div>
                  <div className="text-[10px] text-gray-400">{r.priceNote}</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Cross-Sell */}
        <div className="mt-16 pt-10 border-t border-gray-100">
          <h2 className="font-display text-xl font-black text-navy-900 mb-4">Complete Your Trip</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {crossSell.map((p) => (
              <Link key={p.id} href={p.href} className="bg-gray-50 hover:bg-gray-100 rounded-xl p-4 transition-colors group">
                <h3 className="font-bold text-navy-900 text-sm group-hover:text-gold-600 transition-colors">{p.name}</h3>
                <p className="text-gray-500 text-xs mt-1">{p.tagline}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
