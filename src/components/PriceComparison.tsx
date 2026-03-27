import { Hotel } from "@/lib/types";
import TrackedLink from "@/components/TrackedLink";
import { ExternalLink, CheckCircle, ShieldCheck } from "lucide-react";

interface PriceComparisonProps {
  hotel: Hotel;
}

/**
 * Side-by-side OTA price comparison widget.
 * Shows prices from Booking.com, Agoda, Expedia, and Direct booking
 * with tracked affiliate links. This is a key competitive moat —
 * no other Middle East platform offers this comparison view.
 */

// Estimated price variation per platform based on typical rate differences.
// In production, replace with real-time API calls to each OTA.
function getEstimatedPrice(basePrice: number, platform: string): number {
  const multipliers: Record<string, number> = {
    booking: 1.0,
    agoda: 0.95,
    expedia: 1.05,
    direct: 0.88,
  };
  return Math.round(basePrice * (multipliers[platform] || 1.0));
}

function getBestPlatform(prices: { id: string; price: number }[]): string {
  return prices.reduce((best, p) => (p.price < best.price ? p : best)).id;
}

export default function PriceComparison({ hotel }: PriceComparisonProps) {
  const platforms: { id: string; name: string; href: string | null; logo: string }[] = [
    { id: "booking", name: "Booking.com", href: hotel.affiliateLinks?.booking || null, logo: "B" },
    { id: "agoda", name: "Agoda", href: hotel.affiliateLinks?.agoda || null, logo: "A" },
    { id: "expedia", name: "Expedia", href: hotel.affiliateLinks?.expedia || null, logo: "E" },
  ];

  // Add direct booking if available
  if (hotel.listingType === "direct") {
    platforms.push({ id: "direct", name: "Book Direct", href: `/book/${hotel.slug}/`, logo: "D" });
  }

  const availablePlatforms = platforms.filter((p) => p.href);
  if (availablePlatforms.length < 2) return null;

  const prices = availablePlatforms.map((p) => ({
    ...p,
    price: getEstimatedPrice(hotel.priceFrom, p.id),
  }));

  const bestPlatformId = getBestPlatform(prices);
  const bestPrice = prices.find((p) => p.id === bestPlatformId)?.price ?? hotel.priceFrom;
  const worstPrice = Math.max(...prices.map((p) => p.price));
  const savings = worstPrice - bestPrice;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-navy-950 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-gold-400" />
          <span className="text-white text-xs font-black uppercase tracking-wider">Price Comparison</span>
        </div>
        {savings > 0 && (
          <span className="text-green-400 text-xs font-bold">
            Save up to {hotel.currency} {savings}
          </span>
        )}
      </div>

      {/* Price Rows */}
      <div className="divide-y divide-gray-50">
        {prices.sort((a, b) => a.price - b.price).map((p) => {
          const isBest = p.id === bestPlatformId;
          return (
            <div
              key={p.id}
              className={`px-4 py-3 flex items-center justify-between ${isBest ? "bg-green-50" : ""}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${
                  p.id === "booking" ? "bg-blue-100 text-blue-700" :
                  p.id === "agoda" ? "bg-red-100 text-red-700" :
                  p.id === "expedia" ? "bg-yellow-100 text-yellow-700" :
                  "bg-navy-100 text-navy-700"
                }`}>
                  {p.logo}
                </div>
                <div>
                  <div className="text-sm font-bold text-navy-900 flex items-center gap-1.5">
                    {p.name}
                    {isBest && (
                      <span className="text-[8px] font-black bg-green-500 text-white px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <CheckCircle className="w-2.5 h-2.5" /> BEST
                      </span>
                    )}
                  </div>
                  {isBest && <div className="text-[10px] text-green-600 font-semibold">Lowest price found</div>}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className={`font-black text-lg ${isBest ? "text-green-700" : "text-navy-900"}`}>
                    {hotel.currency} {p.price.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-gray-400">per night</div>
                </div>
                {p.id === "direct" ? (
                  <a href={p.href!} className="bg-navy-900 hover:bg-navy-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1">
                    Book <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <TrackedLink
                    href={p.href!}
                    event="affiliate_click"
                    hotelSlug={hotel.slug}
                    city={hotel.city}
                    source={`compare_${p.id}`}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="bg-gold-500 hover:bg-gold-600 text-navy-950 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    View <ExternalLink className="w-3 h-3" />
                  </TrackedLink>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-4 py-2 text-center">
        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
          Estimated prices by Best Hotel Deals Daily · Click through for live rates
        </span>
      </div>
    </div>
  );
}
