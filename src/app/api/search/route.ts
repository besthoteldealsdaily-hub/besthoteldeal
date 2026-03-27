import { NextRequest, NextResponse } from "next/server";
import { hotels, cities, deals } from "@/lib/data";

function normalize(s: string) {
  return s.toLowerCase().replace(/[-_\s]+/g, " ").trim();
}

export async function GET(req: NextRequest) {
  const q = normalize(req.nextUrl.searchParams.get("q") ?? "");

  if (q.length < 2) {
    return NextResponse.json({ hotels: [], cities: [], deals: [] });
  }

  // Cities
  const matchedCities = cities
    .filter(
      (c) =>
        normalize(c.name).includes(q) ||
        normalize(c.country).includes(q) ||
        normalize(c.slug).includes(q),
    )
    .slice(0, 4)
    .map((c) => ({
      name:       c.name,
      slug:       c.slug,
      country:    c.country,
      hotelCount: c.hotels.length,
    }));

  // Hotels — search all hotels in data.ts
  const allHotels = [
    ...hotels,
    ...cities.flatMap((c) => c.hotels),
  ];
  // Deduplicate by slug
  const seen = new Set<string>();
  const deduped = allHotels.filter((h) => {
    if (seen.has(h.slug)) return false;
    seen.add(h.slug);
    return true;
  });

  const matchedHotels = deduped
    .filter(
      (h) =>
        normalize(h.name).includes(q) ||
        normalize(h.city).includes(q) ||
        normalize(h.description).substring(0, 120).includes(q),
    )
    .slice(0, 5)
    .map((h) => ({
      id:          h.id,
      name:        h.name,
      slug:        h.slug,
      city:        h.city,
      country:     h.country,
      priceFrom:   h.priceFrom,
      currency:    h.currency,
      stars:       h.stars,
      listingType: h.listingType,
      image:       h.image,
      rating:      h.rating,
    }));

  // Deals
  const matchedDeals = deals
    .filter(
      (d) =>
        normalize(d.hotelName).includes(q) ||
        normalize(d.city).includes(q) ||
        normalize(d.country).includes(q),
    )
    .slice(0, 3)
    .map((d) => ({
      slug:            d.slug,
      hotelName:       d.hotelName,
      city:            d.city,
      discount:        d.discount,
      discountedPrice: d.discountedPrice,
      currency:        d.currency,
      image:           d.image,
    }));

  return NextResponse.json(
    { hotels: matchedHotels, cities: matchedCities, deals: matchedDeals },
    { headers: { "Cache-Control": "no-store" } },
  );
}
