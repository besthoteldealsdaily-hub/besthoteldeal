"use client";

import { useState, useEffect, FormEvent } from "react";
import { useParams } from "next/navigation";
import { BedDouble, Plus, ArrowLeft, Pencil, Trash2, X, Save } from "lucide-react";
import Link from "next/link";

const ROOM_TYPES = ["single", "double", "twin", "suite", "family", "studio", "penthouse"];

type Room = {
  id: string;
  name: string;
  room_type: string;
  floor: number | null;
  max_occupancy: number;
  bed_count: number | null;
  size_sqm: number | null;
  price_per_night: number;
  currency: string;
  description: string | null;
  is_available: boolean;
};

type RoomForm = Omit<Room, "id"> & { id?: string };

const emptyForm: RoomForm = {
  name: "", room_type: "double", floor: null, max_occupancy: 2,
  bed_count: null, size_sqm: null, price_per_night: 0,
  currency: "USD", description: null, is_available: true,
};

export default function RoomsPage() {
  const params    = useParams();
  const slug      = params.slug as string;

  const [hotelId, setHotelId] = useState<string | null>(null);
  const [rooms,   setRooms]   = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState<RoomForm>(emptyForm);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  useEffect(() => {
    fetch(`/api/hotels/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.hotel?.id) setHotelId(d.hotel.id);
        return d.hotel?.id;
      })
      .then((id) => id ? fetch(`/api/hotels/${slug}/rooms`) : null)
      .then((r) => r?.json())
      .then((d) => { setRooms(d?.rooms ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  function openNew() {
    setForm(emptyForm);
    setError("");
    setModal(true);
  }

  function openEdit(room: Room) {
    setForm({ ...room });
    setError("");
    setModal(true);
  }

  function setF(key: string, value: unknown) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      let res: Response;
      if (form.id) {
        res = await fetch(`/api/rooms/${form.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name:            form.name,
            room_type:       form.room_type,
            floor:           form.floor,
            max_occupancy:   form.max_occupancy,
            bed_count:       form.bed_count,
            size_sqm:        form.size_sqm,
            price_per_night: form.price_per_night,
            currency:        form.currency,
            description:     form.description,
            is_available:    form.is_available,
          }),
        });
      } else {
        res = await fetch(`/api/hotels/${slug}/rooms`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hotel_id:        hotelId,
            name:            form.name,
            room_type:       form.room_type,
            floor:           form.floor,
            max_occupancy:   form.max_occupancy,
            bed_count:       form.bed_count,
            size_sqm:        form.size_sqm,
            price_per_night: form.price_per_night,
            currency:        form.currency,
            description:     form.description,
            is_available:    form.is_available,
          }),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save room.");
      } else {
        if (form.id) {
          setRooms((prev) => prev.map((r) => r.id === form.id ? data.room : r));
        } else {
          setRooms((prev) => [...prev, data.room]);
        }
        setModal(false);
      }
    } catch {
      setError("Connection error.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(room: Room) {
    if (!confirm(`Delete "${room.name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/rooms/${room.id}`, { method: "DELETE" });
    if (res.ok) {
      setRooms((prev) => prev.filter((r) => r.id !== room.id));
    }
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-navy-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all";
  const labelCls = "block text-xs font-semibold text-gray-700 mb-1";

  if (loading) {
    return <div className="p-6 max-w-3xl mx-auto"><div className="animate-pulse h-64 bg-gray-100 rounded-xl" /></div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href={`/owner/hotels/${slug}/`} className="text-gray-400 hover:text-gray-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-black text-navy-900 flex items-center gap-2">
              <BedDouble className="w-5 h-5 text-gold-500" />
              Room Management
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">{rooms.length} room{rooms.length !== 1 ? "s" : ""} for this property</p>
          </div>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black text-navy-950 transition-all hover:scale-[1.02]"
          style={{ background: "linear-gradient(135deg, #d4a017, #efd466)" }}
        >
          <Plus className="w-3.5 h-3.5" /> Add Room
        </button>
      </div>

      {rooms.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <BedDouble className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <h3 className="text-sm font-black text-navy-900 mb-1">No rooms yet</h3>
          <p className="text-xs text-gray-500 mb-4">Add your first room to accept bookings.</p>
          <button
            onClick={openNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-navy-950"
            style={{ background: "linear-gradient(135deg, #d4a017, #efd466)" }}
          >
            <Plus className="w-3.5 h-3.5" /> Add Room
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {["Room", "Type", "Occupancy", "Price / Night", "Available", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-gray-500 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rooms.map((room) => (
                <tr key={room.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold text-navy-900">{room.name}</div>
                    {room.size_sqm && <div className="text-gray-400">{room.size_sqm} m²</div>}
                  </td>
                  <td className="px-4 py-3 capitalize">{room.room_type}</td>
                  <td className="px-4 py-3 text-gray-600">{room.max_occupancy} guests{room.bed_count ? `, ${room.bed_count} beds` : ""}</td>
                  <td className="px-4 py-3 font-bold text-navy-900">{room.currency} {room.price_per_night.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${room.is_available ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-gray-50 text-gray-500 border-gray-100"}`}>
                      {room.is_available ? "yes" : "no"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => openEdit(room)} className="p-1 text-gray-300 hover:text-gold-500 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(room)} className="p-1 text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setModal(false)}>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-navy-900">{form.id ? "Edit Room" : "Add Room"}</h3>
              <button onClick={() => setModal(false)} className="text-gray-300 hover:text-gray-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className={labelCls}>Room Name *</label>
                <input className={inputCls} value={form.name} onChange={(e) => setF("name", e.target.value)} placeholder="e.g. Deluxe Double" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Room Type</label>
                  <select className={inputCls} value={form.room_type} onChange={(e) => setF("room_type", e.target.value)}>
                    {ROOM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Floor</label>
                  <input className={inputCls} type="number" value={form.floor ?? ""} onChange={(e) => setF("floor", e.target.value ? Number(e.target.value) : null)} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>Max Guests</label>
                  <input className={inputCls} type="number" min="1" value={form.max_occupancy} onChange={(e) => setF("max_occupancy", Number(e.target.value))} required />
                </div>
                <div>
                  <label className={labelCls}>Beds</label>
                  <input className={inputCls} type="number" min="1" value={form.bed_count ?? ""} onChange={(e) => setF("bed_count", e.target.value ? Number(e.target.value) : null)} />
                </div>
                <div>
                  <label className={labelCls}>Size (m²)</label>
                  <input className={inputCls} type="number" min="0" value={form.size_sqm ?? ""} onChange={(e) => setF("size_sqm", e.target.value ? Number(e.target.value) : null)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Price / Night *</label>
                  <input className={inputCls} type="number" min="0" value={form.price_per_night} onChange={(e) => setF("price_per_night", Number(e.target.value))} required />
                </div>
                <div>
                  <label className={labelCls}>Currency</label>
                  <select className={inputCls} value={form.currency} onChange={(e) => setF("currency", e.target.value)}>
                    {["USD", "SAR", "AED", "EUR", "GBP"].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelCls}>Description</label>
                <textarea className={`${inputCls} resize-none`} rows={2} value={form.description ?? ""} onChange={(e) => setF("description", e.target.value || null)} />
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.is_available} onChange={(e) => setF("is_available", e.target.checked)} className="w-4 h-4 rounded border-gray-300" />
                <span className="text-xs font-semibold text-gray-700">Available for booking</span>
              </label>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                  <p className="text-red-600 text-xs">{error}</p>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-xs font-black text-navy-950 disabled:opacity-60 flex items-center justify-center gap-1.5"
                  style={{ background: "linear-gradient(135deg, #d4a017, #efd466)" }}
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? "Saving…" : "Save Room"}
                </button>
                <button type="button" onClick={() => setModal(false)} className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
