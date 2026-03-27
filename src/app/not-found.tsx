import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found – 404 | Best Hotel Deals Daily",
  description: "The page you are looking for doesn't exist. Browse our hotel deals or explore destinations.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
      <div className="max-w-lg mx-auto px-4 text-center">
        <div className="font-display text-9xl font-bold text-gold-gradient mb-6">404</div>
        <h1 className="font-display text-3xl font-bold text-navy-900 mb-4">
          Page Not Found
        </h1>
        <p className="text-gray-500 mb-10 leading-relaxed">
          Oops! The page you&apos;re looking for doesn&apos;t exist. It might have been moved or the URL may be incorrect.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-gold">
             Back to Home
          </Link>
          <Link href="/deals/" className="btn-navy">
             View Hotel Deals
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          {[
            { label: "Dubai Hotels", href: "/city/dubai/" },
            { label: "Makkah Hotels", href: "/city/makkah/" },
            { label: "Doha Hotels", href: "/city/doha/" },
            { label: "Bahrain Hotels", href: "/city/manama/" },
            { label: "Riyadh Hotels", href: "/city/riyadh/" },
            { label: "Travel Blog", href: "/blog/" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="py-2 px-3 bg-white border border-gray-200 rounded-xl text-gray-600 hover:border-gold-400 hover:text-gold-600 transition-all"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
