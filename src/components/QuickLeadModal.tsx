"use client";

import { useState, FormEvent } from "react";
import { X, MessageSquare, Check, Loader2 } from "lucide-react";
import Image from "next/image";

interface Props {
  hotelName: string;
  hotelSlug: string;
  hotelCity: string;
  hotelImage?: string;
  trigger?: React.ReactNode;
  defaultSource?: string;
}

export default function QuickLeadModal({
  hotelName,
  hotelSlug,
  hotelCity,
  hotelImage,
  trigger,
  defaultSource = "website",
}: Props) {
  const [open,    setOpen]    = useState(false);
  const [state,   setState]   = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error,   setError]   = useState("");
  const [form,    setForm]    = useState({
    guestName:       "",
    guestEmail:      "",
    guestPhone:      "",
    checkIn:         "",
    checkOut:        "",
    guestsCount:     2,
    specialRequests: "",
  });

  const today = new Date().toISOString().split("T")[0];

  function set(k: string, v: string | number) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setState("loading");
    setError("");

    try {
      const res = await fetch("/api/leads", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          hotel_slug:       hotelSlug,
          hotel_name:       hotelName,
          guest_name:       form.guestName,
          guest_email:      form.guestEmail,
          guest_phone:      form.guestPhone,
          check_in:         form.checkIn   || undefined,
          check_out:        form.checkOut  || undefined,
          guests_count:     form.guestsCount,
          special_requests: form.specialRequests || undefined,
          source:           defaultSource,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Something went wrong. Please try again.");
        setState("error");
      } else {
        setState("success");
      }
    } catch {
      setError("Connection error. Please try again.");
      setState("error");
    }
  }

  const inputCls =
    "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-navy-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all";

  return (
    <>
      {/* Trigger */}
      <span onClick={() => setOpen(true)} className="cursor-pointer">
        {trigger ?? (
          <button className="btn-gold w-full justify-center">
            <MessageSquare className="w-4 h-4 mr-1.5" />
            Get Best Deal
          </button>
        )}
      </span>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 px-4 pb-4 sm:pb-0"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">

            {/* Hotel header */}
            <div className="relative h-24 bg-navy-900">
              {hotelImage && (
                <Image src={hotelImage} alt={hotelName} fill className="object-cover opacity-40" sizes="448px" />
              )}
              <div className="absolute inset-0 flex items-center justify-between px-4">
                <div>
                  <div className="text-gold-400 text-[9px] font-black uppercase tracking-widest mb-0.5">Get Best Deal</div>
                  <div className="text-white text-sm font-black leading-tight">{hotelName}</div>
                  <div className="text-white/60 text-[10px] capitalize">{hotelCity}</div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="text-white/60 hover:text-white transition-colors p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {state === "success" ? (
              <div className="p-6 text-center">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-sm font-black text-navy-900 mb-1">Inquiry Received!</h3>
                <p className="text-xs text-gray-500 mb-4">
                  We'll send you the best rates for <strong>{hotelName}</strong> at <strong>{form.guestEmail}</strong> within 30 minutes.
                </p>
                <button
                  onClick={() => { setOpen(false); setState("idle"); setForm({ guestName: "", guestEmail: "", guestPhone: "", checkIn: "", checkOut: "", guestsCount: 2, specialRequests: "" }); }}
                  className="btn-navy w-full justify-center"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="col-span-2">
                    <input
                      className={inputCls}
                      value={form.guestName}
                      onChange={(e) => set("guestName", e.target.value)}
                      placeholder="Full name *"
                      required
                    />
                  </div>
                  <input
                    className={inputCls}
                    type="email"
                    value={form.guestEmail}
                    onChange={(e) => set("guestEmail", e.target.value)}
                    placeholder="Email *"
                    required
                  />
                  <input
                    className={inputCls}
                    type="tel"
                    value={form.guestPhone}
                    onChange={(e) => set("guestPhone", e.target.value)}
                    placeholder="Phone / WhatsApp"
                  />
                  <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Check-in</label>
                    <input
                      type="date"
                      className={inputCls}
                      value={form.checkIn}
                      onChange={(e) => set("checkIn", e.target.value)}
                      min={today}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Check-out</label>
                    <input
                      type="date"
                      className={inputCls}
                      value={form.checkOut}
                      onChange={(e) => set("checkOut", e.target.value)}
                      min={form.checkIn || today}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Guests</label>
                    <select
                      className={inputCls}
                      value={form.guestsCount}
                      onChange={(e) => set("guestsCount", Number(e.target.value))}
                    >
                      {[1,2,3,4,5,6].map((n) => (
                        <option key={n} value={n}>{n} Guest{n !== 1 ? "s" : ""}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <textarea
                      className={`${inputCls} resize-none`}
                      rows={2}
                      value={form.specialRequests}
                      onChange={(e) => set("specialRequests", e.target.value)}
                      placeholder="Special requests (optional)"
                    />
                  </div>
                </div>

                {state === "error" && (
                  <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                    <p className="text-red-600 text-xs">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={state === "loading" || !form.guestName || !form.guestEmail}
                  className="w-full py-3 rounded-xl text-navy-950 font-black text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                  style={{ background: "linear-gradient(135deg, #d4a017, #efd466)" }}
                >
                  {state === "loading" ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                  ) : (
                    <><MessageSquare className="w-4 h-4" /> Send Inquiry</>
                  )}
                </button>
                <p className="text-[9px] text-gray-400 text-center">
                  Free · No payment required · Our team responds within 30 min
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
