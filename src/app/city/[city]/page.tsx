import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getCityBySlug, cities, countries, getRelatedCities, blogPosts, getLandmarksByCity, getDealsByCity } from "@/lib/data";
import { umrahPackages } from "@/lib/umrah-data";
import { transferRoutes } from "@/lib/transfers-data";
import HotelCard from "@/components/HotelCard";
import Breadcrumb from "@/components/Breadcrumb";
import PriceIntelligence from "@/components/PriceIntelligence";
import SocialProof from "@/components/SocialProof";
import PriceAlertSignup from "@/components/PriceAlertSignup";
import ErrorBoundary from "@/components/ErrorBoundary";
import { MoonStar, Car, ArrowRight } from "lucide-react";

type Props = { params: Promise<{ city: string }> };

export async function generateStaticParams() {
  return cities.map((c) => ({ city: c.slug }));
}

function generateCityMeta(cityName: string, n: number, minPrice: number, currency: string) {
  switch (cityName.toLowerCase()) {
    case "dubai":
      return {
        title: `${n} Dubai Hotels 2026 – From AED ${minPrice}/night | Compare & Book Today`,
        description: `Find your perfect Dubai hotel — budget stays near Dubai Metro to Burj Khalifa-view suites. ${n} verified properties from AED ${minPrice}/night. Booking.com, Agoda & direct rates compared daily.`,
      };
    case "makkah":
      return {
        title: `Hotels Near Al Masjid Al Haram, Makkah 2026 – ${n} Pilgrim Stays | Compare Rates`,
        description: `${n} verified Makkah hotels from steps-away Haram-view suites to budget options with free shuttles. From SAR ${minPrice}/night. Compare Hajj & Umrah season rates — book early to save.`,
      };
    case "madinah":
      return {
        title: `Hotels Near Masjid an-Nabawi, Madinah 2026 – ${n} Verified Stays | Book Direct`,
        description: `Stay within walking distance of the Prophet's Mosque. ${n} verified Madinah hotels from SAR ${minPrice}/night — budget pilgrim rooms to luxury 5-star suites. Compare & book with confidence.`,
      };
    case "riyadh":
      return {
        title: `${n} Riyadh Hotels 2026 – Business & Luxury Stays from SAR ${minPrice}/night`,
        description: `Compare ${n} verified Riyadh hotels in Olaya, KAFD & the Diplomatic Quarter. Business travel, Riyadh Season, and weekend escapes — real rates updated daily.`,
      };
    case "doha":
      return {
        title: `${n} Doha Hotels 2026 – Compare Rates Near The Pearl & West Bay`,
        description: `Ultra-luxury in West Bay to value stays in Al Sadd — ${n} verified Doha hotels from QAR ${minPrice}/night. Booking.com, Agoda & direct rates compared every day.`,
      };
    case "muscat":
      return {
        title: `${n} Muscat Hotels 2026 – Beach Resorts & City Stays | Premium Value`,
        description: `Discover ${n} verified Muscat hotels — beachfront resorts, mountain-view retreats & city stays from OMR ${minPrice}/night. Premium Gulf hospitality at exceptional value.`,
      };
    case "manama":
      return {
        title: `${n} Manama Hotels 2026 – Bahrain Stays | Compare Rates & Book Today`,
        description: `Stay in Bahrain from BHD ${minPrice}/night. ${n} verified Manama hotels in Juffair, Seef & the Diplomatic Area — ideal for Saudi weekend escapes and corporate travelers.`,
      };
    case "abu dhabi":
      return {
        title: `${n} Abu Dhabi Hotels 2026 – Near Sheikh Zayed Mosque, Yas Island & Saadiyat`,
        description: `Compare ${n} verified Abu Dhabi hotels — Emirates Palace to Corniche stays. From AED ${minPrice}/night. F1 season, cultural tourism & beach luxury rates compared daily.`,
      };
    case "kuwait city":
      return {
        title: `${n} Kuwait City Hotels 2026 – Compare Rates in Sharq & Salmiya`,
        description: `Find ${n} verified Kuwait City hotels from KWD ${minPrice}/night. Business stays near ministries, leisure hotels by the waterfront — compare and book your ideal property.`,
      };
    default:
      return {
        title: `${n} Hotels in ${cityName} 2026 – Compare & Book | Best Deals Daily`,
        description: `Compare ${n}+ verified hotels in ${cityName}. Luxury to budget stays near top landmarks. Prices from ${currency} ${minPrice}/night. Updated daily.`,
      };
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = getCityBySlug(citySlug);
  if (!city) return {};

  const minPrice = city.hotels.length > 0 ? Math.min(...city.hotels.map((h) => h.priceFrom)) : 0;
  const currency = city.hotels[0]?.currency || "USD";
  const meta = generateCityMeta(city.name, city.hotels.length, minPrice, currency);

  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `https://besthoteldealsdaily.com/city/${city.slug}/` },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `https://besthoteldealsdaily.com/city/${city.slug}/`,
      images: [{ url: city.image, width: 1200, height: 630, alt: `Hotels in ${city.name}` }],
    },
  };
}

