import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { hotels, getHotelBySlug } from "@/lib/data";
import { Hotel } from "@/lib/types";
import Breadcrumb from "@/components/Breadcrumb";
import RelatedHotels from "@/components/RelatedHotels";
import AddToCompare from "@/components/AddToCompare";
import QuickLeadModal from "@/components/QuickLeadModal";
import TrackedLink from "@/components/TrackedLink";
import { whatsappLink, isHighTicketHotel } from "@/lib/config";
import {
  Star, MapPin, Wifi, Shield, Phone, Mail, Globe, MoonStar,
  CheckCircle, Clock, Users, CreditCard, ArrowRight,
} from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return hotels.map((h) => ({ slug: h.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const hotel    = getHotelBySlug(slug);
  if (!hotel) return {};

  const title       = `${hotel.name} – ${hotel.city} Hotel | Best Hotel Deals Daily`;
  const description = `Book ${hotel.name} in ${hotel.city}. ${hotel.description.slice(0, 140)}. From ${hotel.currency} ${hotel.priceFrom.toLocaleString()}/night.`;

  return {
    title,
    description,
    alternates: { canonical: `https://besthoteldealsdaily.com/hotels/${hotel.slug}/` },
    openGraph: { title, description, images: [hotel.image] },
  };
}

// Helper: get related hotels (same city, different hotel)
function getRelated(hotel: Hotel): Hotel[] {
  return hotels
    .filter((h) => h.city === hotel.city && h.slug !== hotel.slug && h.type === hotel.type)
    .slice(0, 3)
    .concat(
      hotels.filter((h) => h.city === hotel.city && h.slug !== hotel.slug && h.type !== hotel.type).slice(0, 3 - hotels.filter((h) => h.city === hotel.city && h.slug !== hotel.slug && h.type === hotel.type).slice(0, 3).length),
    )
    .slice(0, 3);
}

export default async function HotelDetailPage({ params }: Props) {
  const { slug } = await params;
  const hotel    = getHotelBySlug(slug);
  if (!hotel) notFound();

  const related    = getRelated(hotel);
  const isDirect   = hotel.listingType === "direct"   && hotel.status === "live";
  const isAffiliate = hotel.listingType === "affiliate";
  const isHighTicket = isHighTicketHotel(hotel.city, hotel.type, hotel.priceFrom);

  const affiliateUrl = hotel.affiliateLinks?.booking
    || hotel.affiliateLinks?.agoda
    || hotel.affiliateLinks?.expedia
    || "#";

  const amenityIcons: Record<string, React.ReactNode> = {
    "Wi-Fi":          <Wifi className="w-3.5 h-3.5" />,
    "WiFi":           <Wifi className="w-3.5 h-3.5" />,
    "Free WiFi":      <Wifi className="w-3.5 h-3.5" />,
    "Pool":           <span className="text-[11px]">🏊</span>,
    "Spa":            <span className="text-[11px]">💆</span>,
    "Gym":            <span className="text-[11px]">🏋️</span>,
    "Restaurant":     <span className="text-[11px]">🍽️</span>,
    "Parking":        <span className="text-[11px]">🅿️</span>,
    "Airport Shuttle":<span className="text-[11px]">🚌</span>,
  };

  // Hotel schema
  const hotelSchema = {
    "@context": "https://schema.org",
    "@type":    "Hotel",
    name:       hotel.name,
    description: hotel.description,
    image:      hotel.image,
    url:        `https://besthoteldealsdaily.com/hotels/${hotel.slug}/`,
    address: {
      "@type":         "PostalAddress",
      addressLocality: hotel.city,
      addressCountry:  hotel.country,
    },
    starRating: {
      "@type":      "Rating",
      ratingValue:  hotel.stars,
    },
    aggregateRating: {
      "@type":       "AggregateRating",
      ratingValue:   hotel.rating,
      reviewCount:   hotel.reviewCount,
      bestRating:    5,
    },
    priceRange: hotel.priceRange,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hotelSchema).replace(/</g, "\\u003c") }}
      />

      <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumb crumbs={[
              { label: "Home",  href: "/" },
              { label: hotel.city.charAt(0).toUpperCase() + hotel.city.slice(1), href: `/city/${hotel.city.toLowerCase().replace(/\s+/g, "-")}/` },
              { label: hotel.name },
            ]} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── LEFT: Main Content ─────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Hero image */}
              <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden">
                <Image
                  src={hotel.image}
                  alt={hotel.name}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent" />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  {hotel.verified    && <span className="badge bg-white text-navy-900 border border-gray-200">✓ Verified</span>}
                  {hotel.bestDealToday && <span className="badge-gold">Best Deal</span>}
                  {isDirect          && <span className="badge-navy">Direct Booking</span>}
                  {hotel.nearHaram   && (
                    <span className="badge bg-emerald-600 text-white flex items-center gap-0.5">
                      <MoonStar className="w-2.5 h-2.5" /> Near Haram
                    </span>
                  )}
                </div>

                {/* Bottom info */}
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <div>
                    <h1 className="text-white font-black text-xl sm:text-2xl leading-tight drop-shadow-lg">
                      {hotel.name}
                    </h1>
                    <div className="flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3 h-3 text-gold-400" />
                      <span className="text-white/80 text-xs font-semibold capitalize">{hotel.city}, {hotel.country.toUpperCase()}</span>
                      {hotel.distanceFromCenter && (
                        <span className="text-white/50 text-[10px]">· {hotel.distanceFromCenter} from centre</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: Math.min(hotel.stars, 5) }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-gold-400 fill-current drop-shadow" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
                  <div className="text-sm font-black text-navy-900">{hotel.rating.toFixed(1)}</div>
                  <div className="text-[9px] text-gray-400 uppercase tracking-wider font-bold">Rating</div>
                  <div className="text-[9px] text-gray-400">{hotel.reviewCount.toLocaleString()} reviews</div>
                </div>
                <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
                  <div className="text-sm font-black text-navy-900">{hotel.stars}★</div>
                  <div className="text-[9px] text-gray-400 uppercase tracking-wider font-bold">Stars</div>
                  <div className="text-[9px] text-gray-400 capitalize">{hotel.type}</div>
                </div>
                <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
                  <div className="text-sm font-black text-navy-900">{hotel.currency} {hotel.priceFrom.toLocaleString()}</div>
                  <div className="text-[9px] text-gray-400 uppercase tracking-wider font-bold">From / night</div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <h2 className="text-sm font-black text-navy-900 mb-3">About {hotel.name}</h2>
                <p className="text-xs text-gray-600 leading-relaxed">{hotel.description}</p>
              </div>

              {/* Amenities */}
              {hotel.amenities.length > 0 && (
                <div className="bg-white rounded-2xl p-5 border border-gray-100">
                  <h2 className="text-sm font-black text-navy-900 mb-3">Amenities</h2>
                  <div className="flex flex-wrap gap-2">
                    {hotel.amenities.map((a) => (
                      <div key={a} className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5 text-xs font-semibold text-navy-700">
                        {amenityIcons[a] ?? <CheckCircle className="w-3.5 h-3.5 text-gold-500" />}
                        {a}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Check-in info */}
              {(hotel.checkInTime || hotel.checkOutTime || hotel.cancellationPolicy) && (
                <div className="bg-white rounded-2xl p-5 border border-gray-100">
                  <h2 className="text-sm font-black text-navy-900 mb-3">Hotel Policies</h2>
                  <div className="space-y-2.5">
                    {hotel.checkInTime && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Clock className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                        <span><strong>Check-in:</strong> from {hotel.checkInTime}</span>
                      </div>
                    )}
                    {hotel.checkOutTime && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Clock className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                        <span><strong>Check-out:</strong> by {hotel.checkOutTime}</span>
                      </div>
                    )}
                    {hotel.cancellationPolicy && (
                      <div className="flex items-start gap-2 text-xs text-gray-600">
                        <Shield className="w-3.5 h-3.5 text-gold-500 shrink-0 mt-0.5" />
                        <span><strong>Cancellation:</strong> {hotel.cancellationPolicy}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Rooms (direct only) */}
              {isDirect && hotel.rooms && hotel.rooms.length > 0 && (
                <div className="bg-white rounded-2xl p-5 border border-gray-100">
                  <h2 className="text-sm font-black text-navy-900 mb-3">Available Rooms</h2>
                  <div className="space-y-3">
                    {hotel.rooms.map((room) => (
                      <div key={room.id} className="border border-gray-100 rounded-xl p-3 flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-navy-900">{room.name}</div>
                          <div className="text-[10px] text-gray-400">{room.bedType} · Up to {room.maxGuests} guests</div>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {room.amenities.slice(0, 3).map((a) => (
                              <span key={a} className="text-[9px] bg-gray-50 border border-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{a}</span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-sm font-black text-navy-900">{room.currency} {room.pricePerNight.toLocaleString()}</div>
                          <div className="text-[9px] text-gray-400">per night</div>
                          <Link href={`/book/${hotel.slug}/`} className="inline-block mt-1.5 text-[10px] font-black bg-navy-900 text-white px-3 py-1.5 rounded-lg hover:bg-navy-800 transition-colors">
                            Book
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related hotels */}
              {related.length > 0 && (
                <div className="bg-white rounded-2xl p-5 border border-gray-100">
                  <RelatedHotels
                    hotels={related}
                    title={`More Hotels in ${hotel.city.charAt(0).toUpperCase() + hotel.city.slice(1)}`}
                  />
                </div>
              )}
            </div>

            {/* ── RIGHT: CTA Sidebar ─────────────────────────────────── */}
            <div className="lg:col-span-1 space-y-4">

              {/* Price card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-24">
                <div className="mb-4">
                  <div className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Rates Starting From</div>
                  <div className="text-3xl font-black text-navy-900 mt-0.5">
                    {hotel.currency} {hotel.priceFrom.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-gray-400">per night · taxes may apply</div>
                </div>

                {/* Trust signals */}
                <div className="space-y-1.5 mb-4 pb-4 border-b border-gray-100">
                  {[
                    { icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />, text: "Price verified daily" },
                    { icon: <Shield       className="w-3.5 h-3.5 text-emerald-500" />, text: "Secure booking" },
                    { icon: <Users        className="w-3.5 h-3.5 text-emerald-500" />, text: "Expert support 24/7" },
                    { icon: <CreditCard   className="w-3.5 h-3.5 text-emerald-500" />, text: isDirect ? "Pay at hotel — no fee" : "Best rate guaranteed" },
                  ].map(({ icon, text }) => (
                    <div key={text} className="flex items-center gap-2 text-[11px] text-gray-600">
                      {icon} {text}
                    </div>
                  ))}
                </div>

                {/* CTAs */}
                <div className="space-y-2.5">
                  {isDirect ? (
                    <Link
                      href={`/book/${hotel.slug}/`}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm text-navy-950 transition-all hover:scale-[1.02]"
                      style={{ background: "linear-gradient(135deg,#d4a017,#efd466)" }}
                    >
                      Book Now — No Fee <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : isHighTicket ? (
                    <TrackedLink
                      href={whatsappLink(`Hi! I am looking for a VIP package for ${hotel.name} in ${hotel.city}. Please share the best rates.`)}
                      event="lead_click"
                      hotelSlug={hotel.slug}
                      hotelName={hotel.name}
                      city={hotel.city}
                      country={hotel.country}
                      pricePoint={hotel.priceFrom}
                      currency={hotel.currency}
                      source="hotel_detail"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm bg-green-600 text-white hover:bg-green-700 transition-colors"
                    >
                      Get VIP Deal via WhatsApp
                    </TrackedLink>
                  ) : isAffiliate ? (
                    <>
                      <TrackedLink
                        href={affiliateUrl}
                        event="affiliate_click"
                        hotelSlug={hotel.slug}
                        city={hotel.city}
                        country={hotel.country}
                        source="hotel_detail_primary"
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm text-navy-950 transition-all hover:scale-[1.02]"
                        style={{ background: "linear-gradient(135deg,#d4a017,#efd466)" }}
                      >
                        Check Price & Availability <ArrowRight className="w-4 h-4" />
                      </TrackedLink>
                      <QuickLeadModal
                        hotelName={hotel.name}
                        hotelSlug={hotel.slug}
                        hotelCity={hotel.city}
                        hotelImage={hotel.image}
                        trigger={
                          <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm border border-gray-200 text-gray-600 hover:border-navy-300 hover:text-navy-900 transition-colors">
                            Get Best Deal — Free Inquiry
                          </button>
                        }
                      />
                    </>
                  ) : (
                    <QuickLeadModal
                      hotelName={hotel.name}
                      hotelSlug={hotel.slug}
                      hotelCity={hotel.city}
                      hotelImage={hotel.image}
                      trigger={
                        <button
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm text-navy-950 transition-all hover:scale-[1.02]"
                          style={{ background: "linear-gradient(135deg,#d4a017,#efd466)" }}
                        >
                          Send Inquiry — Get Best Rate
                        </button>
                      }
                    />
                  )}

                  {/* Affiliate platform links */}
                  {isAffiliate && hotel.affiliateLinks && (
                    <div className="pt-2 border-t border-gray-100">
                      <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-2">Also on</div>
                      <div className="flex gap-2 flex-wrap">
                        {hotel.affiliateLinks.booking && (
                          <TrackedLink href={hotel.affiliateLinks.booking} event="affiliate_click" hotelSlug={hotel.slug} city={hotel.city} source="booking_com" target="_blank" rel="noopener noreferrer nofollow" className="text-[10px] text-gray-500 hover:text-navy-900 font-bold py-1 px-2 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                            Booking.com
                          </TrackedLink>
                        )}
                        {hotel.affiliateLinks.agoda && (
                          <TrackedLink href={hotel.affiliateLinks.agoda} event="affiliate_click" hotelSlug={hotel.slug} city={hotel.city} source="agoda" target="_blank" rel="noopener noreferrer nofollow" className="text-[10px] text-gray-500 hover:text-navy-900 font-bold py-1 px-2 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                            Agoda
                          </TrackedLink>
                        )}
                        {hotel.affiliateLinks.expedia && (
                          <TrackedLink href={hotel.affiliateLinks.expedia} event="affiliate_click" hotelSlug={hotel.slug} city={hotel.city} source="expedia" target="_blank" rel="noopener noreferrer nofollow" className="text-[10px] text-gray-500 hover:text-navy-900 font-bold py-1 px-2 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                            Expedia
                          </TrackedLink>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Compare button */}
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-center">
                  <AddToCompare
                    size="md"
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
              </div>

              {/* Contact card */}
              {(hotel.ownerEmail || hotel.ownerName) && (
                <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2">
                  <div className="text-xs font-black text-navy-900 mb-2">Contact Hotel</div>
                  {hotel.ownerEmail && (
                    <a href={`mailto:${hotel.ownerEmail}`} className="flex items-center gap-2 text-xs text-gray-600 hover:text-gold-600 transition-colors">
                      <Mail className="w-3.5 h-3.5 text-gold-500" /> {hotel.ownerEmail}
                    </a>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
