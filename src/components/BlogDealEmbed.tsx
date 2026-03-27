import Link from "next/link";
import { deals, cities } from "@/lib/data";
import { Star, ArrowRight, Tag } from "lucide-react";

interface BlogDealEmbedProps {
  relatedCities: string[];
}

/**
 * Embeddable deal/hotel widget for blog posts.
 * Automatically shows relevant deals + top hotels for the post's related cities.
 * Drives affiliate conversions directly from content pages.
 */
export default function BlogDealEmbed({ relatedCities }: BlogDealEmbedProps) {
  // Find deals in related cities
  const relevantDeals = deals
    .filter((d) => relatedCities.some((cs) => {
      const city = cities.find((c) => c.slug === cs);
      return city && d.city.toLowerCase() === city.name.toLowerCase();
    }))
    .slice(0, 3);

  // Find top hotels from related cities
  const relevantHotels = relatedCities
    .flatMap((cs) => {
      const city = cities.find((c) => c.slug === cs);
      return city ? city.hotels.slice(0, 2).map((h) => ({ ...h, cityName: city.name })) : [];
    })
    .slice(0, 4);

  if (relevantDeals.length === 0 && relevantHotels.length === 0) return null;

  return (
    <div className="my-10 space-y-6">
      {/* Active Deals */}
      {relevantDeals.length > 0 && (
        <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 rounded-2xl overflow-hidden">
          <div className="bg-red-500 px-5 py-2.5 flex items-center gap-2">
            <Tag className="w-4 h-4 text-white" />
            <span className="text-white text-xs font-black uppercase tracking-wider">
              Active Deals for This Destination
            </span>
          </div>
          <div className="p-5 space-y-3">
            {relevantDeals.map((deal) => (
              <Link
                key={deal.id}
                href={`/deals/${deal.slug}/`}
                className="flex items-center justify-between bg-white rounded-xl p-4 border border-red-100 hover:shadow-md transition-shadow group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      -{deal.discount}%
                    </span>
                    <span className="text-sm font-bold text-navy-900 truncate group-hover:text-gold-600 transition-colors">
                      {deal.hotelName}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {deal.city}, {deal.country} · Valid until {new Date(deal.validUntil).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </div>
                </div>
                <div className="text-right ml-4 shrink-0">
                  <div className="text-xs text-gray-400 line-through">{deal.currency} {deal.originalPrice}</div>
                  <div className="text-lg font-black text-green-600">{deal.currency} {deal.discountedPrice}</div>
                  <div className="text-[10px] text-gray-400">per night</div>
                </div>
              </Link>
            ))}
            <Link
              href="/deals/"
              className="flex items-center justify-center gap-1.5 text-red-600 font-bold text-xs py-2 hover:text-red-700 transition-colors"
            >
              View All Deals <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {/* Top Hotels */}
      {relevantHotels.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
          <div className="bg-navy-950 px-5 py-2.5 flex items-center gap-2">
            <Star className="w-4 h-4 text-gold-400" />
            <span className="text-white text-xs font-black uppercase tracking-wider">
              Top Rated Hotels
            </span>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {relevantHotels.map((hotel) => (
              <Link
                key={hotel.id}
                href={`/city/${hotel.city}/`}
                className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center gap-1 mb-1">
                  {Array.from({ length: Math.min(hotel.stars, 5) }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-gold-400 fill-gold-400" />
                  ))}
                </div>
                <div className="text-sm font-bold text-navy-900 group-hover:text-gold-600 transition-colors truncate">
                  {hotel.name}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{hotel.cityName}</div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">From</span>
                  <span className="text-sm font-black text-navy-900">
                    {hotel.currency} {hotel.priceFrom.toLocaleString()}/night
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
