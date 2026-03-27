"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, CheckCircle, Building2 } from "lucide-react";

const perks = [
  "Free to list — no setup fees",
  "Receive direct booking requests",
  "Get warm lead inquiries",
  "Owner dashboard & analytics",
  "Verified hotel badge",
  "Expert support team",
];

function RegisterForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: "",
    email:    "",
    phone:    "",
    password: "",
  });
  const [showPw,  setShowPw]  = useState(false);
  const [state,   setState]   = useState<"idle" | "loading" | "error">("idle");
  const [error,   setError]   = useState("");

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  const pwStrength = (() => {
    const p = form.password;
    if (!p)       return null;
    if (p.length < 6)  return { level: 0, label: "Too short", color: "bg-red-400" };
    if (p.length < 8)  return { level: 1, label: "Weak",      color: "bg-orange-400" };
    const has = (re: RegExp) => re.test(p);
    const score = [has(/[A-Z]/), has(/[0-9]/), has(/[^a-z0-9]/i)].filter(Boolean).length;
    if (score === 0) return { level: 1, label: "Weak",   color: "bg-orange-400" };
    if (score === 1) return { level: 2, label: "Fair",   color: "bg-yellow-400" };
    if (score === 2) return { level: 3, label: "Good",   color: "bg-lime-500"   };
    return            { level: 4, label: "Strong", color: "bg-emerald-500" };
  })();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.password) return;
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }

    setState("loading");
    setError("");

    try {
      const res  = await fetch("/api/auth/signup", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          fullName: form.fullName.trim(),
          email:    form.email.trim(),
          phone:    form.phone.trim() || undefined,
          password: form.password,
          role:     "hotel_owner",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setState("error");
        setError(data.error ?? "Registration failed. Please try again.");
        return;
      }

      if (data.confirmed) {
        // Session available — go straight to onboarding
        router.push("/owner/onboard/");
      } else {
        // Email confirmation required
        router.push("/owner/register/confirm/?email=" + encodeURIComponent(form.email));
      }
    } catch {
      setState("error");
      setError("Connection error. Please try again.");
    }
  }

  const inputCls =
    "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-navy-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all disabled:opacity-60";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name *</label>
        <input
          className={inputCls}
          value={form.fullName}
          onChange={(e) => set("fullName", e.target.value)}
          placeholder="Your full name"
          autoFocus
          required
          disabled={state === "loading"}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Address *</label>
        <input
          className={inputCls}
          type="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder="owner@hotel.com"
          required
          disabled={state === "loading"}
          autoComplete="email"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Phone / WhatsApp
          <span className="text-gray-400 font-normal ml-1">(optional — for booking notifications)</span>
        </label>
        <input
          className={inputCls}
          type="tel"
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
          placeholder="+966 50 000 0000"
          disabled={state === "loading"}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Password *</label>
        <div className="relative">
          <input
            className={inputCls}
            type={showPw ? "text" : "password"}
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            placeholder="Min. 8 characters"
            required
            minLength={8}
            disabled={state === "loading"}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex={-1}
          >
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {/* Strength bar */}
        {pwStrength && (
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${pwStrength.color}`}
                style={{ width: `${(pwStrength.level / 4) * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-400 font-semibold shrink-0">{pwStrength.label}</span>
          </div>
        )}
      </div>

      {state === "error" && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <p className="text-red-600 text-xs font-medium">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={state === "loading" || !form.fullName || !form.email || form.password.length < 8}
        className="w-full py-3.5 rounded-xl font-black text-sm text-navy-950 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:scale-[1.01] disabled:hover:scale-100"
        style={{ background: "linear-gradient(135deg,#d4a017,#efd466)" }}
      >
        {state === "loading" ? (
          <><span className="w-4 h-4 border-2 border-navy-950/30 border-t-navy-950 rounded-full animate-spin" />Creating Account…</>
        ) : (
          <>Create Free Account <ArrowRight className="w-4 h-4" /></>
        )}
      </button>

      <p className="text-[10px] text-gray-400 text-center">
        By registering you agree to our{" "}
        <Link href="/about/" className="text-gold-600 hover:underline">Terms of Service</Link>.
        No credit card required.
      </p>
    </form>
  );
}

export default function OwnerRegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ── LEFT: Benefits panel (desktop) ────────────────────── */}
      <div className="hidden lg:flex w-[420px] shrink-0 bg-navy-950 flex-col p-10">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-12">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-navy-950 font-black text-sm"
            style={{ background: "linear-gradient(135deg,#d4a017,#efd466)" }}
          >
            BH
          </div>
          <div>
            <div className="text-white text-sm font-black leading-tight">Best Hotel Deals Daily</div>
            <div className="text-gold-400 text-[10px] uppercase tracking-widest">Hotel Owner</div>
          </div>
        </div>

        <div className="flex-1">
          <h2 className="text-2xl font-black text-white leading-tight mb-4">
            Join the Middle East's fastest-growing hotel platform
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            Thousands of travelers search for hotels across Dubai, Makkah, Doha, and beyond every day. List your property and start receiving bookings.
          </p>

          <div className="space-y-3">
            {perks.map((p) => (
              <div key={p} className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-gold-400 shrink-0" />
                <span className="text-sm text-gray-300 font-medium">{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quote */}
        <div className="mt-10 bg-white/5 border border-white/10 rounded-2xl p-5">
          <p className="text-white/70 text-xs italic leading-relaxed mb-3">
            "We started receiving booking requests within 48 hours of our listing going live. The process was simple and the team was very supportive."
          </p>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gold-400/20 flex items-center justify-center text-gold-400 text-[10px] font-black">
              SA
            </div>
            <div className="text-white/50 text-[10px]">Hotel Owner, Makkah</div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Form ────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-3 mb-8 lg:hidden">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-navy-950 font-black text-sm"
              style={{ background: "linear-gradient(135deg,#d4a017,#efd466)" }}
            >
              BH
            </div>
            <div>
              <div className="text-navy-900 text-sm font-black leading-tight">Best Hotel Deals Daily</div>
              <div className="text-gold-600 text-[10px] uppercase tracking-widest">Hotel Owner</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-7">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-5 h-5 text-gold-500" />
              <h1 className="text-lg font-black text-navy-900">Create Your Account</h1>
            </div>
            <p className="text-xs text-gray-500 mb-6">
              Already have an account?{" "}
              <Link href="/owner/login/" className="text-gold-600 font-semibold hover:underline">Sign in</Link>
            </p>

            <Suspense>
              <RegisterForm />
            </Suspense>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            Want to see the platform first?{" "}
            <Link href="/partner/" className="text-gold-600 font-semibold hover:underline">
              Learn more →
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}
