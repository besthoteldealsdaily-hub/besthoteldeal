import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getHotelBySlug, hotels } from "@/lib/data";
import Breadcrumb from "@/components/Breadcrumb";
import BookingFormClient from "@/components/BookingFormClient";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return hotels.filter((h) => h.listingType === "direct").map((h) => ({ slug: h.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const hotel = getHotelBySlug(slug);
  if (!hotel) return {};
  return {
    title: `Book ${hotel.name} – Direct Booking | Best Hotel Deals Daily`,
    description: `Book directly at ${hotel.name} in ${hotel.city}. No booking fees, pay at hotel, instant confirmation. From ${hotel.currency} ${hotel.priceFrom}/night.`,
    alternates: { canonical: `https://besthoteldealsdaily.com/book/${hotel.slug}/` },
    robots: { index: false }, // Don't index booking pages
  };
}

export default async function BookPage({ params }: Props) {
  const { slug } = await params;
  const hotel = getHotelBySlug(slug);

  if (!hotel || hotel.listingType !== "direct" || hotel.status !== "live") {
    notFound();
  }

  return (
    <div className="pt-28 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Breadcrumb crumbs={[
            { label: "Cities", href: "/" },
            { label: hotel.city.charAt(0).toUpperCase() + hotel.city.slice(1), href: `/city/${hotel.city}/` },
            { label: hotel.name, href: `/city/${hotel.city}/` },
            { label: "Book Now" },
          ]} />
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 bg-navy-900 text-gold-400 text-xs font-bold px-3 py-1.5 rounded-full">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
              </svg>
              Direct Booking — No Middleman
            </span>
            {hotel.verified && (
              <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full">
                 Verified Hotel
              </span>
            )}
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-navy-900">
            Book {hotel.name}
          </h1>
          <p className="text-gray-500 mt-2">
             {hotel.city.charAt(0).toUpperCase() + hotel.city.slice(1)} ·{" "}
            {"".repeat(Math.min(hotel.stars, 5))} · From {hotel.currency} {hotel.priceFrom.toLocaleString()}/night
          </p>
        </div>

        {/* Booking form */}
        <BookingFormClient hotel={hotel} />
      </div>
    </div>
  );
}
