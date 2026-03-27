"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export interface CompareHotel {
  id:          string;
  slug:        string;
  name:        string;
  city:        string;
  stars:       number;
  priceFrom:   number;
  currency:    string;
  rating:      number;
  image:       string;
  listingType: string;
}

interface CompareCtx {
  list:       CompareHotel[];
  add:        (h: CompareHotel) => void;
  remove:     (slug: string)   => void;
  clear:      ()               => void;
  has:        (slug: string)   => boolean;
  compareUrl: string;
}

const Ctx = createContext<CompareCtx>({
  list: [], add: () => {}, remove: () => {}, clear: () => {}, has: () => false, compareUrl: "/compare/",
});

const LS_KEY = "bhdd_compare";
const MAX    = 3;

export function CompareProvider({ children }: { children: ReactNode }) {
  const [list, setList] = useState<CompareHotel[]>([]);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setList(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const persist = useCallback((next: CompareHotel[]) => {
    setList(next);
    try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }, []);

  const add    = useCallback((h: CompareHotel) => {
    setList((prev) => {
      if (prev.length >= MAX || prev.some((x) => x.slug === h.slug)) return prev;
      const next = [...prev, h];
      try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const remove = useCallback((slug: string) => persist(list.filter((h) => h.slug !== slug)), [list, persist]);
  const clear  = useCallback(()              => persist([]), [persist]);
  const has    = useCallback((slug: string)  => list.some((h) => h.slug === slug), [list]);

  const compareUrl = `/compare/?h=${list.map((h) => h.slug).join("&h=")}`;

  return (
    <Ctx.Provider value={{ list, add, remove, clear, has, compareUrl }}>
      {children}
    </Ctx.Provider>
  );
}

export const useCompare = () => useContext(Ctx);
