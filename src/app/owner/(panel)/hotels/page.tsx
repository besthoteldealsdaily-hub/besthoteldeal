import { createServerClient } from "@/lib/supabase";
import { requireSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Building2, Plus, MapPin } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "My Hotels — Owner" };
export const dynamic  = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-amber-50  text-amber-700  border-amber-100",
  reviewing: "bg-purple-50 text-purple-700 border-purple-100",
  approved:  "bg-blue-50   text-blue-700   border-blue-100",
  live:      "bg-emerald-50 text-emerald-700 border-emerald-100",
  rejected:  "bg-red-50    text-red-600    border-red-100",
};

const TYPE_COLORS: Record<string, string> = {
  direct:    "bg-navy-50   text-navy-700  border-navy-100",
  affiliate: "bg-gold-50   text-gold-700  border-gold-200",
  lead:      "bg-purple-50 text-purple-700 border-purple-100",
};

export default async function OwnerHotelsPage() {
  const session = await requireSession(["hotel_owner", "admin"]);
  if (!session) redirect("/owner/login/");

  const db = createServerClient();

  const { data: hotels } = await db
    .from("hotels")
    .select("id, name, slug, city, country, listing_type, hotel_type, stars, status, price_per_night_from, currency, created_at")
    .eq("owner_id", session.id)
    .order("created_at", { ascending: false });

  const statusCounts = (hotels ?? []).reduce<Record<string, number>>((acc, h) => {
    acc[h.status] = (acc[h.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-black text-navy-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gold-500" />
            My Hotels
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage your hotel listings.</p>
        </div>
        <Link
          href="/owner/hotels/new/"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black text-navy-950 transition-all hover:scale-[1.02]"
          style={{ background: "linear-gradient(135deg, #d4a017, #efd466)" }}
        >
          <Plus className="w-3.5 h-3.5" /> Add Hotel
        </Link>
      </div>

      {/* Status summary */}
      {(hotels ?? []).length > 0 && (
        <div className="flex gap-3 mb-4 flex-wrap">
          {Object.entries(statusCounts).map(([s, c]) => (
            <div key={s} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${STATUS_COLORS[s] ?? "bg-gray-50 text-gray-600 border-gray-100"}`}>
              <span className="capitalize">{s}</span>
              <span className="font-black">{c}</span>
            </div>
          ))}
        </div>
      )}

      {(hotels ?? []).length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <Building2 className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <h3 className="text-sm font-black text-navy-900 mb-1">No hotels yet</h3>
          <p className="text-xs text-gray-500 mb-4">Add your first hotel listing to get started.</p>
          <Link
            href="/owner/hotels/new/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-navy-950"
            style={{ background: "linear-gradient(135deg, #d4a017, #efd466)" }}
          >
            <Plus className="w-3.5 h-3.5" /> Add Hotel
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {(hotels ?? []).map((h) => (
            <div key={h.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4 hover:border-gray-300 transition-colors">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-black text-navy-900">{h.name}</span>
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${STATUS_COLORS[h.status] ?? "bg-gray-50 text-gray-600 border-gray-100"}`}>
                    {h.status}
                  </span>
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${TYPE_COLORS[h.listing_type] ?? "bg-gray-50 text-gray-600 border-gray-100"}`}>
                    {h.listing_type}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {h.city}{h.country ? `, ${h.country}` : ""}
                  </span>
                  {h.hotel_type && <span className="capitalize">{h.hotel_type.replace("_", " ")}</span>}
                  {h.stars && <span>{"★".repeat(h.stars)}</span>}
                  {h.price_per_night_from && (
                    <span className="font-semibold text-navy-700">{h.currency ?? "USD"} {h.price_per_night_from}/night</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/owner/hotels/${h.slug}/`}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-black border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-navy-900 transition-colors"
                >
                  Edit
                </Link>
                <Link
                  href={`/owner/hotels/${h.slug}/rooms/`}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-black bg-navy-900 text-white hover:bg-navy-800 transition-colors"
                >
                  Rooms
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
