"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Building2, Tag, Loader2, X } from "lucide-react";

interface Result {
  hotels: { id: string; name: string; slug: string; city: string; priceFrom: number; currency: string; stars: number; listingType: string; image: string }[];
  cities: { name: string; slug: string; country: string; hotelCount: number }[];
  deals:  { slug: string; hotelName: string; city: string; discount: number; discountedPrice: number; currency: string }[];
}

interface Props {
  variant?: "hero" | "compact";
  placeholder?: string;
  className?: string;
}

export default function SmartSearch({
  variant      = "hero",
  placeholder  = "Search hotels, cities, or landmarks…",
  className    = "",
}: Props) {
  const router          = useRouter();
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [open,    setOpen]    = useState(false);
  const wrapRef             = useRef<HTMLDivElement>(null);
  const inputRef            = useRef<HTMLInputElement>(null);
  const debounceRef         = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close on outside click
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults(null); setOpen(false); return; }
    setLoading(true);
    try {
      const res  = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data);
      setOpen(true);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  function handleChange(val: string) {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 260);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOpen(false);
    if (!query.trim()) return;
    router.push(`/deals/?q=${encodeURIComponent(query.trim())}`);
  }

  function goCity(slug: string)  { setOpen(false); router.push(`/city/${slug}/`); }
  function goHotel(slug: string) { setOpen(false); router.push(`/hotels/${slug}/`); }
  function goDeal(slug: string)  { setOpen(false); router.push(`/deals/${slug}/`); }

  const hasResults = results && (
    results.cities.length > 0 || results.hotels.length > 0 || results.deals.length > 0
  );

  const inputCls =
    variant === "hero"
      ? "flex-1 bg-transparent text-navy-900 placeholder:text-gray-400 text-sm font-medium focus:outline-none min-w-0 py-1"
      : "flex-1 bg-transparent text-navy-900 placeholder:text-gray-400 text-xs focus:outline-none min-w-0";

  const wrapperCls =
    variant === "hero"
      ? `bg-white rounded-2xl shadow-2xl border border-gray-100 flex items-center gap-2 px-4 py-3 ${className}`
      : `bg-white rounded-xl border border-gray-200 flex items-center gap-2 px-3 py-2 ${className}`;

  return (
    <div ref={wrapRef} className="relative w-full">
      <form onSubmit={handleSubmit} className={wrapperCls} role="search">
        {loading
          ? <Loader2 className="w-4 h-4 text-gray-400 animate-spin shrink-0" />
          : <Search className="w-4 h-4 text-gray-400 shrink-0" />
        }
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => { if (results && hasResults) setOpen(true); }}
          placeholder={placeholder}
          autoComplete="off"
          aria-label="Search hotels"
          className={inputCls}
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(""); setResults(null); setOpen(false); inputRef.current?.focus(); }}
            className="text-gray-300 hover:text-gray-500 transition-colors shrink-0"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          type="submit"
          className={
            variant === "hero"
              ? "bg-navy-900 text-white text-xs font-black px-5 py-2 rounded-xl hover:bg-navy-800 transition-colors whitespace-nowrap shrink-0"
              : "bg-navy-900 text-white text-[10px] font-black px-3 py-1.5 rounded-lg hover:bg-navy-800 transition-colors shrink-0"
          }
        >
          Search
        </button>
      </form>

      {/* Dropdown */}
      {open && hasResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden max-h-[420px] overflow-y-auto">

          {/* Cities */}
          {results!.cities.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-gray-50 flex items-center gap-1.5 border-b border-gray-100">
                <MapPin className="w-3 h-3 text-gold-500" />
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Cities</span>
              </div>
              {results!.cities.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => goCity(c.slug)}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-navy-50 rounded-lg flex items-center justify-center shrink-0">
                      <MapPin className="w-3.5 h-3.5 text-navy-600" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-navy-900">{c.name}</div>
                      <div className="text-[10px] text-gray-400">{c.country}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 font-semibold">{c.hotelCount} hotels</span>
                </button>
              ))}
            </div>
          )}

          {/* Hotels */}
          {results!.hotels.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-gray-50 flex items-center gap-1.5 border-y border-gray-100">
                <Building2 className="w-3 h-3 text-gold-500" />
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Hotels</span>
              </div>
              {results!.hotels.map((h) => (
                <button
                  key={h.slug}
                  onClick={() => goHotel(h.slug)}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors text-left gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-10 h-8 rounded-lg bg-gray-100 bg-cover bg-center shrink-0 overflow-hidden"
                      style={{ backgroundImage: `url(${h.image})` }}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-navy-900 truncate">{h.name}</div>
                      <div className="text-[10px] text-gray-400 capitalize">{h.city} · {"★".repeat(Math.min(h.stars, 5))}</div>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-xs font-black text-navy-900">{h.currency} {h.priceFrom.toLocaleString()}</div>
                    {h.listingType === "direct" && (
                      <span className="text-[9px] bg-navy-50 text-navy-700 font-bold px-1.5 py-0.5 rounded">Direct</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Deals */}
          {results!.deals.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-gray-50 flex items-center gap-1.5 border-y border-gray-100">
                <Tag className="w-3 h-3 text-gold-500" />
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Deals</span>
              </div>
              {results!.deals.map((d) => (
                <button
                  key={d.slug}
                  onClick={() => goDeal(d.slug)}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                >
                  <div>
                    <div className="text-xs font-bold text-navy-900">{d.hotelName}</div>
                    <div className="text-[10px] text-gray-400 capitalize">{d.city}</div>
                  </div>
                  <span className="text-[10px] font-black bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-100">
                    -{d.discount}% OFF
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {!hasResults && query.length >= 2 && !loading && (
            <div className="px-4 py-6 text-center">
              <p className="text-xs text-gray-400">No results for "<strong>{query}</strong>"</p>
              <button
                onClick={() => router.push(`/deals/?q=${encodeURIComponent(query)}`)}
                className="text-xs text-gold-600 font-bold mt-1 hover:underline"
              >
                Search all deals →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
