import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getCategoryBySlug, categories, getHotelsByCategory, cities, blogPosts, landmarks } from "@/lib/data";
import HotelCard from "@/components/HotelCard";
import Breadcrumb from "@/components/Breadcrumb";
import { CheckCircle2, Star, Wallet, Users, MoonStar, ArrowRight } from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

function generateCollectionMeta(slug: string, name: string) {
  switch (slug) {
    case "luxury":
      return {
        title: "Luxury Hotels Middle East 2026 – 5-Star Stays in Dubai, Doha & Abu Dhabi",
        description:
          "Handpicked 5-star hotels across the Middle East. Burj Al Arab, Emirates Palace, Four Seasons & more — compare luxury rates in Dubai, Doha, Abu Dhabi and Riyadh. Find your premium escape.",
      };
    case "budget":
      return {
        title: "Budget Hotels Middle East 2026 – Verified Cheap Stays from AED 150/night",
        description:
          "Find affordable hotels across Dubai, Makkah, Riyadh & more. Verified budget properties from AED 150/night — clean, safe & well-connected. Save more, see more of the Middle East.",
      };
    case "family":
      return {
        title: "Family Hotels Middle East 2026 – Kids' Clubs, Pools & Family Suites | Best Deals",
        description:
          "Compare family-friendly hotels across Dubai, Abu Dhabi, Doha and beyond. Kids' pools, adjoining rooms, beach access & entertainment — find the best family deal for your Middle East holiday.",
      };
    case "near-haram":
      return {
        title: "Hotels Near Al Haram, Makkah 2026 – Pilgrim Stays Steps from the Kaaba",
        description:
          "Verified hotels within walking distance of Al Masjid Al Haram. Haram-view suites and shuttle-served budget options — compare Umrah & Hajj proximity rates across all tiers.",
      };
    default:
      return {
        title: `${name} in the Middle East 2026 – Handpicked Stays | Best Deals Daily`,
        description: `Discover top-rated ${name.toLowerCase()} hotels across Dubai, Makkah, Doha & Riyadh. Compare verified deals and book your perfect stay.`,
      };
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};

  const meta = generateCollectionMeta(category.slug, category.name);

  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `https://besthoteldealsdaily.com/collection/${category.slug}/` },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `https://besthoteldealsdaily.com/collection/${category.slug}/`,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  const hotels = getHotelsByCategory(slug);

  if (!category) notFound();

  // Per-intent content engine
  const getIntentContent = (categorySlug: string) => {
    switch (categorySlug) {
      case "luxury":
        return {
          icon: <Star className="w-10 h-10 text-gold-400" />,
          tagline: "Redefining Arabian Hospitality",
          guide: "Luxury hotels in the Middle East are genuinely world-class. From butler-serviced suites with private pools in Dubai's Palm Jumeirah, to rooms overlooking the Kaaba in Makkah, the standard of premium accommodation here is unmatched globally.",
          highlights: ["Personal butler service", "Private beach or pool access", "Michelin-level dining within the property", "Dedicated concierge for excursions and bookings"],
          faq: [
            { q: "What makes a Middle East luxury hotel different?", a: "Scale. Properties here routinely feature 17+ restaurants, 90+ swimming pools, and helicopter pads as standard amenities — something rarely matched elsewhere." },
            { q: "Is it worth paying for a luxury hotel in Makkah?", a: "Yes, especially if proximity to the Haram matters to you. A Kaaba-view suite at Fairmont eliminates all commute stress and provides a deeply immersive spiritual environment." }
          ]
        };
      case "budget":
        return {
          icon: <Wallet className="w-10 h-10 text-gold-400" />,
          tagline: "Smart Stays, Maximum Value",
          guide: "Budget travel in the Middle East is more accessible than most assume. In every major city, from Dubai to Riyadh, there are hundreds of clean, well-connected 3-star properties offering strong value. The key is knowing which locations are walking distance from metro stations or free hotel shuttles.",
          highlights: ["Metro-adjacent rooms in Dubai from AED 250", "Al Aziziyah area Makkah hotels with free Haram shuttle", "Furnished apartment hotels perfect for longer stays", "Breakfast-included packages for pilgrims"],
          faq: [
            { q: "Can I find a clean budget hotel near Dubai Mall?", a: "Yes. Rove Downtown Dubai and similar 3-star options offer clean, stylish rooms typically under AED 400/night within walking distance of Dubai Mall and Burj Khalifa." },
            { q: "What is the cheapest area in Makkah to stay in?", a: "The Al Aziziyah district offers excellent budget options with reliable free shuttle buses running 24/7 to Masjid Al Haram. Expect to pay SAR 200–450/night depending on season." }
          ]
        };
      case "family":
        return {
          icon: <Users className="w-10 h-10 text-gold-400" />,
          tagline: "Spaces Built for Every Generation",
          guide: "Middle East hotels are exceptionally family-conscious. From kids clubs and aqua parks to spacious family suites and halal-certified restaurants, the top properties are designed to ensure children and parents can both genuinely relax.",
          highlights: ["Supervised kids clubs with 2–12 age groups", "Connecting rooms and family suite configurations", "Aquaventure Waterpark access at Atlantis", "Child-friendly buffet options and prayer room access"],
          faq: [
            { q: "Which Dubai hotel is best for families with young children?", a: "Atlantis The Palm is the gold standard — it includes full Aquaventure waterpark access, The Lost Chambers Aquarium, and extensive kids club facilities as part of the stay." },
            { q: "Are there family apartment hotels in Makkah?", a: "Yes. Extended stay apartment hotels near Haram are very popular. They offer fully equipped kitchens, multiple bedrooms, and laundry access, ideal for families during Umrah." }
          ]
        };
      case "near-haram":
        return {
          icon: <MoonStar className="w-10 h-10 text-gold-400" />,
          tagline: "Proximity as Spiritual Priority",
          guide: "For pilgrims performing Hajj or Umrah, distance from the Haram determines the quality of the entire journey. Every minute saved in transit is gained in prayer, rest, and reflection. This collection features only those properties with verified proximity data and direct or shuttle access.",
          highlights: ["Properties within 50m to 1km of Al Masjid Al Haram", "Hotels with 24/7 Haram shuttle service", "Prayer mat and Qibla direction in all rooms", "Halal-only dining throughout the property"],
          faq: [
            { q: "What is the definition of 'Near Haram' in this collection?", a: "We define this as less than 1.5km direct distance or less than 10 minutes door-to-door commute via shuttle. All distances are sourced and periodically verified." },
            { q: "Do these hotels have any gender-segregated facilities?", a: "Most higher-end properties in this category offer dedicated prayer rooms, and some provide gender-separated gym and pool facilities as per Islamic guidelines." }
          ]
        };
      default:
        return {
          icon: <Star className="w-10 h-10 text-gold-400" />,
          tagline: "Curated Middle East Stays",
          guide: category.description + " Each listing in this collection has been hand-verified for quality, value, and travel-readiness.",
          highlights: ["Verified pricing across multiple platforms", "Authentic high-resolution hotel photography", "Real guest reviews and rating scores"],
          faq: [
            { q: `What criteria is used to select hotels in the ${category.name} collection?`, a: "We evaluate properties based on guest ratings above 4.0, authentic imagery, price consistency, and location relevance to the stated category intent." }
          ]
        };
    }
  };

  const content = getIntentContent(category.slug);

  return (
    <div className="min-h-screen bg-white pb-20 pt-14">

      {/* Collection Hero — intent-first layout */}
      <div className="border-b border-gray-100 bg-gray-50 pt-12 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb crumbs={[{ label: "Collections", href: "/" }, { label: category.name }]} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-8">
            <div>
              <div className="mb-4">{content.icon}</div>
              <h1 className="font-display text-4xl md:text-5xl font-black text-navy-900 leading-tight mb-4">
                {category.name} in the<br />
                <span className="text-gold-gradient">Middle East</span>
              </h1>
              <p className="text-sm text-gray-600 leading-relaxed mb-6 max-w-lg">{content.guide}</p>

              {/* Key Highlights */}
              <ul className="space-y-2 mb-8">
                {content.highlights.map((h, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-navy-900 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>

              <div className="flex gap-3">
                <a href="#hotels" className="btn-gold text-xs py-2 px-5">
                  View Hotels
                </a>
                <Link href="/deals/" className="btn-navy text-xs py-2 px-5">
                  Today&apos;s Deals
                </Link>
              </div>
            </div>

            {/* Hero Image */}
            <div className="aspect-[4/3] relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white hidden lg:block">
              <Image src={category.image} alt={category.name} fill className="object-cover" priority />
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-navy-900 font-black text-xs">{hotels.length} Verified Properties</span>
                </div>
                <p className="text-gray-500 text-[10px] mt-0.5">Prices updated {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hotel Listings */}
      <div className="py-16" id="hotels">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div>
              <h2 className="text-2xl font-black text-navy-900 font-display">{content.tagline}</h2>
              <p className="text-gray-500 text-xs mt-1">Showing {hotels.length} properties &mdash; sorted by rating and deal availability.</p>
            </div>
            {/* City Filter Cluster */}
            <div className="flex flex-wrap gap-2">
              {cities.slice(0, 5).map((city) => (
                <Link key={city.slug} href={`/city/${city.slug}/`} className="px-3 py-1.5 bg-gray-50 hover:bg-gold-50 text-gray-500 hover:text-gold-700 text-xs font-bold rounded-full transition-all border border-transparent hover:border-gold-200">
                  {city.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {hotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        </div>
      </div>

      {/* AISO FAQ */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black text-navy-900 font-display mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {content.faq.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-navy-900 text-sm mb-2 flex items-start gap-2">
                  <span className="text-gold-500 font-black">Q:</span> {f.q}
                </h3>
                <p className="text-gray-600 text-xs leading-relaxed pl-5">
                  <span className="font-black text-navy-900 mr-1">A:</span>{f.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expert Trust Block */}
      <div className="bg-navy-950 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            {[
              { num: "01.", title: "Verified Value", desc: "We compare 3+ booking platforms to ensure the price listed here is actually the best available rate." },
              { num: "02.", title: "Real Visual Data", desc: `Each hotel in our ${category.slug} collection is featured with authentic imagery sourced from property managers.` },
              { num: "03.", title: "Safe Booking Path", desc: "Book via trusted affiliate partners or directly with hotels. Both routes are pre-verified for reliability." }
            ].map((item) => (
              <div key={item.num} className="p-6 bg-white/5 rounded-2xl border border-white/10">
                <div className="text-gold-400 font-black text-2xl mb-2">{item.num}</div>
                <div className="font-bold text-white mb-2 text-sm">{item.title}</div>
                <div className="text-xs text-gray-400 leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/deals/" className="inline-flex items-center gap-2 btn-gold">
              View All Active Deals <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Cross-Linking: Related Collections + Blog + Landmarks */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Other Collections */}
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
              <h3 className="font-bold text-navy-900 text-xs mb-4 uppercase tracking-widest">Other Collections</h3>
              <div className="space-y-2">
                {categories.filter(c => c.slug !== category.slug).map((cat) => (
                  <Link key={cat.slug} href={`/collection/${cat.slug}/`} className="flex items-center gap-3 p-3 bg-white rounded-xl hover:shadow-sm transition-shadow group">
                    <div className="w-8 h-8 relative rounded-lg overflow-hidden shrink-0">
                      <Image src={cat.image} alt={cat.name} fill className="object-cover" sizes="32px" />
                    </div>
                    <div>
                      <div className="font-bold text-navy-900 text-[11px] group-hover:text-gold-600 transition-colors">{cat.name}</div>
                      <div className="text-gray-400 text-[9px] mt-0.5 line-clamp-1">{cat.description.slice(0, 50)}...</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Related Blog Posts */}
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
              <h3 className="font-bold text-navy-900 text-xs mb-4 uppercase tracking-widest">Travel Guides</h3>
              <div className="space-y-4">
                {blogPosts.filter(b => b.tags.some(t => t.toLowerCase().includes(category.slug)) || b.category.toLowerCase().includes(category.slug)).slice(0, 3).concat(
                  blogPosts.slice(0, 3)
                ).filter((b, i, arr) => arr.findIndex(x => x.id === b.id) === i).slice(0, 3).map((post) => (
                  <Link key={post.slug} href={`/blog/${post.slug}/`} className="block group">
                    <h4 className="font-bold text-navy-900 text-[11px] group-hover:text-gold-600 transition-colors line-clamp-2 leading-snug">{post.title}</h4>
                    <p className="text-[9px] uppercase font-bold text-gray-500 mt-1">{post.readTime} min read → </p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Key Landmarks */}
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
              <h3 className="font-bold text-navy-900 text-xs mb-4 uppercase tracking-widest">Hotels Near Landmarks</h3>
              <div className="space-y-2">
                {landmarks.slice(0, 5).map((lm) => (
                  <Link key={lm.slug} href={`/landmark/${lm.slug}/`} className="flex items-center gap-3 p-3 bg-white rounded-xl hover:shadow-sm transition-shadow group">
                    <div className="w-8 h-8 relative rounded-lg overflow-hidden shrink-0">
                      <Image src={lm.image} alt={lm.name} fill className="object-cover" sizes="32px" />
                    </div>
                    <div>
                      <div className="font-bold text-navy-900 text-[11px] group-hover:text-gold-600 transition-colors line-clamp-1">{lm.name}</div>
                      <div className="text-gray-400 text-[9px] mt-0.5">{lm.city}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
