/**
 * Airport Transfers & Car Rental Data
 *
 * Structured inventory for the transfers vertical.
 * Each route represents a common airport-to-hotel transfer corridor.
 */

export interface TransferRoute {
  id: string;
  slug: string;
  name: string;
  from: string;
  to: string;
  city: string;
  country: string;
  type: "airport-transfer" | "inter-city" | "car-rental";
  vehicleTypes: { name: string; capacity: number; price: number; currency: string }[];
  duration: string;
  distance: string;
  description: string;
  image: string;
  featured?: boolean;
}

export const transferRoutes: TransferRoute[] = [
  {
    id: "tf-1",
    slug: "dubai-airport-to-downtown",
    name: "Dubai Airport (DXB) → Downtown Dubai",
    from: "Dubai International Airport (DXB)",
    to: "Downtown Dubai / Burj Khalifa Area",
    city: "Dubai",
    country: "UAE",
    type: "airport-transfer",
    vehicleTypes: [
      { name: "Economy Sedan", capacity: 3, price: 85, currency: "AED" },
      { name: "Premium Sedan", capacity: 3, price: 150, currency: "AED" },
      { name: "Luxury SUV", capacity: 6, price: 280, currency: "AED" },
      { name: "Van (7-Seater)", capacity: 7, price: 200, currency: "AED" },
    ],
    duration: "25-40 min",
    distance: "18 km",
    description: "Pre-book your Dubai airport transfer and skip the taxi queue. Meet & greet service at arrivals, flight tracking, and complimentary 60-minute wait time included.",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/680582913.jpg?k=5fd96a5d0ce5da3022369154bf305ccbaff0d2a7b2c5434f88f7fc9e5ed8bbb1&o=",
    featured: true,
  },
  {
    id: "tf-2",
    slug: "jeddah-airport-to-makkah",
    name: "Jeddah Airport (JED) → Makkah",
    from: "King Abdulaziz International Airport (JED)",
    to: "Makkah Hotels / Haram Area",
    city: "Makkah",
    country: "Saudi Arabia",
    type: "airport-transfer",
    vehicleTypes: [
      { name: "Economy Sedan", capacity: 3, price: 180, currency: "SAR" },
      { name: "Premium Sedan", capacity: 3, price: 300, currency: "SAR" },
      { name: "Luxury SUV", capacity: 6, price: 500, currency: "SAR" },
      { name: "Family Van", capacity: 7, price: 400, currency: "SAR" },
    ],
    duration: "1h 15min",
    distance: "85 km",
    description: "The most popular Umrah transfer route. Licensed drivers familiar with Haram-area hotel access. Luggage assistance and drop-off at your hotel entrance.",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/680582913.jpg?k=5fd96a5d0ce5da3022369154bf305ccbaff0d2a7b2c5434f88f7fc9e5ed8bbb1&o=",
    featured: true,
  },
  {
    id: "tf-3",
    slug: "makkah-to-madinah-transfer",
    name: "Makkah → Madinah Inter-City Transfer",
    from: "Makkah Hotels",
    to: "Madinah Hotels / Masjid Nabawi Area",
    city: "Makkah",
    country: "Saudi Arabia",
    type: "inter-city",
    vehicleTypes: [
      { name: "Shared Bus", capacity: 40, price: 80, currency: "SAR" },
      { name: "Private Sedan", capacity: 3, price: 600, currency: "SAR" },
      { name: "Private SUV", capacity: 6, price: 900, currency: "SAR" },
    ],
    duration: "4-5 hours",
    distance: "420 km",
    description: "Inter-city transfer between the two holy cities. Choose between budget shared buses or private vehicles with rest stops and refreshments.",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/680582913.jpg?k=5fd96a5d0ce5da3022369154bf305ccbaff0d2a7b2c5434f88f7fc9e5ed8bbb1&o=",
    featured: true,
  },
  {
    id: "tf-4",
    slug: "doha-airport-to-city-center",
    name: "Doha Airport (DOH) → City Center",
    from: "Hamad International Airport (DOH)",
    to: "West Bay / Corniche Area",
    city: "Doha",
    country: "Qatar",
    type: "airport-transfer",
    vehicleTypes: [
      { name: "Economy Sedan", capacity: 3, price: 100, currency: "QAR" },
      { name: "Premium Sedan", capacity: 3, price: 200, currency: "QAR" },
      { name: "Luxury SUV", capacity: 6, price: 350, currency: "QAR" },
    ],
    duration: "20-30 min",
    distance: "12 km",
    description: "Quick airport transfer to Doha's business and hotel district. Professional drivers, flight tracking, and free cancellation up to 24 hours before.",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/680582913.jpg?k=5fd96a5d0ce5da3022369154bf305ccbaff0d2a7b2c5434f88f7fc9e5ed8bbb1&o=",
  },
  {
    id: "tf-5",
    slug: "riyadh-airport-to-city",
    name: "Riyadh Airport (RUH) → City Hotels",
    from: "King Khalid International Airport (RUH)",
    to: "Riyadh City Hotels / Olaya District",
    city: "Riyadh",
    country: "Saudi Arabia",
    type: "airport-transfer",
    vehicleTypes: [
      { name: "Economy Sedan", capacity: 3, price: 120, currency: "SAR" },
      { name: "Business Sedan", capacity: 3, price: 250, currency: "SAR" },
      { name: "SUV", capacity: 6, price: 400, currency: "SAR" },
    ],
    duration: "30-45 min",
    distance: "35 km",
    description: "Riyadh airport transfer to all major hotel districts. Popular with business travelers and families visiting for Riyadh Season events.",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/680582913.jpg?k=5fd96a5d0ce5da3022369154bf305ccbaff0d2a7b2c5434f88f7fc9e5ed8bbb1&o=",
  },
  {
    id: "tf-6",
    slug: "muscat-airport-transfer",
    name: "Muscat Airport (MCT) → Hotels",
    from: "Muscat International Airport (MCT)",
    to: "Al Qurum / Muttrah Hotels",
    city: "Muscat",
    country: "Oman",
    type: "airport-transfer",
    vehicleTypes: [
      { name: "Economy Sedan", capacity: 3, price: 15, currency: "OMR" },
      { name: "Premium Sedan", capacity: 3, price: 28, currency: "OMR" },
      { name: "SUV", capacity: 6, price: 45, currency: "OMR" },
    ],
    duration: "25-35 min",
    distance: "22 km",
    description: "Comfortable airport transfer from Muscat International to all major hotel areas. English and Arabic speaking drivers available.",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/680582913.jpg?k=5fd96a5d0ce5da3022369154bf305ccbaff0d2a7b2c5434f88f7fc9e5ed8bbb1&o=",
  },
  {
    id: "tf-7",
    slug: "dubai-car-rental",
    name: "Dubai Car Rental — Daily & Weekly",
    from: "Multiple pickup locations",
    to: "Dubai-wide",
    city: "Dubai",
    country: "UAE",
    type: "car-rental",
    vehicleTypes: [
      { name: "Economy (Nissan Sunny)", capacity: 5, price: 90, currency: "AED" },
      { name: "Mid-Size (Toyota Camry)", capacity: 5, price: 150, currency: "AED" },
      { name: "SUV (Nissan Patrol)", capacity: 7, price: 350, currency: "AED" },
      { name: "Luxury (Mercedes E-Class)", capacity: 4, price: 500, currency: "AED" },
    ],
    duration: "Per day",
    distance: "Unlimited km",
    description: "Compare car rental rates from top providers in Dubai. Airport pickup available at DXB and DWC. Full insurance and unlimited mileage options.",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/680582913.jpg?k=5fd96a5d0ce5da3022369154bf305ccbaff0d2a7b2c5434f88f7fc9e5ed8bbb1&o=",
    featured: true,
  },
  {
    id: "tf-8",
    slug: "bahrain-airport-transfer",
    name: "Bahrain Airport (BAH) → Hotels",
    from: "Bahrain International Airport (BAH)",
    to: "Manama Hotels / Seef District",
    city: "Manama",
    country: "Bahrain",
    type: "airport-transfer",
    vehicleTypes: [
      { name: "Economy Sedan", capacity: 3, price: 8, currency: "BHD" },
      { name: "Premium Sedan", capacity: 3, price: 15, currency: "BHD" },
      { name: "SUV", capacity: 6, price: 25, currency: "BHD" },
    ],
    duration: "15-25 min",
    distance: "10 km",
    description: "Quick transfer from Bahrain airport to all major hotels. Popular weekend gateway from Saudi Arabia.",
    image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/680582913.jpg?k=5fd96a5d0ce5da3022369154bf305ccbaff0d2a7b2c5434f88f7fc9e5ed8bbb1&o=",
  },
];

export function getFeaturedTransfers(): TransferRoute[] {
  return transferRoutes.filter((t) => t.featured);
}
