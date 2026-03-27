"use client";

import { useState, useCallback } from "react";
import { Hotel } from "@/lib/types";
import HotelCard from "@/components/HotelCard";
import { SlidersHorizontal, X } from "lucide-react";

interface Filters {
  type:      string;
  minPrice:  string;
  maxPrice:  string;
  nearHaram: boolean;
  minStars:  number;
  listing:   string;
}

const EMPTY: Filters = { type: "", minPrice: "", maxPrice: "", nearHaram: false, minStars: 0, listing: "" };

const TYPES   = ["luxury", "budget", "boutique", "business", "resort"] as const;
const STARS   = [3, 4, 5] as const;

function apply(hotels: Hotel[], f: Filters): Hotel[] {
  return hotels.filter((h) => {
    if (f.type      && h.type !== f.type)                        return false;
    if (f.minPrice  && h.priceFrom < Number(f.minPrice))         return false;
    if (f.maxPrice  && h.priceFrom > Number(f.maxPrice))         return false;
    if (f.nearHaram && !h.nearHaram)                             return false;
    if (f.minStars  && h.stars < f.minStars)                     return false;
    if (f.listing   && h.listingType !== f.listing)              return false;
    return true;
  });
}

const selectCls =
  "border border-gray-200 rounded-xl px-3 py-2 text-xs text-navy-900 font-semibold focus:outline-none focus:ring-2 focus:ring-gold-400 bg-white";

interface Props {
  hotels:      Hotel[];
  title?:      string;
  emptyLabel?: string;
}

export default function HotelFilters({ hotels, title = "Hotels", emptyLabel = "No hotels match your filters." }: Props) {
  const [filters,    setFilters]    = useState<Filters>(EMPTY);
  const [panelOpen,  setPanelOpen]  = useState(false);

  const set = useCallback(<K extends keyof Filters>(k: K, v: Filters[K]) =>
    setFilters((f) => ({ ...f, [k]: v })), []);

  const reset = useCallback(() => setFilters(EMPTY), []);

  const results   = apply(hotels, filters);
  const activeCount = Object.entries(filters).filter(([, v]) => v !== "" && v !== false && v !== 0).length;

  return (
    <div>
      {/* Filter bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-3 mb-5 flex items-center gap-2 flex-wrap">
        {/* Type */}
        <select
          value={filters.type}
          onChange={(e) => set("type", e.target.value)}
          className={selectCls}
          aria-label="Hotel type"
        >
          <option value="">All Types</option>
          {TYPES.map((t) => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>

        {/* Stars */}
        <select
          value={filters.minStars}
          onChange={(e) => set("minStars", Number(e.target.value))}
          className={selectCls}
          aria-label="Minimum stars"
        >
          <option value={0}>Any Stars</option>
          {STARS.map((s) => <option key={s} value={s}>{s}★+</option>)}
        </select>

        {/* Price range */}
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            min="0"
            value={filters.minPrice}
            onChange={(e) => set("minPrice", e.target.value)}
            placeholder="Min $"
            className={`${selectCls} w-20`}
            aria-label="Minimum price"
          />
          <span className="text-gray-400 text-xs">–</span>
          <input
            type="number"
            min="0"
            value={filters.maxPrice}
            onChange={(e) => set("maxPrice", e.target.value)}
            placeholder="Max $"
            className={`${selectCls} w-20`}
            aria-label="Maximum price"
          />
        </div>

        {/* Listing type */}
        <select
          value={filters.listing}
          onChange={(e) => set("listing", e.target.value)}
          className={selectCls}
          aria-label="Listing type"
        >
          <option value="">All Listings</option>
          <option value="direct">Direct Booking</option>
          <option value="affiliate">Affiliate</option>
          <option value="lead">Inquiry</option>
        </select>

        {/* Near Haram */}
        <label className="flex items-center gap-1.5 cursor-pointer bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-navy-700 hover:border-gold-300 transition-colors select-none">
          <input
            type="checkbox"
            checked={filters.nearHaram}
            onChange={(e) => set("nearHaram", e.target.checked)}
            className="w-3.5 h-3.5 rounded border-gray-300 text-gold-500 focus:ring-gold-400"
          />
          Near Haram
        </label>

        {/* Reset */}
        {activeCount > 0 && (
          <button
            onClick={reset}
            className="flex items-center gap-1 text-xs text-red-500 font-bold hover:text-red-600 px-2 py-2 transition-colors ml-auto"
          >
            <X className="w-3.5 h-3.5" /> Reset ({activeCount})
          </button>
        )}

        {/* Count */}
        <div className="ml-auto text-[10px] text-gray-400 font-semibold shrink-0">
          {results.length} of {hotels.length} {title.toLowerCase()}
        </div>
      </div>

      {/* Grid */}
      {results.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <SlidersHorizontal className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-bold text-navy-900 mb-1">No results</p>
          <p className="text-xs text-gray-400 mb-4">{emptyLabel}</p>
          <button onClick={reset} className="text-xs text-gold-600 font-bold hover:underline">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {results.map((h) => (
            <HotelCard key={h.slug} hotel={h} />
          ))}
        </div>
      )}
    </div>
  );
}
