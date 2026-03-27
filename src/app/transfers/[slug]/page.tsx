import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { transferRoutes } from "@/lib/transfers-data";
import { getCrossSellPlatforms } from "@/lib/ecosystem";
import { whatsappLink } from "@/lib/config";
import { Car, MapPin, Clock, Users, Shield, CheckCircle, ArrowLeft, Plane } from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return transferRoutes.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const route = transferRoutes.find((t) => t.slug === slug);
  if (!route) return {};
  const cheapest = route.vehicleTypes[0];
  return {
    title: `${route.name} – From ${cheapest.currency} ${cheapest.price} | Best Transfer Deals Daily`,
    description: `${route.description} Compare ${route.vehicleTypes.length} vehicle options. ${route.duration}, ${route.distance}. Free cancellation.`,
    alternates: { canonical: `https://besthoteldealsdaily.com/transfers/${route.slug}/` },
    openGraph: {
      title: route.name,
      description: route.description,
      url: `https://besthoteldealsdaily.com/transfers/${route.slug}/`,
      images: [{ url: route.image, width: 1200, height: 630, alt: route.name }],
    },
  };
}

const typeLabels: Record<string, string> = {
  "airport-transfer": "Airport Transfer",
  "inter-city": "Inter-City Transfer",
  "car-rental": "Car Rental",
};

export default async function TransferDetailPage({ params }: Props) {
  const { slug } = await params;
  const route = transferRoutes.find((t) => t.slug === slug);
  if (!route) notFound();

  const related = transferRoutes.filter((t) => t.slug !== slug && t.city === route.city).slice(0, 3);
  const otherRoutes = related.length < 3
    ? [...related, ...transferRoutes.filter((t) => t.slug !== slug && t.city !== route.city).slice(0, 3 - related.length)]
    : related;
  const crossSell = getCrossSellPlatforms("transfers");
  const cheapest = route.vehicleTypes[0];

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: route.name,
    description: route.description,
    provider: { "@type": "Organization", name: "Best Transfer Deals Daily" },
    areaServed: { "@type": "City", name: route.city },
    offers: route.vehicleTypes.map((v) => ({
      "@type": "Offer",
      name: v.name,
      price: v.price,
      priceCurrency: v.currency,
      eligibleQuantity: { "@type": "QuantitativeValue", value: v.capacity, unitText: "passengers" },
    })),
  };

  return (
    <div className="min-h-screen bg-white pt-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      {/* Hero */}
      <div className="relative h-56 sm:h-72">
        <Image src={route.image} alt={route.name} fill className="object-cover" sizes="100vw" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 to-transparent" />
        <div className="absolute bottom-6 left-0 right-0">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/transfers/" className="text-gray-300 text-xs hover:text-white transition-colors inline-flex items-center gap-1 mb-3">
              <ArrowLeft className="w-3 h-3" /> All Transfers
            </Link>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                {typeLabels[route.type]}
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-black text-white">{route.name}</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-8">
            {/* Route Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-blue-500" /> {route.city}, {route.country}</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-blue-500" /> {route.duration}</span>
              <span className="flex items-center gap-1"><Car className="w-4 h-4 text-blue-500" /> {route.distance}</span>
            </div>

            {/* Description */}
            <div>
              <h2 className="font-display text-xl font-black text-navy-900 mb-3">About This Route</h2>
              <p className="text-gray-600 leading-relaxed">{route.description}</p>
            </div>

            {/* Route Details */}
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
              <h2 className="font-display text-lg font-black text-navy-900 mb-4">Route Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500 mb-1">From</div>
                  <div className="font-bold text-navy-900">{route.from}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">To</div>
                  <div className="font-bold text-navy-900">{route.to}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Duration</div>
                  <div className="font-bold text-navy-900">{route.duration}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Distance</div>
                  <div className="font-bold text-navy-900">{route.distance}</div>
                </div>
              </div>
            </div>

            {/* Vehicle Options */}
            <div>
              <h2 className="font-display text-xl font-black text-navy-900 mb-4">Vehicle Options</h2>
              <div className="space-y-3">
                {route.vehicleTypes.map((v) => (
                  <div key={v.name} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        <Car className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold text-navy-900">{v.name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Users className="w-3 h-3" /> Up to {v.capacity} passengers
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-navy-900 font-black text-xl">{v.currency} {v.price}</div>
                      <div className="text-[10px] text-gray-400">{route.type === "car-rental" ? "per day" : "one way"}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust Features */}
            <div>
              <h2 className="font-display text-xl font-black text-navy-900 mb-4">Service Features</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "Meet & greet at arrivals",
                  "Flight tracking — driver adjusts for delays",
                  "Free cancellation up to 24 hours",
                  "60 minutes free waiting time",
                  "Licensed & insured vehicles",
                  "English & Arabic speaking drivers",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" /> {f}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 sticky top-28 space-y-5">
              <div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">From</div>
                <div className="text-navy-900 font-black text-3xl">{cheapest.currency} {cheapest.price}</div>
                <div className="text-gray-500 text-sm">{cheapest.name} · {route.type === "car-rental" ? "per day" : "one way"}</div>
              </div>

              <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
                <div className="flex justify-between"><span className="text-gray-500">Route</span><span className="font-semibold text-navy-900">{route.city}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Duration</span><span className="font-semibold text-navy-900">{route.duration}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Vehicles</span><span className="font-semibold text-navy-900">{route.vehicleTypes.length} options</span></div>
              </div>

              <a
                href={whatsappLink(`I need: ${route.name}. Date: [date]. Passengers: [number]. Flight: [flight number].`)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white w-full block text-center py-3.5 text-sm font-black rounded-xl transition-colors"
              >
                Book via WhatsApp
              </a>

              <a
                href="mailto:transfers@besthoteldealsdaily.com"
                className="border border-blue-200 text-blue-700 hover:bg-blue-50 w-full block text-center py-3 text-sm font-bold rounded-xl transition-colors"
              >
                Request by Email
              </a>

              <div className="space-y-2 pt-3 border-t border-gray-50">
                {["Free cancellation", "No hidden fees", "Instant confirmation"].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-xs text-gray-500">
                    <Shield className="w-3 h-3 text-green-500" /> {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related Routes */}
        {otherRoutes.length > 0 && (
          <div className="mt-16 pt-10 border-t border-gray-100">
            <h2 className="font-display text-2xl font-black text-navy-900 mb-6">Other Routes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {otherRoutes.map((r) => (
                <Link
                  key={r.slug}
                  href={`/transfers/${r.slug}/`}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5 group"
                >
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 mb-2 inline-block">
                    {typeLabels[r.type]}
                  </span>
                  <h3 className="font-bold text-navy-900 text-sm group-hover:text-blue-700 transition-colors mb-1">{r.name}</h3>
                  <div className="text-xs text-gray-500 mb-2">{r.duration} · {r.distance}</div>
                  <div className="text-navy-900 font-black">{r.vehicleTypes[0].currency} {r.vehicleTypes[0].price}+</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Cross-Sell */}
        <div className="mt-16 pt-10 border-t border-gray-100">
          <h2 className="font-display text-xl font-black text-navy-900 mb-4">More Travel Services</h2>
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
