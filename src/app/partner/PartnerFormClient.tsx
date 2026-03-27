"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle } from "lucide-react";

interface PartnerForm {
  hotelName: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  city: string;
  country: string;
  stars: string;
  description: string;
  priceFrom: string;
  currency: string;
  website: string;
  message: string;
}

const CITIES = [
  { label: "Dubai", country: "UAE" },
  { label: "Makkah", country: "Saudi Arabia" },
  { label: "Madinah", country: "Saudi Arabia" },
  { label: "Riyadh", country: "Saudi Arabia" },
  { label: "Doha", country: "Qatar" },
  { label: "Manama", country: "Bahrain" },
  { label: "Kuwait City", country: "Kuwait" },
  { label: "Muscat", country: "Oman" },
];

export default function PartnerFormClient() {
  const [form, setForm] = useState<PartnerForm>({
    hotelName: "",
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    city: "",
    country: "",
    stars: "",
    description: "",
    priceFrom: "",
    currency: "USD",
    website: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleCityChange = (city: string) => {
    const match = CITIES.find((c) => c.label === city);
    setForm((f) => ({ ...f, city, country: match?.country ?? f.country }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          stars: form.stars ? Number(form.stars) : null,
          priceFrom: form.priceFrom ? Number(form.priceFrom) : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="font-display text-2xl font-black text-navy-900 mb-3">
          Application Received!
        </h3>
        <p className="text-gray-500 max-w-md mx-auto mb-2">
          Thank you for submitting <strong>{form.hotelName}</strong>.
        </p>
        <p className="text-gray-500 max-w-md mx-auto">
          Our partnerships team will review your property and contact you at{" "}
          <strong>{form.ownerEmail}</strong> within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Hotel Details */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
        <h3 className="font-bold text-navy-900 text-lg mb-6">Hotel Details</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">
              Hotel Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Grand Palace Hotel"
              value={form.hotelName}
              onChange={(e) => setForm((f) => ({ ...f, hotelName: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-2">
                City *
              </label>
              <select
                required
                value={form.city}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
              >
                <option value="">Select city</option>
                {CITIES.map((c) => (
                  <option key={c.label} value={c.label}>
                    {c.label}, {c.country}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-2">
                Star Rating
              </label>
              <select
                value={form.stars}
                onChange={(e) => setForm((f) => ({ ...f, stars: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
              >
                <option value="">Select rating</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-2">
                Starting Price (per night)
              </label>
              <div className="flex gap-2">
                <select
                  value={form.currency}
                  onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                  className="border border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent w-24"
                >
                  <option value="USD">USD</option>
                  <option value="SAR">SAR</option>
                  <option value="AED">AED</option>
                  <option value="QAR">QAR</option>
                  <option value="BHD">BHD</option>
                  <option value="KWD">KWD</option>
                  <option value="OMR">OMR</option>
                </select>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 120"
                  value={form.priceFrom}
                  onChange={(e) => setForm((f) => ({ ...f, priceFrom: e.target.value }))}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-2">
                Website
              </label>
              <input
                type="url"
                placeholder="https://yourhotel.com"
                value={form.website}
                onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">
              Hotel Description
            </label>
            <textarea
              rows={3}
              placeholder="Brief description of your property, unique selling points, location highlights..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
      </div>

      {/* Contact Details */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
        <h3 className="font-bold text-navy-900 text-lg mb-6">Contact Details</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">
              Your Name *
            </label>
            <input
              type="text"
              required
              placeholder="Full name"
              value={form.ownerName}
              onChange={(e) => setForm((f) => ({ ...f, ownerName: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="you@hotel.com"
                value={form.ownerEmail}
                onChange={(e) => setForm((f) => ({ ...f, ownerEmail: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy-900 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+971 50 000 0000"
                value={form.ownerPhone}
                onChange={(e) => setForm((f) => ({ ...f, ownerPhone: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">
              Additional Message
            </label>
            <textarea
              rows={3}
              placeholder="Anything else you'd like us to know..."
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-gold w-full justify-center py-4 text-base font-bold disabled:opacity-70"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Submitting...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Send className="w-5 h-5" />
            Submit Application
          </span>
        )}
      </button>

      <p className="text-xs text-gray-400 text-center">
        By submitting, you agree to our listing terms. There are no upfront fees
        to list your property.
      </p>
    </form>
  );
}
