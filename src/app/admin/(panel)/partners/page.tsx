import { createServerClient, TABLES } from "@/lib/supabase";
import { Users, CheckCircle, Clock, MapPin, Star, Laptop, Globe, Phone, Mail } from "lucide-react";

export const metadata = {
  title: "Partner Applications – Admin",
};

export default async function PartnersPage() {
  const db = createServerClient();
  
  const { data: partners, error } = await db
    .from(TABLES.PARTNER_APPLICATIONS)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 text-red-600 rounded-xl m-8 border border-red-100 font-medium">
        Error loading partners: {error.message}
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-700 border-green-200";
      case "rejected": return "bg-red-100 text-red-700 border-red-200";
      case "reviewing": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            Partner Applications
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Properties applying to join the BHDD direct-booking ecosystem.
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-6">
          <div className="text-center">
            <div className="text-xl font-black text-navy-900">{partners?.filter(p => p.status === 'pending').length || 0}</div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">Pending Items</div>
          </div>
          <div className="status-badge bg-gold-100 text-gold-700 px-3 py-1 rounded-full text-xs font-black uppercase">
            In Review
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {partners && partners.length > 0 ? (
          partners.map((partner) => (
            <div key={partner.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col hover:border-gold-300 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex flex-col">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border inline-block w-fit mb-2 ${getStatusColor(partner.status)}`}>
                    {partner.status}
                  </span>
                  <h3 className="text-lg font-black text-navy-900 leading-tight group-hover:text-gold-600 transition-colors">{partner.hotel_name}</h3>
                  <div className="text-xs text-gray-500 font-bold uppercase mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gold-500" /> {partner.city}, {partner.country}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex flex-col items-center justify-center text-navy-900">
                  <div className="text-sm font-black">{partner.stars}</div>
                  <Star className="w-3 h-3 text-gold-500 fill-gold-500" />
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl mb-4 space-y-3">
                <div className="flex items-center gap-3 text-xs">
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-navy-900 font-bold">
                    {partner.owner_name.charAt(0)}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-black text-navy-900 truncate">{partner.owner_name}</span>
                    <span className="text-gray-400 font-medium truncate">{partner.owner_email}</span>
                  </div>
                </div>
                
                {partner.owner_phone && (
                  <div className="flex items-center gap-2 text-[11px] text-gray-500 font-medium">
                    <Phone className="w-3 h-3" /> {partner.owner_phone}
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium italic">
                  <Clock className="w-3 h-3" /> Applied {new Date(partner.created_at).toLocaleDateString()}
                </div>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-6 font-normal">
                {partner.description || "No property description provided."}
              </p>

              <div className="mt-auto flex gap-2">
                <a href={`mailto:${partner.owner_email}?subject=BHDD Partnership: ${partner.hotel_name}`} className="btn-navy flex-1 justify-center text-[10px]">
                  <Mail className="w-3.5 h-3.5" /> Contact Owner
                </a>
                {partner.website && (
                  <a href={partner.website} target="_blank" className="bg-gray-100 hover:bg-gray-200 text-navy-900 p-2 rounded-lg transition-colors">
                    <Laptop className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-gray-100 border-dashed">
            <Users className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="text-navy-900 text-lg">No applicant properties found.</h3>
            <p className="text-sm text-gray-500">Wait for properties to apply at /partner</p>
          </div>
        )}
      </div>
    </div>
  );
}
