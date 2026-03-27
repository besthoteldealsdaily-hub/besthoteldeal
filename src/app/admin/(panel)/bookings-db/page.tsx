import { createServerClient } from "@/lib/supabase";
import { Calendar, Search, TrendingUp } from "lucide-react";
import { BookingActions } from "./BookingActions";

export const metadata = { title: "DB Bookings — Admin" };
export const dynamic  = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-amber-50  text-amber-700  border-amber-100",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-100",
  completed: "bg-blue-50   text-blue-700   border-blue-100",
  cancelled: "bg-red-50    text-red-600    border-red-100",
  refunded:  "bg-gray-50   text-gray-600   border-gray-200",
};

const PAY_COLORS: Record<string, string> = {
  unpaid:    "bg-amber-50  text-amber-700 border-amber-100",
  paid:      "bg-emerald-50 text-emerald-700 border-emerald-100",
  partial:   "bg-blue-50   text-blue-700  border-blue-100",
  refunded:  "bg-gray-50   text-gray-600  border-gray-200",
};

function Badge({ label, colorMap }: { label: string; colorMap: Record<string, string> }) {
  const cls = colorMap[label] ?? "bg-gray-50 text-gray-600 border-gray-100";
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${cls}`}>
      {label}
    </span>
  );
}

export default async function AdminBookingsDBPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp     = await searchParams;
  const status = sp.status ?? "";
  const search = sp.search ?? "";

  const db = createServerClient();

  let query = db
    .from("bookings")
    .select(`
      id, booking_ref, guest_name, guest_email, guest_phone,
      check_in, check_out, guests_count, rooms_count,
      price_per_night, total_amount, currency,
      status, payment_status, created_at,
      hotels ( name, city ),
      rooms  ( name, room_type )
    `)
    .order("created_at", { ascending: false })
    .limit(150);

  if (status) query = query.eq("status", status);
  if (search) query = query.or(
    `guest_name.ilike.%${search}%,guest_email.ilike.%${search}%,booking_ref.ilike.%${search}%`,
  );

  const { data: bookings } = await query;

  // Revenue from confirmed/completed
  const { data: revenueData } = await db
    .from("bookings")
    .select("total_amount")
    .in("status", ["confirmed", "completed"]);
  const totalRevenue = (revenueData ?? []).reduce((s, b) => s + (b.total_amount ?? 0), 0);

  const { data: counts } = await db.from("bookings").select("status");
  const countMap = (counts ?? []).reduce<Record<string, number>>((acc, b) => {
    acc[b.status] = (acc[b.status] ?? 0) + 1;
    return acc;
  }, {});

  const statuses = ["pending", "confirmed", "completed", "cancelled"];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-black text-navy-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gold-500" />
            Booking Requests
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">All direct booking submissions requiring manual confirmation.</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5">
          <TrendingUp className="w-4 h-4 text-gold-500" />
          <div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Confirmed Revenue</div>
            <div className="text-sm font-black text-navy-900">USD {Math.round(totalRevenue).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[["", "All", counts?.length ?? 0], ...statuses.map((s) => [s, s, countMap[s] ?? 0])].map(([val, label, cnt]) => {
          const active = val === "" ? !status : status === val;
          return (
            <a
              key={String(val)}
              href={val ? `/admin/bookings-db/?status=${val}` : "/admin/bookings-db/"}
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

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {["Ref", "Guest", "Hotel / Room", "Dates", "Total", "Status", "Payment", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-gray-500 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(bookings ?? []).length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">No bookings found.</td></tr>
              )}
              {(bookings ?? []).map((b) => {
                const hotel = Array.isArray(b.hotels) ? b.hotels[0] : b.hotels;
                const room  = Array.isArray(b.rooms)  ? b.rooms[0]  : b.rooms;
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
                    <td className="px-4 py-3"><Badge label={b.status} colorMap={STATUS_COLORS} /></td>
                    <td className="px-4 py-3"><Badge label={b.payment_status ?? "unpaid"} colorMap={PAY_COLORS} /></td>
                    <td className="px-4 py-3">
                      <BookingActions bookingId={b.id} bookingRef={b.booking_ref} status={b.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">{bookings?.length ?? 0} booking{bookings?.length !== 1 ? "s" : ""}</span>
        </div>
      </div>
    </div>
  );
}
