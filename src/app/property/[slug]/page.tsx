import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getInsights, getListingBySlug, getListingSlugs, getListings } from "@/lib/cms/data";
import { buildPriceInsights } from "@/lib/cms/insights";
import { PropertyDetail } from "./property-detail";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://househunt.com";

export async function generateStaticParams() {
  const slugs = await getListingSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await getListingBySlug(slug);
  if (!property) return { title: "Property Not Found" };

  const title = `${property.title} in ${[property.locality, property.city].filter(Boolean).join(", ")}`;
  const description =
    property.overview[0] ||
    `${property.bhk ? `${property.bhk} BHK ` : ""}${property.type} for ${
      property.listingType === "rent" ? "rent" : "sale"
    } in ${property.location || property.city}. Price: ${property.price}. Verified listing with direct owner contacts on House Hunt .com.`;
  const url = `${siteUrl}/property/${slug}`;
  const images = property.images && property.images.length > 0 ? property.images : property.image ? [property.image] : [];

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: "House Hunt .com",
      images: images.length > 0 ? images.map((u) => ({ url: u, alt: property.title })) : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.length > 0 ? [images[0]] : undefined,
    },
  };
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [property, all, articles] = await Promise.all([getListingBySlug(slug), getListings(), getInsights(3)]);
  if (!property) notFound();

  const insights = buildPriceInsights(property, all);
  const dealerListed = property.dealer ? all.filter((l) => l.dealerName === property.dealer?.name).length : 0;
  const propertyUrl = `${siteUrl}/property/${slug}`;

  // Structured Data (JSON-LD) for Real Estate Listing & Breadcrumbs
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
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
          {
            "@type": "ListItem",
            position: 3,
            name: property.city || "All Cities",
            item: `${siteUrl}/properties?city=${encodeURIComponent(property.city)}`,
          },
          {
            "@type": "ListItem",
            position: 4,
            name: property.title,
            item: propertyUrl,
          },
        ],
      },
      {
        "@type": property.listingType === "rent" ? "RealEstateListing" : "SingleFamilyResidence",
        "@id": `${propertyUrl}#listing`,
        name: property.title,
        description: property.overview.join(" ") || property.title,
        url: propertyUrl,
        image: property.images.length > 0 ? property.images : property.image ? [property.image] : undefined,
        address: {
          "@type": "PostalAddress",
          streetAddress: property.society || property.location,
          addressLocality: property.locality || property.location,
          addressRegion: property.city,
          addressCountry: "IN",
        },
        numberOfRooms: property.bhk || undefined,
        numberOfBedrooms: property.bhk || undefined,
        floorSize: property.area
          ? {
              "@type": "QuantitativeValue",
              value: property.area,
            }
          : undefined,
        offers: {
          "@type": "Offer",
          price: property.priceNum ? property.priceNum * 100000 : undefined,
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            priceCurrency: "INR",
            unitText: property.price,
          },
          businessFunction:
            property.listingType === "rent"
              ? "http://purl.org/goodrelations/v1#LeaseOut"
              : "http://purl.org/goodrelations/v1#Sell",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PropertyDetail property={property} insights={insights} dealerListed={dealerListed} articles={articles} />
    </>
  );
}
