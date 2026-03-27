import { createServerClient } from "@/lib/supabase";
import { UserSquare2, Search, Users, Building2 } from "lucide-react";
import { RoleSelector, DeleteUser } from "./UserActions";

export const metadata = { title: "Users — Admin" };
export const dynamic  = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const sp     = await searchParams;
  const role   = sp.role   ?? "";
  const search = sp.search ?? "";

  const db = createServerClient();

  let query = db
    .from("users")
    .select("id, email, full_name, phone, role, nationality, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (role)   query = query.eq("role", role);
  if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);

  const { data: users } = await query;

  // Hotel counts per owner
  const { data: ownerHotels } = await db
    .from("hotels")
    .select("owner_id")
    .not("owner_id", "is", null);

  const hotelCountMap = (ownerHotels ?? []).reduce<Record<string, number>>((acc, h) => {
    if (h.owner_id) acc[h.owner_id] = (acc[h.owner_id] ?? 0) + 1;
    return acc;
  }, {});

  // User role counts
  const { data: allUsers } = await db.from("users").select("role");
  const roleCounts = (allUsers ?? []).reduce<Record<string, number>>((acc, u) => {
    acc[u.role] = (acc[u.role] ?? 0) + 1;
    return acc;
  }, {});

  const roleFilters = [
    { val: "",             label: "All",          count: allUsers?.length ?? 0 },
    { val: "customer",     label: "Customers",    count: roleCounts.customer     ?? 0 },
    { val: "hotel_owner",  label: "Hotel Owners", count: roleCounts.hotel_owner  ?? 0 },
    { val: "admin",        label: "Admins",        count: roleCounts.admin        ?? 0 },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-black text-navy-900 flex items-center gap-2">
            <UserSquare2 className="w-5 h-5 text-gold-500" />
            User Management
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">All registered users — customers, hotel owners, and admins.</p>
        </div>

        {/* Summary cards */}
        <div className="hidden md:flex items-center gap-3">
          {[
            { icon: Users,    label: "Total",   count: allUsers?.length ?? 0 },
            { icon: Building2, label: "Owners", count: roleCounts.hotel_owner ?? 0 },
          ].map(({ icon: Icon, label, count }) => (
            <div key={label} className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5">
              <Icon className="w-4 h-4 text-gold-500" />
              <div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{label}</div>
                <div className="text-sm font-black text-navy-900">{count}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Role tabs */}
      <div className="flex gap-2 mb-4">
        {roleFilters.map(({ val, label, count }) => {
          const active = val === "" ? !role : role === val;
          return (
            <a
              key={val}
              href={val ? `/admin/users/?role=${val}` : "/admin/users/"}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-black transition-colors ${
                active ? "bg-navy-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {label}
              <span className={`ml-0.5 px-1 rounded text-[10px] ${active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>{count}</span>
            </a>
          );
        })}
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 mb-4 flex items-center gap-2">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <form className="flex-1 flex gap-2" method="GET">
          {role && <input type="hidden" name="role" value={role} />}
          <input
            name="search"
            defaultValue={search}
            placeholder="Search by name or email…"
            className="flex-1 text-xs text-navy-900 placeholder:text-gray-400 focus:outline-none"
          />
          <button type="submit" className="btn-navy text-[10px] px-2 py-1">Search</button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {["User", "Contact", "Hotels", "Role", "Joined", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-gray-500 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(users ?? []).length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">No users found.</td></tr>
              )}
              {(users ?? []).map((u) => {
                const initials = (u.full_name ?? u.email)
                  .split(" ").slice(0, 2).map((w: string) => w[0]?.toUpperCase()).join("");
                const hotelCount = hotelCountMap[u.id] ?? 0;
                return (
                  <tr key={u.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-navy-100 flex items-center justify-center text-navy-700 font-black text-[11px] shrink-0">
                          {initials || "?"}
                        </div>
                        <div>
                          <div className="font-bold text-navy-900">{u.full_name ?? "—"}</div>
                          {u.nationality && <div className="text-gray-400">{u.nationality}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-navy-700">{u.email}</div>
                      {u.phone && <div className="text-gray-400">{u.phone}</div>}
                    </td>
                    <td className="px-4 py-3">
                      {hotelCount > 0 ? (
                        <a href={`/admin/hotels-db/?owner_id=${u.id}`} className="flex items-center gap-1 text-gold-600 font-bold hover:text-gold-700 transition-colors">
                          <Building2 className="w-3 h-3" /> {hotelCount}
                        </a>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <RoleSelector userId={u.id} role={u.role} />
                    </td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                      {new Date(u.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <DeleteUser userId={u.id} userName={u.full_name ?? u.email} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">{users?.length ?? 0} user{users?.length !== 1 ? "s" : ""}</span>
        </div>
      </div>
    </div>
  );
}
