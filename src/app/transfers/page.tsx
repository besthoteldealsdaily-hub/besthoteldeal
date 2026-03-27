import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Car, Plane, MapPin, Clock, Users, ArrowRight, Shield, CheckCircle } from "lucide-react";
import { transferRoutes, getFeaturedTransfers } from "@/lib/transfers-data";
import { getCrossSellPlatforms } from "@/lib/ecosystem";
import { whatsappLink } from "@/lib/config";

export const metadata: Metadata = {
  title: "Airport Transfers in Dubai, Doha & Jeddah 2026 – Fixed Rates | Pre-Book Today",
  description:
    "Pre-book reliable airport transfers in Dubai, Jeddah, Doha, Riyadh & Muscat. Sedans, SUVs & minivans from verified drivers — fixed prices, flight tracking, free cancellation.",
  alternates: { canonical: "https://besthoteldealsdaily.com/transfers/" },
  robots: { index: true, follow: true },
};

export default function TransfersPage() {
  const featured = getFeaturedTransfers();
  const airportTransfers = transferRoutes.filter((t) => t.type === "airport-transfer");
  const interCity = transferRoutes.filter((t) => t.type === "inter-city");
  const carRentals = transferRoutes.filter((t) => t.type === "car-rental");
  const crossSell = getCrossSellPlatforms("transfers");

  return (
    <div className="min-h-screen bg-white pt-14">
      {/* Hero */}
      <div className="bg-blue-950 pt-20 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-500/30 rounded-full px-3 py-1 mb-6">
            <Car className="w-3 h-3 text-blue-400" />
            <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest">
              Transfers &amp; Car Rentals
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black text-white leading-tight mb-6">
            Airport Transfers &amp; Car Rentals{" "}
            <span className="text-blue-400">Across the Middle East</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Pre-book verified airport pickups, hotel transfers, and rental cars
            in Dubai, Jeddah, Doha, Riyadh, and more. Meet &amp; greet service,
            flight tracking, and free cancellation.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-white text-sm font-bold">
            <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
              <Shield className="w-4 h-4 text-blue-400" /> {transferRoutes.length} Routes
            </span>
            <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
              <Clock className="w-4 h-4 text-blue-400" /> Free Cancellation
            </span>
            <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
              <Plane className="w-4 h-4 text-blue-400" /> Flight Tracking
            </span>
          </div>
        </div>
      </div>

      {/* Featured Routes */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-black text-navy-900 mb-8 text-center">
            Most Popular Routes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((route) => (
              <article key={route.id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 flex flex-col">
                <div className="relative h-40">
                  <Image src={route.image} alt={route.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 25vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="bg-blue-600 text-white text-[9px] font-black px-2 py-1 rounded-full uppercase">
                      {route.type === "car-rental" ? "Car Rental" : route.type === "inter-city" ? "Inter-City" : "Airport"}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 text-white">
                    <div className="font-bold text-xs">{route.city}, {route.country}</div>
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-navy-900 text-sm mb-2 line-clamp-2">{route.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {route.duration}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {route.distance}</span>
                  </div>
                  <div className="mt-auto pt-3 border-t border-gray-100 flex items-end justify-between">
                    <div>
                      <div className="text-[8px] text-gray-400 font-bold uppercase">From</div>
                      <div className="text-navy-900 font-black">
                        {route.vehicleTypes[0].currency} {route.vehicleTypes[0].price}
                      </div>
                    </div>
                    <a
                      href={whatsappLink(`I need a transfer: ${route.name}. Please share availability.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-xs font-black rounded-xl transition-colors"
                    >
                      Book Now
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* Airport Transfers Table */}
      <div className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-black text-navy-900 mb-8 text-center">
            Airport Transfer Routes
          </h2>
          <div className="space-y-4">
            {airportTransfers.map((route) => (
              <div key={route.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-bold text-navy-900 mb-1">{route.name}</h3>
                    <div className="text-xs text-gray-500 flex items-center gap-3">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {route.duration}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {route.distance}</span>
                    </div>
                  </div>
                  <a
                    href={whatsappLink(`I need: ${route.name}. Date: [date]. Flight: [flight number].`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-black rounded-xl transition-colors shrink-0"
                  >
                    Get Quote
                  </a>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {route.vehicleTypes.map((v) => (
                    <div key={v.name} className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-xs font-bold text-navy-900 mb-1">{v.name}</div>
                      <div className="text-navy-900 font-black">{route.vehicleTypes[0].currency} {v.price}</div>
                      <div className="text-[10px] text-gray-400 flex items-center justify-center gap-1 mt-1">
                        <Users className="w-3 h-3" /> Up to {v.capacity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inter-City */}
      {interCity.length > 0 && (
        <div className="py-16 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl font-black text-navy-900 mb-8 text-center">
              Inter-City Transfers
            </h2>
            {interCity.map((route) => (
              <div key={route.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-4">
                <h3 className="font-bold text-navy-900 text-lg mb-2">{route.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{route.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  {route.vehicleTypes.map((v) => (
                    <div key={v.name} className="bg-blue-50 rounded-lg p-4">
                      <div className="font-bold text-navy-900 text-sm">{v.name}</div>
                      <div className="text-navy-900 font-black text-xl mt-1">{route.vehicleTypes[0].currency} {v.price}</div>
                      <div className="text-xs text-gray-500 mt-1">Up to {v.capacity} passengers</div>
                    </div>
                  ))}
                </div>
                <a
                  href={whatsappLink(`I need: ${route.name}. Date: [date]. Passengers: [number].`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full block text-center py-3 text-sm font-black rounded-xl transition-colors"
                >
                  Book Inter-City Transfer
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Car Rentals */}
      {carRentals.length > 0 && (
        <div className="py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl font-black text-navy-900 mb-8 text-center">
              Car Rentals
            </h2>
            {carRentals.map((route) => (
              <div key={route.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-navy-900 text-lg mb-2">{route.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{route.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {route.vehicleTypes.map((v) => (
                    <div key={v.name} className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="font-bold text-navy-900 text-sm">{v.name}</div>
                      <div className="text-navy-900 font-black text-xl mt-1">{v.currency} {v.price}</div>
                      <div className="text-[10px] text-gray-400 mt-1">per day</div>
                    </div>
                  ))}
                </div>
                <a
                  href={whatsappLink(`I need a rental car in ${route.city}. Dates: [from] to [to].`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full block text-center py-3 text-sm font-black rounded-xl transition-colors"
                >
                  Get Rental Quote
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cross-Sell */}
      <div className="py-16 bg-navy-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-2xl font-bold text-white mb-8">
            More Travel Services
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
