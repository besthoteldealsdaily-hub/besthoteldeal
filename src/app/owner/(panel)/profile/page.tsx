"use client";

import { useState, useEffect, FormEvent } from "react";
import { User, Save } from "lucide-react";

export default function OwnerProfilePage() {
  const [form, setForm] = useState({
    full_name:   "",
    phone:       "",
    nationality: "",
  });

  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");
  const [saved,   setSaved]   = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setEmail(d.user.email ?? "");
          setForm({
            full_name:   d.user.full_name   ?? "",
            phone:       d.user.phone       ?? "",
            nationality: d.user.nationality ?? "",
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/auth/me", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          fullName:    form.full_name   || undefined,
          phone:       form.phone       || undefined,
          nationality: form.nationality || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save.");
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch {
      setError("Connection error.");
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-navy-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all";
  const labelCls = "block text-xs font-semibold text-gray-700 mb-1";

  if (loading) {
    return (
      <div className="p-6 max-w-lg mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-100 rounded-xl w-32" />
          <div className="h-48 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-lg font-black text-navy-900 flex items-center gap-2">
          <User className="w-5 h-5 text-gold-500" />
          My Profile
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">Update your account details.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Account info */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <h2 className="text-xs font-black text-navy-900 uppercase tracking-wider">Account</h2>

          <div>
            <label className={labelCls}>Email</label>
            <input
              className={`${inputCls} bg-gray-50 text-gray-400 cursor-not-allowed`}
              value={email}
              disabled
              readOnly
            />
            <p className="text-[10px] text-gray-400 mt-1">Email cannot be changed here.</p>
          </div>

          <div>
            <label className={labelCls}>Full Name</label>
            <input
              className={inputCls}
              value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
              placeholder="Your full name"
            />
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <h2 className="text-xs font-black text-navy-900 uppercase tracking-wider">Contact</h2>

          <div>
            <label className={labelCls}>Phone</label>
            <input
              className={inputCls}
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="+966..."
            />
          </div>

          <div>
            <label className={labelCls}>Nationality</label>
            <input
              className={inputCls}
              value={form.nationality}
              onChange={(e) => setForm((f) => ({ ...f, nationality: e.target.value }))}
              placeholder="e.g. Saudi Arabian"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <p className="text-red-600 text-xs font-medium">{error}</p>
          </div>
        )}

        {saved && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
            <p className="text-emerald-700 text-xs font-medium">Profile updated successfully.</p>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-xl text-navy-950 font-black text-sm disabled:opacity-60 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, #d4a017, #efd466)" }}
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
