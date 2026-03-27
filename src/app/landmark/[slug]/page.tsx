import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getLandmarkBySlug, landmarks, getHotelsForLandmark, getLandmarksByCity, blogPosts, categories, getDealsByCity, countries } from "@/lib/data";
import HotelCard from "@/components/HotelCard";
import Breadcrumb from "@/components/Breadcrumb";
import { MapPin, Navigation, Info, ShieldCheck, Map, ArrowRight } from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return landmarks.map((l) => ({ slug: l.slug }));
}

function generateLandmarkMeta(slug: string, name: string, city: string) {
  switch (slug) {
    case "masjid-al-haram-makkah":
      return {
        title: "Hotels Adjacent to Masjid Al Haram, Makkah 2026 – Kaaba View & Pilgrim Stays",
        description:
          "Hotels within steps of Al Masjid Al Haram. Kaaba-view suites at Fairmont & Swissôtel, budget pilgrim options with free shuttles. Compare Haram-proximity rates — book before Hajj & Ramadan surge.",
      };
    case "al-masjid-an-nabawi-madinah":
      return {
        title: "Hotels Near Masjid an-Nabawi, Madinah 2026 – Steps from the Prophet's Mosque",
        description:
          "Stay within the Markazia district, steps from Al-Rawdah. Compare verified Madinah hotels from SAR 250/night — luxury Mövenpick towers to budget pilgrim rooms with shuttle access.",
      };
    case "burj-khalifa-dubai":
      return {
        title: "Hotels Near Burj Khalifa, Dubai 2026 – Downtown Stays from AED 400/night",
        description:
          "Stay in Downtown Dubai, walking distance from the world's tallest tower. Compare hotels with Burj Khalifa views, Dubai Fountain access & Dubai Mall proximity. Prices from AED 400/night.",
      };
    case "palm-jumeirah-dubai":
      return {
        title: "Palm Jumeirah Hotels 2026 – Beachfront Resorts from AED 800/night | Compare",
        description:
          "Compare luxury hotels on Palm Jumeirah. Atlantis, Waldorf Astoria & boutique resorts — private beach, infinity pools & world-class dining. Find your Palm Jumeirah deal today.",
      };
    case "the-pearl-qatar-doha":
      return {
        title: "Hotels Near The Pearl-Qatar, Doha 2026 – Marina & Beachfront Stays",
        description:
          "Find the best hotels near The Pearl-Qatar — Doha's exclusive island. Marina-view suites, luxury apartments & family resorts from QAR 450/night. Compare and book today.",
      };
    case "sheikh-zayed-grand-mosque-abu-dhabi":
      return {
        title: "Hotels Near Sheikh Zayed Grand Mosque, Abu Dhabi 2026 – Compare Rates",
        description:
          "Stay within easy reach of the world's third-largest mosque. Compare Abu Dhabi hotels near Sheikh Zayed Grand Mosque — Corniche luxury to mid-range. From AED 350/night.",
      };
    case "yas-island-abu-dhabi":
      return {
        title: "Yas Island Hotels, Abu Dhabi 2026 – F1, Ferrari World & Waterpark Stays",
        description:
          "Book your Yas Island stay — home to Yas Marina Circuit, Ferrari World & Yas Waterworld. Compare resort packages for F1 season, theme parks & family getaways. From AED 450/night.",
      };
    case "dubai-mall-downtown-dubai":
      return {
        title: "Hotels Near Dubai Mall 2026 – Walk to the World's Largest Shopping Destination",
        description:
          "Stay within walking distance of Dubai Mall and the Dubai Fountain. Compare Downtown hotels with direct mall access, Burj Khalifa views & Metro connectivity. From AED 400/night.",
      };
    case "souq-waqif-doha":
      return {
        title: "Hotels Near Souq Waqif, Doha 2026 – Traditional Market & Corniche Stays",
        description:
          "Experience authentic Doha from hotels near Souq Waqif. Arabian-style boutique inns and modern towers close to the market and waterfront — from QAR 300/night.",
      };
    case "sultan-qaboos-grand-mosque-muscat":
      return {
        title: "Hotels Near Sultan Qaboos Grand Mosque, Muscat 2026 – Compare Rates",
        description:
          "Stay close to Muscat's most iconic landmark. Verified Muscat hotels near the Sultan Qaboos Grand Mosque from OMR 45/night — serene surroundings, premium value.",
      };
    case "abraj-al-bait-makkah":
      return {
        title: "Hotels in Abraj Al Bait, Makkah 2026 – Clock Tower Haram-View Stays",
        description:
          "Stay inside the Abraj Al Bait complex, directly above Al Masjid Al Haram. Fairmont Makkah, Swissôtel & more — compare Kaaba-view rooms & pilgrim packages. Book early for Ramadan.",
      };
    case "dubai-international-airport":
      return {
        title: "Hotels Near Dubai Airport (DXB) 2026 – Transit & Overnight Stays from AED 250",
        description:
          "Compare hotels near Dubai International Airport — ideal for transits, early flights & stopovers. From AED 250/night with shuttle service. Hyatt, Premier Inn & more compared daily.",
      };
    case "difc-dubai-financial-centre":
      return {
        title: "Hotels Near DIFC Dubai 2026 – Corporate Stays in the Financial District",
        description:
          "Compare hotels near DIFC — Dubai's financial hub. Executive suites, meeting facilities & fine dining at your doorstep. From AED 600/night. The top choice for corporate travelers.",
      };
    case "museum-of-islamic-art-doha":
      return {
        title: "Hotels Near Museum of Islamic Art, Doha 2026 – Corniche & MIA Park Stays",
        description:
          "Stay close to Doha's iconic MIA with waterfront Corniche views. Compare hotels near MIA Park from QAR 350/night — culture, fine dining & luxury all within reach.",
      };
    case "saadiyat-island-abu-dhabi":
      return {
        title: "Saadiyat Island Hotels, Abu Dhabi 2026 – Louvre, Natural Beach & Resort Stays",
        description:
          "Book your Saadiyat Island hotel — home to the Louvre Abu Dhabi and pristine natural beaches. Park Hyatt & beach resort packages from AED 750/night. Abu Dhabi's cultural crown.",
      };
    default:
      return {
        title: `Best Hotels Near ${name}, ${city} 2026 – Compare & Book Daily Deals`,
        description: `Find top-rated hotels near ${name} in ${city}. Compare Booking.com, Agoda & direct rates for stays within walking distance — updated daily.`,
      };
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const landmark = getLandmarkBySlug(slug);
  if (!landmark) return {};

  const meta = generateLandmarkMeta(landmark.slug, landmark.name, landmark.city);

  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `https://besthoteldealsdaily.com/landmark/${landmark.slug}/` },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `https://besthoteldealsdaily.com/landmark/${landmark.slug}/`,
      images: [{ url: landmark.image, width: 1200, height: 630, alt: `Hotels near ${landmark.name}` }],
    },
  };
}

