/**
 * Umrah & Hajj Packages Data
 *
 * Structured inventory for the Umrah vertical.
 * Each package represents a complete pilgrimage offering
 * from a verified travel operator.
 */

export interface UmrahPackage {
  id: string;
  slug: string;
  name: string;
  operator: string;
  operatorCity: string;
  type: "umrah" | "hajj" | "umrah-plus";
  tier: "economy" | "standard" | "premium" | "vip";
  duration: string;
  nights: number;
  makkahNights: number;
  madinahNights: number;
  makkahHotel: string;
  madinahHotel: string;
  makkahDistance: string;
  madinahDistance: string;
  includesFlights: boolean;
  includesVisa: boolean;
  includesTransport: boolean;
  includesMeals: boolean;
  price: number;
  currency: string;
  priceNote: string;
  image: string;
  description: string;
  highlights: string[];
  departureCities: string[];
  validFrom: string;
  validUntil: string;
  featured?: boolean;
  rating: number;
  reviewCount: number;
}

export const umrahPackages: UmrahPackage[] = [
  {
    id: "umr-1",
    slug: "economy-umrah-10-nights-dubai",
    name: "Economy Umrah — 10 Nights",
    operator: "Al Haramain Travel",
    operatorCity: "Dubai",
    type: "umrah",
    tier: "economy",
    duration: "10 Nights / 11 Days",
    nights: 10,
    makkahNights: 5,
    madinahNights: 5,
    makkahHotel: "Elaf Al Mashaer Hotel",
    madinahHotel: "Rawda Al Madinah Hotel",
    makkahDistance: "800m from Haram",
    madinahDistance: "500m from Masjid Nabawi",
    includesFlights: true,
    includesVisa: true,
    includesTransport: true,
    includesMeals: false,
    price: 4500,
    currency: "AED",
    priceNote: "Per person, double sharing",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/680582913.jpg?k=5fd96a5d0ce5da3022369154bf305ccbaff0d2a7b2c5434f88f7fc9e5ed8bbb1&o=",
    description: "Affordable Umrah package from Dubai with flights, visa, and hotels within walking distance of both holy mosques. Ideal for first-time pilgrims and families on a budget.",
    highlights: ["Return flights from Dubai", "Umrah visa processing", "AC bus transfers", "Walking distance hotels", "Ziyarat tours included"],
    departureCities: ["Dubai", "Abu Dhabi", "Sharjah"],
    validFrom: "2026-01-01",
    validUntil: "2026-06-30",
    featured: true,
    rating: 4.5,
    reviewCount: 328,
  },
  {
    id: "umr-2",
    slug: "premium-umrah-14-nights-riyadh",
    name: "Premium Umrah — 14 Nights",
    operator: "Dar Al Safa Travel",
    operatorCity: "Riyadh",
    type: "umrah",
    tier: "premium",
    duration: "14 Nights / 15 Days",
    nights: 14,
    makkahNights: 7,
    madinahNights: 7,
    makkahHotel: "Swissotel Makkah",
    madinahHotel: "Pullman Madinah",
    makkahDistance: "200m from Haram",
    madinahDistance: "300m from Masjid Nabawi",
    includesFlights: true,
    includesVisa: true,
    includesTransport: true,
    includesMeals: true,
    price: 12500,
    currency: "SAR",
    priceNote: "Per person, double sharing",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/680582913.jpg?k=5fd96a5d0ce5da3022369154bf305ccbaff0d2a7b2c5434f88f7fc9e5ed8bbb1&o=",
    description: "Premium Umrah experience with 5-star hotels steps from Haram and Masjid Nabawi. Includes all meals, private transfers, and guided Ziyarat tours in both holy cities.",
    highlights: ["5-star Haram-view hotels", "All meals included", "Private car transfers", "Guided Ziyarat", "24/7 assistance", "Umrah visa included"],
    departureCities: ["Riyadh", "Jeddah", "Dammam"],
    validFrom: "2026-01-01",
    validUntil: "2026-12-31",
    featured: true,
    rating: 4.8,
    reviewCount: 512,
  },
  {
    id: "umr-3",
    slug: "vip-umrah-ramadan-special",
    name: "VIP Ramadan Umrah — 15 Nights",
    operator: "Elite Hajj Services",
    operatorCity: "Doha",
    type: "umrah",
    tier: "vip",
    duration: "15 Nights / 16 Days",
    nights: 15,
    makkahNights: 10,
    madinahNights: 5,
    makkahHotel: "Fairmont Makkah Clock Tower",
    madinahHotel: "The Oberoi Madinah",
    makkahDistance: "Direct Haram access",
    madinahDistance: "150m from Masjid Nabawi",
    includesFlights: true,
    includesVisa: true,
    includesTransport: true,
    includesMeals: true,
    price: 28000,
    currency: "QAR",
    priceNote: "Per person, single room",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/680582913.jpg?k=5fd96a5d0ce5da3022369154bf305ccbaff0d2a7b2c5434f88f7fc9e5ed8bbb1&o=",
    description: "The ultimate Ramadan Umrah experience. Stay at the iconic Fairmont Clock Tower with direct Haram access. Extended Makkah stay for maximum Ibadah during the blessed month.",
    highlights: ["Fairmont Clock Tower — Haram view suite", "Direct Haram access", "Iftar & Suhoor included", "Private limousine transfers", "Personal Umrah guide", "Last 10 nights of Ramadan"],
    departureCities: ["Doha", "Dubai", "Kuwait City", "Manama"],
    validFrom: "2026-02-17",
    validUntil: "2026-03-22",
    rating: 4.9,
    reviewCount: 89,
  },
  {
    id: "umr-4",
    slug: "family-umrah-package-dubai",
    name: "Family Umrah — 12 Nights",
    operator: "Al Haramain Travel",
    operatorCity: "Dubai",
    type: "umrah",
    tier: "standard",
    duration: "12 Nights / 13 Days",
    nights: 12,
    makkahNights: 6,
    madinahNights: 6,
    makkahHotel: "Hilton Suites Makkah",
    madinahHotel: "Crowne Plaza Madinah",
    makkahDistance: "400m from Haram",
    madinahDistance: "350m from Masjid Nabawi",
    includesFlights: true,
    includesVisa: true,
    includesTransport: true,
    includesMeals: true,
    price: 6800,
    currency: "AED",
    priceNote: "Per person, family room (2 adults + 2 children)",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/680582913.jpg?k=5fd96a5d0ce5da3022369154bf305ccbaff0d2a7b2c5434f88f7fc9e5ed8bbb1&o=",
    description: "Family-friendly Umrah package with spacious family rooms, child-friendly meal plans, and a patient pace designed for families traveling with young children.",
    highlights: ["Family suites with extra space", "Kids meal plan included", "Child-friendly Ziyarat pace", "Stroller-accessible transfers", "Family visa processing"],
    departureCities: ["Dubai", "Abu Dhabi"],
    validFrom: "2026-01-01",
    validUntil: "2026-12-31",
    featured: true,
    rating: 4.6,
    reviewCount: 245,
  },
  {
    id: "umr-5",
    slug: "budget-umrah-7-nights-kuwait",
    name: "Budget Umrah — 7 Nights",
    operator: "Safar Travel Kuwait",
    operatorCity: "Kuwait City",
    type: "umrah",
    tier: "economy",
    duration: "7 Nights / 8 Days",
    nights: 7,
    makkahNights: 4,
    madinahNights: 3,
    makkahHotel: "Al Shohada Hotel Makkah",
    madinahHotel: "Al Eiman Royal Hotel",
    makkahDistance: "1.2km from Haram",
    madinahDistance: "800m from Masjid Nabawi",
    includesFlights: true,
    includesVisa: true,
    includesTransport: true,
    includesMeals: false,
    price: 850,
    currency: "KWD",
    priceNote: "Per person, triple sharing",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/680582913.jpg?k=5fd96a5d0ce5da3022369154bf305ccbaff0d2a7b2c5434f88f7fc9e5ed8bbb1&o=",
    description: "Short and affordable Umrah from Kuwait. Clean hotels with shuttle service to Haram. Perfect for working professionals with limited leave.",
    highlights: ["Short 7-night itinerary", "Free Haram shuttle", "Visa included", "Group Ziyarat tours"],
    departureCities: ["Kuwait City"],
    validFrom: "2026-01-01",
    validUntil: "2026-12-31",
    rating: 4.3,
    reviewCount: 167,
  },
  {
    id: "umr-6",
    slug: "hajj-2026-standard-package",
    name: "Hajj 2026 — Standard Package",
    operator: "Dar Al Safa Travel",
    operatorCity: "Riyadh",
    type: "hajj",
    tier: "standard",
    duration: "21 Nights / 22 Days",
    nights: 21,
    makkahNights: 12,
    madinahNights: 9,
    makkahHotel: "Hilton Makkah Convention",
    madinahHotel: "Millennium Madinah Airport",
    makkahDistance: "600m from Haram",
    madinahDistance: "500m from Masjid Nabawi",
    includesFlights: true,
    includesVisa: true,
    includesTransport: true,
    includesMeals: true,
    price: 22000,
    currency: "SAR",
    priceNote: "Per person, quad sharing",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/680582913.jpg?k=5fd96a5d0ce5da3022369154bf305ccbaff0d2a7b2c5434f88f7fc9e5ed8bbb1&o=",
    description: "Complete Hajj 2026 package with accommodation in Makkah, Madinah, Mina, and Arafat. Includes all transport, meals, and guided Hajj rituals by certified scholars.",
    highlights: ["Full Hajj rites guidance", "Mina/Arafat tented accommodation", "All meals & water", "Return flights", "Hajj visa & insurance", "Scholar-led sessions"],
    departureCities: ["Riyadh", "Jeddah", "Dammam", "Dubai", "Doha"],
    validFrom: "2026-05-20",
    validUntil: "2026-06-05",
    rating: 4.7,
    reviewCount: 634,
  },
];

