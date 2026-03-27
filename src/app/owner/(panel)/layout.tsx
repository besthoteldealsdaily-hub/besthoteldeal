import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Building2, Calendar, MessageSquare, User,
} from "lucide-react";
import { requireSession } from "@/lib/session";
import LogoutButton from "../LogoutButton";

const navLinks = [
  { href: "/owner/",          icon: LayoutDashboard, label: "Dashboard" },
  { href: "/owner/hotels/",   icon: Building2,       label: "My Hotels" },
  { href: "/owner/bookings/", icon: Calendar,        label: "Bookings" },
  { href: "/owner/leads/",    icon: MessageSquare,   label: "Leads" },
  { href: "/owner/profile/",  icon: User,            label: "Profile" },
];

export default async function OwnerPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession(["hotel_owner", "admin"]);
  if (!session) redirect("/owner/login/");

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-56 shrink-0 bg-navy-950 flex-col h-screen sticky top-0 z-40 border-r border-white/5">
        {/* Logo */}
        <div className="px-5 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-navy-950 font-black text-xs shrink-0"
              style={{ background: "linear-gradient(135deg,#d4a017,#efd466)" }}
            >
              BH
            </div>
            <div>
              <div className="text-white text-sm font-black leading-tight">Best Hotel Deals</div>
              <div className="text-gold-400 text-[10px] uppercase tracking-widest">Owner Portal</div>
            </div>
          </div>
        </div>

        {/* User badge */}
        <div className="px-5 py-3 border-b border-white/10">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-0.5">Signed in as</div>
          <div className="text-xs text-white font-semibold truncate">{session.full_name ?? session.email}</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {navLinks.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-5 py-2.5 text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-all group"
            >
              <Icon className="w-3.5 h-3.5 shrink-0 group-hover:text-gold-400 transition-colors" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-5 py-4 border-t border-white/10 space-y-3">
          <Link href="/" className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors">
            ← Back to site
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen min-w-0 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden bg-navy-950 px-4 py-3 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded flex items-center justify-center text-navy-950 font-black text-[10px]"
              style={{ background: "linear-gradient(135deg,#d4a017,#efd466)" }}
            >
              BH
            </div>
            <span className="text-white text-xs font-black uppercase tracking-wider">Owner</span>
          </div>
          <div className="flex items-center gap-3">
            {navLinks.slice(0, 4).map(({ href, icon: Icon }) => (
              <Link key={href} href={href} className="text-gray-400 p-1">
                <Icon className="w-5 h-5" />
              </Link>
            ))}
            <LogoutButton />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