// Programmatic proximity/religious context engine
function generateLandmarkContext(landmarkSlug: string, cityName: string) {
  const isReligious = cityName.toLowerCase() === "makkah" || cityName.toLowerCase() === "madinah";

  if (isReligious) {
    return {
      significanceTitle: "Spiritual Significance & Proximity",
      significanceBody: `Staying near this sacred site is the primary goal for pilgrims. The closer your accommodation, the easier it is to attend the five daily prayers and avoid physical exhaustion. Properties adjacent to the holy perimeter often provide direct audio feeds and stunning spiritual views from upper suites.`,
      proximityAdvice: "During peak seasons like Ramadan and Hajj, traffic around the central area is heavily restricted. Booking a hotel within direct walking distance — or one offering a dedicated 24/7 private shuttle — is critical to a smooth spiritual journey.",
      faq: [
        { q: `What is the actual walking distance to this landmark?`, a: "Hotels in our 'Premium' tier are generally within 50 to 200 meters, requiring less than a 5-minute walk. Budget options are typically 500m to 1.5km away." },
        { q: "Do these hotels offer wheelchair access?", a: "Yes, the luxury hotels positioned directly next to the holy sites offer excellent wheelchair accessibility directly into the courtyard." }
      ]
    };
  }

  return {
    significanceTitle: "Strategic Location Advantage",
    significanceBody: `Positioning yourself near this landmark places you at the epicenter of the city's most vibrant district. Whether you are traveling for business or premium leisure, staying in this radius drastically cuts your daily commute and surrounds you with world-class dining and entertainment.`,
    proximityAdvice: "Traffic in central areas can peak during rush hours. We highly recommend booking a hotel within walking distance or one that connects directly to the local metro or transit system to navigate seamlessly.",
    faq: [
      { q: `Is it expensive to stay right next to this landmark?`, a: "Properties directly adjacent carry a premium pricing tier. However, you can find excellent 3 and 4-star value deals just 2 to 3 blocks away that offer the same logistical benefits at half the price." },
      { q: "Are there family-friendly amenities nearby?", a: "Absolutely. The district surrounding the landmark is heavily commercialized and includes numerous family-friendly restaurants, malls, and secure transport nodes." }
    ]
  };
}

