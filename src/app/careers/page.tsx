import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, MapPin, ArrowRight, Rocket, Globe, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Careers – Join Best Deals Daily | Middle East Travel Platform",
  description:
    "Join the team building the Middle East's leading travel platform ecosystem. We're hiring content operations, partnerships, and growth marketing roles.",
  alternates: { canonical: "https://besthoteldealsdaily.com/careers/" },
  robots: { index: true, follow: true },
};

const openRoles = [
  {
    title: "Content Operations Manager",
    type: "Full-time",
    location: "Remote (MENA timezone)",
    description:
      "Scale our content engine from 70 to 500+ pages. Manage hotel data pipelines, editorial calendars, and content automation. You'll own the programmatic SEO output across all verticals.",
    requirements: [
      "3+ years in content operations or SEO at scale",
      "Experience with programmatic content generation",
      "Familiarity with Middle East travel market",
      "Strong data management skills (spreadsheets, APIs, CMS)",
    ],
  },
  {
    title: "Partnerships Lead – Hotels & Travel Operators",
    type: "Full-time",
    location: "Dubai or Riyadh preferred",
    description:
      "Acquire hotel partners and Umrah operators across UAE, Saudi Arabia, and Qatar. Negotiate direct listing agreements, commission structures, and co-marketing deals.",
    requirements: [
      "3+ years in travel industry partnerships or BD",
      "Existing network in Middle East hospitality sector",
      "Experience with affiliate programs and commission models",
      "Arabic + English fluency",
    ],
  },
  {
    title: "Growth Marketer",
    type: "Full-time",
    location: "Remote (MENA timezone)",
    description:
      "Own organic traffic growth, paid acquisition testing, and retention loops across all platforms. Optimize CAC and LTV metrics while scaling from niche to market leadership.",
    requirements: [
      "3+ years in growth/performance marketing",
      "Deep SEO knowledge (technical + content)",
      "Experience with analytics tools and attribution",
      "Travel or marketplace experience preferred",
    ],
  },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-white pt-14">
      {/* Hero */}
      <div className="bg-navy-950 pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-gold-500/15 border border-gold-500/30 rounded-full px-3 py-1 mb-6">
            <Briefcase className="w-3 h-3 text-gold-400" />
            <span className="text-gold-400 text-[10px] font-black uppercase tracking-widest">
              Careers
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black text-white leading-tight mb-6">
            Build the Future of Middle East Travel
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
            We&apos;re a small team building a big platform. Join us to shape the
            travel ecosystem for the world&apos;s fastest-growing tourism market.
          </p>
        </div>
      </div>

      {/* Why Join */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Rocket className="w-6 h-6" />,
                title: "Early Stage Impact",
                desc: "Join at the ground floor. Every team member shapes the product, strategy, and culture. Your decisions matter from day one.",
              },
              {
                icon: <Globe className="w-6 h-6" />,
                title: "High-Growth Market",
                desc: "$133B travel market growing at 8-12% annually. Saudi Vision 2030, Dubai tourism boom, and religious tourism expansion create massive tailwinds.",
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: "Remote-First Culture",
                desc: "Work from anywhere in the MENA timezone. Results-driven environment with async communication and quarterly in-person team meetups.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center">
                <div className="w-14 h-14 bg-navy-50 rounded-2xl flex items-center justify-center text-navy-900 mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="font-bold text-navy-900 text-lg mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Open Roles */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-black text-navy-900 mb-8 text-center">
            Open Roles
          </h2>
          <div className="space-y-6">
            {openRoles.map((role) => (
              <div key={role.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-display text-xl font-black text-navy-900">{role.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-2">
                      <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {role.type}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {role.location}</span>
                    </div>
                  </div>
                  <a
                    href={`mailto:careers@besthoteldealsdaily.com?subject=Application: ${role.title}`}
                    className="btn-gold shrink-0 text-sm"
                  >
                    Apply Now <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{role.description}</p>
                <div>
                  <h4 className="text-xs font-black text-navy-900 uppercase tracking-widest mb-2">Requirements</h4>
                  <ul className="space-y-1">
                    {role.requirements.map((req) => (
                      <li key={req} className="text-sm text-gray-500 flex items-start gap-2">
                        <span className="text-gold-500 mt-1">•</span> {req}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* General Application */}
      <div className="bg-navy-950 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-2xl font-bold text-white mb-4">
            Don&apos;t See Your Role?
          </h2>
          <p className="text-gray-400 mb-6">
            We&apos;re always looking for talented people passionate about travel and technology.
            Send us your resume and tell us how you&apos;d contribute.
          </p>
          <a href="mailto:careers@besthoteldealsdaily.com" className="btn-gold">
            Send General Application
          </a>
        </div>
      </div>
    </div>
  );
}
