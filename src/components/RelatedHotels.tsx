import Link from "next/link";
import Image from "next/image";
import { Hotel } from "@/lib/types";
import { Building2, Star } from "lucide-react";

interface Props {
  hotels: Hotel[];
  title?: string;
}

export default function RelatedHotels({ hotels, title = "Similar Hotels" }: Props) {
  if (!hotels.length) return null;

  return (
    <section aria-label="Related hotels">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="w-4 h-4 text-gold-500" />
        <h2 className="text-base font-black text-navy-900">{title}</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {hotels.map((h) => {
          const isDirect   = h.listingType === "direct";
          const href       = isDirect ? `/book/${h.slug}/` : `/hotels/${h.slug}/`;

          return (
            <Link
              key={h.slug}
              href={href}
              className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-gold-300 hover:shadow-md transition-all"
            >
              <div className="relative h-36">
                <Image
                  src={h.image}
                  alt={h.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 to-transparent" />
                <div className="absolute bottom-2 left-3">
                  <div className="text-white text-[10px] font-black capitalize">{h.city}</div>
                </div>
                {isDirect && (
                  <div className="absolute top-2 left-2">
                    <span className="badge-navy">Direct</span>
                  </div>
                )}
              </div>

              <div className="p-3">
                <h3 className="text-xs font-black text-navy-900 line-clamp-1 group-hover:text-gold-600 transition-colors mb-1">
                  {h.name}
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <div className="bg-navy-900 text-white text-[9px] font-black px-1 py-0.5 rounded">
                      {h.rating.toFixed(1)}
                    </div>
                    <div className="flex items-center gap-0.5 text-gold-400">
                      {Array.from({ length: Math.min(h.stars, 5) }).map((_, i) => (
                        <Star key={i} className="w-2.5 h-2.5 fill-current" />
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] text-gray-400 uppercase tracking-wider">From</div>
                    <div className="text-xs font-black text-navy-900">
                      {h.currency} {h.priceFrom.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
