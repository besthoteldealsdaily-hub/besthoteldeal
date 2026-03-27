export type ListingType = "affiliate" | "direct" | "lead";
export type HotelStatus = "live" | "pending" | "rejected";

export interface Room {
  id: string;
  name: string;
  description: string;
  pricePerNight: number;
  currency: string;
  maxGuests: number;
  bedType: string;
  amenities: string[];
  images: string[];
  available: boolean;
}

export interface Hotel {
  id: string;
  name: string;
  slug: string;
  city: string;
  country: string;
  image: string;
  images?: string[];
  description: string;
  rating: number;
  reviewCount: number;
  priceRange: string;
  priceFrom: number;
  currency: string;
  amenities: string[];
  stars: number;
  type: "luxury" | "budget" | "boutique" | "business" | "resort";
  featured?: boolean;

  // ── Hybrid Platform Fields ──────────────────────────────────────────────
  listingType: ListingType;        // "affiliate" | "direct"
  status?: HotelStatus;            // Direct listings: live | pending | rejected
  affiliateLinks?: {
    booking?: string;
    agoda?: string;
    expedia?: string;
  };
  // Direct listing extras
  rooms?: Room[];
  ownerId?: string;
  ownerName?: string;
  ownerEmail?: string;
  commissionRate?: number;         // % platform takes on direct bookings
  checkInTime?: string;
  checkOutTime?: string;
  cancellationPolicy?: string;
  // SEO / UX badges
  verified?: boolean;              //  Verified Hotels badge
  nearHaram?: boolean;             //  Near Haram filter (Makkah/Madinah)
  bestDealToday?: boolean;         //  Best Deal Today tag
  distanceFromHaram?: string;      // e.g. "250m"
  distanceFromCenter?: string;
  allowInquiry?: boolean;          // Whether this hotel allows 'lead' generation inquiries
}

export interface Deal {
  id: string;
  hotelName: string;
  slug: string;
  city: string;
  country: string;
  image: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  discount: number;
  currency: string;
  validUntil: string;
  affiliateLink: string;
  rating: number;
  featured?: boolean;
  lastUpdated: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  category: string;
  tags: string[];
  readTime: number;
  relatedCities: string[];
  faqs: { question: string; answer: string }[];
}

export interface City {
  name: string;
  slug: string;
  country: string;
  countrySlug: string;
  image: string;
  description: string;
  hotels: Hotel[];
}

export interface Country {
  name: string;
  slug: string;
  image: string;
  description: string;
  cities: string[];
}

export interface Landmark {
  id: string;
  name: string;
  slug: string;
  city: string;
  citySlug: string;
  country: string;
  countrySlug: string;
  image: string;
  description: string;
  latitude?: number;
  longitude?: number;
  type: "religious" | "business" | "tourist" | "airport" | "landmark";
  hotelsNearby: string[]; // Hotel IDs
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  icon: string;
}

export interface HotelOwnerForm {
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  hotelName: string;
  city: string;
  country: string;
  stars: number;
  description: string;
  priceFrom: number;
  currency: string;
  website?: string;
  message?: string;
}

export interface BookingForm {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  guests: number;
  roomId?: string;
  specialRequests?: string;
}
