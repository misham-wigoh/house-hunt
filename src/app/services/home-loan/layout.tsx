import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://househunt.com";

export const metadata: Metadata = {
  title: "Compare Home Loan Interest Rates from 8.35% | Instant Bank Approval",
  description:
    "Compare and apply for lowest home loan interest rates from SBI, HDFC, ICICI, Axis Bank and Kotak. Instant digital sanction, zero hidden fees, and doorstep documentation with House Hunt .com.",
  alternates: {
    canonical: `${siteUrl}/services/home-loan`,
  },
  openGraph: {
    title: "Lowest Home Loan Rates from 8.35% | House Hunt .com",
    description: "Compare interest rates across top Indian banks and get instant loan approval.",
    url: `${siteUrl}/services/home-loan`,
    type: "website",
  },
};

export default function HomeLoanLayout({ children }: { children: React.ReactNode }) {
  return children;
}
