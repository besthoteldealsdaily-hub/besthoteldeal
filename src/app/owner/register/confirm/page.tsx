"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowRight, RefreshCw } from "lucide-react";
import { useState } from "react";

function ConfirmContent() {
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const [resent, setResent] = useState(false);
  const [sending, setSending] = useState(false);

  async function resend() {
    if (!email || sending) return;
    setSending(true);
    try {
      await fetch("/api/auth/resend-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setResent(true);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
        style={{ background: "linear-gradient(135deg,#d4a017,#efd466)" }}
      >
        <Mail className="w-8 h-8 text-navy-950" />
      </div>

      <h1 className="text-2xl font-black text-navy-900 mb-3">Check your email</h1>
      <p className="text-sm text-gray-500 leading-relaxed mb-2">
        We sent a confirmation link to
      </p>
      {email && (
        <p className="text-sm font-black text-navy-900 mb-6">{email}</p>
      )}
      <p className="text-sm text-gray-500 leading-relaxed mb-8">
        Click the link in the email to verify your account, then you can log in and complete your hotel listing.
      </p>

      <div className="space-y-3">
        <Link
          href="/owner/login/"
          className="w-full py-3.5 rounded-xl font-black text-sm text-navy-950 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
          style={{ background: "linear-gradient(135deg,#d4a017,#efd466)" }}
        >
          Go to Login <ArrowRight className="w-4 h-4" />
        </Link>

        {!resent ? (
          <button
            onClick={resend}
            disabled={sending}
            className="w-full py-3 rounded-xl font-semibold text-sm text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {sending ? (
              <><span className="w-4 h-4 border-2 border-gray-400/30 border-t-gray-500 rounded-full animate-spin" />Sending…</>
            ) : (
              <><RefreshCw className="w-4 h-4" />Resend confirmation email</>
            )}
          </button>
        ) : (
          <p className="text-xs text-emerald-600 font-semibold py-2">
            ✓ Confirmation email resent. Check your inbox (and spam folder).
          </p>
        )}
      </div>

      <p className="text-[10px] text-gray-400 mt-8">
        Wrong email?{" "}
        <Link href="/owner/register/" className="text-gold-600 hover:underline font-semibold">
          Register again
        </Link>
      </p>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
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

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <Suspense>
            <ConfirmContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
