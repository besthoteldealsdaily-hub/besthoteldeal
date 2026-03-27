import { SITE } from "@/lib/config";

/**
 * Reusable JSON-LD schema builders.
 * Reduces boilerplate across page files that all need
 * breadcrumbs, FAQ schemas, and organization references.
 */

/** Build a BreadcrumbList schema from an array of {name, url} pairs */
export function breadcrumbSchema(crumbs: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  };
}

/** Build a FAQPage schema from an array of {question, answer} pairs */
export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

/** Safely serialize a schema object for dangerouslySetInnerHTML */
export function serializeSchema(schema: object): string {
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}

/** Organization schema — reusable across any page that needs publisher info */
export const PUBLISHER_REF = {
  "@type": "Organization" as const,
  name: SITE.name,
  url: SITE.url,
};
