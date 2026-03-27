import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getDealBySlug, deals, cities } from "@/lib/data";
import Breadcrumb from "@/components/Breadcrumb";
import DealCard from "@/components/DealCard";
import SocialProof from "@/components/SocialProof";
import PriceAlertSignup from "@/components/PriceAlertSignup";
import ErrorBoundary from "@/components/ErrorBoundary";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return deals.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const deal = getDealBySlug(slug);
  if (!deal) return {};

  const savings = deal.originalPrice - deal.discountedPrice;
  const validDate = new Date(deal.validUntil).toLocaleDateString("en-GB", { day: "numeric", month: "long" });
  const title = `[${deal.discount}% OFF] ${deal.hotelName}, ${deal.city} – ${deal.currency} ${deal.discountedPrice}/night`;
  const description = `Save ${deal.currency} ${savings} on your stay — was ${deal.currency} ${deal.originalPrice}, now ${deal.currency} ${deal.discountedPrice}/night. ${deal.description} Offer valid until ${validDate}.`;

  return {
    title,
    description,
    alternates: { canonical: `https://besthoteldealsdaily.com/deals/${deal.slug}/` },
    openGraph: {
      title: `${deal.discount}% Off – ${deal.hotelName} | Save ${deal.currency} ${savings}`,
      description,
      url: `https://besthoteldealsdaily.com/deals/${deal.slug}/`,
      images: [{ url: deal.image, width: 1200, height: 630, alt: deal.hotelName }],
    },
  };
}

