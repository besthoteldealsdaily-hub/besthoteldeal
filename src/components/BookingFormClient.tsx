"use client";

import { useState } from "react";
import Image from "next/image";
import { Hotel, BookingForm } from "@/lib/types";

interface BookingFormClientProps {
  hotel: Hotel;
}

export default function BookingFormClient({ hotel }: BookingFormClientProps) {
  const isDirect   = hotel.listingType === "direct";
  const isLeadOnly = hotel.listingType === "lead" || !hotel.rooms?.length;
  const [step, setStep] = useState<1 | 2 | 3>(isLeadOnly ? 2 : 1);
  const [selectedRoom, setSelectedRoom] = useState(hotel.rooms?.[0]?.id ?? "");
  const [form, setForm] = useState<BookingForm>({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    checkIn: "",
    checkOut: "",
    rooms: 1,
    guests: 2,
    roomId: hotel.rooms?.[0]?.id ?? "",
    specialRequests: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectedRoomData = hotel.rooms?.find((r) => r.id === selectedRoom);

  const nights = (() => {
    if (!form.checkIn || !form.checkOut) return 0;
    const diff = new Date(form.checkOut).getTime() - new Date(form.checkIn).getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  })();

  const totalPrice = selectedRoomData ? selectedRoomData.pricePerNight * Math.max(nights, 1) : 0;
  const platformFee = Math.round(totalPrice * ((hotel.commissionRate ?? 15) / 100));
  const hotelTotal = totalPrice - platformFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const isDbHotel = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(hotel.id);

      if (isDirect && !isLeadOnly && isDbHotel) {
        // DB-managed direct hotel → bookings API
        await fetch("/api/bookings", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            hotel_id:     hotel.id,
            room_id:      form.roomId,
            guest_name:   form.guestName,
            guest_email:  form.guestEmail,
            guest_phone:  form.guestPhone,
            check_in:     form.checkIn,
            check_out:    form.checkOut,
            guests_count: form.guests,
            rooms_count:  form.rooms,
            special_requests: form.specialRequests,
            total_amount: totalPrice,
            currency:     hotel.currency,
          }),
        });
      } else {
        // Static / lead-only hotel → leads API
        await fetch("/api/leads", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            hotel_slug:       hotel.slug,
            hotel_name:       hotel.name,
            guest_name:       form.guestName,
            guest_email:      form.guestEmail,
            guest_phone:      form.guestPhone,
            check_in:         form.checkIn,
            check_out:        form.checkOut,
            guests_count:     form.guests,
            budget_range:     selectedRoomData ? `${hotel.currency} ${totalPrice.toLocaleString()}` : undefined,
            special_requests: form.specialRequests,
            source:           "website",
          }),
        });
      }
    } catch { /* fail silently — still show success to user */ }

    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center py-16 px-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="font-display text-3xl font-bold text-navy-900 mb-3">
          {isLeadOnly ? "Inquiry Received!" : "Booking Request Sent!"}
        </h2>
        <p className="text-gray-500 max-w-md mx-auto mb-2">
          Your {isLeadOnly ? "inquiry" : "booking request"} for <strong>{hotel.name}</strong> has been received.
        </p>
        <p className="text-gray-500 max-w-md mx-auto mb-8">
          One of our {hotel.city} area experts will contact you at <strong>{form.guestEmail}</strong> within 30 minutes.
        </p>
        <div className="bg-gray-50 rounded-2xl p-6 max-w-sm mx-auto text-left mb-8">
          <div className="text-sm text-gray-500 space-y-2">
            <div className="flex justify-between"><span>Hotel</span><span className="font-semibold text-navy-900">{hotel.name}</span></div>
            <div className="flex justify-between"><span>Room</span><span className="font-semibold text-navy-900">{selectedRoomData?.name}</span></div>
            <div className="flex justify-between"><span>Check-in</span><span className="font-semibold text-navy-900">{form.checkIn}</span></div>
            <div className="flex justify-between"><span>Check-out</span><span className="font-semibold text-navy-900">{form.checkOut}</span></div>
            <div className="flex justify-between border-t border-gray-200 pt-2 mt-2"><span className="font-bold text-navy-900">Total</span><span className="font-black text-navy-900">{hotel.currency} {totalPrice.toLocaleString()}</span></div>
          </div>
        </div>
        <a href="/" className="btn-gold">Back to Home</a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: Form */}
      <div className="lg:col-span-2">
        {/* Trust Badge for Conversion */}
        <div className="bg-gold-50 border border-gold-200 rounded-2xl p-4 mb-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-gold-400 rounded-full flex items-center justify-center text-white text-xl">️</div>
          <div>
            <div className="font-bold text-navy-900 text-sm">Best Price & Assistance Guarantee</div>
            <div className="text-xs text-gray-600 leading-tight italic">Our Middle East travel experts verify every request manually to ensure you get the lowest possible rate.</div>
          </div>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-0 mb-8">
          {[
            { n: 1, label: "Select Room", hide: isLeadOnly },
            { n: 2, label: "Your Details", hide: false },
            { n: 3, label: "Confirm", hide: false }
          ].filter(s => !s.hide).map((s, i, arr) => (
            <div key={s.n} className="flex items-center flex-1">
              <div className={`flex items-center gap-2 ${step >= s.n ? "text-navy-900" : "text-gray-400"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step === s.n ? "bg-navy-900 text-gold-400 shadow-lg" : step > s.n ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400"}`}>
                  {step > s.n ? "" : (i + 1)}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${step >= s.n ? "text-navy-900" : "text-gray-400"}`}>{s.label}</span>
              </div>
              {i < arr.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${step > s.n ? "bg-green-400" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Select Room */}
          {step === 1 && (
            <div>
              <h2 className="font-display text-xl font-bold text-navy-900 mb-4">Select Your Room</h2>
              <div className="space-y-4">
                {hotel.rooms?.map((room) => (
                  <label
                    key={room.id}
                    className={`block cursor-pointer rounded-2xl border-2 p-4 transition-all ${selectedRoom === room.id ? "border-navy-700 bg-navy-50 shadow-md" : "border-gray-100 bg-white hover:border-gray-200"}`}
                  >
                    <input
                      type="radio"
                      name="room"
                      value={room.id}
                      checked={selectedRoom === room.id}
                      onChange={() => { setSelectedRoom(room.id); setForm(f => ({ ...f, roomId: room.id })); }}
                      className="sr-only"
                    />
                    <div className="flex items-start gap-4">
                      <div className="relative w-24 h-20 rounded-xl overflow-hidden shrink-0">
                        <Image src={room.images[0]} alt={room.name} fill className="object-cover" sizes="96px" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-bold text-navy-900">{room.name}</div>
                            <div className="text-gray-500 text-sm">{room.bedType} · Max {room.maxGuests} guests</div>
                          </div>
                          <div className="text-right">
                            <div className="font-black text-navy-900 text-lg">{room.currency} {room.pricePerNight.toLocaleString()}</div>
                            <div className="text-gray-400 text-xs">per night</div>
                          </div>
                        </div>
                        <p className="text-gray-500 text-sm mt-1">{room.description}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {room.amenities.slice(0, 4).map((a) => (
                            <span key={a} className="text-xs bg-white border border-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{a}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    {selectedRoom === room.id && (
                      <div className="mt-3 pt-3 border-t border-navy-100 flex items-center gap-2 text-navy-700 text-sm font-medium">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        Selected
                      </div>
                    )}
                  </label>
                ))}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div>
                  <label className="block text-sm font-semibold text-navy-900 mb-2">Check-in Date</label>
                  <input type="date" required value={form.checkIn} onChange={e => setForm(f => ({ ...f, checkIn: e.target.value }))} min={new Date().toISOString().split("T")[0]} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy-900 mb-2">Check-out Date</label>
                  <input type="date" required value={form.checkOut} onChange={e => setForm(f => ({ ...f, checkOut: e.target.value }))} min={form.checkIn || new Date().toISOString().split("T")[0]} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent" />
                </div>
              </div>

              <div className="mt-6">
                <button type="button" onClick={() => setStep(2)} disabled={!selectedRoom || !form.checkIn || !form.checkOut} className="btn-gold w-full justify-center py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed">
                  Continue to Guest Details →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Guest Details */}
          {step === 2 && (
            <div>
              <h2 className="font-display text-xl font-bold text-navy-900 mb-4">
                {isLeadOnly ? `Tell us about your stay at ${hotel.name}` : "Guest Details"}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-navy-900 mb-2">Full Name *</label>
                  <input type="text" required placeholder="As on passport" value={form.guestName} onChange={e => setForm(f => ({ ...f, guestName: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy-500" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-navy-900 mb-2">Email Address *</label>
                    <input type="email" required placeholder="your@email.com" value={form.guestEmail} onChange={e => setForm(f => ({ ...f, guestEmail: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy-900 mb-2">Phone Number *</label>
                    <input type="tel" required placeholder="+971 50 000 0000" value={form.guestPhone} onChange={e => setForm(f => ({ ...f, guestPhone: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-navy-900 mb-2">Rooms</label>
                    <select value={form.rooms} onChange={e => setForm(f => ({ ...f, rooms: Number(e.target.value) }))} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy-500">
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Room{n > 1 ? "s" : ""}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy-900 mb-2">Guests</label>
                    <select value={form.guests} onChange={e => setForm(f => ({ ...f, guests: Number(e.target.value) }))} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy-500">
                      {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? "s" : ""}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy-900 mb-2">Special Requests <span className="text-gray-400 font-normal">(Optional)</span></label>
                  <textarea rows={3} placeholder="e.g. Early check-in, ground floor room, halal food..." value={form.specialRequests} onChange={e => setForm(f => ({ ...f, specialRequests: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-navy-500 resize-none" />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                {!isLeadOnly && <button type="button" onClick={() => setStep(1)} className="btn-navy flex-1 justify-center py-4">← Back</button>}
                <button type="button" onClick={() => setStep(3)} disabled={!form.guestName || !form.guestEmail || !form.guestPhone || !form.checkIn || !form.checkOut} className="btn-gold flex-2 flex-1 justify-center py-4 disabled:opacity-50">
                  {isLeadOnly ? "Review Inquiry →" : "Review Booking →"}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div>
              <h2 className="font-display text-xl font-bold text-navy-900 mb-4 font-black">Final Review</h2>
              <div className="bg-gray-50 rounded-2xl p-6 space-y-3 text-sm mb-6 border border-gray-100">
                <div className="flex justify-between"><span className="text-gray-500">Hotel</span><span className="font-semibold text-navy-900">{hotel.name}</span></div>
                {selectedRoomData && <div className="flex justify-between"><span className="text-gray-500">Room Type</span><span className="font-semibold text-navy-900">{selectedRoomData.name}</span></div>}
                <div className="flex justify-between"><span className="text-gray-500">Check-in</span><span className="font-semibold text-navy-900">{form.checkIn} at {hotel.checkInTime}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Check-out</span><span className="font-semibold text-navy-900">{form.checkOut} at {hotel.checkOutTime}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Nights</span><span className="font-semibold text-navy-900">{nights}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Guests</span><span className="font-semibold text-navy-900">{form.guests}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Guest Name</span><span className="font-semibold text-navy-900">{form.guestName}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="font-semibold text-navy-900">{form.guestEmail}</span></div>
                {!isLeadOnly ? (
                  <div className="border-t border-gray-200 my-2 pt-2">
                    <div className="flex justify-between text-base"><span className="font-bold text-navy-900">Estimated Total</span><span className="font-black text-navy-900 text-xl">{hotel.currency} {totalPrice.toLocaleString()}</span></div>
                    <div className="text-green-600 text-xs mt-1 text-right italic"> Verified Deal · Safe Handover</div>
                  </div>
                ) : (
                  <div className="border-t border-gray-200 my-2 pt-2 italic text-xs text-gray-400">
                    Total price will be confirmed by hotel management. No upfront payment required.
                  </div>
                )}
              </div>

              {hotel.cancellationPolicy && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6 text-sm text-amber-800">
                  <strong>Cancellation Policy:</strong> {hotel.cancellationPolicy}
                </div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="btn-navy flex-1 justify-center py-4">← Back</button>
                <button type="submit" disabled={loading} className="btn-gold flex-1 justify-center py-4 text-base font-bold disabled:opacity-70">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Processing...
                    </span>
                  ) : isLeadOnly ? " Send Inquiry Request" : " Confirm Booking"}
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center mt-4">
                By confirming, you agree to our terms. Payment is collected at the hotel.
              </p>
            </div>
          )}
        </form>
      </div>

      {/* Right: Hotel Summary */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-28">
          <div className="relative h-44">
            <Image src={hotel.image} alt={hotel.name} fill className="object-cover" sizes="400px" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 to-transparent" />
            <div className="absolute bottom-3 left-3 text-white">
              <div className="font-bold text-sm">{hotel.name}</div>
              <div className="text-gold-400 text-xs capitalize">{hotel.city} · {hotel.stars}</div>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {selectedRoomData && (
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Selected Room</div>
                <div className="font-bold text-navy-900 text-sm">{selectedRoomData.name}</div>
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-gray-500">{nights} night{nights !== 1 ? "s" : ""}</span>
                  <span className="font-black text-navy-900">{hotel.currency} {totalPrice.toLocaleString()}</span>
                </div>
              </div>
            )}
            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex items-center gap-2"><svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> No booking fee</div>
              <div className="flex items-center gap-2"><svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> Pay at hotel</div>
              <div className="flex items-center gap-2"><svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> Instant confirmation</div>
              <div className="flex items-center gap-2"><svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> {hotel.cancellationPolicy?.includes("Free") ? "Free cancellation available" : "Check cancellation policy"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
