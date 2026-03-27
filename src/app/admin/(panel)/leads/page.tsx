import { createServerClient, TABLES } from "@/lib/supabase";
import { MessageSquare, Calendar, Globe, MapPin, Tag, Smartphone, ExternalLink } from "lucide-react";

export const metadata = {
  title: "WhatsApp Leads – Admin",
};

export default async function WhatsAppLeadsPage() {
  const db = createServerClient();
  
  const { data: leads, error } = await db
    .from(TABLES.WHATSAPP_LEADS)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 text-red-600 rounded-xl m-8 border border-red-100 font-medium">
        Error loading leads: {error.message}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            WhatsApp Leads
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Tracking high-ticket conversion intent for CRM assignment.
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-6">
          <div className="text-center">
            <div className="text-xl font-black text-navy-900">{leads?.length || 0}</div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">Total Today</div>
          </div>
          <div className="status-badge bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black self-center uppercase">
            Live Pipeline
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-w-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Time & Device</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Hotel / Deal Source</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {leads && leads.length > 0 ? (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-navy-900 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {new Date(lead.created_at).toLocaleString("en-GB", { 
                            day: "numeric", 
                            month: "short", 
                            hour: "2-digit", 
                            minute: "2-digit" 
                          })}
                        </span>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1.5 font-medium mt-0.5 truncate max-w-[150px]">
                          <Smartphone className="w-3.5 h-3.5" />
                          {lead.user_agent?.split("(")[1]?.split(")")[0] || "Desktop/Web"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-navy-900">
                          {lead.hotel_name || lead.hotel_slug || "Unknown Property"}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold bg-navy-50 text-navy-700 px-1.5 py-0.5 rounded leading-none uppercase">
                            {lead.source_page || "General"}
                          </span>
                          {lead.price_point && (
                            <span className="text-[10px] font-black text-green-600 flex items-center gap-0.5 leading-none">
                              <Tag className="w-3 h-3" />
                              {lead.currency} {lead.price_point.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                          <Globe className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-navy-900">{lead.city || "Restricted City"}</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none">
                            {lead.country || "Intl"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a 
                        href={`https://wa.me/${process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "971500000000"}?text=${encodeURIComponent(`Hi, following up on your lead for ${lead.hotel_name}`)}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-wider hover:bg-green-600 hover:text-white transition-all shadow-sm"
                      >
                         Assign CRM
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <MessageSquare className="w-10 h-10 opacity-20" />
                      <p className="text-sm font-medium italic">No WhatsApp leads recorded yet.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
