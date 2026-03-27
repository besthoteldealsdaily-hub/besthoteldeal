import Image from "next/image";
import Link from "next/link";
import { Deal } from "@/lib/types";
import { Flame, Clock, History, TrendingUp } from "lucide-react";
import { isCityTrending, getSeasonalContext } from "@/lib/seasonal";
import { whatsappLink, isHighTicketDeal } from "@/lib/config";
import TrackedLink from "@/components/TrackedLink";

interface DealCardProps {
  deal: Deal;
}

export default function DealCard({ deal }: DealCardProps) {
  const timeLeft = (() => {
    const end = new Date(deal.validUntil);
    const now = new Date();
    const days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (days < 0) return "Expired";
    if (days === 0) return "Last day!";
    if (days === 1) return "1 day left";
    return `${days} days left`;
  })();

  const savings = deal.originalPrice - deal.discountedPrice;

  const isHighTicket = isHighTicketDeal(deal.city, deal.discountedPrice);

  // Seasonal trending
  const trending = isCityTrending(deal.city.toLowerCase());
  const season = getSeasonalContext();

  return (
    <article className="bg-white rounded-2xl shadow-md overflow-hidden card-hover border border-gray-100 relative flex flex-col">
      {/* Discount Badge */}
      <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-sm font-black px-3 py-1.5 rounded-full shadow-lg">
        -{deal.discount}% OFF
      </div>

      {/* Featured */}
      {deal.featured && (
        <div className="absolute top-3 right-3 z-10 badge-gold text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
          <Flame className="w-3 h-3" /> Hot Deal
        </div>
      )}

      {/* Trending Badge */}
      {trending && season.badgeText && !deal.featured && (
        <div className="absolute top-3 right-3 z-10 bg-orange-500 text-white text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 shadow-lg">
          <TrendingUp className="w-3 h-3" /> {season.badgeText}
        </div>
      )}

      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <Image
          src={deal.image}
          alt={`${deal.hotelName} deal – ${deal.city}`}
          fill
          className="object-cover transition-transform duration-500 hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 to-transparent" />
        {/* Time left */}
        <div className="absolute bottom-3 left-3 bg-navy-900/90 backdrop-blur-sm text-xs text-gold-400 font-semibold px-3 py-1 rounded-full flex items-center gap-1">
          <Clock className="w-3 h-3" /> {timeLeft}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
          <svg className="w-4 h-4 text-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          {deal.city}, {deal.country}
        </div>

        <Link href={`/deals/${deal.slug}/`}>
          <h3 className="font-display text-lg font-bold text-navy-900 hover:text-gold-600 transition-colors line-clamp-2 mb-2">
            {deal.hotelName}
          </h3>
        </Link>

        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4 flex-1">
          {deal.description}
        </p>

        {/* Price */}
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 line-through text-sm">
                  {deal.currency} {deal.originalPrice.toLocaleString()}
                </span>
                <span className="text-green-600 text-xs font-bold bg-green-100 px-2 py-0.5 rounded-full">
                  Save {deal.currency} {savings.toLocaleString()}
                </span>
              </div>
              <div className="text-navy-900 font-black text-xl mt-0.5">
                {deal.currency} {deal.discountedPrice.toLocaleString()}
              </div>
              <div className="text-gray-400 text-xs">per night</div>
            </div>
            <div className="text-right">
              <div className="text-gold-500 text-sm font-bold"> {deal.rating}</div>
              <div className="text-gray-400 text-xs">Rating</div>
            </div>
          </div>
        </div>

        {/* Last updated */}
        <div className="text-gray-400 text-xs mb-4 flex items-center gap-1">
          <History className="w-3 h-3" /> Last updated: {new Date(deal.lastUpdated).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
        </div>

        {/* Brand Attribution */}
        <div className="text-[8px] text-gray-300 font-bold uppercase tracking-widest mb-3 text-center">
          Verified by Best Hotel Deals Daily
        </div>

        {/* CTAs */}
        <div className="flex gap-2">
          {isHighTicket ? (
            <TrackedLink
              href={whatsappLink(`Hi! I am looking for the ${deal.hotelName} deal in ${deal.city}. Please build a package.`)}
              event="lead_click"
              dealSlug={deal.slug}
              hotelName={deal.hotelName}
              city={deal.city}
              country={deal.country}
              pricePoint={deal.discountedPrice}
              currency={deal.currency}
              source="deal_card"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 hover:bg-green-700 text-white font-black flex-1 text-center text-sm py-2 rounded-xl transition-colors shrink-0"
            >
              Get VIP Deal
            </TrackedLink>
          ) : (
            <TrackedLink
              href={deal.affiliateLink}
              event="affiliate_click"
              dealSlug={deal.slug}
              city={deal.city}
              country={deal.country}
              source="deal_card"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="btn-gold flex-1 text-center text-sm justify-center shrink-0"
            >
              View Deal
            </TrackedLink>
          )}
          <Link
            href={`/deals/${deal.slug}/`}
            className="btn-navy text-sm px-4 shrink-0"
            aria-label={`More details about ${deal.hotelName}`}
          >
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}
