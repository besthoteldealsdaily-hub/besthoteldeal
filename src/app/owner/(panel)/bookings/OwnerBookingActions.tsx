"use client";

import { useState } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

type Booking = {
  id: string;
  booking_ref: string;
  guest_name: string;
  guest_email: string;
  guest_phone?: string | null;
  check_in: string;
  check_out: string;
  guests_count: number;
  price_per_night: number;
  total_amount: number;
  currency: string;
  status: string;
  payment_status: string;
  created_at: string;
  hotels: { name: string } | { name: string }[] | null;
  rooms: { name: string; room_type: string } | { name: string; room_type: string }[] | null;
};

export function OwnerBookingActions({ booking }: { booking: Booking }) {
  const [status,   setStatus]   = useState(booking.status);
  const [loading,  setLoading]  = useState(false);
  const [modal,    setModal]    = useState<"cancel" | null>(null);
  const [note,     setNote]     = useState("");

  if (status === "cancelled" || status === "completed" || status === "refunded") {
    return <span className="text-[10px] text-gray-400 font-semibold capitalize">{status}</span>;
  }

  async function update(nextStatus: string, cancelNote?: string) {
    setLoading(true);
    const body: Record<string, string> = { status: nextStatus };
    if (cancelNote) body.cancelNote = cancelNote;

    await fetch(`/api/bookings/${booking.id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
    });
    setStatus(nextStatus);
    setModal(null);
    setLoading(false);
  }

  return (
    <>
      <div className="flex items-center gap-1.5">
        {status === "pending" && (
          <button
            onClick={() => update("confirmed")}
            disabled={loading}
            title="Confirm booking"
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 disabled:opacity-50 transition-colors"
          >
            <CheckCircle className="w-3 h-3" /> Confirm
          </button>
        )}
        {(status === "pending" || status === "confirmed") && (
          <button
            onClick={() => setModal("cancel")}
            disabled={loading}
            title="Cancel booking"
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 disabled:opacity-50 transition-colors"
          >
            <XCircle className="w-3 h-3" /> Cancel
          </button>
        )}
      </div>

      {modal === "cancel" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-navy-900">Cancel Booking</h3>
              <button onClick={() => setModal(null)} className="text-gray-300 hover:text-gray-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Cancel booking <strong>{booking.booking_ref}</strong> for {booking.guest_name}?
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note to guest…"
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-navy-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-400 resize-none mb-3"
            />
            <div className="flex gap-2">
              <button
                onClick={() => update("cancelled", note || undefined)}
                disabled={loading}
                className="flex-1 py-2 rounded-xl text-xs font-black bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Cancelling…" : "Cancel Booking"}
              </button>
              <button onClick={() => setModal(null)} className="flex-1 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                Keep
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
