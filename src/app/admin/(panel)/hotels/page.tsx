import { hotels } from "@/lib/data";
import { Building2, MapPin, Star, Tag, ExternalLink, ShieldCheck } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Hotels Inventory – Admin",
};

export default function HotelsAdminPage() {
  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            Hotels Inventory
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Static programmatically managed hotel database.
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-6 text-center">
          <div>
            <div className="text-xl font-black text-navy-900">{hotels.length}</div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">Total Listed</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Hotel Property</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type & Level</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Pricing</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Listing Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {hotels.map((hotel) => (
                <tr key={hotel.id} className="hover:bg-gray-50 transition-all group">
                  <td className="px-6 py-4 text-xs font-bold text-navy-900">
                    <div className="flex flex-col">
                      <span className="text-sm font-black group-hover:text-gold-600 transition-colors">{hotel.name}</span>
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider flex items-center gap-1 mt-0.5 font-bold">
                        <MapPin className="w-3 h-3 text-gold-500" /> {hotel.city}, {hotel.country}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-navy-900 capitalize">{hotel.type}</span>
                        <div className="flex items-center text-gold-500 mt-0.5">
                          {Array.from({ length: hotel.stars }).map((_, i) => (
                            <Star key={i} className="w-2.5 h-2.5 fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-black text-navy-900">
                    <div className="flex flex-col">
                      <span>{hotel.currency} {hotel.priceFrom.toLocaleString()}</span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase lining-none">Starting Rate</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase border ${
                      hotel.listingType === 'direct' ? 'bg-navy-900 text-white border-navy-950' : 
                      hotel.listingType === 'lead' ? 'bg-green-100 text-green-700 border-green-200' :
                      'bg-gold-50 text-gold-700 border-gold-200'
                    }`}>
                      {hotel.listingType}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
