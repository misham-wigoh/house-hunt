"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { BlogCard } from "./blog-card";
import { CmsImage } from "./cms-image";
import type { InsightItem } from "@/lib/cms/types";

export function BlogIndex({ posts }: { posts: InsightItem[] }) {
  const [active, setActive] = useState("all");

  const categories = useMemo(() => {
    const map = new Map<string, { name: string; count: number }>();
    for (const p of posts) {
      if (!p.categorySlug) continue;
      const row = map.get(p.categorySlug) ?? { name: p.category, count: 0 };
      row.count += 1;
      map.set(p.categorySlug, row);
    }
    return [...map.entries()].map(([slug, v]) => ({ slug, ...v }));
  }, [posts]);

  const visible = active === "all" ? posts : posts.filter((p) => p.categorySlug === active);
  const [featured, ...rest] = visible;

  return (
    <div>
      <div className="mb-8 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar" role="tablist" aria-label="Article categories">
        {[{ slug: "all", name: "All articles", count: posts.length }, ...categories].map((c) => (
          <button
            key={c.slug}
            type="button"
            role="tab"
            aria-selected={active === c.slug}
            onClick={() => setActive(c.slug)}
            className={`whitespace-nowrap rounded-[4px] border px-3 py-1.5 text-xs font-medium transition-colors ${
              active === c.slug
                ? "border-[#008ae8] bg-[#008ae8] text-white"
                : "border-[#aeaeaf]/40 bg-white text-[#262626] hover:bg-[#e0f2fe]"
            }`}
          >
            {c.name} <span className={active === c.slug ? "text-white/80" : "text-[#757577]"}>({c.count})</span>
          </button>
        ))}
      </div>

      {!featured ? (
        <p className="rounded-2xl border border-[#aeaeaf]/40 bg-white p-10 text-center text-sm text-[#757577]">
          No articles in this category yet.
        </p>
      ) : (
        <>
          <Link
            href={`/blog/${featured.id}`}
            data-ui="blog-featured"
            className="group grid grid-cols-1 overflow-hidden rounded-2xl border border-[#aeaeaf]/40 bg-white hover:border-[#008ae8] transition-colors lg:grid-cols-2"
          >
            <div className="relative aspect-16/10 overflow-hidden bg-[#fafafa] lg:aspect-auto lg:min-h-[320px]">
              <CmsImage
                src={featured.image}
                alt={featured.title}
                sizes="(min-width: 1024px) 50vw, 100vw"
                priority
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-10">
              {featured.category && (
                <span className="mb-3 inline-block self-start rounded-[4px] bg-[#e0f2fe] px-2.5 py-1 text-[11px] font-medium text-[#008ae8]">
                  {featured.category}
                </span>
              )}
              <h2 className="text-2xl font-light leading-snug text-[#262626] transition-colors group-hover:text-[#008ae8] sm:text-3xl">
                {featured.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#757577]">{featured.summary}</p>
              <div className="mt-5 flex items-center gap-4 text-xs text-[#757577]">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {featured.date}
                </span>
                {featured.readTime && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {featured.readTime}
                  </span>
                )}
              </div>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-[#008ae8]">
                Read article <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </Link>

          {rest.length > 0 && (
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
