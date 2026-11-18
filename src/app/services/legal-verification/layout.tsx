import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://househunt.com";

export const metadata: Metadata = {
  title: "Property Legal Verification & Title Search | 30+ Deed Checks",
  description:
    "Protect your real estate investment with lawyer-verified 30-year chain title deed search, encumbrance certificates (EC), RERA court dispute check, and municipal sanction audit on House Hunt .com.",
  alternates: {
    canonical: `${siteUrl}/services/legal-verification`,
  },
  openGraph: {
    title: "Property Legal Verification & Title Search | House Hunt .com",
    description: "Get comprehensive 30+ legal checkpoints verified by senior high court property lawyers.",
    url: `${siteUrl}/services/legal-verification`,
    type: "website",
  },
};

export default function LegalVerificationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