export default async function LandmarkPage({ params }: Props) {
  const { slug } = await params;
  const landmark = getLandmarkBySlug(slug);
  const hotels = getHotelsForLandmark(slug);

  if (!landmark) notFound();

  const contextData = generateLandmarkContext(landmark.slug, landmark.city);
  const sortedByPrice = [...hotels].sort((a, b) => a.priceFrom - b.priceFrom);

  // ── Structured Data (JSON-LD) ──────────────────────────────────────────────
  const attractionSchema = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: landmark.name,
    description: landmark.description,
    image: landmark.image,
    address: {
      "@type": "PostalAddress",
      addressLocality: landmark.city,
      addressCountry: landmark.country,
    },
    url: `https://besthoteldealsdaily.com/landmark/${landmark.slug}/`,
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: contextData.faq.map((f: { q: string; a: string }) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const nearbyHotelsSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Hotels near ${landmark.name}`,
    numberOfItems: hotels.length,
    itemListElement: hotels.map((hotel, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "LodgingBusiness",
        name: hotel.name,
        image: hotel.image,
        description: hotel.description,
        priceRange: hotel.priceRange,
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: hotel.rating,
          reviewCount: hotel.reviewCount,
        },
        address: {
          "@type": "PostalAddress",
          addressLocality: landmark.city,
          addressCountry: landmark.country,
        },
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://besthoteldealsdaily.com/" },
      { "@type": "ListItem", position: 2, name: landmark.city, item: `https://besthoteldealsdaily.com/city/${landmark.citySlug}/` },
      { "@type": "ListItem", position: 3, name: `Hotels near ${landmark.name}`, item: `https://besthoteldealsdaily.com/landmark/${landmark.slug}/` },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(attractionSchema).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(nearbyHotelsSchema).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c") }} />

      {/* Transactional Hero */}
      <div className="bg-navy-950 pt-20 pb-16 relative border-b-4 border-gold-500">
        <div className="absolute inset-0 opacity-30">
          <Image src={landmark.image} alt={landmark.name} fill className="object-cover grayscale" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Breadcrumb crumbs={[
            { label: landmark.city, href: `/city/${landmark.citySlug}/` },
            { label: `Hotels near ${landmark.name}` }
          ]} />

          <div className="flex flex-col lg:flex-row gap-8 items-start justify-between mt-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-gold-500 text-navy-900 font-black text-xs px-3 py-1 rounded-full uppercase tracking-widest mb-4">
                <MapPin className="w-3 h-3" /> Prime Location
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-black text-white leading-tight mb-4">
                Hotels Near <span className="text-gold-400">{landmark.name}</span>
              </h1>
              <p className="text-gray-300 text-lg leading-relaxed">
                {landmark.description} Reduce your commute and stay right where the action is.
              </p>
            </div>

            {/* Quick Data Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl w-full lg:w-80 shrink-0 shadow-xl">
              <h3 className="text-white font-bold mb-4 font-display text-sm">Location Intel</h3>
              <ul className="space-y-3 text-sm text-gray-200">
                <li className="flex justify-between border-b border-white/10 pb-2">
                  <span>City Base:</span>
                  <span className="font-bold text-white capitalize">{landmark.city}</span>
                </li>
                <li className="flex justify-between border-b border-white/10 pb-2">
                  <span>Properties Found:</span>
                  <span className="font-bold text-white">{hotels.length} Verified</span>
                </li>
                <li className="flex justify-between border-b border-white/10 pb-2">
                  <span>Starting Price:</span>
                  <span className="font-bold text-gold-400">{sortedByPrice[0]?.currency || "USD"} {sortedByPrice[0]?.priceFrom || 0}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Context Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 text-gray-50 opacity-50 group-hover:scale-110 transition-transform">
              <Info className="w-48 h-48" />
            </div>
            <div className="relative z-10">
              <h2 className="text-xl font-black text-navy-900 mb-4 font-display">{contextData.significanceTitle}</h2>
              <p className="text-gray-600 leading-relaxed text-sm">{contextData.significanceBody}</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 text-gray-50 opacity-50 group-hover:scale-110 transition-transform">
              <Navigation className="w-48 h-48" />
            </div>
            <div className="relative z-10">
              <h2 className="text-xl font-black text-navy-900 mb-4 font-display">Logistics & Proximity</h2>
              <p className="text-gray-600 leading-relaxed text-sm">{contextData.proximityAdvice}</p>
            </div>
          </div>
        </div>

        {/* Directory Listings */}
        <div className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-gray-200 pb-4">
            <div>
              <h2 className="text-2xl font-black text-navy-900 font-display">Verified Accommodations</h2>
              <p className="text-gray-500 text-xs mt-1">Properties ranked by distance, quality, and direct booking availability.</p>
            </div>
            <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 w-max">
              <ShieldCheck className="w-3 h-3" /> Live Prices
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {hotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        </div>

        {/* FAQ + Navigation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-black text-navy-900 font-display">Frequently Asked Questions</h2>
            {contextData.faq.map((f: { q: string; a: string }, i: number) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-navy-900 text-sm mb-2 flex items-start gap-2">
                  <span className="text-gold-500 font-black">Q:</span> {f.q}
                </h3>
                <p className="text-gray-600 text-xs leading-relaxed pl-5"><span className="font-black text-navy-900 mr-1">A:</span>{f.a}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-black text-navy-900 font-display">Continue Planning</h2>

            <Link href={`/city/${landmark.citySlug}/`} className="block bg-navy-900 rounded-2xl p-6 text-white hover:bg-navy-950 transition-colors group relative overflow-hidden">
              <Map className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 group-hover:scale-110 transition-transform" />
              <div className="relative z-10">
                <h3 className="font-bold text-gold-400 mb-1 text-sm">Explore {landmark.city} Hotels</h3>
                <p className="text-xs text-gray-300 w-4/5 leading-relaxed">See all hotels, resorts, and budgets available across the entire city perimeter.</p>
                <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-widest mt-4">
                  City Guide <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>

            <Link href="/deals/" className="block bg-gold-500 rounded-2xl p-6 text-navy-900 hover:bg-gold-400 transition-colors group">
              <h3 className="font-black text-base mb-1">Today&apos;s Best Deals</h3>
              <p className="text-xs text-navy-800/80 w-4/5 leading-relaxed">Browse our curated daily promotions to save on premium stays.</p>
              <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-widest mt-4">
                Check Prices <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            {/* Related Landmarks in Same City */}
            {(() => {
              const relatedLandmarks = getLandmarksByCity(landmark.citySlug).filter(l => l.slug !== landmark.slug);
              if (relatedLandmarks.length === 0) return null;
              return (
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <h3 className="font-bold text-navy-900 text-xs mb-3 uppercase tracking-widest">Other Landmarks in {landmark.city}</h3>
                  <div className="space-y-2">
                    {relatedLandmarks.map((rl) => (
                      <Link key={rl.slug} href={`/landmark/${rl.slug}/`} className="flex items-center gap-3 p-2 bg-white rounded-xl hover:shadow-sm transition-shadow group">
                        <div className="w-8 h-8 relative rounded-lg overflow-hidden shrink-0">
                          <Image src={rl.image} alt={rl.name} fill className="object-cover" sizes="32px" />
                        </div>
                        <span className="font-bold text-navy-900 text-[11px] group-hover:text-gold-600 transition-colors line-clamp-1">{rl.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Active Deals for this City */}
            {(() => {
              const cityDeals = getDealsByCity(landmark.city).slice(0, 2);
              if (cityDeals.length === 0) return null;
              return (
                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                  <h3 className="font-bold text-navy-900 text-xs mb-3 uppercase tracking-widest">Active Deals in {landmark.city}</h3>
                  <div className="space-y-3">
                    {cityDeals.map((deal) => (
                      <Link key={deal.slug} href={`/deals/${deal.slug}/`} className="flex items-center gap-3 group">
                        <div className="bg-red-50 border border-red-100 rounded-lg px-2 py-1 text-center shrink-0">
                          <div className="text-red-600 font-black text-sm leading-none">{deal.discount}%</div>
                          <div className="text-red-500 text-[8px] font-bold uppercase">OFF</div>
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-navy-900 text-[11px] group-hover:text-gold-600 transition-colors line-clamp-1">{deal.hotelName}</p>
                          <p className="text-[9px] text-gray-400 mt-0.5">{deal.currency} {deal.discountedPrice}/night</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link href="/deals/" className="block text-center mt-4 text-[10px] font-black text-gold-600 uppercase tracking-widest hover:underline">All Deals →</Link>
                </div>
              );
            })()}

            {/* Country Hub Link */}
            {(() => {
              const landmarkCountry = countries.find((co) =>
                co.cities.some((cs) => cs === landmark.citySlug)
              );
              if (!landmarkCountry) return null;
              return (
                <Link href={`/country/${landmarkCountry.slug}/`} className="block bg-gold-50 border border-gold-200 rounded-2xl p-5 hover:bg-gold-100 transition-colors group">
                  <p className="text-[10px] uppercase font-bold text-gold-700 tracking-widest mb-1">Explore Country</p>
                  <h3 className="font-bold text-navy-900 text-sm group-hover:text-gold-700 transition-colors">{landmarkCountry.name} Hotels</h3>
                  <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">All cities and deals in {landmarkCountry.name}.</p>
                  <span className="inline-block mt-3 text-[10px] font-black text-gold-600 uppercase tracking-widest">View Country →</span>
                </Link>
              );
            })()}

            {/* Browse by Collection */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h3 className="font-bold text-navy-900 text-xs mb-3 uppercase tracking-widest">Browse by Style</h3>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <Link key={cat.slug} href={`/collection/${cat.slug}/`} className="block text-center py-2 bg-gray-50 hover:bg-gold-50 text-xs font-bold text-gray-600 hover:text-gold-700 rounded-xl transition-colors">
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Related Blog Posts */}
            {(() => {
              const relatedPosts = blogPosts.filter(b => b.relatedCities.includes(landmark.citySlug)).slice(0, 3);
              if (relatedPosts.length === 0) return null;
              return (
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <h3 className="font-bold text-navy-900 text-xs mb-3 uppercase tracking-widest">Travel Guides</h3>
                  <div className="space-y-3">
                    {relatedPosts.map((post) => (
                      <Link key={post.slug} href={`/blog/${post.slug}/`} className="block group">
                        <h4 className="font-bold text-navy-900 text-[11px] group-hover:text-gold-600 transition-colors line-clamp-2 leading-snug">{post.title}</h4>
                        <p className="text-[9px] uppercase font-bold text-gray-500 mt-1">Read Guide →</p>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

        </div>
      </div>
    </div>
  );
}
