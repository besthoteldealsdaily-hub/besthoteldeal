import { transferRoutes } from "@/lib/transfers-data";
import { Car, MapPin, Globe, Shield, Gauge, ExternalLink } from "lucide-react";

export const metadata = {
  title: "Transfers Inventory – Admin",
};

export default function TransfersAdminPage() {
  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
            Transfers & Routes
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Airport transfers, inter-city corridors, and car rental inventory.
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-6 text-center">
          <div>
            <div className="text-xl font-black text-navy-900">{transferRoutes.length}</div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">Total Routes</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Route & Location</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type & Duration</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Vehicle Options</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {transferRoutes.map((route) => (
                <tr key={route.id} className="hover:bg-gray-50 transition-all group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-navy-900 group-hover:text-blue-600 transition-colors truncate max-w-[250px]">
                        {route.name}
                      </span>
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider flex items-center gap-1 mt-0.5 font-bold">
                        <MapPin className="w-3 h-3 text-gold-500" /> {route.city}, {route.country}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-navy-900 capitalize flex items-center gap-1.5">
                        <Gauge className="w-3.5 h-3.5 text-gray-400" /> {route.type.replace("-", " ")}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold mt-0.5">Approx. {route.duration} ({route.distance})</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 flex-wrap">
                      {route.vehicleTypes.slice(0, 2).map((v) => (
                        <span key={v.name} className="text-[9px] font-black bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded border border-gray-100 uppercase">
                          {v.name}
                        </span>
                      ))}
                      {route.vehicleTypes.length > 2 && (
                        <span className="text-[9px] font-black text-gray-300">+{route.vehicleTypes.length - 2} more</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {route.featured ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase bg-gold-100 text-gold-700 border border-gold-200">
                        <Shield className="w-2.5 h-2.5" /> Featured
                      </span>
                    ) : (
                      <span className="text-[9px] font-black text-gray-300 uppercase">Standard</span>
                    )}
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
