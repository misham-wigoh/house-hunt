import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getCities } from "@/lib/cms/data";
import { CmsProvider } from "@/components/sites/house-hunt/cms-context";
import { AuthProvider } from "@/components/auth/auth-context";
import { LocationProvider } from "@/components/location/location-context";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://househunt.com";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#008ae8",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "House Hunt .com | Buy, Rent & Sell Real Estate Properties in India",
    template: "%s | House Hunt .com",
  },
  description:
    "House Hunt .com - India's Premier Property Portal. Search 1,200,000+ verified real estate properties for sale and rent across Delhi NCR, Mumbai, Bangalore, Pune, Hyderabad, Chennai, and major Indian cities. Direct owner flats, luxury villas, commercial spaces, and RERA-approved builder projects.",
  keywords: [
    "real estate India",
    "buy flat in India",
    "properties for rent",
    "commercial office space",
    "flats in Bangalore",
    "apartments in Mumbai",
    "houses for rent in Gurgaon",
    "villas in Hyderabad",
    "new builder projects",
    "RERA verified properties",
    "zero brokerage rentals",
    "House Hunt",
    "House Hunt .com",
  ],
  authors: [{ name: "House Hunt" }],
  creator: "House Hunt",
  publisher: "House Hunt .com",
  formatDetection: {
    telephone: true,
    date: false,
    address: true,
    email: true,
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "House Hunt .com",
    title: "House Hunt .com | Buy, Rent & Sell Real Estate Properties in India",
    description:
      "Explore 1,200,000+ verified properties, direct owner flats, luxury condos, and Grade-A commercial spaces with 100% RERA verification on House Hunt .com.",
  },
  twitter: {
    card: "summary_large_image",
    title: "House Hunt .com | Buy, Rent & Sell Real Estate Properties in India",
    description:
      "Explore verified properties, direct owner flats, and commercial spaces across India on House Hunt .com.",
    creator: "@househunt",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cities = await getCities();

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "House Hunt .com",
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/logo.png`,
          caption: "House Hunt .com",
        },
        contactPoint: [
          {
            "@type": "ContactPoint",
            telephone: "1800-41-99099",
            contactType: "customer service",
            areaServed: "IN",
            availableLanguage: ["English", "Hindi"],
          },
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "House Hunt .com",
        description: "India's Premier Real Estate Property Portal",
        publisher: {
          "@id": `${siteUrl}/#organization`,
        },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteUrl}/properties?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <html lang="en" className="h-full antialiased">
      <head>
        {/* Performance Preconnect & DNS-Prefetch */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://antiquewhite-turtle-463103.hostingersite.com" />
        <link rel="dns-prefetch" href="https://antiquewhite-turtle-463103.hostingersite.com" />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-white text-[#262626]">
        {/* Global Structured Data (JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <CmsProvider cities={cities}>
          <LocationProvider>
            <AuthProvider>{children}</AuthProvider>
          </LocationProvider>
        </CmsProvider>
      </body>
    </html>
  );
}
