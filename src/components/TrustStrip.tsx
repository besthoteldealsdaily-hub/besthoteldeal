import { ShieldCheck, RefreshCw, Star, HeadphonesIcon } from "lucide-react";

/**
 * TrustStrip — Sitewide authority bar (rendered server-side)
 * Placed below the hero on every page to immediately anchor trust signals.
 * Reduces bounce rate by confirming platform legitimacy above the fold.
 */
export default function TrustStrip() {
  const signals = [
    {
      icon: <ShieldCheck className="w-4 h-4 text-green-400" />,
      text: "Verified Listings",
      sub: "All properties authenticated",
    },
    {
      icon: <RefreshCw className="w-4 h-4 text-blue-400" />,
      text: "Daily Price Updates",
      sub: "Rates refreshed every 24hrs",
    },
    {
      icon: <Star className="w-4 h-4 text-gold-400" />,
      text: "500+ Properties",
      sub: "Across 5 Middle East countries",
    },
    {
      icon: <HeadphonesIcon className="w-4 h-4 text-purple-400" />,
      text: "VIP Booking Assistance",
      sub: "Direct WhatsApp support",
    },
  ];

  return (
    <div className="bg-navy-900 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5">
          {signals.map((s) => (
            <div
              key={s.text}
              className="flex items-center gap-3 py-3 px-4"
            >
              <div className="shrink-0">{s.icon}</div>
              <div>
                <div className="text-white font-bold text-[11px] leading-none">{s.text}</div>
                <div className="text-gray-500 text-[9px] mt-0.5 leading-none">{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
