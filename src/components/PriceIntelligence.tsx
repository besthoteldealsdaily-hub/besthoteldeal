import { Hotel } from "@/lib/types";
import { BarChart3, TrendingDown, TrendingUp, Calendar, DollarSign } from "lucide-react";
import { getSeasonalContext } from "@/lib/seasonal";

interface PriceIntelligenceProps {
  hotels: Hotel[];
  cityName: string;
  citySlug: string;
}

/**
 * City-level price intelligence section.
 * Shows avg prices, budget distribution, seasonal pricing,
 * and booking recommendations. Key competitive differentiator.
 */
export default function PriceIntelligence({ hotels, cityName, citySlug }: PriceIntelligenceProps) {
  if (hotels.length < 3) return null;

  const prices = hotels.map((h) => h.priceFrom);
  const avgPrice = Math.round(prices.reduce((s, p) => s + p, 0) / prices.length);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const currency = hotels[0]?.currency || "USD";

  // Price distribution buckets
  const buckets = [
    { label: `Under ${currency} 200`, range: [0, 200], count: 0, color: "bg-green-500" },
    { label: `${currency} 200–500`, range: [200, 500], count: 0, color: "bg-blue-500" },
    { label: `${currency} 500–1000`, range: [500, 1000], count: 0, color: "bg-purple-500" },
    { label: `${currency} 1000+`, range: [1000, Infinity], count: 0, color: "bg-gold-500" },
  ];

  prices.forEach((p) => {
    const bucket = buckets.find((b) => p >= b.range[0] && p < b.range[1]);
    if (bucket) bucket.count++;
  });

  const maxBucketCount = Math.max(...buckets.map((b) => b.count));

  // Seasonal pricing insight
  const season = getSeasonalContext();
  const isTrending = season.priorityCities.includes(citySlug);

  // Value rating
  const luxuryHotels = hotels.filter((h) => h.type === "luxury");
  const budgetHotels = hotels.filter((h) => h.type === "budget");
  const avgLuxuryPrice = luxuryHotels.length > 0
    ? Math.round(luxuryHotels.reduce((s, h) => s + h.priceFrom, 0) / luxuryHotels.length)
    : 0;
  const avgBudgetPrice = budgetHotels.length > 0
    ? Math.round(budgetHotels.reduce((s, h) => s + h.priceFrom, 0) / budgetHotels.length)
    : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-navy-950 px-5 py-3 flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-gold-400" />
        <span className="text-white text-xs font-black uppercase tracking-wider">
          {cityName} Price Intelligence
        </span>
      </div>

      <div className="p-5 space-y-6">
        {/* Key Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Budget</div>
            <div className="text-navy-900 font-black text-lg">{currency} {minPrice}</div>
            <div className="text-[10px] text-gray-400">per night</div>
          </div>
          <div className="text-center border-x border-gray-100">
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Average</div>
            <div className="text-navy-900 font-black text-lg">{currency} {avgPrice}</div>
            <div className="text-[10px] text-gray-400">per night</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Luxury</div>
            <div className="text-navy-900 font-black text-lg">{currency} {maxPrice}</div>
            <div className="text-[10px] text-gray-400">per night</div>
          </div>
        </div>

        {/* Price Distribution */}
        <div>
          <h3 className="text-xs font-black text-navy-900 uppercase tracking-wider mb-3">Price Distribution</h3>
          <div className="space-y-2">
            {buckets.filter((b) => b.count > 0).map((bucket) => (
              <div key={bucket.label} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 font-semibold w-28 shrink-0">{bucket.label}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full ${bucket.color} rounded-full transition-all flex items-center justify-end pr-1.5`}
                    style={{ width: `${(bucket.count / maxBucketCount) * 100}%` }}
                  >
                    <span className="text-white text-[9px] font-black">{bucket.count}</span>
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 w-10 text-right">
                  {Math.round((bucket.count / hotels.length) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Seasonal Insight */}
        <div className={`rounded-xl p-4 ${isTrending ? "bg-orange-50 border border-orange-100" : "bg-green-50 border border-green-100"}`}>
          <div className="flex items-start gap-3">
            {isTrending ? (
              <TrendingUp className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
            ) : (
              <TrendingDown className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className={`text-sm font-bold ${isTrending ? "text-orange-800" : "text-green-800"}`}>
                {isTrending ? `${season.label} — High Demand Period` : "Standard Season — Good Value"}
              </div>
              <p className={`text-xs mt-1 ${isTrending ? "text-orange-600" : "text-green-600"}`}>
                {isTrending
                  ? `Prices in ${cityName} are 20-40% higher than average during ${season.label}. Book early for the best rates.`
                  : `Current prices in ${cityName} are at or below average. Good time to book for value.`
                }
              </p>
            </div>
          </div>
        </div>

        {/* Booking Tips */}
        <div>
          <h3 className="text-xs font-black text-navy-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-gold-500" /> Smart Booking Tips
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <DollarSign className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <span>Book 30-45 days in advance for best rates in {cityName}.</span>
            </div>
            {avgBudgetPrice > 0 && avgLuxuryPrice > 0 && (
              <div className="flex items-start gap-2">
                <DollarSign className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                <span>Budget hotels average {currency} {avgBudgetPrice}/night vs {currency} {avgLuxuryPrice}/night for luxury — {Math.round((avgLuxuryPrice / avgBudgetPrice - 1) * 100)}% premium.</span>
              </div>
            )}
            <div className="flex items-start gap-2">
              <DollarSign className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <span>Compare prices across Booking.com, Agoda, and Expedia — rate differences of 5-15% are common.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-4 py-2 text-center">
        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
          Analysis by Best Hotel Deals Daily · {hotels.length} hotels compared
        </span>
      </div>
    </div>
  );
}
