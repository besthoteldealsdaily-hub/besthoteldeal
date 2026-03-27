/**
 * Client-side engagement tracking utility.
 * Fires non-blocking POST requests to /api/track.
 * For WhatsApp leads, also fires a request to /api/whatsapp.
 * Never throws — tracking failures are silently ignored.
 */
export function trackEvent(payload: {
  event: string;
  dealSlug?: string;
  hotelSlug?: string;
  hotelName?: string;
  city?: string;
  country?: string;
  pricePoint?: number;
  currency?: string;
  source?: string;
}) {
  if (typeof window === "undefined") return;

  // 1. Record generic engagement
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {});

  // 2. If it's a WhatsApp lead, record it in the dedicated leads table
  if (payload.event === "lead_click") {
    fetch("/api/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hotelSlug:  payload.hotelSlug || payload.dealSlug,
        hotelName:  payload.hotelName,
        dealSlug:   payload.dealSlug,
        city:       payload.city,
        country:    payload.country,
        pricePoint: payload.pricePoint,
        currency:   payload.currency,
        sourcePage: window.location.pathname,
      }),
      keepalive: true,
    }).catch(() => {});
  }
}
