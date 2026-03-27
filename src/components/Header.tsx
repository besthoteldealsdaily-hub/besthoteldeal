"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Flame } from "lucide-react";

const brandMessages = [
  "Best Hotel Deals Updated Daily — Compare & Save Up To 50%",
  "500+ Verified Hotels Across Dubai, Makkah, Doha & More",
  "Trusted by Thousands — Middle East's Hotel Deal Experts",
  "Prices Compared on Booking.com, Agoda & Expedia Daily",
  "Best Hotel Deals Daily — Your Middle East Travel Companion",
];

const navItems = [
  { label: "Home", href: "/" },
  {
    label: "Deals",
    href: "/deals/",
  },
  {
    label: "Countries",
    href: "#",
    children: [
      { label: "UAE", href: "/country/uae/" },
      { label: "Saudi Arabia", href: "/country/saudi-arabia/" },
      { label: "Qatar", href: "/country/qatar/" },
      { label: "Bahrain", href: "/country/bahrain/" },
      { label: "Kuwait", href: "/country/kuwait/" },
      { label: "Oman", href: "/country/oman/" },
    ],
  },
  {
    label: "Cities",
    href: "#",
    children: [
      { label: "Dubai", href: "/city/dubai/" },
      { label: "Abu Dhabi", href: "/city/abu-dhabi/" },
      { label: "Makkah", href: "/city/makkah/" },
      { label: "Madinah", href: "/city/madinah/" },
      { label: "Riyadh", href: "/city/riyadh/" },
      { label: "Doha", href: "/city/doha/" },
      { label: "Muscat", href: "/city/muscat/" },
      { label: "Manama", href: "/city/manama/" },
    ],
  },
  { label: "Blog", href: "/blog/" },
  {
    label: "More",
    href: "#",
    children: [
      { label: "Umrah & Hajj Packages", href: "/umrah/" },
      { label: "Airport Transfers", href: "/transfers/" },
      { label: "Our Ventures", href: "/ventures/" },
    ],
  },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % brandMessages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-navy-900/95 backdrop-blur-md shadow-2xl"
          : "bg-navy-950/80 backdrop-blur-sm"
      }`}
    >
      {/* Top bar */}
      <div className="bg-gold-600 text-navy-950 text-xs text-center py-1 px-4 font-semibold tracking-wide transition-opacity duration-500">
        {brandMessages[messageIndex]}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg">
              <span className="text-navy-950 font-black text-xs">BH</span>
            </div>
            <div className="hidden sm:block">
              <div className="text-white font-black text-sm leading-tight group-hover:text-gold-400 transition-colors tracking-tight">
                Best Hotel Deals
              </div>
              <div className="text-gold-400 text-[10px] leading-none tracking-[0.2em] uppercase font-bold">
                Daily
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.children && setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-1 px-3 py-1.5 text-gray-200 hover:text-gold-400 text-xs font-bold transition-colors rounded-lg hover:bg-white/5"
                >
                  {item.label}
                  {item.children && (
                    <svg className="w-3 h-3 mt-0.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </Link>

                {/* Dropdown */}
                {item.children && activeDropdown === item.label && (
                  <div className="absolute top-full left-0 mt-0 w-48 bg-navy-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2 text-xs font-bold text-gray-300 hover:text-gold-400 hover:bg-white/5 transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/deals/"
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-navy-950 text-xs font-black transition-all duration-300 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #d4a017, #efd466)",
              }}
            >
              <Flame className="w-3 h-3" /> Latest Deals
            </Link>

            <button
              className="lg:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-white/10 py-4 space-y-1">
            {navItems.map((item) => (
              <div key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 text-gray-200 hover:text-gold-400 font-medium text-sm transition-colors"
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="pl-6 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setMobileOpen(false)}
                        className="block px-4 py-2 text-gray-400 hover:text-gold-400 text-sm transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-3 px-4">
              <Link
                href="/deals/"
                onClick={() => setMobileOpen(false)}
                className="block text-center py-3 rounded-full text-navy-950 font-bold text-sm"
                style={{ background: "linear-gradient(135deg, #d4a017, #f5e699, #b8860b)" }}
              >
                <Flame className="w-3 h-3 border" /> Check Latest Deals
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
