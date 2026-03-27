import { createServerClient } from "@/lib/supabase";

// ── Booking reference generator ───────────────────────────────────────────────
// Format: BK + YYYYMMDD + 6 random uppercase hex chars
// Example: BK20260320A3F8C2
// Unique enough for human communication; DB has a UNIQUE constraint as backstop.
export function generateBookingRef(): string {
  const now = new Date();
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const randPart = Math.random().toString(16).substring(2, 8).toUpperCase();
  return `BK${datePart}${randPart}`;
}

// ── Slug generator ────────────────────────────────────────────────────────────
// Converts "Grand Hyatt Dubai" → "grand-hyatt-dubai"
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ── Pagination ────────────────────────────────────────────────────────────────

export interface PaginationParams {
  page:   number;
  limit:  number;
  offset: number;
}

export function parsePagination(searchParams: URLSearchParams): PaginationParams {
  const page  = Math.max(1,   parseInt(searchParams.get("page")  ?? "1",  10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
  return { page, limit, offset: (page - 1) * limit };
}

export function paginationMeta(total: number, { page, limit }: PaginationParams) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNext:    page * limit < total,
    hasPrev:    page > 1,
  };
}

// ── Slug uniqueness ───────────────────────────────────────────────────────────

/** Returns true if the slug already exists in the hotels table. */
async function isHotelSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
  const db = createServerClient();
  let query = db.from("hotels").select("id").eq("slug", slug);
  if (excludeId) query = query.neq("id", excludeId);
  const { data } = await query.maybeSingle();
  return !!data;
}

/**
 * Ensures a slug is unique in the hotels table.
 * Appends -1, -2, … if needed.
 * Example: "grand-hyatt-dubai" → "grand-hyatt-dubai-2"
 */
export async function ensureUniqueHotelSlug(
  baseSlug: string,
  excludeId?: string,
): Promise<string> {
  let slug    = baseSlug;
  let attempt = 0;
  while (await isHotelSlugTaken(slug, excludeId)) {
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }
  return slug;
}

// ── Date validation ───────────────────────────────────────────────────────────

/** Returns true if check-out is strictly after check-in. */
export function areDatesValid(checkIn: string, checkOut: string): boolean {
  const inDate  = new Date(checkIn);
  const outDate = new Date(checkOut);
  return !isNaN(inDate.getTime()) && !isNaN(outDate.getTime()) && outDate > inDate;
}

/** Calculates the number of nights between two ISO date strings. */
export function calcNights(checkIn: string, checkOut: string): number {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  return Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / MS_PER_DAY);
}

// ── Email validation ──────────────────────────────────────────────────────────

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── Log helper ────────────────────────────────────────────────────────────────
// Lightweight structured logger for API routes.
// Replace with your preferred logging service (Axiom, Logtail, etc.) as needed.
export function logEvent(
  context: string,
  event: Record<string, unknown>,
): void {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[${context}]`, JSON.stringify(event));
  }
  // Future: await axiom.ingest("besthoteldealsdaily", [{ ...event, _time: new Date().toISOString() }])
}