export default async function DealDetailPage({ params }: Props) {
  const { slug } = await params;
  const deal = getDealBySlug(slug);
  if (!deal) notFound();

  const savings = deal.originalPrice - deal.discountedPrice;
  const validUntilFormatted = new Date(deal.validUntil).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
  const relatedDeals = deals.filter((d) => d.id !== deal.id && d.country === deal.country).slice(0, 3);

  const dealSchema = {
    "@context": "https://schema.org",
    "@type": "Offer",
    name: deal.hotelName,
    description: deal.description,
    price: deal.discountedPrice,
    priceCurrency: deal.currency,
    validFrom: deal.lastUpdated,
    priceValidUntil: deal.validUntil,
    url: `https://besthoteldealsdaily.com/deals/${deal.slug}/`,
    availability: "https://schema.org/InStock",
    seller: { "@type": "Organization", name: "Best Hotel Deals Daily" },
    itemOffered: {
      "@type": "LodgingBusiness",
      name: deal.hotelName,
      image: deal.image,
      address: {
        "@type": "PostalAddress",
        addressLocality: deal.city,
        addressCountry: deal.country,
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: deal.rating,
        bestRating: 5,
        worstRating: 1,
        ratingCount: Math.round(deal.rating * 120),
      },
    },
  };

  return (
    <div className="pt-28 pb-20 bg-gray-50 min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dealSchema).replace(/</g, "\\u003c") }} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Breadcrumb crumbs={[
            { label: "Deals", href: "/deals/" },
            { label: deal.hotelName },
          ]} />
        </div>

        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          {/* Image */}
          <div className="relative h-72 md:h-96">
            <Image src={deal.image} alt={deal.hotelName} fill className="object-cover" priority sizes="(max-width: 1024px) 100vw, 900px" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 to-transparent" />
            {/* Badges */}
            <div className="absolute top-6 left-6 flex gap-3">
              <span className="bg-red-500 text-white text-xl font-black px-4 py-2 rounded-full shadow-lg">
                -{deal.discount}% OFF
              </span>
              {deal.featured && <span className="badge-gold text-sm px-4 py-2"> Hot Deal</span>}
            </div>
            {/* Location */}
            <div className="absolute bottom-6 left-6">
              <div className="text-white font-display text-2xl md:text-3xl font-bold">{deal.hotelName}</div>
              <div className="text-gold-400 mt-1"> {deal.city}, {deal.country}</div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Price block */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8 p-6 bg-gray-50 rounded-2xl">
              <div>
                <div className="text-gray-400 text-sm mb-1">Original Price</div>
                <div className="text-gray-400 line-through text-xl">
                  {deal.currency} {deal.originalPrice.toLocaleString()}
                </div>
              </div>
              <div className="text-center">
                <div className="text-green-600 bg-green-100 font-bold text-sm px-3 py-1 rounded-full mb-2">
                  You save {deal.currency} {savings.toLocaleString()}
                </div>
                <div className="text-navy-900 font-black text-4xl">
                  {deal.currency} {deal.discountedPrice.toLocaleString()}
                </div>
                <div className="text-gray-400 text-sm">per night</div>
              </div>
              <div className="text-right">
                <div className="text-gold-500 font-bold text-lg"> {deal.rating}</div>
                <div className="text-gray-400 text-xs">Rating</div>
                <div className="mt-3 text-sm text-orange-600 font-semibold">
                  ⏰ Valid until {validUntilFormatted}
                </div>
              </div>
            </div>

            {/* Social Proof */}
            <div className="mb-6">
              <ErrorBoundary>
                <SocialProof city={deal.city} hotelName={deal.hotelName} type="deal" />
              </ErrorBoundary>
            </div>

            {/* Description */}
            <h1 className="font-display text-2xl md:text-3xl font-bold text-navy-900 mb-3">
              {deal.hotelName} — Exclusive Hotel Deal
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">{deal.description}</p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <a
                href={deal.affiliateLink}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="btn-gold flex-1 text-center justify-center text-base py-4"
              >
                 View Deal on Booking.com
              </a>
              <a
                href={deal.affiliateLink}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="btn-navy flex-1 text-center justify-center text-base py-4"
              >
                 Check Price & Availability
              </a>
            </div>

            {/* Price Alert */}
            <div className="mb-8">
              <ErrorBoundary>
                <PriceAlertSignup city={deal.city} currency={deal.currency} compact />
              </ErrorBoundary>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-gray-400 text-center mb-8">
              * Prices shown are indicative. Click "View Deal" to see the latest verified price.
              Best Hotel Deals Daily earns a commission on qualifying bookings at no extra cost to you.
            </p>

            {/* Last updated */}
            <div className="text-center text-xs text-gray-400">
              Last updated: {new Date(deal.lastUpdated).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
        </div>

        {/* Brand Authority Block */}
        <div className="mt-12 bg-navy-950 rounded-3xl p-8 text-white">
          <h2 className="font-display text-xl font-bold mb-6 text-center">
            Why Book Through <span className="text-gold-400">Best Hotel Deals Daily</span>?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { num: "01.", title: "Triple-Verified Pricing", desc: "We cross-check Booking.com, Agoda, and Expedia simultaneously. If the discount isn't real across all platforms, it doesn't appear here." },
              { num: "02.", title: "Middle East Specialists", desc: "We focus exclusively on UAE, Saudi Arabia, Qatar, Bahrain, Kuwait, and Oman. Our editorial team has deep regional expertise." },
              { num: "03.", title: "Zero Extra Cost", desc: "You pay the exact same price — or less — as booking directly. Our commission comes from partners, never from you." }
            ].map((item) => (
              <div key={item.num} className="p-5 bg-white/5 rounded-2xl border border-white/10">
                <div className="text-gold-400 font-black text-lg mb-1">{item.num}</div>
                <div className="font-bold text-white text-sm mb-2">{item.title}</div>
                <div className="text-gray-400 text-xs leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Related deals */}
        {relatedDeals.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-2xl font-bold text-navy-900 mb-6">
              More Hotel Deals in {deal.country}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedDeals.map((d) => <DealCard key={d.id} deal={d} />)}
            </div>
          </div>
        )}

        {/* Internal links */}
        <div className="mt-10 text-center">
          <Link href="/deals/" className="btn-navy mr-3">← All Deals</Link>
          <Link href="/blog/" className="btn-gold"> Travel Guides</Link>
        </div>
      </div>
    </div>
  );
}
