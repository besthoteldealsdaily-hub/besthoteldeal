"use client";

import { trackEvent } from "@/lib/track";

interface TrackedLinkProps {
  href: string;
  event: string;
  dealSlug?: string;
  hotelSlug?: string;
  hotelName?: string;
  city?: string;
  country?: string;
  pricePoint?: number;
  currency?: string;
  source?: string;
  className?: string;
  style?: React.CSSProperties;
  target?: string;
  rel?: string;
  children: React.ReactNode;
}

/**
 * An anchor element that fires an engagement tracking event on click.
 * Used for affiliate links, booking CTAs, and lead-gen buttons.
 * Specifically handles WhatsApp lead recording when event is "lead_click".
 */
export default function TrackedLink({
  href,
  event,
  dealSlug,
  hotelSlug,
  hotelName,
  city,
  country,
  pricePoint,
  currency,
  source,
  className,
  style,
  target,
  rel,
  children,
}: TrackedLinkProps) {
  const handleClick = () => {
    trackEvent({
      event,
      dealSlug,
      hotelSlug,
      hotelName,
      city,
      country,
      pricePoint,
      currency,
      source,
    });
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={className}
      style={style}
      target={target}
      rel={rel}
    >
      {children}
    </a>
  );
}
