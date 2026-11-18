import Link from "next/link";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { CmsImage } from "./cms-image";
import type { InsightItem } from "@/lib/cms/types";

/** Standard article card: photo on top, meta, title, summary. */
export function BlogCard({ post }: { post: InsightItem }) {
  return (
    <Link
      href={`/blog/${post.id}`}
      data-ui="blog-card"
      className="group flex flex-col overflow-hidden rounded-2xl border border-[#aeaeaf]/40 bg-white hover:border-[#008ae8] transition-colors"
    >
      <div className="relative aspect-16/10 overflow-hidden bg-[#fafafa]">
        <CmsImage
          src={post.image}
          alt={post.title}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {post.category && (
          <span className="absolute top-3 left-3 rounded-[4px] border border-white/20 bg-[#1c1c1e]/60 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-md">
            {post.category}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center gap-3 text-xs text-[#757577]">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {post.date}
          </span>
          {post.readTime && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.readTime}
            </span>
          )}
        </div>
        <h3 className="text-base font-normal leading-snug text-[#262626] transition-colors group-hover:text-[#008ae8] line-clamp-2">
          {post.title}
        </h3>
        <p className="mt-2 text-xs leading-relaxed text-[#757577] line-clamp-3">{post.summary}</p>
        <span className="mt-auto inline-flex items-center gap-1 pt-4 text-xs font-medium text-[#008ae8] group-hover:translate-x-1 transition-transform">
          Read article <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
