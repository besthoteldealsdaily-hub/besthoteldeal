"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Building2, ArrowLeft } from "lucide-react";
import Link from "next/link";

const HOTEL_TYPES = ["hotel", "resort", "boutique_hotel", "villa", "apartment", "hostel", "guesthouse", "riad"];
const LISTING_TYPES = ["direct", "lead", "affiliate"];

export default function NewHotelPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name:                "",
    description:         "",
    city:                "",
    country:             "",
    address:             "",
    hotel_type:          "hotel",
    listing_type:        "direct",
    stars:               "",
    price_per_night_from: "",
    currency:            "USD",
    affiliate_url:       "",
    phone:               "",
    email:               "",
    website:             "",
    near_haram:          false,
    featured:            false,
  });

  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  function set(key: string, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setState("loading");
    setError("");

    try {
      const payload: Record<string, unknown> = {
        name:         form.name,
        description:  form.description || undefined,
        city:         form.city,
        country:      form.country || undefined,
        address:      form.address || undefined,
        hotel_type:   form.hotel_type,
        listing_type: form.listing_type,
        stars:        form.stars ? Number(form.stars) : undefined,
        price_per_night_from: form.price_per_night_from ? Number(form.price_per_night_from) : undefined,
        currency:     form.currency || "USD",
        phone:        form.phone || undefined,
        email:        form.email || undefined,
        website:      form.website || undefined,
        near_haram:   form.near_haram,
        featured:     false,
      };
      if (form.listing_type === "affiliate") {
        payload.affiliate_url = form.affiliate_url;
      }

      const res = await fetch("/api/hotels", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setState("error");
        setError(data.error || "Failed to create hotel.");
      } else {
        setState("success");
        router.push("/owner/hotels/");
      }
    } catch {
      setState("error");
      setError("Connection error. Try again.");
    }
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-navy-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all";
  const labelCls = "block text-xs font-semibold text-gray-700 mb-1";

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/owner/hotels/" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-lg font-black text-navy-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gold-500" />
            Add New Hotel
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Your listing will be reviewed before going live.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <h2 className="text-xs font-black text-navy-900 uppercase tracking-wider">Basic Information</h2>

          <div>
            <label className={labelCls}>Hotel Name *</label>
            <input
              className={inputCls}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Al Safwah Royale Orchid"
              required
            />
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea
              className={`${inputCls} resize-none`}
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Brief description of the hotel…"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>City *</label>
              <input
                className={inputCls}
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="e.g. Makkah"
                required
              />
            </div>
            <div>
              <label className={labelCls}>Country</label>
              <input
                className={inputCls}
                value={form.country}
                onChange={(e) => set("country", e.target.value)}
                placeholder="e.g. Saudi Arabia"
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Address</label>
            <input
              className={inputCls}
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="Street address"
            />
          </div>
        </div>

        {/* Type & Pricing */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <h2 className="text-xs font-black text-navy-900 uppercase tracking-wider">Type & Pricing</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Hotel Type</label>
              <select
                className={inputCls}
                value={form.hotel_type}
                onChange={(e) => set("hotel_type", e.target.value)}
              >
                {HOTEL_TYPES.map((t) => (
                  <option key={t} value={t}>{t.replace("_", " ")}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Listing Type</label>
              <select
                className={inputCls}
                value={form.listing_type}
                onChange={(e) => set("listing_type", e.target.value)}
              >
                {LISTING_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Stars</label>
              <select
                className={inputCls}
                value={form.stars}
                onChange={(e) => set("stars", e.target.value)}
              >
                <option value="">—</option>
                {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n} ★</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Price from / night</label>
              <input
                className={inputCls}
                type="number"
                min="0"
                value={form.price_per_night_from}
                onChange={(e) => set("price_per_night_from", e.target.value)}
                placeholder="150"
              />
            </div>
            <div>
              <label className={labelCls}>Currency</label>
              <select
                className={inputCls}
                value={form.currency}
                onChange={(e) => set("currency", e.target.value)}
              >
                {["USD", "SAR", "AED", "EUR", "GBP"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {form.listing_type === "affiliate" && (
            <div>
              <label className={labelCls}>Affiliate URL *</label>
              <input
                className={inputCls}
                type="url"
                value={form.affiliate_url}
                onChange={(e) => set("affiliate_url", e.target.value)}
                placeholder="https://booking.com/hotel/..."
                required={form.listing_type === "affiliate"}
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
              <input className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+966..." />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input className={inputCls} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="info@hotel.com" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Website</label>
            <input className={inputCls} type="url" value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://..." />
          </div>
        </div>

        {/* Flags */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.near_haram}
              onChange={(e) => set("near_haram", e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-gold-500 focus:ring-gold-400"
            />
            <span className="text-xs font-semibold text-gray-700">Near Haram (Makkah / Madinah)</span>
          </label>
        </div>

        {state === "error" && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <p className="text-red-600 text-xs font-medium">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={state === "loading" || !form.name || !form.city}
            className="flex-1 py-3 rounded-xl text-navy-950 font-black text-sm disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:scale-[1.01]"
            style={{ background: "linear-gradient(135deg, #d4a017, #efd466)" }}
          >
            {state === "loading" ? "Submitting…" : "Submit for Review"}
          </button>
          <Link
            href="/owner/hotels/"
            className="px-5 py-3 rounded-xl text-xs font-black bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors text-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
