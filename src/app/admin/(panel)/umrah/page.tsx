import { umrahPackages } from "@/lib/umrah-data";
import { MoonStar, MapPin, Star, Tag, CheckCircle2, Building2, User } from "lucide-react";

export const metadata = {
  title: "Umrah Packages Inventory – Admin",
};

export default function UmrahAdminPage() {
  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <MoonStar className="w-5 h-5" />
            </div>
            Umrah & Hajj Inventory
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Pilgrimage packages across all tiers and departure cities.
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-6 text-center">
          <div>
            <div className="text-xl font-black text-navy-900">{umrahPackages.length}</div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">Total Packages</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Package & Operator</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Duration & Hotels</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tier & Pricing</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {umrahPackages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-gray-50 transition-all group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-navy-900 group-hover:text-emerald-600 transition-colors">
                        {pkg.name}
                      </span>
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider flex items-center gap-1 mt-0.5 font-bold">
                        <User className="w-3 h-3 text-gold-500" /> {pkg.operator} ({pkg.operatorCity})
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-navy-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {pkg.duration}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-bold bg-gray-50 text-gray-400 px-1.5 py-0.5 rounded border border-gray-100 uppercase truncate max-w-[120px]">
                           Makkah: {pkg.makkahHotel}
                        </span>
                        <span className="text-[9px] font-bold bg-gray-50 text-gray-400 px-1.5 py-0.5 rounded border border-gray-100 uppercase truncate max-w-[120px]">
                           Madinah: {pkg.madinahHotel}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className={`text-[10px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded border w-fit mb-1 ${
                        pkg.tier === 'vip' ? 'bg-navy-950 text-gold-400 border-gold-900' :
                        pkg.tier === 'premium' ? 'bg-gold-50 text-gold-700 border-gold-200' :
                        pkg.tier === 'standard' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-gray-50 text-gray-500 border-gray-100'
                      }`}>
                        {pkg.tier}
                      </span>
                      <span className="font-black text-navy-900">{pkg.currency} {pkg.price.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 font-black text-navy-900">
                      <Star className="w-3 h-3 fill-gold-500 text-gold-500" /> {pkg.rating}
                    </div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none">
                      {pkg.reviewCount} Reviews
                    </div>
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
