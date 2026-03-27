import { createServerClient } from "@/lib/supabase";
import { requireSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Calendar, Search } from "lucide-react";
import { OwnerBookingActions } from "./OwnerBookingActions";

export const metadata = { title: "Bookings — Owner" };
export const dynamic  = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-amber-50  text-amber-700  border-amber-100",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-100",
  completed: "bg-blue-50   text-blue-700   border-blue-100",
  cancelled: "bg-red-50    text-red-600    border-red-100",
  refunded:  "bg-gray-50   text-gray-600   border-gray-200",
};

export default async function OwnerBookingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const session = await requireSession(["hotel_owner", "admin"]);
  if (!session) redirect("/owner/login/");

  const sp     = await searchParams;
  const status = sp.status ?? "";
  const search = sp.search ?? "";

  const db = createServerClient();

  // Get owner's hotel IDs
  const { data: hotels } = await db
    .from("hotels")
    .select("id")
    .eq("owner_id", session.id);

  const hotelIds = (hotels ?? []).map((h) => h.id);

  let bookings: unknown[] = [];
  let allBookings: { status: string; total_amount: number }[] = [];

  if (hotelIds.length > 0) {
    let query = db
      .from("bookings")
      .select(`
        id, booking_ref, guest_name, guest_email, guest_phone,
        check_in, check_out, guests_count,
        price_per_night, total_amount, currency,
        status, payment_status, created_at,
        hotels ( name ), rooms ( name, room_type )
      `)
      .in("hotel_id", hotelIds)
      .order("created_at", { ascending: false })
      .limit(100);

    if (status) query = query.eq("status", status);
    if (search) query = query.or(`guest_name.ilike.%${search}%,guest_email.ilike.%${search}%,booking_ref.ilike.%${search}%`);

    const { data } = await query;
    bookings = data ?? [];

    const { data: all } = await db
      .from("bookings")
      .select("status, total_amount")
      .in("hotel_id", hotelIds);
    allBookings = (all ?? []) as { status: string; total_amount: number }[];
  }

  const countMap = allBookings.reduce<Record<string, number>>((acc, b) => {
    acc[b.status] = (acc[b.status] ?? 0) + 1;
    return acc;
  }, {});

  const confirmedRevenue = allBookings
    .filter((b) => b.status === "confirmed" || b.status === "completed")
    .reduce((s, b) => s + (b.total_amount ?? 0), 0);

  const statuses = ["pending", "confirmed", "completed", "cancelled"];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-black text-navy-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gold-500" />
            Bookings
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Incoming booking requests for your hotels.</p>
        </div>
        {confirmedRevenue > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-2.5">
            <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Confirmed Revenue</div>
            <div className="text-sm font-black text-navy-900">USD {Math.round(confirmedRevenue).toLocaleString()}</div>
          </div>
        )}
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[["", "All", allBookings.length], ...statuses.map((s) => [s, s, countMap[s] ?? 0])].map(([val, label, cnt]) => {
          const active = val === "" ? !status : status === val;
          return (
            <a
              key={String(val)}
              href={val ? `/owner/bookings/?status=${val}` : "/owner/bookings/"}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-black transition-colors ${
                active ? "bg-navy-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              <span className="capitalize">{label || "All"}</span>
              <span className={`ml-0.5 px-1 rounded text-[10px] ${active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>{cnt}</span>
            </a>
          );
        })}
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 mb-4 flex items-center gap-2">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <form className="flex-1 flex gap-2" method="GET">
          {status && <input type="hidden" name="status" value={status} />}
          <input
            name="search"
            defaultValue={search}
            placeholder="Search by guest name, email, or booking ref…"
            className="flex-1 text-xs text-navy-900 placeholder:text-gray-400 focus:outline-none"
          />
          <button type="submit" className="btn-navy text-[10px] px-2 py-1">Search</button>
        </form>
      </div>

      {hotelIds.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <Calendar className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">Add a hotel first to receive bookings.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {["Ref", "Guest", "Hotel / Room", "Dates", "Total", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-gray-500 font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(bookings as Parameters<typeof OwnerBookingActions>[0]["booking"][]).length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">No bookings found.</td></tr>
                )}
                {(bookings as Parameters<typeof OwnerBookingActions>[0]["booking"][]).map((b) => {
                  const hotel  = Array.isArray(b.hotels) ? b.hotels[0] : b.hotels;
                  const room   = Array.isArray(b.rooms)  ? b.rooms[0]  : b.rooms;
                  const nights = Math.round(
                    (new Date(b.check_out).getTime() - new Date(b.check_in).getTime()) / 86400000,
                  );
                  return (
                    <tr key={b.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-navy-700 whitespace-nowrap">{b.booking_ref}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-navy-900">{b.guest_name}</div>
                        <div className="text-gray-400">{b.guest_email}</div>
                        {b.guest_phone && <div className="text-gray-400">{b.guest_phone}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-navy-900">{hotel?.name ?? "—"}</div>
                        <div className="text-gray-400 capitalize">{room?.room_type ?? ""} {room?.name ? `· ${room.name}` : ""}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-navy-700">{b.check_in} → {b.check_out}</div>
                        <div className="text-gray-400">{nights}n · {b.guests_count} guest{b.guests_count !== 1 ? "s" : ""}</div>
                      </td>
                      <td className="px-4 py-3 font-bold text-navy-900 whitespace-nowrap">
                        {b.currency} {Number(b.total_amount).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${STATUS_COLORS[b.status] ?? "bg-gray-50 text-gray-600 border-gray-100"}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <OwnerBookingActions booking={b} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">{(bookings as unknown[]).length} booking{(bookings as unknown[]).length !== 1 ? "s" : ""}</span>
          </div>
        </div>
      )}
    </div>
  );
}
