import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StickyIntentBar from "@/components/StickyIntentBar";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import ClientProviders from "@/components/ClientProviders";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://besthoteldealsdaily.com"),
  title: {
    default: "Best Hotel Deals in Middle East – Updated Daily | Best Hotel Deals Daily",
    template: "%s | Best Hotel Deals Daily",
  },
  description:
    "Dubai, Makkah, Doha, Riyadh hotel deals — compared and verified daily. Save up to 50% on 500+ Middle East hotels. Booking.com, Agoda & Expedia rates in one place.",
  keywords: [
    "best hotel deals",
    "Middle East hotels",
    "Dubai hotels",
    "Makkah hotels",
    "Doha hotels",
    "hotel deals UAE",
    "cheap hotels Saudi Arabia",
    "luxury hotels Middle East",
    "hotel deals daily",
    "besthoteldealsdaily",
  ],
  authors: [{ name: "Best Hotel Deals Daily" }],
  creator: "Best Hotel Deals Daily",
  publisher: "Best Hotel Deals Daily",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://besthoteldealsdaily.com",
    siteName: "Best Hotel Deals Daily",
    title: "Best Hotel Deals in the Middle East – Updated Daily",
    description:
      "Compare and book the best hotel deals across Dubai, Makkah, Doha, Bahrain, Riyadh and beyond. Exclusive offers updated every day.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Best Hotel Deals Daily – Middle East",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Hotel Deals in the Middle East – Updated Daily",
    description:
      "Compare and book the best hotel deals across Dubai, Makkah, Doha, Bahrain and more.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // NOTE: No global canonical here — every page sets its own via alternates.canonical.
  // A global canonical pointing to "/" would incorrectly signal that all pages are
  // duplicates of the homepage if any page accidentally omits its own canonical.
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const isAdmin = headersList.get("x-is-admin") === "1";
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Best Hotel Deals Daily",
    url: "https://besthoteldealsdaily.com",
    logo: {
      "@type": "ImageObject",
      url: "https://besthoteldealsdaily.com/logo.png",
      width: 512,
      height: 512,
    },
    description:
      "Find and compare the best hotel deals across the Middle East including Dubai, Makkah, Madinah, Doha, Bahrain and Kuwait.",
    foundingDate: "2025",
    sameAs: [
      "https://www.facebook.com/besthoteldealsdaily",
      "https://x.com/besthoteldeals",
      "https://www.instagram.com/besthoteldealsdaily",
      "https://www.linkedin.com/company/besthoteldealsdaily",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Support",
      email: "support@besthoteldealsdaily.com",
      availableLanguage: ["English", "Arabic"],
    },
    areaServed: [
      { "@type": "Country", name: "United Arab Emirates" },
      { "@type": "Country", name: "Saudi Arabia" },
      { "@type": "Country", name: "Qatar" },
      { "@type": "Country", name: "Bahrain" },
      { "@type": "Country", name: "Kuwait" },
      { "@type": "Country", name: "Oman" },
    ],
    knowsAbout: [
      "Hotel deals in the Middle East",
      "Dubai hotel bookings",
      "Makkah hotels near Haram",
      "Madinah hotels near Masjid Nabawi",
      "Luxury hotels in the Gulf region",
      "Budget accommodation in Saudi Arabia",
      "Hajj and Umrah hotel stays",
      "Business hotels in Doha and Riyadh",
    ],
  };

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Best Hotel Deals Daily",
    url: "https://besthoteldealsdaily.com",
    description: "Best hotel deals in the Middle East, updated daily.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://besthoteldealsdaily.com/deals/?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  // SiteNavigationElement: signals the primary site structure to search engines.
  // Helps Google understand topical authority clusters and navigate the link graph.
  const navigationSchema = [
    { "@context": "https://schema.org", "@type": "SiteNavigationElement", name: "Hotel Deals",           url: "https://besthoteldealsdaily.com/deals/" },
    { "@context": "https://schema.org", "@type": "SiteNavigationElement", name: "Dubai Hotels",          url: "https://besthoteldealsdaily.com/city/dubai/" },
    { "@context": "https://schema.org", "@type": "SiteNavigationElement", name: "Makkah Hotels",         url: "https://besthoteldealsdaily.com/city/makkah/" },
    { "@context": "https://schema.org", "@type": "SiteNavigationElement", name: "Madinah Hotels",        url: "https://besthoteldealsdaily.com/city/madinah/" },
    { "@context": "https://schema.org", "@type": "SiteNavigationElement", name: "Abu Dhabi Hotels",      url: "https://besthoteldealsdaily.com/city/abu-dhabi/" },
    { "@context": "https://schema.org", "@type": "SiteNavigationElement", name: "Doha Hotels",           url: "https://besthoteldealsdaily.com/city/doha/" },
    { "@context": "https://schema.org", "@type": "SiteNavigationElement", name: "Riyadh Hotels",         url: "https://besthoteldealsdaily.com/city/riyadh/" },
    { "@context": "https://schema.org", "@type": "SiteNavigationElement", name: "Muscat Hotels",         url: "https://besthoteldealsdaily.com/city/muscat/" },
    { "@context": "https://schema.org", "@type": "SiteNavigationElement", name: "UAE Hotels",            url: "https://besthoteldealsdaily.com/country/uae/" },
    { "@context": "https://schema.org", "@type": "SiteNavigationElement", name: "Saudi Arabia Hotels",   url: "https://besthoteldealsdaily.com/country/saudi-arabia/" },
    { "@context": "https://schema.org", "@type": "SiteNavigationElement", name: "Umrah & Hajj Packages", url: "https://besthoteldealsdaily.com/umrah/" },
    { "@context": "https://schema.org", "@type": "SiteNavigationElement", name: "Travel Blog",           url: "https://besthoteldealsdaily.com/blog/" },
  ];

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        {/* Global heading font override — highest priority, beats all Tailwind utilities */}
        <style dangerouslySetInnerHTML={{ __html: `
          h1, h2, h3, h4, h5, h6,
          h1 *, h2 *, h3 *, h4 *, h5 *, h6 * {
            font-family: 'Jotia', Verdana, Geneva, sans-serif !important;
            font-size: 36px !important;
            font-weight: 100 !important;
            line-height: 48px !important;
            color: rgb(255, 255, 255) !important;
          }
        `}} />
        {/* Preconnect: hotel image CDN — reduces render-blocking for crawlers */}
        <link rel="preconnect" href="https://cf.bstatic.com" />
        <link rel="dns-prefetch" href="https://cf.bstatic.com" />
        {/* Preconnect: Google Fonts (already loaded via next/font but belt-and-braces) */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* DNS prefetch: affiliate partners — improves affiliate link load time */}
        <link rel="dns-prefetch" href="https://www.booking.com" />
        <link rel="dns-prefetch" href="https://www.agoda.com" />
        <link rel="dns-prefetch" href="https://www.expedia.com" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(orgSchema).replace(/</g, "\\u003c"),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(webSiteSchema).replace(/</g, "\\u003c"),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(navigationSchema).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body className="font-sans">
        <ClientProviders>
          {!isAdmin && <Header />}
          <main>{children}</main>
          {!isAdmin && <Footer />}
          {!isAdmin && <StickyIntentBar />}
          {!isAdmin && <WhatsAppFloatingButton />}
        </ClientProviders>
      </body>
    </html>
  );
}
