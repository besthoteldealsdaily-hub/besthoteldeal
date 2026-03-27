"use client";

import { useState } from "react";
import { ChevronDown, Trash2 } from "lucide-react";

const ROLES = ["customer", "hotel_owner", "admin"] as const;
type UserRole = typeof ROLES[number];

const ROLE_COLORS: Record<UserRole, string> = {
  customer:    "bg-gray-50   text-gray-600  border-gray-200",
  hotel_owner: "bg-gold-50   text-gold-700  border-gold-200",
  admin:       "bg-navy-50   text-navy-800  border-navy-100",
};

export function RoleSelector({ userId, role: initialRole }: { userId: string; role: string }) {
  const [role,    setRole]    = useState<UserRole>(initialRole as UserRole);
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);

  async function updateRole(next: UserRole) {
    setOpen(false);
    if (next === role) return;
    setLoading(true);
    await fetch(`/api/admin/users/${userId}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ role: next }),
    });
    setRole(next);
    setLoading(false);
  }

  const cls = ROLE_COLORS[role] ?? "bg-gray-50 text-gray-600 border-gray-100";

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border transition-colors disabled:opacity-50 ${cls}`}
      >
        {loading ? "…" : role.replace("_", " ")}
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden w-36">
            {ROLES.map((r) => (
              <button
                key={r}
                onClick={() => updateRole(r)}
                className={`w-full text-left px-3 py-2 text-xs font-bold transition-colors hover:bg-gray-50 capitalize ${r === role ? "text-gold-600 bg-gold-50" : "text-gray-700"}`}
              >
                {r.replace("_", " ")}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function DeleteUser({ userId, userName }: { userId: string; userName: string }) {
  const [confirm, setConfirm] = useState(false);
  const [done,    setDone]    = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    setDone(true);
    setLoading(false);
  }

  if (done) return <span className="text-[10px] text-red-500 font-bold">Deleted</span>;

  return (
    <>
      <button onClick={() => setConfirm(true)} title="Delete user" className="p-1 text-gray-300 hover:text-red-500 transition-colors">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setConfirm(false)}>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-black text-navy-900 mb-2">Delete User</h3>
            <p className="text-xs text-gray-500 mb-4">
              Permanently delete <strong>{userName}</strong>? This cannot be undone. Their hotels will be orphaned (owner set to null).
            </p>
            <div className="flex gap-2">
              <button onClick={handleDelete} disabled={loading} className="flex-1 py-2 rounded-xl text-xs font-black bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors">
                {loading ? "Deleting…" : "Delete"}
              </button>
              <button onClick={() => setConfirm(false)} className="flex-1 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
