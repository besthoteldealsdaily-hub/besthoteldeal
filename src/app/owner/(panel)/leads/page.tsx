import { createServerClient } from "@/lib/supabase";
import { requireSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { MessageSquare, Phone, Mail, Search } from "lucide-react";
import { LeadActions } from "@/app/admin/(panel)/leads-db/LeadActions";

export const metadata = { title: "Leads — Owner" };
export const dynamic  = "force-dynamic";

export default async function OwnerLeadsPage({
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

  let leads: unknown[] = [];
  let allLeads: { status: string }[] = [];

  if (hotelIds.length > 0) {
    let query = db
      .from("leads")
      .select("id, hotel_name, hotel_slug, guest_name, guest_email, guest_phone, check_in, check_out, guests_count, budget_range, special_requests, source, status, created_at")
      .in("hotel_id", hotelIds)
      .order("created_at", { ascending: false })
      .limit(100);

    if (status) query = query.eq("status", status);
    if (search) query = query.or(`guest_name.ilike.%${search}%,guest_email.ilike.%${search}%,hotel_name.ilike.%${search}%`);

    const { data } = await query;
    leads = data ?? [];

    const { data: all } = await db.from("leads").select("status").in("hotel_id", hotelIds);
    allLeads = (all ?? []) as { status: string }[];
  }

  const countMap = allLeads.reduce<Record<string, number>>((acc, l) => {
    acc[l.status] = (acc[l.status] ?? 0) + 1;
    return acc;
  }, {});

  const statusList = ["new", "contacted", "qualified", "converted", "lost"];

  const SOURCE_COLORS: Record<string, string> = {
    website:  "bg-navy-50  text-navy-700  border-navy-100",
    whatsapp: "bg-emerald-50 text-emerald-700 border-emerald-100",
    phone:    "bg-purple-50 text-purple-700 border-purple-100",
    email:    "bg-blue-50   text-blue-700  border-blue-100",
    partner:  "bg-gold-50   text-gold-700  border-gold-200",
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-black text-navy-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-gold-500" />
            Lead Inquiries
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Guest inquiries for your hotels.</p>
        </div>
        <div className="hidden md:flex items-center gap-3">
          {statusList.map((s) => (
            <div key={s} className="text-center">
              <div className="text-sm font-black text-navy-900">{countMap[s] ?? 0}</div>
              <div className="text-[9px] uppercase tracking-wider text-gray-400 font-semibold capitalize">{s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 mb-4 flex items-center gap-3 flex-wrap">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <form className="flex-1 flex gap-2 flex-wrap" method="GET">
          <input
            name="search"
            defaultValue={search}
            placeholder="Search guest, email, or hotel…"
            className="flex-1 min-w-[180px] text-xs text-navy-900 placeholder:text-gray-400 focus:outline-none"
          />
          <select
            name="status"
            defaultValue={status}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-navy-900 focus:outline-none"
          >
            <option value="">All statuses</option>
            {statusList.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
          <button type="submit" className="btn-navy text-[10px] px-3 py-1.5">Filter</button>
        </form>
      </div>

      {hotelIds.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">Add a hotel first to receive leads.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {["Guest", "Contact", "Hotel", "Dates / Guests", "Budget", "Source", "Received", "Status"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-gray-500 font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leads.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">No leads found.</td></tr>
                )}
                {(leads as {
                  id: string; hotel_name: string; hotel_slug: string; guest_name: string;
                  guest_email: string; guest_phone?: string; check_in?: string; check_out?: string;
                  guests_count?: number; budget_range?: string; special_requests?: string;
                  source?: string; status: string; created_at: string;
                }[]).map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-navy-900">{lead.guest_name}</div>
                      {lead.special_requests && (
                        <div className="text-gray-400 mt-0.5 max-w-[200px] truncate" title={lead.special_requests}>
                          "{lead.special_requests}"
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Mail className="w-2.5 h-2.5 shrink-0" />
                        <a href={`mailto:${lead.guest_email}`} className="hover:text-gold-600 transition-colors">{lead.guest_email}</a>
                      </div>
                      {lead.guest_phone && (
                        <div className="flex items-center gap-1 text-gray-600 mt-0.5">
                          <Phone className="w-2.5 h-2.5 shrink-0" />
                          <a href={`https://wa.me/${lead.guest_phone.replace(/\D/g, "")}`} target="_blank" className="hover:text-emerald-600 transition-colors">
                            {lead.guest_phone}
                          </a>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-navy-900">{lead.hotel_name}</div>
                      {lead.hotel_slug && <div className="text-gray-400">{lead.hotel_slug}</div>}
                    </td>
                    <td className="px-4 py-3">
                      {lead.check_in && <div className="text-navy-700">{lead.check_in} → {lead.check_out ?? "—"}</div>}
                      {lead.guests_count && <div className="text-gray-400">{lead.guests_count} guest{lead.guests_count !== 1 ? "s" : ""}</div>}
                      {!lead.check_in && <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{lead.budget_range ?? "—"}</td>
                    <td className="px-4 py-3">
                      {lead.source && (
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${SOURCE_COLORS[lead.source] ?? "bg-gray-50 text-gray-600 border-gray-100"}`}>
                          {lead.source}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                      {new Date(lead.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                    </td>
                    <td className="px-4 py-3">
                      <LeadActions leadId={lead.id} status={lead.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">{leads.length} lead{leads.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
      )}
    </div>
  );
}
