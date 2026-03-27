"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin/";

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [state, setState]       = useState<"idle" | "loading" | "error">("idle");
  const [error, setError]       = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || !password) return;

    setState("loading");
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        router.push(next);
        router.refresh();
      } else {
        setState("error");
        setError(data.error || "Invalid credentials");
      }
    } catch {
      setState("error");
      setError("Connection error. Try again.");
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
      <h1 className="text-xl font-black text-navy-900 mb-1">Sign in</h1>
      <p className="text-sm text-gray-500 mb-6">Enter your admin credentials to continue.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            required
            disabled={state === "loading"}
            autoFocus
            autoComplete="email"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-navy-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all disabled:opacity-60"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={state === "loading"}
            autoComplete="current-password"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-navy-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all disabled:opacity-60"
          />
        </div>

        {state === "error" && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={state === "loading" || !email || !password}
          className="w-full py-3 rounded-xl text-navy-950 font-black text-sm transition-all hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{ background: "linear-gradient(135deg, #d4a017, #efd466)" }}
        >
          {state === "loading" ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
            <span className="text-navy-950 font-bold text-sm">BH</span>
          </div>
          <div>
            <div className="text-navy-900 font-bold text-lg leading-tight">Best Hotel Deals</div>
            <div className="text-gold-600 text-xs uppercase tracking-widest">Admin</div>
          </div>
        </div>

        <Suspense fallback={<div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 animate-pulse h-64" />}>
          <LoginForm />
        </Suspense>

        <p className="text-center text-xs text-gray-400 mt-6">
          Best Hotel Deals Daily · Admin Access
        </p>
      </div>
    </div>
  );
}
