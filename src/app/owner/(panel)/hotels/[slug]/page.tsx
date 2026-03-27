"use client";

import { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { Building2, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

const HOTEL_TYPES = ["hotel", "resort", "boutique_hotel", "villa", "apartment", "hostel", "guesthouse", "riad"];

type HotelData = {
  id: string;
  name: string;
  description: string | null;
  city: string;
  country: string | null;
  address: string | null;
  hotel_type: string;
  listing_type: string;
  stars: number | null;
  price_per_night_from: number | null;
  currency: string | null;
  affiliate_url: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  near_haram: boolean;
  status: string;
};

export default function EditHotelPage() {
  const params    = useParams();
  const router    = useRouter();
  const slug      = params.slug as string;

  const [hotel,   setHotel]   = useState<HotelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");
  const [saved,   setSaved]   = useState(false);

  useEffect(() => {
    fetch(`/api/hotels/${slug}`)
      .then((r) => r.json())
      .then((d) => { setHotel(d.hotel ?? null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  function set(key: string, value: string | boolean | number) {
    setHotel((h) => h ? { ...h, [key]: value } : h);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!hotel) return;
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/hotels/${slug}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          name:                hotel.name,
          description:         hotel.description,
          city:                hotel.city,
          country:             hotel.country,
          address:             hotel.address,
          hotel_type:          hotel.hotel_type,
          stars:               hotel.stars,
          price_per_night_from: hotel.price_per_night_from,
          currency:            hotel.currency,
          affiliate_url:       hotel.affiliate_url,
          phone:               hotel.phone,
          email:               hotel.email,
          website:             hotel.website,
          near_haram:          hotel.near_haram,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save.");
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
        if (data.hotel?.slug && data.hotel.slug !== slug) {
          router.replace(`/owner/hotels/${data.hotel.slug}/`);
        }
      }
    } catch {
      setError("Connection error.");
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-navy-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all";
  const labelCls = "block text-xs font-semibold text-gray-700 mb-1";

  if (loading) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-100 rounded-xl w-48" />
          <div className="h-64 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center py-16">
        <p className="text-gray-500 text-sm mb-4">Hotel not found or you don't have access.</p>
        <Link href="/owner/hotels/" className="text-gold-600 text-xs font-bold hover:underline">← Back to hotels</Link>
      </div>
    );
  }

  const STATUS_COLORS: Record<string, string> = {
    pending:   "bg-amber-50  text-amber-700  border-amber-100",
    reviewing: "bg-purple-50 text-purple-700 border-purple-100",
    approved:  "bg-blue-50   text-blue-700   border-blue-100",
    live:      "bg-emerald-50 text-emerald-700 border-emerald-100",
    rejected:  "bg-red-50    text-red-600    border-red-100",
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/owner/hotels/" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-black text-navy-900 flex items-center gap-2 truncate">
            <Building2 className="w-5 h-5 text-gold-500 shrink-0" />
            {hotel.name}
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${STATUS_COLORS[hotel.status] ?? "bg-gray-50 text-gray-600 border-gray-100"}`}>
              {hotel.status}
            </span>
            <Link href={`/owner/hotels/${slug}/rooms/`} className="text-[10px] text-gold-600 font-bold hover:underline">
              Manage Rooms →
            </Link>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <h2 className="text-xs font-black text-navy-900 uppercase tracking-wider">Basic Information</h2>

          <div>
            <label className={labelCls}>Hotel Name *</label>
            <input className={inputCls} value={hotel.name} onChange={(e) => set("name", e.target.value)} required />
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea
              className={`${inputCls} resize-none`}
              rows={3}
              value={hotel.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>City *</label>
              <input className={inputCls} value={hotel.city} onChange={(e) => set("city", e.target.value)} required />
            </div>
            <div>
              <label className={labelCls}>Country</label>
              <input className={inputCls} value={hotel.country ?? ""} onChange={(e) => set("country", e.target.value)} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Address</label>
            <input className={inputCls} value={hotel.address ?? ""} onChange={(e) => set("address", e.target.value)} />
          </div>
        </div>

        {/* Type & Pricing */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <h2 className="text-xs font-black text-navy-900 uppercase tracking-wider">Type & Pricing</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Hotel Type</label>
              <select className={inputCls} value={hotel.hotel_type} onChange={(e) => set("hotel_type", e.target.value)}>
                {HOTEL_TYPES.map((t) => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Stars</label>
              <select className={inputCls} value={hotel.stars ?? ""} onChange={(e) => set("stars", e.target.value ? Number(e.target.value) : "")}>
                <option value="">—</option>
                {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n} ★</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Price from / night</label>
              <input
                className={inputCls}
                type="number"
                min="0"
                value={hotel.price_per_night_from ?? ""}
                onChange={(e) => set("price_per_night_from", e.target.value ? Number(e.target.value) : "")}
              />
            </div>
            <div>
              <label className={labelCls}>Currency</label>
              <select className={inputCls} value={hotel.currency ?? "USD"} onChange={(e) => set("currency", e.target.value)}>
                {["USD", "SAR", "AED", "EUR", "GBP"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {hotel.listing_type === "affiliate" && (
            <div>
              <label className={labelCls}>Affiliate URL</label>
              <input
                className={inputCls}
                type="url"
                value={hotel.affiliate_url ?? ""}
                onChange={(e) => set("affiliate_url", e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Contact */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <h2 className="text-xs font-black text-navy-900 uppercase tracking-wider">Contact Details</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Phone</label>
              <input className={inputCls} value={hotel.phone ?? ""} onChange={(e) => set("phone", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input className={inputCls} type="email" value={hotel.email ?? ""} onChange={(e) => set("email", e.target.value)} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Website</label>
            <input className={inputCls} type="url" value={hotel.website ?? ""} onChange={(e) => set("website", e.target.value)} />
          </div>
        </div>

        {/* Flags */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={hotel.near_haram}
              onChange={(e) => set("near_haram", e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-xs font-semibold text-gray-700">Near Haram</span>
          </label>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <p className="text-red-600 text-xs font-medium">{error}</p>
          </div>
        )}

        {saved && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
            <p className="text-emerald-700 text-xs font-medium">Changes saved successfully.</p>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-xl text-navy-950 font-black text-sm disabled:opacity-60 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, #d4a017, #efd466)" }}
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
