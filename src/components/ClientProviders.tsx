"use client";

import { CompareProvider } from "@/context/CompareContext";
import CompareBar from "@/components/CompareBar";
import { ReactNode } from "react";

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <CompareProvider>
      {children}
      <CompareBar />
    </CompareProvider>
  );
}
