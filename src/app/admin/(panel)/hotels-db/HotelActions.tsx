"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Pencil, MoreHorizontal } from "lucide-react";

interface HotelActionsProps {
  hotelId:   string;
  hotelName: string;
  status:    string;
}

export function HotelActions({ hotelId, hotelName, status }: HotelActionsProps) {
  const [loading,    setLoading]    = useState<"approve" | "reject" | null>(null);
  const [showReject, setShowReject] = useState(false);
  const [reason,     setReason]     = useState("");
  const [done,       setDone]       = useState<"approved" | "rejected" | null>(null);

  async function handleApprove() {
    setLoading("approve");
    try {
      const res = await fetch(`/api/admin/hotels/${hotelId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      if (res.ok) setDone("approved");
    } finally {
      setLoading(null);
    }
  }

  async function handleReject() {
    if (!reason.trim()) return;
    setLoading("reject");
    try {
      const res = await fetch(`/api/admin/hotels/${hotelId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", rejectedReason: reason }),
      });
      if (res.ok) { setDone("rejected"); setShowReject(false); }
    } finally {
      setLoading(null);
    }
  }

  if (done === "approved") {
    return <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">✓ Approved</span>;
  }
  if (done === "rejected") {
    return <span className="text-[10px] font-black text-red-500 uppercase tracking-wider">✗ Rejected</span>;
  }

  return (
    <div className="flex items-center gap-1.5">
      {/* Approve */}
      {status !== "live" && status !== "approved" && (
        <button
          onClick={handleApprove}
          disabled={loading !== null}
          title="Approve"
          className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 transition-colors disabled:opacity-50"
        >
          <CheckCircle className="w-3 h-3" />
          {loading === "approve" ? "…" : "Approve"}
        </button>
      )}

      {/* Reject */}
      {status !== "rejected" && (
        <button
          onClick={() => setShowReject(true)}
          disabled={loading !== null}
          title="Reject"
          className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-black bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-colors disabled:opacity-50"
        >
          <XCircle className="w-3 h-3" />
          Reject
        </button>
      )}

      {/* Reject Modal */}
      {showReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setShowReject(false)}>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-black text-navy-900 mb-1">Reject Listing</h3>
            <p className="text-xs text-gray-500 mb-4">
              Rejecting <strong>{hotelName}</strong>. Provide a reason — it will be emailed to the owner.
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Missing high-resolution photos, incorrect pricing…"
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-navy-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleReject}
                disabled={!reason.trim() || loading !== null}
                className="flex-1 py-2 rounded-xl text-xs font-black bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading === "reject" ? "Rejecting…" : "Confirm Reject"}
              </button>
              <button
                onClick={() => setShowReject(false)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
