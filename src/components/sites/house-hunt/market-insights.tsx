import Link from "next/link";
import { BookOpen, Calendar, Clock, ArrowRight } from "lucide-react";
import { CmsImage } from "./cms-image";
import type { InsightItem } from "@/lib/cms/types";

export function MarketInsights({ articles }: { articles: InsightItem[] }) {
  const displayArticles = (articles || []).slice(0, 4);

  return (
    <section id="insights" data-ui="market-insights" className="py-10 sm:py-12 bg-white border-b border-[#aeaeaf]/40">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#008ae8] mb-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Intelligence &amp; Advisories</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-light tracking-normal text-[#262626]">
              Real Estate News &amp; Market <span className="font-serif italic font-normal">Insights</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#757577] mt-1">
              Data-backed research reports, price growth heatmaps, and property investment guides.
            </p>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#008ae8] hover:text-[#0077c8] self-start sm:self-auto group"
          >
            <span>Read All Articles</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {displayArticles.map((art) => (
            <Link
              key={art.id}
              href={`/blog/${art.id}`}
              data-ui="article-card"
              className="group relative block aspect-[4/4.8] sm:aspect-[4/5] lg:aspect-[4/4.7] max-h-[420px] overflow-hidden rounded-2xl bg-[#1c1c1e] shadow-xs hover:shadow-lg transition-all duration-300"
            >
              <CmsImage
                src={art.image}
                alt={art.title}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-[#1c1c1e]/95 via-[#1c1c1e]/50 to-[#1c1c1e]/15" />

              <div className="absolute top-2.5 left-2.5 right-2.5 sm:top-3 sm:left-3 sm:right-3 flex items-start justify-between gap-2">
                {art.category ? (
                  <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-[4px] text-[10px] sm:text-[11px] font-medium bg-[#1c1c1e]/60 backdrop-blur-md border border-white/20 text-white">
                    {art.category}
                  </span>
                ) : (
                  <span />
                )}
                {art.readTime && (
                  <span className="flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-[4px] text-[10px] sm:text-[11px] font-medium bg-[#1c1c1e]/60 backdrop-blur-md border border-white/20 text-white">
                    <Clock className="w-3 h-3" />
                    {art.readTime}
                  </span>
                )}
              </div>

              <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4 text-white">
                <span className="mb-1.5 flex items-center gap-1 text-[11px] text-white/80">
                  <Calendar className="w-3 h-3" />
                  {art.date}
                </span>
                <h3 className="text-sm sm:text-[15px] font-normal leading-snug line-clamp-2 text-white group-hover:text-[#008ae8] transition-colors">
                  {art.title}
                </h3>
                <p className="mt-1.5 text-[11px] leading-relaxed text-white/75 line-clamp-2">
                  {art.summary}
                </p>
                <span className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-medium text-white/90 group-hover:text-[#008ae8] group-hover:translate-x-1 transition-all">
                  Read Full Article <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
