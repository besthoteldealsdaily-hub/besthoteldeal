"use client";

import { useCompare, CompareHotel } from "@/context/CompareContext";
import { GitCompareArrows, Check, X } from "lucide-react";

interface Props {
  hotel: CompareHotel;
  size?: "sm" | "md";
}

export default function AddToCompare({ hotel, size = "sm" }: Props) {
  const { has, add, remove, list } = useCompare();
  const inList = has(hotel.slug);
  const full   = list.length >= 3 && !inList;

  if (full) return null;

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        inList ? remove(hotel.slug) : add(hotel);
      }}
      title={inList ? "Remove from comparison" : "Add to comparison"}
      className={
        size === "sm"
          ? `inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider border rounded-lg px-2 py-1 transition-colors ${
              inList
                ? "bg-gold-50 border-gold-200 text-gold-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                : "bg-white border-gray-200 text-gray-500 hover:border-gold-300 hover:text-gold-600"
            }`
          : `inline-flex items-center gap-1.5 text-xs font-black border rounded-xl px-3 py-2 transition-colors ${
              inList
                ? "bg-gold-50 border-gold-200 text-gold-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                : "bg-white border-gray-200 text-gray-600 hover:border-gold-300 hover:text-gold-600"
            }`
      }
    >
      {inList ? (
        <><Check className="w-3 h-3" /> Comparing</>
      ) : (
        <><GitCompareArrows className="w-3 h-3" /> Compare</>
      )}
    </button>
  );
}
