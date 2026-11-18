import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://househunt.com";

export const metadata: Metadata = {
  title: "Post Property for Free | Sell or Rent House, Flat & Commercial Online",
  description:
    "Post your residential property, apartment, villa, commercial office, or rental flat for free on House Hunt .com. Reach 15M+ active buyers and tenants directly with zero brokerage.",
  alternates: {
    canonical: `${siteUrl}/post-property`,
  },
  openGraph: {
    title: "Post Property for Free | Sell or Rent Online - House Hunt .com",
    description: "List your property for free and reach millions of verified buyers and tenants directly.",
    url: `${siteUrl}/post-property`,
    type: "website",
  },
};

export default function PostPropertyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
