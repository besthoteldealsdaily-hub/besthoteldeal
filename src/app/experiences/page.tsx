import type { Metadata } from "next";
import Link from "next/link";
import { Compass, Bell, ArrowRight } from "lucide-react";
import { getCrossSellPlatforms } from "@/lib/ecosystem";

export const metadata: Metadata = {
  title: "Best Experience Deals Daily – Coming Soon | Tours & Activities in the Middle East",
  description:
    "Discover tours, activities, and local experiences across Dubai, Riyadh, Doha, and Muscat. Experience deals platform launching soon — sign up for early access.",
  alternates: { canonical: "https://besthoteldealsdaily.com/experiences/" },
  robots: { index: true, follow: true },
};

export default function ExperiencesPage() {
  const crossSell = getCrossSellPlatforms("experiences");

  return (
    <div className="min-h-screen bg-white pt-14">
      <div className="bg-amber-950 pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 rounded-full px-3 py-1 mb-6">
            <Compass className="w-3 h-3 text-amber-400" />
            <span className="text-amber-400 text-[10px] font-black uppercase tracking-widest">
              Coming Soon
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black text-white leading-tight mb-6">
            Best Experience Deals Daily
          </h1>
          <p className="text-gray-300 text-lg max-w-xl mx-auto leading-relaxed mb-8">
            Curated tours, activities, and local experiences across the Middle East.
            Desert safaris, cultural tours, dhow cruises, and more — all
            compared and verified.
          </p>

          {/* Early Access Signup */}
          <div className="max-w-md mx-auto">
            <form action="#" method="GET" className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
              />
              <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-3 rounded-xl font-bold text-sm transition-colors flex items-center gap-1.5 shrink-0">
                <Bell className="w-4 h-4" /> Notify Me
              </button>
            </form>
            <p className="text-gray-500 text-xs mt-3">Get notified when we launch. No spam.</p>
          </div>
        </div>
      </div>

      {/* What to Expect */}
      <div className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-black text-navy-900 mb-8 text-center">What to Expect</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { title: "Desert Adventures", desc: "Dubai desert safaris, quad biking, and overnight camping experiences." },
              { title: "Cultural Tours", desc: "Old Jeddah walks, Riyadh heritage sites, Doha souq tours, and historical city guides." },
              { title: "Water Activities", desc: "Dhow cruises in Doha, yacht tours in Dubai, and diving in Muscat." },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <h3 className="font-bold text-navy-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cross-Sell */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-xl font-black text-navy-900 mb-6">Browse Our Live Platforms</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {crossSell.map((p) => (
              <Link key={p.id} href={p.href} className="bg-white hover:bg-gray-50 rounded-xl border border-gray-100 p-5 text-left transition-colors group">
                <h3 className="font-bold text-navy-900 text-sm group-hover:text-gold-600 transition-colors mb-1 flex items-center justify-between">
                  {p.name} <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gold-500" />
                </h3>
                <p className="text-gray-500 text-xs">{p.tagline}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
