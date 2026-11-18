import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://househunt.com";

export const metadata: Metadata = {
  title: "Property Valuation Calculator | Real-Time Market Price Estimates",
  description:
    "Calculate fair market value and rental yield for any residential or commercial property in India. Algorithm backed by 1M+ live market transactions and registry circle rates on House Hunt .com.",
  alternates: {
    canonical: `${siteUrl}/services/property-valuation`,
  },
  openGraph: {
    title: "Instant Property Valuation Calculator | House Hunt .com",
    description: "Check accurate market rates, circle rates, and property valuation in seconds.",
    url: `${siteUrl}/services/property-valuation`,
    type: "website",
  },
};

export default function PropertyValuationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
