"""
Converts scraped hotel JSON files → TypeScript Hotel entries for data.ts
Run: .\venv\Scripts\python.exe generate_data.py
Output: scraped_data/hotels_output.ts
"""

import os
import json
import re
import shutil

JSON_DIR  = "scraped_data/metadata"
IMAGES_SRC = "scraped_data/images"
IMAGES_DST = "../public/hotels"  # Next.js public folder
OUTPUT_TS  = "scraped_data/hotels_output.ts"

# ── City / country mapping from Booking.com country code + slug keywords ──────
def detect_city_country(source_url: str, hotel_name: str) -> tuple[str, str, str, str]:
    url = source_url.lower()
    name = hotel_name.lower()

    # country code from URL
    cc = re.search(r"/hotel/([a-z]{2})/", url)
    cc = cc.group(1) if cc else "ae"

    country_map = {
        "ae": ("uae",       "AED"),
        "sa": ("saudi-arabia", "SAR"),
        "qa": ("qatar",     "QAR"),
        "om": ("oman",      "OMR"),
        "bh": ("bahrain",   "BHD"),
        "kw": ("kuwait",    "KWD"),
    }
    country_slug, currency = country_map.get(cc, ("uae", "AED"))

    # city detection
    city_keywords = {
        "dubai":        ["dubai", "burj", "jumeirah", "palm", "downtown", "marina", "creek", "deira", "bur dubai", "jbr", "bluewaters"],
        "abu-dhabi":    ["abu dhabi", "abu-dhabi", "yas island", "corniche", "capital gate", "emirates palace"],
        "sharjah":      ["sharjah"],
        "ras-al-khaimah": ["ras al khaimah", "rak", "al hamra", "al wadi", "mina al arab"],
        "fujairah":     ["fujairah"],
        "makkah":       ["makkah", "mecca", "haram", "jabal omar", "abraj", "zamzam"],
        "madinah":      ["madinah", "madina", "medina", "nabawi", "al nakheel"],
        "riyadh":       ["riyadh", "olaya", "king fahad", "al anoud"],
        "jeddah":       ["jeddah", "corniche jeddah", "red sea", "king abdulaziz road"],
        "dammam":       ["dammam", "al khobar", "khobar", "eastern province"],
        "taif":         ["taif", "al taif"],
        "al-ahsa":      ["al ahsa", "hofuf", "ahsa"],
        "doha":         ["doha", "pearl", "west bay"],
        "muscat":       ["muscat", "al bustan", "barr al jissah", "oman"],
        "salalah":      ["salalah"],
        "manama":       ["manama", "bahrain", "bahrain bay"],
        "kuwait-city":  ["kuwait", "salmiya"],
    }

    combined = url + " " + name
    for city, keywords in city_keywords.items():
        if any(kw in combined for kw in keywords):
            return city, country_slug, currency, cc

    return "dubai", country_slug, currency, cc  # fallback

# ── Parse rating from "Scored 9.1" → 9.1 ─────────────────────────────────────
def parse_rating(rating_str: str) -> float:
    match = re.search(r"(\d+\.?\d*)", rating_str)
    return float(match.group(1)) if match else 0.0

# ── Parse review count from "Superb· 904 reviews" → 904 ──────────────────────
def parse_reviews(review_str: str) -> int:
    match = re.search(r"([\d,]+)\s+review", review_str)
    if match:
        return int(match.group(1).replace(",", ""))
    return 0

# ── Clean amenities — remove "See all X facilities" ──────────────────────────
def clean_amenities(amenities: list) -> list:
    cleaned = []
    for a in amenities:
        if re.match(r"^see all \d+", a.lower()):
            continue
        cleaned.append(a)
    return cleaned[:8]  # max 8 amenities

# ── Determine hotel type from name/amenities ──────────────────────────────────
def detect_type(name: str, amenities: list) -> str:
    n = name.lower()
    a = " ".join(amenities).lower()
    if any(w in n for w in ["ibis", "premier inn", "novotel ibis", "holiday inn express", "courtyard"]):
        return "budget"
    if any(w in n for w in ["resort", "beach", "island", "spa"]) or "beach" in a:
        return "resort"
    if any(w in n for w in ["boutique", "rove", "vida"]):
        return "boutique"
    if any(w in n for w in ["business", "ibis", "novotel", "mercure"]):
        return "business"
    return "luxury"

# ── Detect star rating from hotel name ────────────────────────────────────────
def detect_stars(name: str, hotel_type: str) -> int:
    n = name.lower()
    if any(w in n for w in ["ibis", "premier inn", "holiday inn express"]):
        return 3
    if any(w in n for w in ["novotel", "mercure", "courtyard", "holiday inn", "centro"]):
        return 4
    return 5

