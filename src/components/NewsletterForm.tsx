"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setState("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "footer" }),
      });

      const data = await res.json();

      if (data.success) {
        setState("success");
        setMessage(data.message || "You're on the list!");
        setEmail("");
      } else {
        setState("error");
        setMessage(data.error || "Something went wrong. Try again.");
      }
    } catch {
      setState("error");
      setMessage("Connection error. Please try again.");
    }
  }

  if (state === "success") {
    return (
      <div className="max-w-md mx-auto text-center py-4">
        <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-xl px-5 py-3">
          <span className="text-green-400 text-sm font-bold">{message}</span>
        </div>
        <p className="text-gray-600 text-[10px] mt-3">
          Deal alerts land in your inbox every morning — no spam, unsubscribe anytime.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
        disabled={state === "loading"}
        className="flex-1 bg-white/5 border border-white/10 text-white placeholder:text-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-400 transition-colors disabled:opacity-60"
        aria-label="Email for deal alerts"
      />
      <button
        type="submit"
        disabled={state === "loading" || !email}
        className="px-6 py-3 rounded-xl text-navy-950 font-black text-sm shrink-0 transition-all hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ background: "linear-gradient(135deg, #d4a017, #efd466)" }}
      >
        {state === "loading" ? "Joining..." : "Get Alerts"}
      </button>
      {state === "error" && (
        <p className="text-red-400 text-[10px] text-center w-full mt-1">{message}</p>
      )}
    </form>
  );
}
