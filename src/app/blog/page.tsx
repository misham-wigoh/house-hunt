import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/sites/house-hunt/header";
import { Footer } from "@/components/sites/house-hunt/footer";
import { BlogIndex } from "@/components/sites/house-hunt/blog-index";
import { getAllInsights } from "@/lib/cms/data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://househunt.com";

export const metadata: Metadata = {
  title: "Real Estate News, RERA Guides & Market Insights",
  description:
    "Expert buying guides, RERA and legal explainers, rental and investment analysis, and locality market reports from the House Hunt editorial team.",
  alternates: {
    canonical: `${siteUrl}/blog`,
  },
  openGraph: {
    title: "Real Estate News, RERA Guides & Market Insights | House Hunt .com",
    description: "Buying guides, legal explainers, and real estate market trends from House Hunt .com.",
    url: `${siteUrl}/blog`,
    type: "website",
  },
};

export default async function BlogPage() {
  const posts = await getAllInsights();

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
    ],
  };

  return (
    <div className="min-h-dvh bg-[#fafafa] flex flex-col font-sans text-[#262626] selection:bg-[#008ae8] selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      <Header />

      <div className="bg-white border-b border-[#aeaeaf]/40 py-3 px-4 sm:px-6 lg:px-8 2xl:px-12">
        <div className="max-w-[1920px] mx-auto flex items-center gap-2 text-xs text-[#757577]">
          <Link href="/" className="hover:text-[#008ae8] transition-colors">Home</Link>
          <span>/</span>
          <span className="font-medium text-[#262626]">Blog</span>
        </div>
      </div>

      <main className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-10 flex-1 w-full">
        <header className="mb-8 max-w-2xl">
          <span className="text-xs font-semibold text-[#008ae8]">Intelligence &amp; Advisories</span>
          <h1 className="mt-1 text-3xl sm:text-4xl font-light tracking-normal">
            Real Estate News &amp; Market <span className="font-serif italic font-normal text-[#008ae8]">Insights</span>
          </h1>
          <p className="mt-2 text-sm text-[#757577]">
            Buying guides, legal explainers, rental and investment analysis, and market reports to help you decide with confidence.
          </p>
        </header>

        <BlogIndex posts={posts} />
      </main>

      <Footer />
    </div>
  );
}