export default async function CityPage({ params }: Props) {
  const { city: citySlug } = await params;
  const city = getCityBySlug(citySlug);
  if (!city) notFound();

  const relatedCities = getRelatedCities(city.slug);
  const relatedPosts = blogPosts.filter((b) => b.relatedCities.includes(city.slug) || b.category === city.slug).slice(0, 3);
  const cityLandmarks = getLandmarksByCity(city.slug);
  const cityDeals = getDealsByCity(city.name).slice(0, 3);
  const cityCountry = countries.find((co) => co.slug === city.countrySlug);

  // Categorize hotels for Comparison logic
  const luxuryHotels = city.hotels.filter(h => h.stars === 5 || h.type === "luxury");
  const budgetHotels = city.hotels.filter(h => h.stars <= 3 || h.type === "budget" || h.priceFrom < 400);

  // Programmatic SEO Content Generation based on City
  const generateDynamicSEO = (cityName: string) => {
    switch (cityName.toLowerCase()) {
      case "makkah":
        return {
          whyPopular: "Makkah is the spiritual heart of Islam, drawing millions of pilgrims annually for Hajj and Umrah. Finding accommodation near Al Masjid Al Haram is the primary goal for visitors to minimize walking distance during prayer times.",
          bestTime: "The peak seasons are during Ramadan and Hajj, where prices surge. Booking 2-3 months in advance is critical. For cheaper rates, consider visiting shortly after Hajj or during the cooler winter months.",
          travelerTips: "Families should prioritize hotels in the Abraj Al Bait complex or Jabal Omar for direct Haram access. If traveling on a budget, areas like Al Aziziyah offer great value with free shuttle services.",
          faq: [
            { q: "What is the closest hotel to the Kaaba?", a: "Hotels in the Abraj Al Bait complex (like Fairmont Makkah and Swissôtel) offer the closest proximity, with some rooms featuring direct Kaaba views." },
            { q: "Are there free shuttles from cheap hotels in Makkah?", a: "Yes, most budget and mid-range hotels slightly outside the central Haram area (such as in Al Aziziyah) provide complimentary 24/7 shuttle buses to the mosque." },
            { q: "How do I get a Kaaba view room?", a: "You must explicitly book a Haram View or Kaaba View suite. Be prepared to pay a premium, but the spiritual experience is highly reviewed." }
          ]
        };
      case "dubai":
        return {
          whyPopular: "Dubai is a global hub for luxury tourism, business, and world-class shopping. From the towering Burj Khalifa to the man-made Palm Jumeirah, it offers unparalleled architectural marvels and premium hospitality.",
          bestTime: "The best time to visit Dubai is from November to March when the weather is cool and ideal for outdoor activities, desert safaris, and beach days.",
          travelerTips: "Business travelers should stay in Downtown Dubai or DIFC. Families will love the resorts on Palm Jumeirah featuring water parks. For budget constraints, Deira and Al Barsha offer excellent metro connectivity.",
          faq: [
            { q: "Which area is best to stay in Dubai for tourists?", a: "Downtown Dubai is best for first-timers wanting to see the Burj Khalifa and Dubai Mall. Dubai Marina and JBR are perfect for beach lovers and nightlife." },
            { q: "Do hotels in Dubai ask for a marriage certificate?", a: "No, foreign tourists are not required to present a marriage certificate when checking into hotels in Dubai." },
            { q: "Can I find cheap hotels in Dubai?", a: "Absolutely. Areas like Al Barsha, Deira, and Bur Dubai offer excellent budget-friendly hotels with close proximity to the Metro stations." }
          ]
        };
      case "madinah":
        return {
          whyPopular: "Madinah is the second holiest city in Islam, centered around Al-Masjid an-Nabawi (The Prophets Mosque). Pilgrims visit for spiritual peace and to pray at the Rawdah.",
          bestTime: "Like Makkah, Ramadan and Hajj are peak times. The winter months offer pleasant weather for walking between the hotel and the mosque.",
          travelerTips: "Book hotels in the Northern Central Area (Markazia) for the shortest walk to the womens gates. Southern area hotels are also excellent but require a slightly longer walk to specific entrances.",
          faq: [
            { q: "Which hotels are closest to the Prophets Mosque?", a: "Hotels in the Markazia District, such as Anwar Al Madinah Mövenpick and Pullman Zamzam, are literally steps away from the mosque courtyard." },
            { q: "Is breakfast included in Madinah hotels?", a: "Most 4 and 5-star hotels include international buffet breakfasts, which is highly recommended as dining options can get crowded after morning prayers." }
          ]
        };
      case "doha":
        return {
          whyPopular: "Doha has rapidly emerged as a world-class destination following the 2022 FIFA World Cup. The city blends futuristic architecture along the Corniche with traditional souqs and the world-renowned Museum of Islamic Art. Its hotel scene is dominated by ultra-luxury brands competing for the highest standards.",
          bestTime: "November to March offers ideal weather with temperatures between 20–25°C. Avoid June to September when humidity peaks. Major events like the Qatar Grand Prix and Doha Jewellery & Watches Exhibition drive hotel demand.",
          travelerTips: "West Bay is the prime district for business travelers with direct metro access. Families should consider Lusail or The Pearl-Qatar for beachfront resort living. Budget travelers will find strong value in Al Sadd and Musheireb areas.",
          faq: [
            { q: "What is the best area to stay in Doha?", a: "West Bay is ideal for business travelers with its cluster of 5-star towers and metro connectivity. The Pearl-Qatar suits families and luxury seekers with its beachfront villas and marina dining. Al Sadd offers great mid-range options near Souq Waqif." },
            { q: "Are hotels in Doha expensive?", a: "Doha has a wide range. Ultra-luxury properties like St. Regis and Four Seasons start from QAR 1,200/night, but excellent 4-star hotels in Al Sadd and Musheireb are available from QAR 350/night." },
            { q: "Is The Pearl-Qatar a good area to stay?", a: "Yes. The Pearl-Qatar is a man-made island offering beachfront hotels, luxury apartments, and a vibrant marina. It is particularly popular with families and long-stay visitors." }
          ]
        };
      case "riyadh":
        return {
          whyPopular: "Riyadh is the capital and economic powerhouse of Saudi Arabia. With Vision 2030 transforming the city, it now features world-class entertainment, restaurants, and business infrastructure. The hotel market has expanded rapidly to serve both corporate travelers and the growing tourism sector.",
          bestTime: "October to March is best, with pleasant temperatures around 15–25°C. Riyadh Season (October–March) brings massive entertainment events that drive hotel demand. Summer months exceed 45°C and are best avoided for leisure.",
          travelerTips: "Business travelers should base themselves in Olaya or King Abdullah Financial District (KAFD) for proximity to corporate offices. Families will enjoy the Diplomatic Quarter for its parks and quieter environment. Budget travelers can find value in Al Malaz and Al Murabba near the National Museum.",
          faq: [
            { q: "What is the best area to stay in Riyadh for business?", a: "Olaya District and King Abdullah Financial District (KAFD) are the top choices. Both areas are home to major corporate headquarters, premium dining, and 5-star hotels like Four Seasons and Ritz-Carlton." },
            { q: "Can I find budget hotels in Riyadh?", a: "Yes. Areas like Al Malaz and Al Murabba offer clean 3-star hotels from SAR 250/night. These neighborhoods are close to the National Museum and have good metro connectivity." },
            { q: "Is Riyadh safe for tourists?", a: "Yes. Riyadh is considered very safe for tourists. Saudi Arabia has invested heavily in tourism infrastructure, and the city welcomes international visitors with dedicated tourist visa programs." }
          ]
        };
      case "manama":
        return {
          whyPopular: "Manama is Bahrain's cosmopolitan capital, known for its blend of ancient Arabian heritage and modern luxury. Connected to Saudi Arabia via the King Fahd Causeway, it serves as a weekend getaway for Gulf residents and a business hub for the financial sector.",
          bestTime: "November to March offers the most comfortable weather. Bahrain Grand Prix (March) and the annual Bahrain International Airshow are peak periods. Weekends (Thursday-Friday) see elevated hotel rates due to Saudi visitors.",
          travelerTips: "Juffair is the entertainment hub with restaurants and nightlife. Seef District is best for shopping and family stays near City Centre Bahrain. The Diplomatic Area suits business travelers with its concentration of banks and corporate offices.",
          faq: [
            { q: "What is the best area to stay in Manama?", a: "Juffair is popular for leisure travelers with its dining and entertainment options. Seef District is ideal for families near major malls. Business travelers prefer the Diplomatic Area or hotels along the Corniche." },
            { q: "Are hotels in Bahrain cheaper than Dubai?", a: "Generally yes. Bahrain offers excellent 5-star hotels at 30-40% lower rates than comparable properties in Dubai. A luxury stay that costs AED 1,500 in Dubai may cost BHD 80-120 (approximately AED 800-1,200) in Manama." },
            { q: "Can I visit Bahrain on a weekend trip from Saudi Arabia?", a: "Yes. The King Fahd Causeway connects Saudi Arabia to Bahrain and the drive takes approximately 30 minutes from Dammam. Many Saudi visitors book hotel stays for Thursday and Friday nights." }
          ]
        };
      case "kuwait city":
        return {
          whyPopular: "Kuwait City is a modern Gulf capital with a rich history and rapidly developing hospitality scene. The city offers a mix of waterfront luxury, cultural landmarks like the Kuwait Towers, and vibrant traditional souqs. It is primarily a business and cultural destination.",
          bestTime: "November to March is the ideal visiting period with temperatures between 15–25°C. Kuwait's summer heat (June-September) regularly exceeds 50°C, making it one of the hottest cities in the world during that period.",
          travelerTips: "Sharq and Kuwait City center are best for business travelers near ministries and corporate offices. Salmiya is the go-to area for leisure travelers, shopping, and coastal walks. Families will appreciate the Avenues Mall area for proximity to entertainment.",
          faq: [
            { q: "What is the best area to stay in Kuwait City?", a: "Sharq district is ideal for business travelers with proximity to government buildings and corporate offices. Salmiya is preferred by leisure travelers for its coastal location, restaurants, and shopping centers." },
            { q: "Are hotels in Kuwait City expensive?", a: "Kuwait offers moderate pricing compared to Dubai. Luxury hotels like Four Seasons and JW Marriott start from KWD 80/night (approximately USD 260). Good 4-star hotels are available from KWD 30-50/night." },
            { q: "What is there to do in Kuwait City?", a: "Key attractions include the Kuwait Towers, Grand Mosque, Souq Al-Mubarakiya, the Avenues Mall, and the Scientific Center. The city also has a growing arts and dining scene along the waterfront." }
          ]
        };
      case "muscat":
        return {
          whyPopular: "Muscat is one of the most elegant and understated capitals in the Gulf. Nestled between mountains and sea, it offers a serene alternative to the high-energy cities of Dubai and Doha. The hotel scene emphasizes boutique luxury and resort-style experiences.",
          bestTime: "October to April is ideal with temperatures around 25–30°C. The Muscat Festival (January-February) is a major cultural event. Summer months bring extreme heat and are primarily suited for resort stays with beach and pool access.",
          travelerTips: "Al Qurum and Shatti Al Qurum are excellent for beach resort stays. The old town areas of Mutrah and Muttrah Corniche offer cultural immersion. Business travelers should consider the Central Business District or Muscat Hills for proximity to corporate centers.",
          faq: [
            { q: "What is the best area to stay in Muscat?", a: "Al Qurum and Shatti Al Qurum offer beachfront resort stays with luxury properties like Al Bustan Palace. Mutrah is ideal for cultural experiences near the famous Mutrah Souq and Corniche. The CBD suits business travelers." },
            { q: "Is Muscat cheaper than Dubai for hotels?", a: "Yes. Muscat generally offers 20-35% lower hotel rates than Dubai for comparable quality. A luxury beachfront resort in Muscat averages OMR 80-120/night compared to AED 1,500+ for similar in Dubai." },
            { q: "What makes Muscat different from other Gulf cities?", a: "Muscat prioritizes architectural harmony over skyscrapers — buildings cannot exceed a certain height. This gives it a distinctive low-rise character, with dramatic mountain backdrops and a more relaxed, culturally rich atmosphere." }
          ]
        };
      case "abu dhabi":
        return {
          whyPopular: "Abu Dhabi is the UAE's capital and cultural soul — home to the Sheikh Zayed Grand Mosque, the Louvre Abu Dhabi, and the Formula 1 Yas Marina Circuit. Its hotel scene is defined by palatial grandeur at Emirates Palace, natural beach luxury on Saadiyat Island, and entertainment-driven resorts on Yas Island.",
          bestTime: "November to March offers the most pleasant weather (22–28°C). The Formula 1 Abu Dhabi Grand Prix in late November is peak demand. Summer (June–September) brings 40–60% hotel discounts even at luxury properties, with excellent indoor entertainment compensating for the heat.",
          travelerTips: "For culture and landmarks, stay on the Corniche or near Downtown Abu Dhabi for easy access to the Sheikh Zayed Grand Mosque and Louvre. Families should prioritize Yas Island for theme park access. For pure beach luxury, Saadiyat Island's Park Hyatt or Emirates Palace on the Corniche are the definitive choices.",
          faq: [
            { q: "What is the best area to stay in Abu Dhabi?", a: "The Corniche is best for sightseeing with walkable access to the Grand Mosque and cultural sites. Yas Island is ideal for families and F1 fans. Saadiyat Island offers the finest natural beach experience in the UAE." },
            { q: "Is Emirates Palace worth the price?", a: "For a once-in-a-lifetime experience, yes. Even if staying elsewhere, visiting for afternoon tea or the Camel Milk Cappuccino is a memorable experience. Room rates start from AED 2,800/night." },
            { q: "Is Abu Dhabi cheaper than Dubai for hotels?", a: "Generally yes — comparable 5-star hotels in Abu Dhabi are typically 15–25% cheaper than Dubai equivalents, with notably less tourist crowding." },
          ],
        };
      default:
        return {
          whyPopular: `${cityName} offers a unique blend of cultural attractions, business hubs, and premium hospitality, making it a key destination in the Middle East.`,
          bestTime: "The cooler winter months from November to March are generally the best time to visit for optimal weather and outdoor activities.",
          travelerTips: "Consider booking accommodations close to the city center or major transit routes to easily navigate the city top landmarks.",
          faq: [
            { q: `What are the best areas to stay in ${cityName}?`, a: `The best area depends on your travel purpose. For ${cityName}, the downtown core and areas near major landmarks are generally preferred for convenience.` },
            { q: `How do I find the cheapest hotel deals in ${cityName}?`, a: "We recommend using our comparison platform which scans multiple providers simultaneously. Booking at least 2 weeks in advance yields the best rates." }
          ]
        };
    }
  };

  const seoData = generateDynamicSEO(city.name);

  // ── Structured Data (JSON-LD) ──────────────────────────────────────────────
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: seoData.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Best Hotels in ${city.name}`,
    url: `https://besthoteldealsdaily.com/city/${city.slug}/`,
    numberOfItems: city.hotels.length,
    itemListElement: city.hotels.map((hotel, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "LodgingBusiness",
        name: hotel.name,
        image: hotel.image,
        description: hotel.description,
        starRating: { "@type": "Rating", ratingValue: hotel.stars },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: hotel.rating,
          reviewCount: hotel.reviewCount,
        },
        priceRange: hotel.priceRange,
        address: {
          "@type": "PostalAddress",
          addressLocality: city.name,
          addressCountry: city.country,
        },
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://besthoteldealsdaily.com/" },
      { "@type": "ListItem", position: 2, name: city.country, item: `https://besthoteldealsdaily.com/country/${city.countrySlug}/` },
      { "@type": "ListItem", position: 3, name: `Best Hotels in ${city.name}`, item: `https://besthoteldealsdaily.com/city/${city.slug}/` },
    ],
  };

  return (
    <div className="min-h-screen pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c") }} />
      {/* Hero */}
      <div className="relative h-[60vh] max-h-[600px] min-h-[400px] flex items-end pt-20">
        <Image src={city.image} alt={`Hotels in ${city.name}`} fill className="object-cover" priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-900/60 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
          <Breadcrumb crumbs={[{ label: city.country, href: `/country/${city.countrySlug}/` }, { label: `${city.name} Hotels` }]} />
          <h1 className="font-display text-4xl md:text-5xl font-black text-white mt-4 leading-tight mb-4">
            Best Hotel Deals in <span className="text-gold-gradient">{city.name}</span>
          </h1>
          <p className="text-gray-300 max-w-2xl text-lg hidden sm:block mb-6">
            {city.description}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-white font-bold text-sm">
            <span className="flex items-center gap-2 bg-navy-900/50 backdrop-blur-md px-4 py-2 rounded-xl">
               Verified Listings
            </span>
            <span className="flex items-center gap-2 bg-navy-900/50 backdrop-blur-md px-4 py-2 rounded-xl">
               {city.hotels.length} Properties
            </span>
            <span className="flex items-center gap-2 bg-green-600/80 backdrop-blur-md px-4 py-2 rounded-xl text-xs">
              <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
              Updated: {new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date())}
            </span>
          </div>
          <div className="mt-4">
            <ErrorBoundary>
              <SocialProof city={city.name} type="city" />
            </ErrorBoundary>
          </div>
          <p className="text-white/40 text-[10px] mt-4 font-bold uppercase tracking-widest">
            Prices compared by Best Hotel Deals Daily · Bookmark this page for daily updates
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-16">
            
            {/* Semantic Intro */}
            <section>
              <h2 className="text-2xl font-black text-navy-900 mb-6 font-display">Why Visit {city.name}?</h2>
              <p className="text-gray-600 leading-relaxed text-sm mb-4">{seoData.whyPopular}</p>
              <div className="grid sm:grid-cols-2 gap-4 mt-8">
                 <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                   <h3 className="font-bold text-navy-900 mb-2 flex items-center gap-2 text-sm">
                     Best Time to Book
                   </h3>
                   <p className="text-xs text-gray-600 leading-relaxed">{seoData.bestTime}</p>
                 </div>
                 <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                   <h3 className="font-bold text-navy-900 mb-2 flex items-center gap-2 text-sm">
                     Traveler Tips
                   </h3>
                   <p className="text-xs text-gray-600 leading-relaxed">{seoData.travelerTips}</p>
                 </div>
              </div>
            </section>

            {/* Hotel Listings */}
            <section id="hotels">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-navy-900 font-display">Top Rated Hotels</h2>
                  <p className="text-gray-500 mt-2 text-xs">Compare real prices and VIP direct packages.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {city.hotels.map(hotel => (
                  <HotelCard key={hotel.id} hotel={hotel} />
                ))}
              </div>
            </section>

            {/* Comparison Logic */}
            <section className="bg-navy-900 rounded-3xl p-8 text-white shadow-2xl">
              <h2 className="text-xl font-black font-display mb-6">Hotel Comparison: {city.name}</h2>
              <div className="space-y-6">
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <h3 className="text-gold-400 font-bold text-lg mb-2">Luxury & Premium Stays (5-Star)</h3>
                  <p className="text-gray-300 text-xs mb-4">Expect to pay {city.hotels[0]?.currency || "USD"} {luxuryHotels.length > 0 ? luxuryHotels[0].priceFrom * 1.5 : "1000"}+ per night. Ideal for maximum comfort and premium locations.</p>
                  <div className="flex flex-wrap gap-2">
                    {luxuryHotels.slice(0, 3).map(h => <span key={h.id} className="text-[10px] font-black uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full">{h.name}</span>)}
                  </div>
                </div>
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <h3 className="text-green-400 font-bold text-lg mb-2">Budget & Value Deals (3 & 4-Star)</h3>
                  <p className="text-gray-300 text-xs mb-4">Great value starting from {city.hotels[0]?.currency || "USD"} {budgetHotels.length > 0 ? budgetHotels[0].priceFrom : "250"}/night. Best for budget-conscious travelers.</p>
                  <div className="flex flex-wrap gap-2">
                    {budgetHotels.slice(0, 3).map(h => <span key={h.id} className="text-[10px] font-black uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full">{h.name}</span>)}
                  </div>
                </div>
              </div>
            </section>

            {/* Active Deals */}
            {cityDeals.length > 0 && (
              <section>
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-navy-900 font-display">Active Deals in {city.name}</h2>
                    <p className="text-gray-500 mt-1 text-xs">Limited-time offers verified today.</p>
                  </div>
                  <Link href="/deals/" className="text-gold-600 font-bold text-xs hover:underline">View All →</Link>
                </div>
                <div className="space-y-4">
                  {cityDeals.map((deal) => (
                    <Link key={deal.slug} href={`/deals/${deal.slug}/`} className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-4 hover:border-gold-300 hover:shadow-md transition-all group">
                      <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2 text-center shrink-0">
                        <div className="text-red-600 font-black text-lg leading-none">{deal.discount}%</div>
                        <div className="text-red-500 text-[9px] font-bold uppercase">OFF</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-navy-900 text-sm group-hover:text-gold-600 transition-colors line-clamp-1">{deal.hotelName}</h3>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{deal.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-navy-900 font-black text-sm">{deal.currency} {deal.discountedPrice}</div>
                        <div className="text-gray-400 line-through text-[10px]">{deal.currency} {deal.originalPrice}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* FAQs */}
            <section>
              <h2 className="text-2xl font-black text-navy-900 mb-8 font-display">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {seoData.faq.map((faq, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-navy-900 mb-2 flex items-start gap-3">
                      <span className="text-gold-500 font-black">Q:</span> {faq.q}
                    </h3>
                    <p className="text-gray-600 pl-7 leading-relaxed text-xs"><span className="font-black text-navy-900 mr-2">A:</span> {faq.a}</p>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* Sidebar / Internal Linking Grid */}
          <div className="space-y-8">
            {/* Geo Strategy: Landmarks */}
            {cityLandmarks.length > 0 && (
              <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                <h3 className="font-bold text-navy-900 text-sm mb-4 uppercase tracking-widest">Hotels Near Landmarks</h3>
                <div className="space-y-3">
                  {cityLandmarks.map((lm) => (
                    <Link key={lm.slug} href={`/landmark/${lm.slug}/`} className="flex items-center gap-3 p-3 bg-white rounded-xl hover:shadow-md transition-shadow group">
                      <div className="w-10 h-10 relative rounded-lg overflow-hidden shrink-0">
                        <Image src={lm.image} alt={lm.name} fill className="object-cover group-hover:scale-110 transition-transform" />
                      </div>
                      <div>
                        <div className="font-bold text-navy-900 text-[11px] group-hover:text-gold-600 transition-colors line-clamp-1">{lm.name}</div>
                        <div className="text-gray-400 text-[9px] mt-0.5 uppercase">{lm.type}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Internal Routing / Intent Targeting */}
            <div className="bg-navy-950 p-8 rounded-3xl text-white">
              <h3 className="font-bold text-sm mb-6 uppercase tracking-widest text-gold-400">Explore by Category</h3>
              <div className="space-y-3">
                <Link href={`/collection/luxury/`} className="block w-full text-center py-3 bg-white/10 hover:bg-gold-500 hover:text-navy-900 text-xs font-bold rounded-xl transition-colors">
                  Luxury Hotels
                </Link>
                <Link href={`/collection/budget/`} className="block w-full text-center py-3 bg-white/10 hover:bg-gold-500 hover:text-navy-900 text-xs font-bold rounded-xl transition-colors">
                  Budget Hotels
                </Link>
                <Link href={`/collection/family/`} className="block w-full text-center py-3 bg-white/10 hover:bg-gold-500 hover:text-navy-900 text-xs font-bold rounded-xl transition-colors">
                  Family Friendly
                </Link>
              </div>
            </div>

            {/* Guides cross link */}
            {relatedPosts.length > 0 && (
              <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                <h3 className="font-bold text-navy-900 text-sm mb-4 uppercase tracking-widest">Expert Guides</h3>
                <div className="space-y-4">
                  {relatedPosts.map((post) => (
                    <Link key={post.slug} href={`/blog/${post.slug}/`} className="block group">
                      <h4 className="font-bold text-navy-900 text-xs group-hover:text-gold-600 transition-colors line-clamp-2 leading-snug">{post.title}</h4>
                      <p className="text-[10px] uppercase font-bold text-gray-500 mt-1">Read Guide →</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Country Hub Link */}
            {cityCountry && (
              <Link href={`/country/${cityCountry.slug}/`} className="block bg-gold-50 border border-gold-200 rounded-2xl p-5 hover:bg-gold-100 transition-colors group">
                <p className="text-[10px] uppercase font-bold text-gold-700 tracking-widest mb-1">Explore Country</p>
                <h3 className="font-bold text-navy-900 text-sm group-hover:text-gold-700 transition-colors">{cityCountry.name} Hotels</h3>
                <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">Browse all cities and deals across {cityCountry.name}.</p>
                <span className="inline-block mt-3 text-[10px] font-black text-gold-600 uppercase tracking-widest">View Country →</span>
              </Link>
            )}

            {/* Price Intelligence */}
            <PriceIntelligence hotels={city.hotels} cityName={city.name} citySlug={city.slug} />

            {/* Price Alert */}
            <ErrorBoundary>
              <PriceAlertSignup city={city.name} currency={city.hotels[0]?.currency || "USD"} compact />
            </ErrorBoundary>
          </div>

        </div>

        {/* Cross-Vertical Services */}
        {(() => {
          const cityUmrah = umrahPackages.filter((p) => p.departureCities.some((c) => c.toLowerCase() === city.name.toLowerCase()) || city.slug === "makkah" || city.slug === "madinah");
          const cityTransfers = transferRoutes.filter((t) => t.city.toLowerCase() === city.name.toLowerCase());
          if (cityUmrah.length === 0 && cityTransfers.length === 0) return null;
          return (
            <div className="mt-16">
              <h2 className="text-2xl font-black text-navy-900 font-display mb-2">More Travel Services in {city.name}</h2>
              <p className="text-gray-500 text-xs mb-6">Complete your trip with these additional services.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cityUmrah.length > 0 && (
                  <Link href="/umrah/" className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl p-5 transition-colors group">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700">
                          <MoonStar className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-navy-900 text-sm group-hover:text-emerald-700 transition-colors">Umrah &amp; Hajj Packages</h3>
                          <p className="text-xs text-gray-500 mt-0.5">{cityUmrah.length} packages {city.slug === "makkah" || city.slug === "madinah" ? "for this destination" : `departing from ${city.name}`}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors mt-1" />
                    </div>
                  </Link>
                )}
                {cityTransfers.length > 0 && (
                  <Link href="/transfers/" className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-2xl p-5 transition-colors group">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700">
                          <Car className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-navy-900 text-sm group-hover:text-blue-700 transition-colors">Airport Transfers &amp; Car Rentals</h3>
                          <p className="text-xs text-gray-500 mt-0.5">{cityTransfers.length} routes from {cityTransfers[0]?.vehicleTypes[0]?.currency} {cityTransfers[0]?.vehicleTypes[0]?.price}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors mt-1" />
                    </div>
                  </Link>
                )}
              </div>
            </div>
          );
        })()}

        {/* Related Cities Navigation */}
        {relatedCities.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-black text-navy-900 font-display mb-2">Explore More Destinations</h2>
            <p className="text-gray-500 text-xs mb-8">Compare hotel deals across other cities in the Middle East.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {relatedCities.map((rc) => (
                <Link key={rc.slug} href={`/city/${rc.slug}/`} className="group relative rounded-2xl overflow-hidden h-36 shadow-md">
                  <Image src={rc.image} alt={`Hotels in ${rc.name}`} fill className="object-cover group-hover:scale-110 transition-transform duration-500" sizes="(max-width: 640px) 50vw, 25vw" loading="lazy" />
                  <div className="absolute inset-0 bg-navy-950/60 group-hover:bg-navy-950/40 transition-all" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                    <div className="text-white font-display font-bold text-sm text-center group-hover:text-gold-400 transition-colors">{rc.name}</div>
                    <div className="text-gold-400 text-[10px] mt-1">{rc.hotels.length} Hotels</div>
                    <div className="text-white/60 text-[9px] mt-0.5">{rc.country}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
