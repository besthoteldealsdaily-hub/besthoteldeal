"""
Discovery Scraper — Finds NEW hotels from Booking.com search results
Searches every GCC city, collects all hotel URLs, saves new ones to scrape

Run: .\venv\Scripts\python.exe discover_hotels.py
Then run: .\venv\Scripts\python.exe scraper_advanced.py
"""

import os
import json
import asyncio
import re
from playwright.async_api import async_playwright
from playwright_stealth import Stealth

OUTPUT_FILE   = "scraped_data/discovered_urls.json"
METADATA_DIR  = "scraped_data/metadata"

# All GCC cities with Booking.com search URLs
# offset=0,25,50... = pagination (25 hotels per page)
GCC_CITIES = [
    # UAE
    {"city": "dubai",           "cc": "ae", "pages": 10},
    {"city": "abu-dhabi",       "cc": "ae", "pages": 6},
    {"city": "sharjah",         "cc": "ae", "pages": 4},
    {"city": "ras-al-khaimah",  "cc": "ae", "pages": 4},
    {"city": "fujairah",        "cc": "ae", "pages": 3},
    {"city": "ajman",           "cc": "ae", "pages": 3},
    # Saudi Arabia
    {"city": "mecca",           "cc": "sa", "pages": 8},
    {"city": "medina",          "cc": "sa", "pages": 6},
    {"city": "riyadh",          "cc": "sa", "pages": 8},
    {"city": "jeddah",          "cc": "sa", "pages": 8},
    {"city": "dammam",          "cc": "sa", "pages": 4},
    {"city": "al-khobar",       "cc": "sa", "pages": 4},
    {"city": "taif",            "cc": "sa", "pages": 3},
    {"city": "abha",            "cc": "sa", "pages": 3},
    {"city": "tabuk",           "cc": "sa", "pages": 3},
    {"city": "neom",            "cc": "sa", "pages": 2},
    # Qatar
    {"city": "doha",            "cc": "qa", "pages": 6},
    # Bahrain
    {"city": "manama",          "cc": "bh", "pages": 4},
    # Kuwait
    {"city": "kuwait-city",     "cc": "kw", "pages": 4},
    # Oman
    {"city": "muscat",          "cc": "om", "pages": 5},
    {"city": "salalah",         "cc": "om", "pages": 3},
    {"city": "nizwa",           "cc": "om", "pages": 2},
]

def already_scraped_slugs():
    """Return set of hotel slugs already in metadata folder"""
    if not os.path.exists(METADATA_DIR):
        return set()
    return {f.replace(".json", "") for f in os.listdir(METADATA_DIR) if f.endswith(".json")}

def load_discovered():
    if os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE, "r") as f:
            return json.load(f)
    return {}

def save_discovered(data):
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w") as f:
        json.dump(data, f, indent=2)

async def discover_city(page, city_slug, cc, max_pages):
    """Scrape hotel listing pages for a city and collect hotel URLs"""
    found_urls = []
    base = f"https://www.booking.com/searchresults.html?ss={city_slug.replace('-', '+')}&dest_type=city&rows=25"

    for page_num in range(max_pages):
        offset = page_num * 25
        url = f"{base}&offset={offset}"
        print(f"    Searching {city_slug} page {page_num+1}/{max_pages}...")

        try:
            await page.goto(url, wait_until="domcontentloaded", timeout=30000)
            await asyncio.sleep(3)

            content = await page.content()

            # Extract hotel URLs from search results
            # Pattern: /hotel/ae/hotel-name.html
            pattern = rf'href="(https://www\.booking\.com/hotel/{cc}/[^"?]+\.html)'
            matches = re.findall(pattern, content)

            # Clean URLs (remove query params)
            for m in matches:
                clean = m.split("?")[0].split(".en")[0]
                if clean not in found_urls:
                    found_urls.append(clean)

        except Exception as e:
            print(f"    Error on {city_slug} page {page_num+1}: {e}")
            continue

        await asyncio.sleep(2)

    return found_urls

async def main():
    os.makedirs("scraped_data", exist_ok=True)

    already_done = already_scraped_slugs()
    discovered   = load_discovered()
    all_new_urls = []

    print(f"Already scraped: {len(already_done)} hotels")
    print(f"Starting discovery for {len(GCC_CITIES)} cities...\n")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            viewport={"width": 1920, "height": 1080},
        )
        page = await context.new_page()
        stealth = Stealth()
        await stealth.apply_stealth_async(page)

        for city_info in GCC_CITIES:
            city  = city_info["city"]
            cc    = city_info["cc"]
            pages = city_info["pages"]

            print(f"\n[{city.upper()}] Discovering hotels...")
            urls = await discover_city(page, city, cc, pages)

            # Filter out already-scraped
            new_urls = []
            for u in urls:
                slug = u.split("/hotel/")[1].replace("/", "_").replace("-", "_").replace(".html", "")
                if slug not in already_done and u not in discovered.get(city, []):
                    new_urls.append(u)

            discovered[city] = list(set(discovered.get(city, []) + urls))
            all_new_urls.extend(new_urls)

            print(f"  Found {len(urls)} total, {len(new_urls)} NEW hotels in {city}")
            await asyncio.sleep(3)

        await browser.close()

    save_discovered(discovered)

    # Write new URLs to scraper list
    if all_new_urls:
        new_urls_file = "scraped_data/new_urls_to_scrape.txt"
        with open(new_urls_file, "w") as f:
            f.write("\n".join(all_new_urls))
        print(f"\n[DONE] {len(all_new_urls)} NEW hotels discovered")
        print(f"Saved to: {new_urls_file}")
        print(f"Now run: python scraper_advanced.py --new-only")
    else:
        print("\n[DONE] No new hotels found — all cities are up to date!")

if __name__ == "__main__":
    asyncio.run(main())
