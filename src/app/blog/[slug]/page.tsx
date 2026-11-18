import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Calendar, Clock, User } from "lucide-react";
import { Header } from "@/components/sites/house-hunt/header";
import { Footer } from "@/components/sites/house-hunt/footer";
import { BlogCard } from "@/components/sites/house-hunt/blog-card";
import { CmsImage } from "@/components/sites/house-hunt/cms-image";
import { getAllInsights, getInsightBySlug } from "@/lib/cms/data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://househunt.com";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getAllInsights();
  return posts.map((p) => ({ slug: p.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getInsightBySlug(slug);
  if (!post) return { title: "Article Not Found" };

  const canonicalUrl = `${siteUrl}/blog/${slug}`;

  return {
    title: `${post.title} | Market Insights`,
    description: post.summary,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: post.title,
      description: post.summary,
      url: canonicalUrl,
      type: "article",
      publishedTime: post.dateIso,
      images: post.image ? [{ url: post.image, alt: post.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary,
      images: post.image ? [post.image] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const [post, all] = await Promise.all([getInsightBySlug(slug), getAllInsights()]);
  if (!post) notFound();

  // Same-category articles first, then the newest others.
  const others = all.filter((p) => p.id !== post.id);
  const related = [
    ...others.filter((p) => p.categorySlug && p.categorySlug === post.categorySlug),
    ...others.filter((p) => !p.categorySlug || p.categorySlug !== post.categorySlug),
  ].slice(0, 3);

  const postUrl = `${siteUrl}/blog/${slug}`;

  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Market Insights",
        item: `${siteUrl}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: postUrl,
      },
    ],
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary,
    datePublished: post.dateIso,
    dateModified: post.dateIso,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    image: post.image ?? undefined,
    author: {
      "@type": "Organization",
      name: post.source || "House Hunt Editorial Team",
    },
    publisher: {
      "@type": "Organization",
      name: "House Hunt .com",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
      },
    },
  };

  return (
    <div className="min-h-dvh bg-white flex flex-col font-sans text-[#262626] selection:bg-[#008ae8] selection:text-white">
      <Header />

      <div className="bg-[#fafafa] border-b border-[#aeaeaf]/40 py-3 px-4 sm:px-6 lg:px-8 2xl:px-12">
        <div className="max-w-[1920px] mx-auto flex items-center gap-2 text-xs text-[#757577] min-w-0">
          <Link href="/" className="hover:text-[#008ae8] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-[#008ae8] transition-colors">Blog</Link>
          <span>/</span>
          <span className="font-medium text-[#262626] truncate">{post.title}</span>
        </div>
      </div>

      <main className="flex-1">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

          <header>
            {post.category && (
              <span className="inline-block rounded-[4px] bg-[#e0f2fe] px-2.5 py-1 text-[11px] font-medium text-[#008ae8]">
                {post.category}
              </span>
            )}
            <h1 className="mt-3 text-3xl sm:text-4xl font-light leading-tight tracking-normal">{post.title}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#757577]">
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {post.source}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <time dateTime={post.dateIso}>{post.date}</time>
              </span>
              {post.readTime && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {post.readTime}
                </span>
              )}
            </div>
          </header>

          <div className="relative mt-8 aspect-16/9 overflow-hidden rounded-2xl bg-[#fafafa]">
            <CmsImage src={post.image} alt={post.title} priority sizes="(min-width: 768px) 768px, 100vw" className="object-cover" />
          </div>

          <div className="blog-content mt-10" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />

          <div className="mt-12 flex flex-col gap-4 rounded-2xl border border-[#aeaeaf]/40 bg-[#fafafa] p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-medium">Ready to look at homes?</h2>
              <p className="mt-1 text-xs text-[#757577]">Browse verified listings across India.</p>
            </div>
            <Link
              href="/properties"
              className="inline-flex items-center justify-center gap-1.5 rounded-[4px] border border-[#008ae8] bg-[#008ae8] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0077c8] transition-colors"
            >
              Browse properties <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </article>

        {related.length > 0 && (
          <section className="bg-[#fafafa] border-t border-[#aeaeaf]/40 py-12">
            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
              <div className="mb-6 flex items-end justify-between gap-4">
                <h2 className="text-xl sm:text-2xl font-light">
                  Keep <span className="font-serif italic font-normal text-[#008ae8]">reading</span>
                </h2>
                <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#008ae8] hover:text-[#0077c8]">
                  All articles <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {related.map((p) => (
                  <BlogCard key={p.id} post={p} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
