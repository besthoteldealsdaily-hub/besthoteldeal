import type { Metadata } from "next";
import { blogPosts } from "@/lib/data";
import BlogCard from "@/components/BlogCard";
import Breadcrumb from "@/components/Breadcrumb";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Middle East Hotel Guides 2026 – Dubai, Makkah, Doha & More | Expert Travel Blog",
  description:
    "Expert hotel guides for Dubai, Makkah, Madinah, Riyadh, Doha and Muscat. Find the cheapest pilgrim stays, top luxury resorts, and money-saving booking tips — updated for 2026.",
  alternates: {
    canonical: "https://besthoteldealsdaily.com/blog/",
  },
  openGraph: {
    title: "Middle East Hotel Guides 2026 – Expert Tips, Deals & Local Knowledge",
    description: "In-depth hotel guides for Dubai, Makkah, Doha, Riyadh & more. Pilgrim stays, luxury picks, budget finds — all in one place.",
    url: "https://besthoteldealsdaily.com/blog/",
  },
};

const categories = [
  { label: "All", value: "all" },
  { label: "Dubai", value: "dubai" },
  { label: "Makkah", value: "makkah" },
  { label: "Madinah", value: "madinah" },
  { label: "Riyadh", value: "riyadh" },
  { label: "Bahrain", value: "bahrain" },
];

export default function BlogPage() {
  return (
    <div className="pt-28 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Breadcrumb crumbs={[{ label: "Blog", href: "/blog/" }]} />
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="badge-navy mb-4"> Travel Blog</div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-navy-900 mb-4">
            Middle East Hotel Guides & Travel Tips
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Expert guides to help you find the best hotel deals in Dubai, Makkah, Madinah, Riyadh, Doha, Bahrain and more.
          </p>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-3 mb-10 justify-center">
          {categories.map((cat) => (
            <button
              key={cat.value}
              className="px-4 py-2 rounded-full text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:border-gold-400 hover:text-gold-600 transition-all capitalize"
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Blog grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {blogPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>

        {/* SEO content block */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-3xl mx-auto text-center">
          <h2 className="font-display text-2xl font-bold text-navy-900 mb-3">
            Your Guide to Hotel Deals in the Middle East
          </h2>
          <p className="text-gray-500 leading-relaxed mb-6">
            Our travel blog covers everything from budget pilgrim hotels in Makkah near Al Haram to ultra-luxury
            resorts in Dubai and Doha. We publish new guides regularly with updated prices, tips, and verified deals.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/deals/" className="btn-gold text-sm"> View Hotel Deals</Link>
            <Link href="/city/dubai/" className="btn-navy text-sm">Dubai Hotels</Link>
            <Link href="/city/makkah/" className="btn-navy text-sm">Makkah Hotels</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
