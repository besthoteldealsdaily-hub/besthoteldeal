"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const STATUSES = ["new", "contacted", "qualified", "converted", "lost"] as const;
type LeadStatus = typeof STATUSES[number];

const COLORS: Record<LeadStatus, string> = {
  new:       "bg-blue-50   text-blue-700   border-blue-100",
  contacted: "bg-purple-50 text-purple-700 border-purple-100",
  qualified: "bg-amber-50  text-amber-700  border-amber-100",
  converted: "bg-emerald-50 text-emerald-700 border-emerald-100",
  lost:      "bg-red-50    text-red-600    border-red-100",
};

export function LeadActions({ leadId, status: initialStatus }: { leadId: string; status: string }) {
  const [status,  setStatus]  = useState<LeadStatus>(initialStatus as LeadStatus);
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);

  async function updateStatus(next: LeadStatus) {
    setOpen(false);
    if (next === status) return;
    setLoading(true);
    try {
      await fetch(`/api/leads/${leadId}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status: next }),
      });
      setStatus(next);
    } finally {
      setLoading(false);
    }
  }

  const cls = COLORS[status] ?? "bg-gray-50 text-gray-600 border-gray-100";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border transition-colors disabled:opacity-50 ${cls}`}
      >
        {loading ? "…" : status}
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden w-36">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => updateStatus(s)}
                className={`w-full text-left px-3 py-2 text-xs font-bold transition-colors hover:bg-gray-50 capitalize ${s === status ? "text-gold-600 bg-gold-50" : "text-gray-700"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
