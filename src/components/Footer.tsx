import Link from "next/link";
import NewsletterForm from "@/components/NewsletterForm";
import { MessageCircle } from "lucide-react";

const WA_NUMBER = "971500000000";
const waLink = (msg: string) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;

const footerLinks = {
  Destinations: [
    { label: "Dubai Hotels", href: "/city/dubai/" },
    { label: "Abu Dhabi Hotels", href: "/city/abu-dhabi/" },
    { label: "Makkah Hotels", href: "/city/makkah/" },
    { label: "Madinah Hotels", href: "/city/madinah/" },
    { label: "Riyadh Hotels", href: "/city/riyadh/" },
    { label: "Doha Hotels", href: "/city/doha/" },
    { label: "Muscat Hotels", href: "/city/muscat/" },
    { label: "Manama Hotels", href: "/city/manama/" },
  ],
  Countries: [
    { label: "UAE Hotels", href: "/country/uae/" },
    { label: "Saudi Arabia Hotels", href: "/country/saudi-arabia/" },
    { label: "Qatar Hotels", href: "/country/qatar/" },
    { label: "Bahrain Hotels", href: "/country/bahrain/" },
    { label: "Kuwait Hotels", href: "/country/kuwait/" },
    { label: "Oman Hotels", href: "/country/oman/" },
  ],
  "Top Deals": [
    { label: "All Hotel Deals", href: "/deals/" },
    { label: "Dubai Deal of the Day", href: "/deals/atlantis-palm-summer-deal-dubai/" },
    { label: "Makkah Ramadan Deals", href: "/deals/fairmont-makkah-ramadan-special/" },
    { label: "Doha Weekend Escapes", href: "/deals/st-regis-doha-weekend-escape/" },
    { label: "Emirates Palace Offer", href: "/deals/emirates-palace-abu-dhabi-staycation/" },
    { label: "Shangri-La Muscat Break", href: "/deals/shangri-la-muscat-beach-break/" },
  ],
  Blog: [
    { label: "Dubai Hotel Guide 2026", href: "/blog/best-hotel-deals-dubai-2026/" },
    { label: "Cheap Hotels Near Haram", href: "/blog/cheap-hotels-makkah-near-haram-2026/" },
    { label: "Hotels Near Masjid Nabawi", href: "/blog/hotels-near-masjid-nabawi-madinah-2026/" },
    { label: "Abu Dhabi Hotels Guide", href: "/blog/abu-dhabi-hotels-guide-2026/" },
    { label: "Ramadan Hotel Deals", href: "/blog/ramadan-hotel-deals-middle-east-2026/" },
    { label: "Doha Family Hotels", href: "/blog/doha-family-hotels-2026/" },
  ],
  "More Services": [
    { label: "Umrah & Hajj Packages", href: "/umrah/" },
    { label: "Airport Transfers", href: "/transfers/" },
    { label: "Flights (Coming Soon)", href: "/flights/" },
    { label: "Experiences (Coming Soon)", href: "/experiences/" },
  ],
  Company: [
    { label: "About Us", href: "/about/" },
    { label: "Our Ventures", href: "/ventures/" },
    { label: "List Your Hotel", href: "/partner/" },
    { label: "Careers", href: "/careers/" },
  ],
};

const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-12 border-b border-white/10">
          <div className="max-w-xs">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                <span className="text-navy-950 font-bold">BH</span>
              </div>
              <div>
                <div className="text-white font-bold text-xl leading-tight">
                  Best Hotel Deals
                </div>
                <div className="text-gold-400 text-xs uppercase tracking-widest">Daily</div>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your trusted source for the best hotel deals across the Middle East. Compare prices on Booking.com, Agoda, and Expedia — we find the best rates daily.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/deals/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-navy-950 font-bold text-sm transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #d4a017, #f5e699, #b8860b)" }}
            >
               View All Deals
            </Link>
            <Link
              href="/blog/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-white font-semibold text-sm border border-white/20 hover:border-gold-400 hover:text-gold-400 transition-all"
            >
               Travel Blog
            </Link>
          </div>
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-gold-400 font-semibold text-sm uppercase tracking-widest mb-4">
                {category}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors leading-relaxed"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Price Alert / Newsletter CTA */}
        <div className="py-10 border-t border-white/10">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-white font-display font-bold text-lg mb-2">
              Get Daily Deal Alerts
            </h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Join 5,000+ travelers who receive our best hotel deals every morning. Free, no spam — just the lowest rates across Dubai, Makkah, Doha and more.
            </p>
            <NewsletterForm />
            <p className="text-gray-600 text-[10px] mt-3">
              Unsubscribe anytime · No credit card required · Powered by Best Hotel Deals Daily
            </p>
          </div>
        </div>

        {/* Affiliate partners */}
        <div className="py-8 border-t border-white/10">
          <p className="text-center text-xs text-gray-500 mb-4 uppercase tracking-widest">
            We Compare Prices From
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {["Booking.com", "Agoda", "Expedia", "Hotels.com"].map((partner) => (
              <span
                key={partner}
                className="px-4 py-2 rounded-lg border border-white/10 text-sm text-gray-400 font-medium"
              >
                {partner}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* WhatsApp CTA Banner — above copyright */}
      <div className="border-t border-white/10 bg-[#075E54]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-[#25D366] rounded-full shadow-lg shadow-green-500/30 shrink-0">
              <MessageCircle className="w-5 h-5 text-white fill-current" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">Claim Today&apos;s Deal via WhatsApp</p>
              <p className="text-gray-400 text-[11px] leading-tight mt-0.5">Reply in under 2 minutes · Exclusive rates · No booking fees</p>
            </div>
          </div>
          <a
            href={waLink("Assalam o Alaikum! I want to claim today's best hotel deal.")}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-black text-sm rounded-full transition-all duration-300 shadow-lg hover:shadow-green-500/30 hover:scale-105 active:scale-95 whitespace-nowrap shrink-0"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            Chat &amp; Claim Now
          </a>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500 text-center md:text-left">
            © {currentYear} Best Hotel Deals Daily. All rights reserved.{" "}
            <span className="mx-2">·</span>
            <Link href="/" className="hover:text-gold-400 transition-colors">besthoteldealsdaily.com</Link>
          </p>
          <div className="flex items-center gap-4">
            <p className="text-xs text-gray-600 text-center max-w-md">
              <strong className="text-gray-500">Affiliate Disclosure:</strong> We earn a commission from qualifying bookings at no extra cost to you.
            </p>
            {/* WhatsApp icon — bottom-right */}
            <a
              href={waLink("Hi! I found your site and want to get the best hotel deal.")}
              target="_blank"
              rel="noopener noreferrer nofollow"
              aria-label="Contact us on WhatsApp"
              className="shrink-0 flex items-center justify-center w-9 h-9 bg-[#25D366] hover:bg-[#128C7E] rounded-full transition-all duration-300 hover:scale-110 shadow-md hover:shadow-green-500/40"
            >
              <MessageCircle className="w-5 h-5 text-white fill-current" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
