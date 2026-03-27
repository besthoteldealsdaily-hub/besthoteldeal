import Image from "next/image";
import Link from "next/link";
import { BlogPost } from "@/lib/types";

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="bg-white rounded-2xl shadow-md overflow-hidden card-hover border border-gray-100 flex flex-col">
      {/* Image */}
      <Link href={`/blog/${post.slug}/`} className="block relative h-52 overflow-hidden">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-500 hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/50 to-transparent" />
        <span className="absolute top-3 left-3 badge-navy text-xs capitalize">
          {post.category}
        </span>
        <span className="absolute bottom-3 right-3 bg-navy-900/80 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
          {post.readTime} min read
        </span>
      </Link>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs text-gold-600 bg-gold-50 border border-gold-200 px-2 py-0.5 rounded-full">
              #{tag}
            </span>
          ))}
        </div>

        <Link href={`/blog/${post.slug}/`} className="hover:no-underline">
          <h3 className="font-display text-lg font-bold text-navy-900 hover:text-gold-600 transition-colors line-clamp-2 mb-2">
            {post.title}
          </h3>
        </Link>

        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 flex-1 mb-4">
          {post.excerpt}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-navy-800 flex items-center justify-center text-gold-400 text-xs font-bold">
              {post.author[0]}
            </div>
            <span>{post.author}</span>
          </div>
          <span>
            {new Date(post.publishedAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>

        {/* Read More */}
        <div className="mt-4">
          <Link
            href={`/blog/${post.slug}/`}
            className="text-gold-600 hover:text-gold-700 font-semibold text-sm flex items-center gap-1 transition-colors"
            aria-label={`Read more: ${post.title}`}
          >
            Read Article
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
