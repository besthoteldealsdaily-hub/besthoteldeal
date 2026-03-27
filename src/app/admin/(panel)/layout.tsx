import Link from "next/link";
import {
  BarChart3, Building2, Users, Mail, FileText, MessageSquare,
  Car, MoonStar, Download, Database, Calendar, Inbox, UserSquare2,
} from "lucide-react";
import LogoutButton from "../LogoutButton";

const navLinks = [
  { href: "/admin/",            icon: BarChart3,      label: "Dashboard",       section: "Platform" },
  { href: "/admin/newsletter/", icon: Mail,           label: "Newsletter",      section: "Platform" },
  { href: "/admin/partners/",   icon: Users,          label: "Partner Apps",    section: "Platform" },
  { href: "/admin/bookings/",   icon: FileText,       label: "Inquiries",       section: "Platform" },
  { href: "/admin/leads/",      icon: MessageSquare,  label: "WhatsApp Leads",  section: "Platform" },
  { href: "/admin/hotels/",     icon: Building2,      label: "Catalog",         section: "Platform" },
  { href: "/admin/transfers/",  icon: Car,            label: "Transfers",       section: "Platform" },
  { href: "/admin/umrah/",      icon: MoonStar,       label: "Umrah",           section: "Platform" },
  { href: "/admin/export/",     icon: Download,       label: "Export CSV",      section: "Platform" },
  // Backend management (DB-managed data)
  { href: "/admin/hotels-db/",  icon: Database,       label: "DB Hotels",       section: "Backend" },
  { href: "/admin/bookings-db/",icon: Calendar,       label: "DB Bookings",     section: "Backend" },
  { href: "/admin/leads-db/",   icon: Inbox,          label: "DB Leads",        section: "Backend" },
  { href: "/admin/users/",      icon: UserSquare2,    label: "Users",           section: "Backend" },
];

const sections = ["Platform", "Backend"] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-navy-950 flex-col h-screen sticky top-0 z-40 border-r border-white/5">
        {/* Logo */}
        <div className="px-5 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-navy-950 font-black text-xs shrink-0"
                 style={{ background: "linear-gradient(135deg,#d4a017,#efd466)" }}>
              BH
            </div>
            <div>
              <div className="text-white text-sm font-black leading-tight">Best Hotel Deals</div>
              <div className="text-gold-400 text-[10px] uppercase tracking-widest">Admin Panel</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {sections.map((section) => (
            <div key={section}>
              <div className="px-5 pt-4 pb-1.5 text-[9px] font-black text-gray-600 uppercase tracking-widest">
                {section}
              </div>
              {navLinks.filter((l) => l.section === section).map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-5 py-2.5 text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-all group"
                >
                  <Icon className="w-3.5 h-3.5 shrink-0 group-hover:text-gold-400 transition-colors" />
                  {label}
                </Link>
              ))}
            </div>
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
        {/* Mobile Header (Only visible on small screens) */}
        <div className="lg:hidden bg-navy-950 px-4 py-3 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded flex items-center justify-center text-navy-950 font-black text-[10px]"
                 style={{ background: "linear-gradient(135deg,#d4a017,#efd466)" }}>
              BH
            </div>
            <span className="text-white text-xs font-black uppercase tracking-wider">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/" className="text-gray-400 p-1"><BarChart3 className="w-5 h-5" /></Link>
            <Link href="/admin/leads/" className="text-gray-400 p-1"><MessageSquare className="w-5 h-5" /></Link>
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
