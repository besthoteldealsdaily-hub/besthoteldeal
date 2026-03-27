import { TABLES } from "@/lib/supabase";
import { Download, FileJson, Table, ShieldAlert, CheckCircle, Database } from "lucide-react";

export const metadata = {
  title: "Export Platform Data – Admin",
};

export default function ExportAdminPage() {
  const exportTargets = [
    { label: "Newsletter Subscribers", table: TABLES.NEWSLETTER, icon: "Mail" },
    { label: "WhatsApp Leads", table: TABLES.WHATSAPP_LEADS, icon: "MessageSquare" },
    { label: "Partner Applications", table: TABLES.PARTNER_APPLICATIONS, icon: "Users" },
    { label: "Booking Inquiries", table: TABLES.BOOKING_INQUIRIES, icon: "FileText" },
    { label: "Engagement Events", table: TABLES.ENGAGEMENT_EVENTS, icon: "BarChart3" },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-navy-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-navy-50 text-navy-900 rounded-xl flex items-center justify-center">
            <Download className="w-5 h-5" />
          </div>
          Data Export
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Securely export platform data for external reporting or due diligence.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex items-start gap-4">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-amber-600 shrink-0 shadow-sm">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-amber-900 font-black text-sm uppercase tracking-wider mb-1">Security Warning</h3>
          <p className="text-amber-800 text-xs leading-relaxed max-w-xl">
            Exports contain sensitive user data including emails, phone numbers, and travel intent. 
            Handle downloaded files according to internal data protection policies.
            All exports are logged with your admin session ID.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exportTargets.map((target) => (
          <div key={target.table} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:border-navy-900 transition-all group">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-navy-900 group-hover:bg-navy-900 group-hover:text-white transition-all">
                <Database className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-black uppercase text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                <CheckCircle className="w-3 h-3" /> Real-time
              </div>
            </div>

            <h3 className="text-navy-900 font-black mb-1">{target.label}</h3>
            <p className="text-[11px] text-gray-400 font-medium font-mono uppercase tracking-widest mb-6">
               TABLE: {target.table}
            </p>

            <div className="flex flex-col gap-2">
              <a 
                href={`/api/admin/export?table=${target.table}&limit=5000`} 
                target="_blank"
                className="btn-navy text-xs justify-between group-hover:bg-gold-500 group-hover:text-navy-950 transition-all"
              >
                <span>Export JSON Data</span>
                <FileJson className="w-4 h-4" />
              </a>
              <div className="text-[10px] text-gray-400 text-center font-bold uppercase tracking-widest pt-2">
                Available: Raw JSON (Full Schema)
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