# ── Estimate price from city/type ─────────────────────────────────────────────
def estimate_price(city: str, hotel_type: str, currency: str) -> tuple[int, str]:
    base = {
        "AED": {"luxury": 900,  "resort": 700,  "budget": 200, "boutique": 400, "business": 350},
        "SAR": {"luxury": 1200, "resort": 900,  "budget": 250, "boutique": 500, "business": 400},
        "QAR": {"luxury": 1100, "resort": 850,  "budget": 230, "boutique": 450, "business": 380},
        "OMR": {"luxury": 140,  "resort": 110,  "budget": 30,  "boutique": 60,  "business": 50},
        "BHD": {"luxury": 125,  "resort": 95,   "budget": 25,  "boutique": 55,  "business": 45},
        "KWD": {"luxury": 115,  "resort": 90,   "budget": 22,  "boutique": 50,  "business": 42},
    }
    prices = base.get(currency, base["AED"])
    price_from = prices.get(hotel_type, 500)
    price_max  = price_from * 4
    return price_from, f"{currency} {price_from:,}–{price_max:,}/night"

# ── Slug: underscores → hyphens ───────────────────────────────────────────────
def to_url_slug(slug: str) -> str:
    return slug.replace("_", "-").lower()

# ── Copy images to public/hotels ──────────────────────────────────────────────
def copy_images(slug: str) -> list[str]:
    src_dir = os.path.join(IMAGES_SRC, slug)
    dst_dir = os.path.join(IMAGES_DST, slug.replace("_", "-"))
    public_paths = []

    if os.path.exists(src_dir):
        os.makedirs(dst_dir, exist_ok=True)
        for fname in sorted(os.listdir(src_dir)):
            if fname.endswith(".webp"):
                shutil.copy2(os.path.join(src_dir, fname), os.path.join(dst_dir, fname))
                public_paths.append(f"/hotels/{slug.replace('_', '-')}/{fname}")

    return public_paths

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    os.makedirs(IMAGES_DST, exist_ok=True)
    entries = []

    files = sorted(os.listdir(JSON_DIR))
    print(f"Processing {len(files)} hotels...")

    for i, fname in enumerate(files):
        if not fname.endswith(".json"):
            continue

        with open(os.path.join(JSON_DIR, fname), "r", encoding="utf-8") as f:
            data = json.load(f)

        name       = data.get("hotel_name", "Unknown Hotel")
        slug_raw   = data.get("slug", "unknown")
        source_url = data.get("source_url", "")
        raw_desc   = data.get("raw_description", data.get("description", ""))
        amenities  = clean_amenities(data.get("amenities", []))
        rating     = parse_rating(data.get("rating", "0"))
        reviews    = parse_reviews(data.get("review_count", "0 reviews"))

        city, country_slug, currency, cc = detect_city_country(source_url, name)
        hotel_type = detect_type(name, amenities)
        stars      = detect_stars(name, hotel_type)
        price_from, price_range = estimate_price(city, hotel_type, currency)
        url_slug   = to_url_slug(slug_raw) + f"-{city}"

        # Images
        images = copy_images(slug_raw)
        main_image = images[0] if images else "/hotels/placeholder.jpg"

        # Clean description — use raw (real) description, first 2 paragraphs
        desc_clean = raw_desc.strip()
        paragraphs = [p.strip() for p in desc_clean.split("\n\n") if p.strip()]
        description = " ".join(paragraphs[:2]) if paragraphs else desc_clean
        # Remove last sentence about "Couples particularly like..."
        description = re.sub(r"Couples particularly like.*", "", description).strip()
        description = re.sub(r"Distance in property.*", "", description).strip()

        hotel_id = f"scraped-{i+1:03d}"
        images_str = ",\n      ".join([f'"{img}"' for img in images])
        amenities_str = ", ".join([f'"{a}"' for a in amenities])

        entry = f'''  {{
    id: "{hotel_id}",
    name: "{name.replace('"', "'")}",
    slug: "{url_slug}",
    city: "{city}",
    country: "{country_slug}",
    image: "{main_image}",
    images: [
      {images_str}
    ],
    description: "{description.replace(chr(34), "'").replace(chr(10), " ").strip()}",
    rating: {rating},
    reviewCount: {reviews},
    priceRange: "{price_range}",
    priceFrom: {price_from},
    currency: "{currency}",
    amenities: [{amenities_str}],
    stars: {stars},
    type: "{hotel_type}",
    featured: false,
    listingType: "affiliate",
    verified: true,
    bestDealToday: false,
    affiliateLinks: {{
      booking: "{source_url}",
    }},
  }},'''

        entries.append(entry)
        print(f"  [{i+1}/{len(files)}] {name} → {city}, {country_slug}")

    # Write output
    output = "// AUTO-GENERATED from scraped Booking.com data\n"
    output += "// Paste these entries into the hotels array in src/lib/data.ts\n\n"
    output += "\n".join(entries)

    with open(OUTPUT_TS, "w", encoding="utf-8") as f:
        f.write(output)

    print(f"\n✓ Done! {len(entries)} hotels written to {OUTPUT_TS}")
    print(f"✓ Images copied to {IMAGES_DST}")
    print(f"\nNext step: copy contents of {OUTPUT_TS} into src/lib/data.ts hotels array")

if __name__ == "__main__":
    main()
