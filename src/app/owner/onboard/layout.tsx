import Link from "next/link";

export default function OnboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-navy-950 font-black text-xs"
              style={{ background: "linear-gradient(135deg,#d4a017,#efd466)" }}
            >
              BH
            </div>
            <span className="text-navy-900 text-sm font-black">Best Hotel Deals Daily</span>
          </Link>
          <Link
            href="/owner/"
            className="text-xs text-gray-400 hover:text-gray-600 font-semibold transition-colors"
          >
            Skip for now →
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-10">
        {children}
      </main>
    </div>
  );
}
