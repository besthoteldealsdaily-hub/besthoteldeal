import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getBlogBySlug, blogPosts, cities, getLandmarksByCity } from "@/lib/data";
import { faqSchema, serializeSchema, PUBLISHER_REF } from "@/lib/schema";
import { SITE } from "@/lib/config";
import BlogCard from "@/components/BlogCard";
import BlogDealEmbed from "@/components/BlogDealEmbed";
import { Clock } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return blogPosts.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogBySlug(slug);
  if (!post) return {};

  const year = new Date().getFullYear();
  const titleHasYear = post.title.includes(String(year)) || post.title.includes(String(year - 1));
  const title = titleHasYear
    ? `${post.title} | Best Hotel Deals Daily`
    : `${post.title} (${year} Guide) | Best Hotel Deals Daily`;
  const cityLabel = post.relatedCities[0]
    ? post.relatedCities[0].split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    : "the Middle East";
  const readTag = post.readTime <= 5 ? `${post.readTime}-min read` : `${post.readTime}-min expert guide`;
  const description = `${post.excerpt} A ${readTag} by ${post.author} — packed with actionable tips for finding the best hotel deals in ${cityLabel}.`;

  return {
    title,
    description,
    alternates: { canonical: `https://besthoteldealsdaily.com/blog/${post.slug}/` },
    authors: [{ name: post.author }],
    openGraph: {
      title,
      description,
      url: `https://besthoteldealsdaily.com/blog/${post.slug}/`,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      images: [{ url: post.image, width: 1200, height: 630, alt: post.title }],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogBySlug(slug);
  if (!post) notFound();

  const relatedPosts = blogPosts.filter((b) => b.id !== post.id).slice(0, 3);
  const relatedCityPages = post.relatedCities
    .map((cs) => cities.find((c) => c.slug === cs))
    .filter(Boolean);
  const relatedLandmarks = post.relatedCities
    .flatMap((cs) => getLandmarksByCity(cs))
    .slice(0, 4);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.image,
    url: `${SITE.url}/blog/${post.slug}/`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { "@type": "Person", name: post.author },
    publisher: PUBLISHER_REF,
    keywords: post.tags.join(", "),
    articleSection: post.category,
  };

  const postFaqSchema = faqSchema(post.faqs.map((f) => ({ question: f.question, answer: f.answer })));

  return (
    <div className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeSchema(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeSchema(postFaqSchema) }} />

      {/* Hero Image */}
      <div className="relative h-72 md:h-96 pt-20">
        <Image src={post.image} alt={post.title} fill className="object-cover" priority sizes="100vw" />
        <div className="absolute inset-0 bg-navy-gradient opacity-70" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 w-full">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="badge-navy capitalize text-xs">{post.category}</span>
              {post.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="badge text-xs bg-white/20 text-white border border-white/30">#{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumb crumbs={[
              { label: "Blog", href: "/blog/" },
              { label: post.title },
            ]} />
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-8">
            <span className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-navy-800 flex items-center justify-center text-gold-400 text-xs font-bold">{post.author[0]}</div>
              {post.author}
            </span>
            <span> {new Date(post.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
            <span> Updated: {new Date(post.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {post.readTime} min read</span>
          </div>

          {/* Title */}
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-navy-900 mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Excerpt */}
          <p className="text-xl text-gray-600 leading-relaxed mb-10 pb-8 border-b border-gray-100">
            {post.excerpt}
          </p>

          {/* Article content */}
          <div
            className="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-navy-900 prose-p:text-gray-600 prose-p:leading-relaxed prose-a:text-gold-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-navy-800 prose-li:text-gray-600"
            dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>').replace(/#{1,3} (.+)/g, (match, text, offset, str) => {
              const level = (match.match(/^#+/) || [''])[0].length;
              return `<h${level} class="font-display font-bold text-navy-900 mt-8 mb-4">${text}</h${level}>`;
            }) }}
          />

          {/* Embedded Deal/Hotel Widgets */}
          <BlogDealEmbed relatedCities={post.relatedCities} />

          {/* Brand Comparison Widget */}
          <div className="bg-navy-950 rounded-2xl p-8 my-10 text-center relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "radial-gradient(circle at 30% 50%, #d4a017 0%, transparent 50%)",
              }}
            />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 mb-4">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest">Live Prices</span>
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-2">
                Compare Hotel Prices on <span className="text-gold-400">Best Hotel Deals Daily</span>
              </h3>
              <p className="text-gray-400 text-sm mb-6 max-w-lg mx-auto leading-relaxed">
                We scan Booking.com, Agoda & Expedia daily so you don&apos;t have to. 500+ verified hotels across the Middle East — find your best rate in seconds.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/deals/" className="btn-gold text-sm px-6 py-3 justify-center">
                  Check Today&apos;s Deals
                </Link>
                {relatedCityPages.length > 0 && relatedCityPages[0] && (
                  <Link href={`/city/${relatedCityPages[0].slug}/`} className="border border-white/20 text-white hover:border-gold-400 hover:text-gold-400 px-6 py-3 rounded-full font-semibold text-sm transition-all text-center">
                    Browse {relatedCityPages[0].name} Hotels
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Internal links */}
          {relatedCityPages.length > 0 && (
            <div className="bg-gold-50 border border-gold-200 rounded-2xl p-6 my-10">
              <h3 className="font-display text-lg font-bold text-navy-900 mb-3">
                 Find Hotel Deals in Related Cities
              </h3>
              <div className="flex flex-wrap gap-3">
                {relatedCityPages.map((city) => city && (
                  <Link
                    key={city.slug}
                    href={`/city/${city.slug}/`}
                    className="px-4 py-2 bg-white border border-gold-300 text-navy-800 rounded-full text-sm font-semibold hover:border-gold-500 hover:text-gold-700 transition-all"
                  >
                    {city.name} Hotels →
                  </Link>
                ))}
                <Link href="/deals/" className="px-4 py-2 btn-gold text-sm">
                   View All Deals
                </Link>
              </div>
            </div>
          )}

          {/* Landmark Links */}
          {relatedLandmarks.length > 0 && (
            <div className="bg-navy-50 border border-navy-100 rounded-2xl p-6 my-10">
              <h3 className="font-display text-lg font-bold text-navy-900 mb-3">
                Explore Hotels Near Top Landmarks
              </h3>
              <div className="flex flex-wrap gap-3">
                {relatedLandmarks.map((lm) => (
                  <Link
                    key={lm.slug}
                    href={`/landmark/${lm.slug}/`}
                    className="px-4 py-2 bg-white border border-gray-200 text-navy-800 rounded-full text-sm font-semibold hover:border-navy-400 hover:text-navy-900 transition-all"
                  >
                    Near {lm.name} →
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* FAQs */}
          {post.faqs.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-2xl font-bold text-navy-900 mb-6">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {post.faqs.map((faq, i) => (
                  <details
                    key={i}
                    className="group bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden"
                  >
                    <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                      <h3 className="font-semibold text-navy-900 text-base">{faq.question}</h3>
                      <span className="text-gold-500 shrink-0 ml-4 group-open:rotate-180 transition-transform">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}

          {/* Share/CTA */}
          <div className="bg-navy-gradient rounded-2xl p-8 mt-12 text-center">
            <h3 className="font-display text-xl font-bold text-white mb-3">
              Ready to Book Your Hotel?
            </h3>
            <p className="text-white/70 text-sm mb-6">
              Compare the best hotel deals across the Middle East — prices verified daily.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/deals/" className="btn-gold text-sm justify-center">
                 Check Latest Deals
              </Link>
              <Link href="/blog/" className="border border-white/30 text-white hover:text-gold-400 hover:border-gold-400 px-6 py-2 rounded-full text-sm font-semibold transition-all">
                Read More Articles
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl font-bold text-navy-900 mb-8">
              More Hotel Travel Guides
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((p) => <BlogCard key={p.id} post={p} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
