import type { Metadata } from "next";
import { hotels, cities } from "@/lib/data";
import HotelFilters from "@/components/HotelFilters";
import Breadcrumb from "@/components/Breadcrumb";
import SmartSearch from "@/components/SmartSearch";
import { Building2 } from "lucide-react";

export const metadata: Metadata = {
  title:       "All Hotels in Middle East – Browse & Filter | Best Hotel Deals Daily",
  description: `Browse ${hotels.length}+ verified hotels across Dubai, Makkah, Doha, Riyadh, Muscat & more. Filter by price, type, stars, and listing type.`,
  alternates:  { canonical: "https://besthoteldealsdaily.com/hotels/" },
};

const cityLinks = cities.slice(0, 8).map((c) => ({ name: c.name, slug: c.slug }));

export default function HotelsPage() {
  return (
    <div className="pt-24 pb-20 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <Breadcrumb crumbs={[{ label: "Home", href: "/" }, { label: "All Hotels" }]} />

        {/* Header */}
        <div className="flex items-start justify-between mb-6 mt-4 flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-black text-navy-900 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-gold-500" />
              All Hotels
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {hotels.length}+ verified hotels across the Middle East
            </p>
          </div>

          {/* City quick links */}
          <div className="flex flex-wrap gap-2">
            {cityLinks.map((c) => (
              <a
                key={c.slug}
                href={`/city/${c.slug}/`}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:border-gold-300 hover:text-gold-600 transition-colors"
              >
                {c.name}
              </a>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="mb-5 max-w-xl">
          <SmartSearch variant="compact" placeholder="Search by hotel name or city…" />
        </div>

        {/* Filterable grid */}
        <HotelFilters hotels={hotels} title="Hotels" />
      </div>
    </div>
  );
}
