import Image from "next/image";
import Link from "next/link";
import { Hotel } from "@/lib/types";
import { MoonStar, TrendingUp } from "lucide-react";
import { isCityTrending, getSeasonalContext } from "@/lib/seasonal";
import { whatsappLink, isHighTicketHotel } from "@/lib/config";
import TrackedLink from "@/components/TrackedLink";
import AddToCompare from "@/components/AddToCompare";

interface HotelCardProps {
  hotel: Hotel;
}

export default function HotelCard({ hotel }: HotelCardProps) {
  const isDirect = hotel.listingType === "direct";
  const affiliateHref = hotel.affiliateLinks?.booking || hotel.affiliateLinks?.agoda || hotel.affiliateLinks?.expedia || "#";
  const bookHref    = `/book/${hotel.slug}/`;
  const detailHref  = isDirect ? bookHref : `/hotels/${hotel.slug}/`;

  const isHighTicket = isHighTicketHotel(hotel.city, hotel.type, hotel.priceFrom);

  // Seasonal trending
  const trending = isCityTrending(hotel.city.toLowerCase());
  const season = getSeasonalContext();

  return (
    <article className="card-compact group">
      {/* Image */}
      <div className="relative h-40 -mx-3 -mt-3 mb-3 overflow-hidden rounded-t-lg">
        <Image
          src={hotel.image}
          alt={`${hotel.name}`}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
          loading="lazy"
        />

        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {hotel.bestDealToday && (
            <span className="badge-gold">Best Deal</span>
          )}
          {isDirect && (
            <span className="badge-navy shadow-sm">Direct</span>
          )}
          {trending && season.badgeText && (
            <span className="bg-orange-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
              <TrendingUp className="w-2.5 h-2.5" /> {season.badgeText}
            </span>
          )}
        </div>

        <div className="absolute bottom-2 right-2">
          <div className="bg-navy-900/90 text-white text-[9px] font-black px-1.5 py-0.5 rounded leading-none">
            {hotel.type.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1">
        {/* Name */}
        <Link href={detailHref} className="block">
          <h3 className="text-sm font-black text-navy-900 mb-0.5 line-clamp-1 group-hover:text-gold-600 transition-colors tracking-tight">
            {hotel.name}
          </h3>
        </Link>

        {/* Location */}
        <div className="flex items-center gap-1 text-gray-400 text-[10px] mb-2 font-bold uppercase tracking-wider">
          <span className="text-gold-600">●</span> {hotel.city}
          {hotel.distanceFromCenter && (
            <span className="opacity-60 font-medium">· {hotel.distanceFromCenter}</span>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {/* Rating */}
          <div className="flex items-center gap-1.5">
            <span className="bg-navy-900 text-white font-black text-[10px] px-1 rounded-sm min-w-[20px] h-5 flex items-center justify-center">
              {hotel.rating.toFixed(1)}
            </span>
            <div className="flex flex-col">
              <span className="text-navy-900 font-black text-[9px] leading-tight uppercase">Excellent</span>
              <span className="text-gray-400 text-[8px] font-bold leading-none">{hotel.reviewCount.toLocaleString()} reviews</span>
            </div>
          </div>

          {/* Near Haram */}
          {hotel.nearHaram && (
            <div className="flex items-center gap-1">
              <MoonStar className="w-3 h-3 text-gold-500" />
              <span className="text-gray-500 font-black text-[8px] uppercase tracking-tighter truncate">Near Haram</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-500 text-[11px] leading-relaxed border-l border-gray-100 pl-2 line-clamp-2 mb-3">
          {hotel.description}
        </p>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1 mb-4">
          {hotel.amenities.slice(0, 2).map((a) => (
            <span key={a} className="text-[9px] font-black bg-gray-50 text-gray-400 px-1 py-0.5 border border-gray-100 rounded leading-none uppercase tracking-tighter">
              {a}
            </span>
          ))}
        </div>

        {/* Price + CTA */}
        <div className="flex items-end justify-between pt-2 border-t border-gray-50 mt-auto">
          <div>
            <div className="text-[8px] text-gray-400 font-black uppercase tracking-widest leading-none mb-0.5">Rates From</div>
            <div className="text-navy-900 font-black text-sm leading-none">
              {hotel.currency} {hotel.priceFrom.toLocaleString()}
            </div>
          </div>

          {isHighTicket ? (
            <TrackedLink
              href={whatsappLink(`Hi! I am looking for a VIP package for ${hotel.name} in ${hotel.city}. Please share the best rates.`)}
              event="lead_click"
              hotelSlug={hotel.slug}
              hotelName={hotel.name}
              city={hotel.city}
              country={hotel.country}
              pricePoint={hotel.priceFrom}
              currency={hotel.currency}
              source="hotel_card"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-xs font-black rounded-xl transition-colors shrink-0"
            >
              Get VIP Deal
            </TrackedLink>
          ) : isDirect ? (
            <Link
              href={bookHref}
              className="btn-navy shrink-0"
            >
              Book Now
            </Link>
          ) : (
            <TrackedLink
              href={affiliateHref}
              event="affiliate_click"
              hotelSlug={hotel.slug}
              city={hotel.city}
              country={hotel.country}
              source="hotel_card"
              target="_blank"
              className="btn-gold shrink-0"
            >
              Check Price
            </TrackedLink>
          )}
        </div>

        {/* Compare + attribution */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
          <div className="text-[7px] text-gray-300 font-bold uppercase tracking-widest">
            Compared by Best Hotel Deals Daily
          </div>
          <AddToCompare
            hotel={{
              id:          hotel.id,
              slug:        hotel.slug,
              name:        hotel.name,
              city:        hotel.city,
              stars:       hotel.stars,
              priceFrom:   hotel.priceFrom,
              currency:    hotel.currency,
              rating:      hotel.rating,
              image:       hotel.image,
              listingType: hotel.listingType,
            }}
          />
        </div>

        {/* Multi-platform links for affiliate */}
        {!isDirect && hotel.affiliateLinks && (
          <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100 items-center justify-between">
            {hotel.affiliateLinks.booking && (
              <TrackedLink href={hotel.affiliateLinks.booking} event="affiliate_click" hotelSlug={hotel.slug} city={hotel.city} source="booking_com" target="_blank" rel="noopener noreferrer nofollow" className="text-[9px] font-black text-gray-400 hover:text-navy-900 transition-colors py-1 uppercase tracking-tighter">
                Booking.com
              </TrackedLink>
            )}
            {hotel.affiliateLinks.agoda && (
              <TrackedLink href={hotel.affiliateLinks.agoda} event="affiliate_click" hotelSlug={hotel.slug} city={hotel.city} source="agoda" target="_blank" rel="noopener noreferrer nofollow" className="text-[9px] font-black text-gray-400 hover:text-navy-900 transition-colors py-1 uppercase tracking-tighter">
                Agoda
              </TrackedLink>
            )}
            {hotel.affiliateLinks.expedia && (
              <TrackedLink href={hotel.affiliateLinks.expedia} event="affiliate_click" hotelSlug={hotel.slug} city={hotel.city} source="expedia" target="_blank" rel="noopener noreferrer nofollow" className="text-[9px] font-black text-gray-400 hover:text-navy-900 transition-colors py-1 uppercase tracking-tighter">
                Expedia
              </TrackedLink>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
