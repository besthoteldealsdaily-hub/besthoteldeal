import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Users, TrendingUp, ShieldCheck, Globe, Zap } from "lucide-react";
import PartnerFormClient from "./PartnerFormClient";

export const metadata: Metadata = {
  title: "List Your Hotel – Partner With Best Hotel Deals Daily",
  description:
    "Reach thousands of high-intent travelers searching for hotels in Dubai, Makkah, Doha, Riyadh and across the Middle East. List your property for free.",
  alternates: { canonical: "https://besthoteldealsdaily.com/partner/" },
  robots: { index: true, follow: true },
};

export default function PartnerPage() {
  const benefits = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "High-Intent Traffic",
      description:
        "Our visitors are actively searching for hotels in specific cities. They arrive ready to compare and book — not just browse.",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Consistent Lead Flow",
      description:
        "Receive qualified booking inquiries directly. Our platform connects you with travelers who have already narrowed their search to your city and category.",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Regional Visibility",
      description:
        "Appear in city pages, landmark pages, collection pages, and deal listings — multiple touchpoints that keep your property visible throughout the user journey.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "Verified Badge",
      description:
        "Listed properties receive a 'Verified' badge that signals trust and quality to users, improving click-through and booking rates.",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Direct Booking Channel",
      description:
        "Skip the OTA commissions. Our direct booking system connects guests directly with your front desk — no middleman fees.",
    },
    {
      icon: <Building2 className="w-6 h-6" />,
      title: "Simple Onboarding",
      description:
        "Submit your property details and our team handles the rest. No technical setup required. Most properties go live within 48 hours.",
    },
  ];

  return (
    <div className="min-h-screen bg-white pt-14">
      {/* Hero */}
      <div className="bg-navy-950 pt-20 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-gold-500/15 border border-gold-500/30 rounded-full px-3 py-1 mb-6">
            <Building2 className="w-3 h-3 text-gold-400" />
            <span className="text-gold-400 text-[10px] font-black uppercase tracking-widest">
              Hotel Partners
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black text-white leading-tight mb-6">
            List Your Hotel on{" "}
            <span className="text-gold-gradient">Best Hotel Deals Daily</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Reach thousands of travelers actively searching for hotels in the
            Middle East. Free to list. No upfront costs. Start receiving
            qualified inquiries within days.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-white text-sm font-bold">
            <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
              500+ Hotels Listed
            </span>
            <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
              8 Cities Covered
            </span>
            <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
              Daily Price Updates
            </span>
          </div>
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-black text-navy-900 mb-4">
              Why Hotels Choose Us
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              We focus exclusively on the Middle East hotel market. That
              specialization means better-qualified traffic for your property.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm"
              >
                <div className="w-12 h-12 bg-navy-50 rounded-2xl flex items-center justify-center text-navy-900 mb-4">
                  {b.icon}
                </div>
                <h3 className="font-bold text-navy-900 text-lg mb-2">
                  {b.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {b.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-black text-navy-900 mb-4">
              How It Works
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                num: "01",
                title: "Submit Your Property",
                desc: "Fill in your hotel details below. Include photos, room types, and pricing.",
              },
              {
                num: "02",
                title: "We Verify & Publish",
                desc: "Our team reviews your listing for quality and accuracy. Most properties go live within 48 hours.",
              },
              {
                num: "03",
                title: "Receive Bookings",
                desc: "Start receiving qualified booking inquiries from travelers actively searching for hotels in your city.",
              },
            ].map((s) => (
              <div key={s.num} className="text-center">
                <div className="text-gold-400 font-black text-4xl mb-4 font-display">
                  {s.num}
                </div>
                <h3 className="font-bold text-navy-900 text-lg mb-2">
                  {s.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Partner Application Form */}
      <div className="py-20 bg-gray-50" id="apply">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-black text-navy-900 mb-4">
              List Your Property
            </h2>
            <p className="text-gray-500">
              Fill in the details below and our partnerships team will be in
              touch within 24 hours.
            </p>
          </div>
          <PartnerFormClient />
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-navy-950 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-2xl font-bold text-white mb-4">
            Questions About Listing?
          </h2>
          <p className="text-gray-400 mb-6">
            Contact our partnerships team at{" "}
            <a
              href="mailto:partners@besthoteldealsdaily.com"
              className="text-gold-400 hover:underline"
            >
              partners@besthoteldealsdaily.com
            </a>
          </p>
          <Link href="/" className="btn-gold">
            Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
