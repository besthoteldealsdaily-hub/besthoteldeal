"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";

interface BookingActionsProps {
  bookingId:  string;
  bookingRef: string;
  status:     string;
}

export function BookingActions({ bookingId, bookingRef, status }: BookingActionsProps) {
  const [loading, setLoading]   = useState<"confirm" | "cancel" | null>(null);
  const [current, setCurrent]   = useState(status);
  const [showCancel, setShowCancel] = useState(false);
  const [reason,    setReason]  = useState("");

  async function patch(body: object) {
    const res = await fetch(`/api/bookings/${bookingId}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
    });
    return res.ok;
  }

  async function handleConfirm() {
    setLoading("confirm");
    const ok = await patch({ status: "confirmed" });
    if (ok) setCurrent("confirmed");
    setLoading(null);
  }

  async function handleCancel() {
    setLoading("cancel");
    const ok = await patch({ status: "cancelled", adminNotes: reason || undefined });
    if (ok) { setCurrent("cancelled"); setShowCancel(false); }
    setLoading(null);
  }

  if (current === "confirmed") return <span className="text-[10px] font-black text-emerald-600 uppercase">✓ Confirmed</span>;
  if (current === "cancelled") return <span className="text-[10px] font-black text-red-500 uppercase">✗ Cancelled</span>;
  if (current === "completed") return <span className="text-[10px] font-black text-blue-500 uppercase">✓ Completed</span>;

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={handleConfirm}
        disabled={loading !== null}
        className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 transition-colors disabled:opacity-50"
      >
        <Check className="w-3 h-3" />
        {loading === "confirm" ? "…" : "Confirm"}
      </button>
      <button
        onClick={() => setShowCancel(true)}
        disabled={loading !== null}
        className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-black bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-colors disabled:opacity-50"
      >
        <X className="w-3 h-3" />
        Cancel
      </button>

      {showCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setShowCancel(false)}>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-black text-navy-900 mb-1">Cancel Booking</h3>
            <p className="text-xs text-gray-500 mb-4">Cancelling <strong>{bookingRef}</strong>. Optional: add a note for records.</p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Optional cancellation note…"
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
            />
            <div className="flex gap-2 mt-4">
              <button onClick={handleCancel} disabled={loading !== null} className="flex-1 py-2 rounded-xl text-xs font-black bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors">
                {loading === "cancel" ? "Cancelling…" : "Cancel Booking"}
              </button>
              <button onClick={() => setShowCancel(false)} className="flex-1 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
