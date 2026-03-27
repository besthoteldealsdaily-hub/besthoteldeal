import { createServerClient, TABLES } from "@/lib/supabase";
import { Mail, Calendar, User, Smartphone, MousePointer2 } from "lucide-react";

export const metadata = {
  title: "Newsletter Subscribers – Admin",
};

export default async function NewsletterPage() {
  const db = createServerClient();
  
  const { data: subs, error } = await db
    .from(TABLES.NEWSLETTER)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 text-red-600 rounded-xl m-8 border border-red-100 font-medium">
        Error loading subscribers: {error.message}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            Newsletter Subscribers
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Build your audience for seasonal drip campaigns.
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-6">
          <div className="text-center">
            <div className="text-xl font-black text-navy-900">{subs?.length || 0}</div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">Subscribers</div>
          </div>
          <div className="text-xs font-black text-blue-600 px-3 py-1 bg-blue-50 rounded-full uppercase">
            Active List
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Subscriber</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Source</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Joined On</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {subs && subs.length > 0 ? (
                subs.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-navy-900 flex items-center justify-center text-white text-[10px] font-black uppercase">
                          {sub.email.charAt(0)}
                        </div>
                        <span className="text-sm font-black text-navy-900 font-mono tracking-tight">{sub.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-600 uppercase tracking-tighter flex items-center gap-1">
                          <MousePointer2 className="w-3 h-3" /> {sub.source || "footer"}
                        </span>
                        {sub.city_interest && (
                          <span className="text-[10px] text-gray-400 mt-0.5">{sub.city_interest} interests</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(sub.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {sub.active ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase bg-green-100 text-green-700">Active</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase bg-gray-100 text-gray-500">Unsubscribed</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Mail className="w-10 h-10 opacity-20" />
                      <p className="text-sm font-medium italic">No subscribers yet.</p>
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
