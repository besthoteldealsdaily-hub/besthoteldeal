import { createServerClient } from "@/lib/supabase";
import { requireSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { LayoutDashboard, Building2, Calendar, MessageSquare, Clock } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Dashboard — Hotel Owner" };
export const dynamic  = "force-dynamic";

export default async function OwnerDashboardPage() {
  const session = await requireSession(["hotel_owner", "admin"]);
  if (!session) redirect("/owner/login/");

  const db = createServerClient();

  // Owner's hotels
  const { data: hotels } = await db
    .from("hotels")
    .select("id, name, slug, status, listing_type, city")
    .eq("owner_id", session.id)
    .order("created_at", { ascending: false });

  const hotelIds = (hotels ?? []).map((h) => h.id);

  // Bookings for owner's hotels
  const { data: bookings } = hotelIds.length
    ? await db
        .from("bookings")
        .select("id, guest_name, check_in, total_amount, currency, status, created_at, hotels(name)")
        .in("hotel_id", hotelIds)
        .order("created_at", { ascending: false })
        .limit(5)
    : { data: [] };

  // All bookings for stats
  const { data: allBookings } = hotelIds.length
    ? await db
        .from("bookings")
        .select("total_amount, status")
        .in("hotel_id", hotelIds)
    : { data: [] };

  // Leads for owner's hotels
  const { data: recentLeads } = hotelIds.length
    ? await db
        .from("leads")
        .select("id, guest_name, hotel_name, status, created_at")
        .in("hotel_id", hotelIds)
        .order("created_at", { ascending: false })
        .limit(5)
    : { data: [] };

  const { data: allLeads } = hotelIds.length
    ? await db.from("leads").select("status").in("hotel_id", hotelIds)
    : { data: [] };

  // Stats
  const confirmedRevenue = (allBookings ?? [])
    .filter((b) => b.status === "confirmed" || b.status === "completed")
    .reduce((s, b) => s + (b.total_amount ?? 0), 0);

  const pendingBookings = (allBookings ?? []).filter((b) => b.status === "pending").length;
  const newLeads        = (allLeads ?? []).filter((l) => l.status === "new").length;

  const statusBadge: Record<string, string> = {
    pending:   "bg-amber-50  text-amber-700  border-amber-100",
    confirmed: "bg-emerald-50 text-emerald-700 border-emerald-100",
    completed: "bg-blue-50   text-blue-700   border-blue-100",
    cancelled: "bg-red-50    text-red-600    border-red-100",
    new:       "bg-blue-50   text-blue-700   border-blue-100",
    contacted: "bg-purple-50 text-purple-700 border-purple-100",
    live:      "bg-emerald-50 text-emerald-700 border-emerald-100",
    approved:  "bg-emerald-50 text-emerald-700 border-emerald-100",
    pending_review: "bg-amber-50 text-amber-700 border-amber-100",
  };

  const stats = [
    { icon: Building2,      label: "My Hotels",        value: hotels?.length ?? 0,                 href: "/owner/hotels/" },
    { icon: Calendar,       label: "Pending Bookings",  value: pendingBookings,                      href: "/owner/bookings/" },
    { icon: MessageSquare,  label: "New Leads",         value: newLeads,                             href: "/owner/leads/" },
    { icon: LayoutDashboard, label: "Confirmed Revenue", value: `USD ${Math.round(confirmedRevenue).toLocaleString()}`, href: "/owner/bookings/" },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-black text-navy-900 flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-gold-500" />
          Welcome back{session.full_name ? `, ${session.full_name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">Your hotel portfolio at a glance.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {stats.map(({ icon: Icon, label, value, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gold-300 transition-colors group"
          >
            <Icon className="w-4 h-4 text-gold-500 mb-2" />
            <div className="text-lg font-black text-navy-900 group-hover:text-gold-600 transition-colors">{value}</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{label}</div>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Recent Bookings */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-xs font-black text-navy-900 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gold-500" /> Recent Bookings
            </span>
            <Link href="/owner/bookings/" className="text-[10px] text-gold-600 font-bold hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {(bookings ?? []).length === 0 && (
              <div className="px-4 py-8 text-center text-xs text-gray-400">No bookings yet.</div>
            )}
            {(bookings ?? []).map((b) => {
              const hotel = Array.isArray(b.hotels) ? b.hotels[0] : b.hotels;
              return (
                <div key={b.id} className="px-4 py-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-navy-900 truncate">{b.guest_name}</div>
                    <div className="text-[10px] text-gray-400">{hotel?.name ?? "—"} · {b.check_in}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-navy-700">{b.currency} {Number(b.total_amount).toLocaleString()}</span>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${statusBadge[b.status] ?? "bg-gray-50 text-gray-600 border-gray-100"}`}>
                      {b.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Leads */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-xs font-black text-navy-900 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-gold-500" /> Recent Leads
            </span>
            <Link href="/owner/leads/" className="text-[10px] text-gold-600 font-bold hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {(recentLeads ?? []).length === 0 && (
              <div className="px-4 py-8 text-center text-xs text-gray-400">No leads yet.</div>
            )}
            {(recentLeads ?? []).map((l) => (
              <div key={l.id} className="px-4 py-2.5 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-navy-900 truncate">{l.guest_name}</div>
                  <div className="text-[10px] text-gray-400">{l.hotel_name}</div>
                </div>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border shrink-0 ${statusBadge[l.status] ?? "bg-gray-50 text-gray-600 border-gray-100"}`}>
                  {l.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending actions alert */}
      {(pendingBookings > 0 || newLeads > 0) && (
        <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-center gap-3">
          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-xs text-amber-700 font-medium">
            You have{" "}
            {pendingBookings > 0 && (
              <><Link href="/owner/bookings/" className="font-black hover:underline">{pendingBookings} pending booking{pendingBookings !== 1 ? "s" : ""}</Link>{newLeads > 0 ? " and " : ""}</>
            )}
            {newLeads > 0 && (
              <Link href="/owner/leads/" className="font-black hover:underline">{newLeads} new lead{newLeads !== 1 ? "s" : ""}</Link>
            )}
            {" "}awaiting your attention.
          </p>
        </div>
      )}
    </div>
  );
}
