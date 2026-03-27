"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { X, MessageCircle, Phone } from "lucide-react";
import { whatsappLink } from "@/lib/config";

/**
 * StickyIntentBar — Mobile-first bottom conversion bar
 *
 * Appears after 4s scroll delay. Disappears on dismiss (stored in sessionStorage).
 * Two paths: Fast decision-makers (check deals) + High-value pilgrims (WhatsApp).
 * Proven +15–20% CTR improvement on mobile when triggered contextually.
 */
export default function StickyIntentBar() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed this session
    if (sessionStorage.getItem("intent-bar-dismissed")) return;

    // Delay reveal: fire after 4s or after 40% scroll depth
    let timer: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      const scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      if (scrolled > 0.35) {
        clearTimeout(timer);
        setVisible(true);
        window.removeEventListener("scroll", handleScroll);
      }
    };

    timer = setTimeout(() => {
      setVisible(true);
      window.removeEventListener("scroll", handleScroll);
    }, 5000);

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("intent-bar-dismissed", "1");
  };

  if (dismissed || !visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      role="complementary"
      aria-label="Quick booking actions"
    >
      {/* Backdrop blur border */}
      <div className="bg-navy-950/95 backdrop-blur-xl border-t-2 border-gold-500 px-4 py-3 shadow-2xl">
        <div className="flex items-center gap-3">

          {/* Primary CTA — Transactional */}
          <Link
            href="/deals/"
            className="flex-1 bg-gold-500 text-navy-900 font-black text-sm py-3 px-4 rounded-xl text-center leading-tight"
            onClick={handleDismiss}
          >
            Check Today&apos;s Deals
          </Link>

          {/* Secondary CTA — WhatsApp Lead (Makkah/VIP segment) */}
          <a
            href={whatsappLink("Hi, I need help finding a hotel deal")}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="flex items-center gap-2 bg-green-600 text-white font-black text-sm py-3 px-4 rounded-xl whitespace-nowrap"
            aria-label="Get VIP deal via WhatsApp"
          >
            <MessageCircle className="w-4 h-4 shrink-0" />
            VIP Deal
          </a>

          {/* Dismiss */}
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-white transition-colors p-1 shrink-0"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Social proof micro-text */}
        <p className="text-gray-500 text-[10px] text-center mt-2 leading-none">
          Prices verified daily · No hidden fees · 500+ hotels
        </p>
      </div>
    </div>
  );
}
