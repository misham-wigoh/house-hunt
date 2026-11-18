import { Suspense } from "react";
import type { Metadata } from "next";
import { getListings } from "@/lib/cms/data";
import { PropertiesClient } from "./properties-client";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://househunt.com";

export const metadata: Metadata = {
  title: "Properties in India | Buy, Rent & Lease Flats, Villas, Plots & Commercial",
  description:
    "Browse 1,200,000+ verified properties for sale and rent across India. Search apartments, villas, commercial office spaces, and direct owner rentals with 100% verified documentation on House Hunt .com.",
  alternates: {
    canonical: `${siteUrl}/properties`,
  },
  openGraph: {
    title: "Properties in India | Buy, Rent & Lease Flats, Villas & Offices - House Hunt .com",
    description: "Browse 1,200,000+ verified properties across India on House Hunt .com.",
    url: `${siteUrl}/properties`,
    type: "website",
  },
};

export default async function PropertiesPage() {
  const listings = await getListings();

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
        name: "Properties",
        item: `${siteUrl}/properties`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      <Suspense fallback={<div className="p-12 text-center text-sm font-semibold">Loading Properties...</div>}>
        <PropertiesClient listings={listings} />
      </Suspense>
    </>
  );
}
