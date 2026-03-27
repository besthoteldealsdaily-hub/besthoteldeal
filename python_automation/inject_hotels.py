"""
Injects scraped hotels into src/lib/data.ts
Run: .\venv\Scripts\python.exe inject_hotels.py
"""

SCRAPED_FILE = "scraped_data/hotels_output.ts"
DATA_TS      = "../src/lib/data.ts"

with open(SCRAPED_FILE, "r", encoding="utf-8") as f:
    scraped = f.read()

# Remove comment lines from top
lines = scraped.splitlines()
hotel_lines = [l for l in lines if not l.startswith("//")]
scraped_clean = "\n".join(hotel_lines).strip()

with open(DATA_TS, "r", encoding="utf-8") as f:
    data_ts = f.read()

# Remove previously injected scraped block if exists (avoid duplicates)
OLD_START = "\n  // -- SCRAPED FROM BOOKING.COM"
OLD_ALT   = "\n  // \u2500\u2500 SCRAPED FROM BOOKING.COM"
for marker in [OLD_START, OLD_ALT]:
    if marker in data_ts:
        end_idx = data_ts.find("];\n\n// \u2500\u2500\u2500 DEALS", data_ts.index(marker))
        if end_idx != -1:
            data_ts = data_ts[:data_ts.index(marker)] + "];\n\n// \u2500\u2500\u2500 DEALS" + data_ts[end_idx + len("];\n\n// \u2500\u2500\u2500 DEALS"):]

MARKER = "];\n\n// \u2500\u2500\u2500 DEALS"
NEW_BLOCK = f"\n  // ── SCRAPED FROM BOOKING.COM ─────────────────────────────────────────────\n{scraped_clean}\n];\n\n// ─── DEALS"

if MARKER not in data_ts:
    print("ERROR: Could not find hotels array end marker. Looking for alternative...")
    # Try alternative
    MARKER = "];\n\n// ─── DEALS"
    if MARKER not in data_ts:
        print("FAILED: Marker not found. Check data.ts manually.")
        exit(1)

updated = data_ts.replace(MARKER, NEW_BLOCK, 1)

with open(DATA_TS, "w", encoding="utf-8") as f:
    f.write(updated)

# Count injected hotels
count = scraped_clean.count('id: "scraped-')
print(f"[OK] Injected {count} hotels into src/lib/data.ts")
print("[OK] Done! Restart your Next.js dev server to see changes.")
