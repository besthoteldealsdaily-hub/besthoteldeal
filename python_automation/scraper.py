import os
import json
import asyncio
from datetime import datetime
from playwright.async_api import async_playwright
import requests
from PIL import Image
from io import BytesIO
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

# Supabase Configuration (Placeholder - user will provide)
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

# Initialize Supabase Client
supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Constants
RESOURCES_DIR = "resources"
IMAGES_DIR = os.path.join(RESOURCES_DIR, "hotel_images")
DATA_DIR = os.path.join(RESOURCES_DIR, "hotel_data")

# Create directories
os.makedirs(IMAGES_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

async def download_and_optimize_image(url, hotel_slug, image_index):
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            img = Image.open(BytesIO(response.content))
            
            # Create a slug-friendly filename
            filename = f"{hotel_slug}_{image_index}.webp"
            hotel_img_dir = os.path.join(IMAGES_DIR, hotel_slug)
            os.makedirs(hotel_img_dir, exist_ok=True)
            
            filepath = os.path.join(hotel_img_dir, filename)
            
            # Convert to WebP and save
            img.save(filepath, "WEBP", quality=80)
            print(f"  [+] Saved optimized image: {filepath}")
            return filepath
    except Exception as e:
        print(f"  [-] Error downloading/optimizing image {url}: {e}")
    return None

async def scrape_hotel_booking(url):
    print(f"[*] Scraping hotel: {url}")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
        )
        page = await context.new_page()
        
        try:
            await page.goto(url, wait_until="domcontentloaded", timeout=60000)
            
            # Extract basic info
            name = await page.inner_text("h2.pp-header__title") if await page.query_selector("h2.pp-header__title") else ""
            if not name:
                name = await page.inner_text("#hp_hotel_name") if await page.query_selector("#hp_hotel_name") else "Unknown Hotel"
            
            name = name.strip()
            slug = name.lower().replace(" ", "-").replace("'", "").replace("&", "and")
            
            rating = await page.inner_text('div[data-testid="review-score-component"] div:first-child') if await page.query_selector('div[data-testid="review-score-component"]') else "0"
            review_count = await page.inner_text('div[data-testid="review-score-component"] div:last-child') if await page.query_selector('div[data-testid="review-score-component"]') else "0 Reviews"
            
            description = await page.inner_text("#property_description_content") if await page.query_selector("#property_description_content") else ""
            
            # Price (this can be tricky on Booking.com as it requires dates)
            price = "Check website for price"
            
            # Amenities
            amenities = []
            amenity_elements = await page.query_selector_all(".hp_desc_important_facilities .important_facility")
            for el in amenity_elements:
                amenities.append(await el.inner_text())
            
            # Images
            image_urls = []
            gallery_images = await page.query_selector_all('a[data-testid="image-link"] img, .hp-gallery-top img, .hotel_main_content img')
            for img in gallery_images[:10]: # Limit to 10 images
                src = await img.get_attribute("src")
                if src:
                    # Often Booking.com uses thumbnail URLs, let's try to get higher res if possible
                    # Example: https://cf.bstatic.com/xdata/images/hotel/max1024x768/1234.jpg
                    high_res = src.replace("square60", "max1024x768").replace("max300", "max1024x768")
                    image_urls.append(high_res)
            
            # Optimize and download images
            optimized_images = []
            for i, img_url in enumerate(image_urls):
                local_path = await download_and_optimize_image(img_url, slug, i)
                if local_path:
                    optimized_images.append(local_path)
            
            hotel_data = {
                "name": name,
                "slug": slug,
                "rating": rating.strip(),
                "review_count": review_count.strip(),
                "description": description.strip(),
                "amenities": [a.strip() for a in amenities if a.strip()],
                "images": optimized_images,
                "source_url": url,
                "scraped_at": datetime.now().isoformat()
            }
            
            # Save metadata to JSON
            json_filename = os.path.join(DATA_DIR, f"{slug}.json")
            with open(json_filename, "w", encoding="utf-8") as f:
                json.dump(hotel_data, f, indent=4)
            
            print(f"[+] Successfully scraped and saved: {name}")
            return hotel_data
            
        except Exception as e:
            print(f"[-] Error scraping {url}: {e}")
        finally:
            await browser.close()

async def main():
    # Example urls from data.ts
    urls = [
        "https://www.booking.com/hotel/ae/burj-al-arab.html",
        "https://www.booking.com/hotel/ae/atlantis-the-palm.html",
        "https://www.booking.com/hotel/sa/fairmont-makkah.html"
    ]
    
    for url in urls:
        await scrape_hotel_booking(url)

if __name__ == "__main__":
    asyncio.run(main())
