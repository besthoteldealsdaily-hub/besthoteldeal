import { createServerClient } from "@/lib/supabase";
import { Building2, Search, MapPin, Star } from "lucide-react";
import { HotelActions } from "./HotelActions";

export const metadata = { title: "DB Hotels — Admin" };
export const dynamic  = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-amber-50  text-amber-700  border-amber-100",
  reviewing: "bg-blue-50   text-blue-700   border-blue-100",
  live:      "bg-emerald-50 text-emerald-700 border-emerald-100",
  approved:  "bg-emerald-50 text-emerald-700 border-emerald-100",
  rejected:  "bg-red-50    text-red-600    border-red-100",
};

const TYPE_COLORS: Record<string, string> = {
  affiliate: "bg-purple-50 text-purple-700 border-purple-100",
  direct:    "bg-gold-50   text-gold-700   border-gold-200",
  lead:      "bg-navy-50   text-navy-700   border-navy-100",
};

function Badge({ label, colorMap }: { label: string; colorMap: Record<string, string> }) {
  const cls = colorMap[label] ?? "bg-gray-50 text-gray-600 border-gray-100";
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${cls}`}>
      {label}
    </span>
  );
}

export default async function AdminHotelsDBPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp     = await searchParams;
  const status = sp.status ?? "";
  const search = sp.search ?? "";

  const db = createServerClient();

  let query = db
    .from("hotels")
    .select(`
      id, slug, name, city, country, stars, listing_type, status, hotel_type,
      cover_image, price_from, currency, verified, allow_inquiry,
      created_at, owner_id,
      users!owner_id ( full_name, email )
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  if (status) query = query.eq("status", status);
  if (search) query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%`);

  const { data: hotels } = await query;

  // Status count badges
  const { data: counts } = await db
    .from("hotels")
    .select("status");

  const countMap = (counts ?? []).reduce<Record<string, number>>((acc, h) => {
    acc[h.status] = (acc[h.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-black text-navy-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gold-500" />
            Hotel Listings
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">DB-managed hotels submitted through the partner workflow.</p>
        </div>
        <div className="flex gap-2">
          {[["all", "All", countMap], ["pending", "Pending", countMap], ["live", "Live", countMap], ["rejected", "Rejected", countMap]].map(
            ([val, label]) => {
              const v = val as string;
              const l = label as string;
              const cnt = v === "all" ? (counts?.length ?? 0) : (countMap[v] ?? 0);
              const active = (v === "all" && !status) || status === v;
              return (
                <a
                  key={v}
                  href={v === "all" ? "/admin/hotels-db/" : `/admin/hotels-db/?status=${v}`}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-black transition-colors ${
                    active
                      ? "bg-navy-900 text-white"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {l}
                  <span className={`ml-0.5 px-1 rounded text-[10px] ${active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                    {cnt}
                  </span>
                </a>
              );
            },
          )}
        </div>
      </div>

      {/* Search bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 mb-4 flex items-center gap-2">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <form className="flex-1 flex gap-2" method="GET">
          {status && <input type="hidden" name="status" value={status} />}
          <input
            name="search"
            defaultValue={search}
            placeholder="Search by name or city…"
            className="flex-1 text-xs text-navy-900 placeholder:text-gray-400 focus:outline-none"
          />
          <button type="submit" className="btn-navy text-[10px] px-2 py-1">Search</button>
          {search && (
            <a href={status ? `/admin/hotels-db/?status=${status}` : "/admin/hotels-db/"} className="text-xs text-gray-400 hover:text-gray-600 self-center">Clear</a>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 text-gray-500 font-semibold">Hotel</th>
                <th className="text-left px-4 py-3 text-gray-500 font-semibold">Owner</th>
                <th className="text-left px-4 py-3 text-gray-500 font-semibold">Type</th>
                <th className="text-left px-4 py-3 text-gray-500 font-semibold">Listing</th>
                <th className="text-left px-4 py-3 text-gray-500 font-semibold">Price</th>
                <th className="text-left px-4 py-3 text-gray-500 font-semibold">Status</th>
                <th className="text-left px-4 py-3 text-gray-500 font-semibold">Submitted</th>
                <th className="text-left px-4 py-3 text-gray-500 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(hotels ?? []).length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    No hotels found{search ? ` for "${search}"` : ""}.
                  </td>
                </tr>
              )}
              {(hotels ?? []).map((hotel) => {
                const owner = Array.isArray(hotel.users) ? hotel.users[0] : hotel.users;
                return (
                  <tr key={hotel.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {hotel.cover_image ? (
                          <img src={hotel.cover_image} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0 bg-gray-100" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-navy-50 flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4 text-navy-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-navy-900">{hotel.name}</div>
                          <div className="flex items-center gap-1 text-gray-400 mt-0.5">
                            <MapPin className="w-2.5 h-2.5" />
                            {hotel.city}, {hotel.country}
                            {hotel.stars && (
                              <span className="flex items-center gap-0.5 ml-1">
                                <Star className="w-2.5 h-2.5 text-gold-500 fill-gold-500" />
                                {hotel.stars}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-navy-900">{owner?.full_name ?? "—"}</div>
                      <div className="text-gray-400">{owner?.email ?? ""}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="capitalize text-gray-600">{hotel.hotel_type ?? "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge label={hotel.listing_type} colorMap={TYPE_COLORS} />
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-medium">
                      {hotel.price_from ? `${hotel.currency ?? "USD"} ${hotel.price_from}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge label={hotel.status} colorMap={STATUS_COLORS} />
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(hotel.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <HotelActions hotelId={hotel.id} hotelName={hotel.name} status={hotel.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">{hotels?.length ?? 0} hotel{hotels?.length !== 1 ? "s" : ""}</span>
          <a href={`/api/admin/hotels?limit=100${status ? `&status=${status}` : ""}`} target="_blank" className="text-xs text-gray-400 hover:text-gray-600">JSON ↗</a>
        </div>
      </div>
    </div>
  );
}
