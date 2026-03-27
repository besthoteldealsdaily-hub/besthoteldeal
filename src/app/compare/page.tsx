import type { Metadata } from "next";
import { getHotelBySlug } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, CheckCircle, X, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Compare Hotels | Best Hotel Deals Daily",
  robots: { index: false },
};

type Props = { searchParams: Promise<Record<string, string | string[]>> };

function row(label: string, cells: React.ReactNode[], highlight = false) {
  return (
    <tr className={highlight ? "bg-gold-50/60" : "hover:bg-gray-50/60"}>
      <td className="px-4 py-3 text-xs font-bold text-gray-500 whitespace-nowrap border-r border-gray-100 w-32">{label}</td>
      {cells.map((c, i) => (
        <td key={i} className="px-4 py-3 text-xs text-navy-900 border-r border-gray-100 last:border-r-0">{c}</td>
      ))}
    </tr>
  );
}

export default async function ComparePage({ searchParams }: Props) {
  const sp = await searchParams;

  // Collect all `h` params (can be repeated or comma-joined)
  const raw = sp.h ?? [];
  const slugs = (Array.isArray(raw) ? raw : [raw])
    .flatMap((s) => s.split(","))
    .filter(Boolean)
    .slice(0, 3);

  if (slugs.length < 2) {
    return (
      <div className="pt-24 pb-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-sm">
          <div className="text-4xl mb-4">⚖️</div>
          <h1 className="text-sm font-black text-navy-900 mb-2">Not enough hotels to compare</h1>
          <p className="text-xs text-gray-400 mb-5">Select at least 2 hotels using the Compare button on any hotel page.</p>
          <Link href="/hotels/" className="btn-navy text-xs">Browse Hotels</Link>
        </div>
      </div>
    );
  }

  const hotelList = slugs.map((s) => getHotelBySlug(s)).filter(Boolean);

  if (hotelList.length < 2) notFound();

  const cols = hotelList.length;

  return (
    <div className="pt-24 pb-20 min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Link href="/hotels/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">← Back to Hotels</Link>
          </div>
          <h1 className="text-xl font-black text-navy-900">Hotel Comparison</h1>
          <p className="text-xs text-gray-500 mt-0.5">Comparing {cols} hotels side by side</p>
        </div>

        {/* Hero cards */}
        <div className={`grid gap-4 mb-6 grid-cols-${cols}`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {hotelList.map((h) => {
            const isDirect = h!.listingType === "direct" && h!.status === "live";
            return (
              <div key={h!.slug} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="relative h-36">
                  <Image src={h!.image} alt={h!.name} fill className="object-cover" sizes="33vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 to-transparent" />
                  <div className="absolute bottom-2 left-3 right-3">
                    <div className="text-white text-xs font-black leading-tight truncate">{h!.name}</div>
                    <div className="text-white/60 text-[9px] capitalize">{h!.city}</div>
                  </div>
                </div>
                <div className="p-3">
                  <Link
                    href={isDirect ? `/book/${h!.slug}/` : `/hotels/${h!.slug}/`}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black text-navy-950 transition-all hover:scale-[1.02]"
                    style={{ background: "linear-gradient(135deg,#d4a017,#efd466)" }}
                  >
                    {isDirect ? "Book Now" : "Check Price"} <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-3 text-left text-xs font-black text-gray-400 uppercase tracking-wider border-r border-gray-100 w-32">
                    Feature
                  </th>
                  {hotelList.map((h) => (
                    <th key={h!.slug} className="px-4 py-3 text-left text-xs font-black text-navy-900 border-r border-gray-100 last:border-r-0">
                      {h!.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {row("City", hotelList.map((h) => <span key={h!.slug} className="capitalize">{h!.city}</span>))}
                {row("Country", hotelList.map((h) => <span key={h!.slug} className="uppercase">{h!.country}</span>))}
                {row("Stars", hotelList.map((h) => (
                  <span key={h!.slug} className="flex items-center gap-0.5">
                    {Array.from({ length: Math.min(h!.stars, 5) }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-gold-400 fill-current" />
                    ))}
                  </span>
                )))}
                {row("Rating", hotelList.map((h) => (
                  <span key={h!.slug} className="flex items-center gap-1.5">
                    <span className="bg-navy-900 text-white text-[9px] font-black px-1.5 py-0.5 rounded">{h!.rating.toFixed(1)}</span>
                    <span className="text-[10px] text-gray-400">{h!.reviewCount.toLocaleString()} reviews</span>
                  </span>
                )), true)}
                {row("Type", hotelList.map((h) => <span key={h!.slug} className="capitalize font-semibold">{h!.type}</span>))}
                {row("Price from", hotelList.map((h) => (
                  <span key={h!.slug} className="font-black text-sm text-navy-900">{h!.currency} {h!.priceFrom.toLocaleString()}<span className="text-[10px] text-gray-400 font-normal">/night</span></span>
                )), true)}
                {row("Listing", hotelList.map((h) => (
                  <span key={h!.slug} className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${h!.listingType === "direct" ? "bg-navy-50 text-navy-700 border-navy-100" : "bg-gold-50 text-gold-700 border-gold-200"}`}>
                    {h!.listingType}
                  </span>
                )))}
                {row("Near Haram", hotelList.map((h) => (
                  h!.nearHaram
                    ? <CheckCircle key={h!.slug} className="w-4 h-4 text-emerald-500" />
                    : <X key={h!.slug} className="w-4 h-4 text-gray-300" />
                )))}
                {row("Verified", hotelList.map((h) => (
                  h!.verified
                    ? <CheckCircle key={h!.slug} className="w-4 h-4 text-emerald-500" />
                    : <X key={h!.slug} className="w-4 h-4 text-gray-300" />
                )))}
                {row("Distance", hotelList.map((h) => (
                  <span key={h!.slug} className="text-gray-500">{h!.distanceFromCenter ?? "—"}</span>
                )))}
                {row("Amenities", hotelList.map((h) => (
                  <span key={h!.slug} className="text-[10px] text-gray-500 leading-relaxed">{h!.amenities.slice(0, 4).join(", ")}</span>
                )), true)}
                {/* Best choice row */}
                <tr className="bg-navy-50/60 border-t-2 border-navy-100">
                  <td className="px-4 py-3 text-xs font-black text-navy-900 border-r border-gray-100">Best Choice?</td>
                  {hotelList.map((h) => {
                    const isDirect   = h!.listingType === "direct" && h!.status === "live";
                    const isTopRated = Math.max(...hotelList.map((x) => x!.rating)) === h!.rating;
                    const isCheapest = Math.min(...hotelList.map((x) => x!.priceFrom)) === h!.priceFrom;
                    return (
                      <td key={h!.slug} className="px-4 py-3 border-r border-gray-100 last:border-r-0">
                        <div className="flex flex-col gap-1">
                          {isDirect   && <span className="badge-navy text-[9px]">Direct Booking</span>}
                          {isTopRated && <span className="badge-gold text-[9px]">Top Rated</span>}
                          {isCheapest && <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px]">Best Price</span>}
                        </div>
                      </td>
                    );
                  })}
                </tr>
                {/* CTA row */}
                <tr className="bg-gray-50/60">
                  <td className="px-4 py-4 border-r border-gray-100"></td>
                  {hotelList.map((h) => {
                    const isDirect = h!.listingType === "direct" && h!.status === "live";
                    return (
                      <td key={h!.slug} className="px-4 py-4 border-r border-gray-100 last:border-r-0">
                        <Link
                          href={isDirect ? `/book/${h!.slug}/` : `/hotels/${h!.slug}/`}
                          className="w-full flex items-center justify-center gap-1 py-2.5 rounded-xl text-xs font-black text-navy-950 transition-all hover:scale-[1.02]"
                          style={{ background: "linear-gradient(135deg,#d4a017,#efd466)" }}
                        >
                          {isDirect ? "Book Now" : "Check Price"} →
                        </Link>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Back */}
        <div className="mt-6 text-center">
          <Link href="/hotels/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            ← Explore more hotels
          </Link>
        </div>
      </div>
    </div>
  );
}
