import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://househunt.com";

export const metadata: Metadata = {
  title: "Online Rent Agreement & Doorstep Biometric E-Registration",
  description:
    "Draft legally compliant rental agreements online with government e-stamping and doorstep Aadhaar biometric verification. 100% paperless, rapid delivery across India on House Hunt .com.",
  alternates: {
    canonical: `${siteUrl}/services/rent-agreement`,
  },
  openGraph: {
    title: "Online Rent Agreement with Doorstep Biometrics | House Hunt .com",
    description: "Get government-stamped rental agreements drafted online and signed at your doorstep.",
    url: `${siteUrl}/services/rent-agreement`,
    type: "website",
  },
};

export default function RentAgreementLayout({ children }: { children: React.ReactNode }) {
  return children;
}
