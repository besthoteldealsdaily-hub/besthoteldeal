"use client";

import { useState } from "react";
import { Bell, CheckCircle, Loader2 } from "lucide-react";

interface PriceAlertSignupProps {
  city: string;
  hotelSlug?: string;
  currency?: string;
  compact?: boolean;
}

/**
 * Price alert subscription widget.
 * Users enter email + optional max price to get notified on drops.
 * Appears on city pages and deal pages as a conversion tool.
 */
export default function PriceAlertSignup({ city, hotelSlug, currency = "USD", compact = false }: PriceAlertSignupProps) {
  const [email, setEmail] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          city,
          hotelSlug,
          maxPrice: maxPrice ? parseInt(maxPrice, 10) : null,
          currency,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-2xl ${compact ? "p-4" : "p-6"} text-center`}>
        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
        <div className="text-green-800 font-bold text-sm">Price Alert Set!</div>
        <p className="text-green-600 text-xs mt-1">
          We&apos;ll email you when prices drop in {city}.
        </p>
      </div>
    );
  }

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="bg-gold-50 border border-gold-200 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-4 h-4 text-gold-600" />
          <span className="text-xs font-black text-navy-900 uppercase tracking-wider">Price Drop Alert</span>
        </div>
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            required
            className="flex-1 text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold-400"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-gold-500 hover:bg-gold-600 text-navy-950 text-xs font-bold px-3 py-2 rounded-lg transition-colors shrink-0 flex items-center gap-1"
          >
            {status === "loading" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bell className="w-3 h-3" />}
            Alert Me
          </button>
        </div>
        {status === "error" && <p className="text-red-500 text-[10px] mt-1">Something went wrong. Try again.</p>}
      </form>
    );
  }

  return (
    <div className="bg-gradient-to-br from-navy-950 to-navy-900 rounded-2xl p-6 text-white">
      <div className="flex items-center gap-2 mb-2">
        <Bell className="w-5 h-5 text-gold-400" />
        <h3 className="text-sm font-black uppercase tracking-wider">Get Price Drop Alerts</h3>
      </div>
      <p className="text-gray-400 text-xs mb-4">
        Set your budget and we&apos;ll notify you when hotel prices in {city} drop below your target.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="w-full text-sm px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-gold-400 transition-colors"
        />
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">{currency}</span>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max price/night"
              className="w-full text-sm pl-12 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-gold-400 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="px-5 py-2.5 rounded-xl text-navy-950 font-black text-sm shrink-0 transition-all hover:scale-105 flex items-center gap-1.5"
            style={{ background: "linear-gradient(135deg, #d4a017, #efd466)" }}
          >
            {status === "loading" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Bell className="w-4 h-4" /> Set Alert
              </>
            )}
          </button>
        </div>
        {status === "error" && <p className="text-red-400 text-xs">Something went wrong. Please try again.</p>}
      </form>
      <p className="text-gray-600 text-[9px] mt-3 text-center">
        Free · No spam · Unsubscribe anytime
      </p>
    </div>
  );
}
