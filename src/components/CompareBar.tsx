"use client";

import { useCompare } from "@/context/CompareContext";
import { useRouter } from "next/navigation";
import { X, GitCompareArrows, Trash2 } from "lucide-react";
import Image from "next/image";

export default function CompareBar() {
  const { list, remove, clear, compareUrl } = useCompare();
  const router = useRouter();

  if (list.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="pointer-events-auto w-full max-w-3xl mx-4 mb-4 bg-navy-950 rounded-2xl border border-white/10 shadow-2xl">
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Label */}
          <div className="shrink-0">
            <div className="text-[9px] text-gold-400 font-black uppercase tracking-widest">Compare</div>
            <div className="text-white text-xs font-bold">{list.length} / 3 hotels</div>
          </div>

          {/* Hotel chips */}
          <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-none">
            {list.map((h) => (
              <div
                key={h.slug}
                className="flex items-center gap-2 bg-white/10 rounded-xl px-2.5 py-1.5 shrink-0 group"
              >
                <div className="relative w-7 h-7 rounded-lg overflow-hidden shrink-0">
                  <Image src={h.image} alt={h.name} fill className="object-cover" sizes="28px" />
                </div>
                <div>
                  <div className="text-white text-[10px] font-bold leading-tight max-w-[100px] truncate">{h.name}</div>
                  <div className="text-white/50 text-[9px] capitalize">{h.city}</div>
                </div>
                <button
                  onClick={() => remove(h.slug)}
                  className="text-white/30 hover:text-red-400 transition-colors ml-1"
                  aria-label={`Remove ${h.name}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {/* Empty slots */}
            {Array.from({ length: 3 - list.length }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-2 border border-dashed border-white/20 rounded-xl px-4 py-1.5 shrink-0 text-[10px] text-white/30"
              >
                + Add hotel
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={clear}
              className="p-2 text-white/40 hover:text-white/80 transition-colors"
              aria-label="Clear comparison"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => router.push(compareUrl)}
              disabled={list.length < 2}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-navy-950 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-[1.03] disabled:hover:scale-100"
              style={list.length >= 2 ? { background: "linear-gradient(135deg,#d4a017,#efd466)" } : { background: "#333" }}
            >
              <GitCompareArrows className="w-3.5 h-3.5" />
              Compare Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
