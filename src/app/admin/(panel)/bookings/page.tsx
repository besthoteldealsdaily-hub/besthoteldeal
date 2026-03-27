import { createServerClient, TABLES } from "@/lib/supabase";
import { FileText, Calendar, User, Smartphone, MousePointer2, Tag, CheckSquare, Clock } from "lucide-react";

export const metadata = {
  title: "Booking Inquiries – Admin",
};

export default async function BookingsPage() {
  const db = createServerClient();
  
  const { data: bookings, error } = await db
    .from(TABLES.BOOKING_INQUIRIES)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 text-red-600 rounded-xl m-8 border border-red-100 font-medium">
        Error loading bookings: {error.message}
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-700 border-green-200";
      case "contacted": return "bg-blue-100 text-blue-700 border-blue-200";
      case "cancelled": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-amber-100 text-amber-700 border-amber-200";
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            Booking Inquiries
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Direct high-margin booking leads requiring concierge follow-up.
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-6">
          <div className="text-center">
            <div className="text-xl font-black text-navy-900">{bookings?.filter(b => b.status === "new").length || 0}</div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">New Inquiries</div>
          </div>
          <div className="text-xs font-black text-amber-600 px-3 py-1 bg-amber-50 rounded-full uppercase">
            Inquiry Queue
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {bookings && bookings.length > 0 ? (
          bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 flex flex-col md:flex-row md:items-center gap-6 hover:border-gold-300 transition-all transition-colors group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                  <span className="text-gray-400 text-xs font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {new Date(booking.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <h3 className="text-lg font-black text-navy-900 truncate leading-snug group-hover:text-gold-600 transition-colors">
                  {booking.hotel_name || booking.hotel_slug}
                </h3>
                <div className="text-gray-500 text-xs font-bold uppercase mt-1">
                  {booking.city}, {booking.country}
                </div>
              </div>

              <div className="flex-1 md:border-l md:border-gray-50 md:pl-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-navy-50 flex items-center justify-center text-navy-900 italic font-black text-[10px]">
                       {booking.guest_name.charAt(0)}
                     </div>
                     <div className="flex flex-col">
                        <span className="text-sm font-black text-navy-900 leading-none">{booking.guest_name}</span>
                        <span className="text-xs font-medium text-gray-400 mt-1 truncate">{booking.guest_email}</span>
                     </div>
                  </div>
                  <div className="text-[11px] text-gray-500 font-black">
                    <span className="text-gold-600">●</span> {booking.check_in} – {booking.check_out} ({booking.guests} guests)
                  </div>
                </div>
              </div>

              <div className="flex gap-2 shrink-0 md:justify-end">
                <a href={`mailto:${booking.guest_email}?subject=Your Booking Request: ${booking.hotel_name}`} className="btn-navy py-2 px-6 flex-1 text-center justify-center text-xs">
                  Review &amp; Reply
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-white rounded-2xl border border-gray-100 border-dashed">
            <FileText className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="text-navy-900 text-lg">No direct booking inquiries yet.</h3>
            <p className="text-sm text-gray-500">Enable direct listings to receive inquiries.</p>
          </div>
        )}
      </div>
    </div>
  );
}
