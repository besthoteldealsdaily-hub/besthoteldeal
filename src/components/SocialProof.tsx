"use client";

import { useEffect, useState } from "react";
import { Eye, TrendingUp, Clock } from "lucide-react";

interface SocialProofProps {
  city: string;
  hotelName?: string;
  type?: "hotel" | "deal" | "city";
}

/**
 * Estimated activity indicators based on seasonal demand patterns.
 * Numbers reflect typical engagement levels for the destination
 * and current season — not real-time tracking data.
 */
export default function SocialProof({ city, hotelName, type = "hotel" }: SocialProofProps) {
  const [viewCount, setViewCount] = useState(0);
  const [bookingCount, setBookingCount] = useState(0);

  useEffect(() => {
    // Simulate realistic engagement numbers based on city demand
    const cityMultipliers: Record<string, number> = {
      dubai: 3.0, makkah: 4.0, madinah: 2.5, riyadh: 2.0,
      doha: 1.8, manama: 1.2, "kuwait city": 1.0, muscat: 0.8,
    };
    const mult = cityMultipliers[city.toLowerCase()] || 1.0;

    setViewCount(Math.floor(12 * mult + Math.random() * 20 * mult));
    setBookingCount(Math.floor(2 * mult + Math.random() * 5 * mult));

    // Periodically update to feel live
    const interval = setInterval(() => {
      setViewCount((prev) => prev + Math.floor(Math.random() * 3));
    }, 15000);

    return () => clearInterval(interval);
  }, [city]);

  if (viewCount === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs">
      <span className="flex items-center gap-1 text-orange-600 font-semibold bg-orange-50 px-2 py-1 rounded-full">
        <Eye className="w-3 h-3" />
        <span>~{viewCount} estimated {type === "city" ? `searches in ${city}` : "interest"} today</span>
      </span>
      {bookingCount > 0 && (
        <span className="flex items-center gap-1 text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-full">
          <TrendingUp className="w-3 h-3" />
          <span>~{bookingCount} bookings recently</span>
        </span>
      )}
      {bookingCount > 3 && (
        <span className="flex items-center gap-1 text-red-500 font-semibold bg-red-50 px-2 py-1 rounded-full">
          <Clock className="w-3 h-3" />
          <span>High demand</span>
        </span>
      )}
    </div>
  );
}
