import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/sites/house-hunt/header";
import { Footer } from "@/components/sites/house-hunt/footer";
import {
  ShieldCheck,
  Scale,
  Lock,
  Mail,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions & Privacy Policy | House Hunt .com",
  description:
    "Read the terms of use, privacy commitments, user rights, and RERA disclaimer for House Hunt .com - India's Premier Real Estate Portal.",
};

const SECTIONS = [
  { id: "acceptance", label: "1. Acceptance of Terms" },
  { id: "intermediary", label: "2. Platform Role & Intermediary Disclaimer" },
  { id: "eligibility", label: "3. User Eligibility & Accounts" },
  { id: "listings", label: "4. Property Listings & Accuracy" },
  { id: "zero-brokerage", label: "5. Zero Brokerage & Direct Connecting" },
  { id: "privacy", label: "6. Privacy Policy & Data Usage" },
  { id: "prohibited", label: "7. Prohibited Conduct" },
  { id: "liability", label: "8. Limitation of Liability" },
  { id: "disputes", label: "9. Governing Law & Jurisdiction" },
  { id: "contact", label: "10. Contact & Support" },
];

export default function TermsPage() {
  return (
    <div className="min-h-dvh bg-[#fafafa] flex flex-col font-sans text-[#262626] selection:bg-[#008ae8] selection:text-white">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-[#aeaeaf]/40 py-3 px-4 sm:px-6 lg:px-8 2xl:px-12">
        <div className="max-w-[1920px] mx-auto flex items-center gap-2 text-xs text-[#757577]">
          <Link href="/" className="hover:text-[#008ae8] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#262626]">Terms &amp; Conditions</span>
        </div>
      </div>

      <main className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-8 sm:py-12 flex-1 w-full space-y-8">
        {/* Hero Header */}
        <div className="bg-white rounded-2xl border border-[#aeaeaf]/40 p-6 sm:p-10 shadow-xs">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#e0f2fe] text-[#008ae8] border border-[#008ae8]/30 mb-3">
              <Scale className="w-3.5 h-3.5" />
              Legal &amp; Compliance Documentation
            </span>
            <h1 className="text-2xl sm:text-4xl font-light tracking-tight text-[#262626]">
              Terms of Service &amp; <span className="font-serif italic text-[#008ae8]">Privacy Policy</span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-[#757577] leading-relaxed">
              Welcome to <strong>House Hunt .com</strong>. Please read these terms and conditions carefully before using our website, mobile application, and related property services. By accessing or using our platform, you agree to be bound by these legal terms.
            </p>
            <div className="mt-4 flex items-center gap-4 text-xs text-[#757577]">
              <span>Effective Date: November 2026</span>
              <span>•</span>
              <span>Version: 3.2</span>
              <span>•</span>
              <span className="text-[#008ae8] font-medium">100% RERA Compliant Network</span>
            </div>
          </div>
        </div>

        {/* Content Layout: Sticky Nav Sidebar + Main Terms Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Table of Contents */}
          <aside className="lg:col-span-4 sticky top-24">
            <div className="bg-white rounded-2xl border border-[#aeaeaf]/40 p-5 space-y-3 shadow-xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#757577] pb-2 border-b border-[#aeaeaf]/30">
                Table of Contents
              </h2>
              <nav className="space-y-1">
                {SECTIONS.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    className="block px-3 py-2 text-xs font-medium rounded-xl text-[#757577] hover:text-[#008ae8] hover:bg-[#e0f2fe] transition-colors"
                  >
                    {sec.label}
                  </a>
                ))}
              </nav>

              <div className="pt-4 border-t border-[#aeaeaf]/30 mt-4 space-y-2">
                <p className="text-[11px] text-[#757577]">Have legal questions or compliance inquiries?</p>
                <a
                  href="mailto:support@househunt.com"
                  className="flex items-center gap-1.5 text-xs font-medium text-[#008ae8] hover:underline"
                >
                  <Mail className="w-3.5 h-3.5" />
                  support@househunt.com
                </a>
              </div>
            </div>
          </aside>

          {/* Right Detailed Sections */}
          <div className="lg:col-span-8 space-y-6">
            {/* Section 1 */}
            <section id="acceptance" className="bg-white rounded-2xl border border-[#aeaeaf]/40 p-6 sm:p-8 scroll-mt-24 space-y-3">
              <h2 className="text-lg font-medium text-[#262626]">1. Acceptance of Terms</h2>
              <p className="text-sm text-[#757577] leading-relaxed">
                By browsing, registering, posting a property, or inquiring about real estate listings on House Hunt .com (referred to as &quot;the Platform&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;House Hunt&quot;), you acknowledge that you have read, understood, and agreed to be legally bound by these Terms and Conditions. If you do not agree to these terms, please discontinue using the platform immediately.
              </p>
            </section>

            {/* Section 2 */}
            <section id="intermediary" className="bg-white rounded-2xl border border-[#aeaeaf]/40 p-6 sm:p-8 scroll-mt-24 space-y-3">
              <div className="flex items-center gap-2 text-[#008ae8]">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <h2 className="text-lg font-medium text-[#262626]">2. Platform Role &amp; Intermediary Disclaimer</h2>
              </div>
              <p className="text-sm text-[#757577] leading-relaxed">
                House Hunt .com functions strictly as an electronic online marketplace and intermediary under Section 79 of the Information Technology Act, 2000. We provide a neutral platform for property owners, builders, certified dealers, and potential buyers or tenants to discover and interact with each other.
              </p>
              <div className="p-4 rounded-xl bg-[#fafafa] border border-[#aeaeaf]/40 text-xs text-[#757577] space-y-2">
                <p>
                  <strong>Non-Party Disclaimer:</strong> House Hunt .com is not a real estate broker, lender, developer, or financial adviser. We do not participate in, control, or take responsibility for negotiations, transactions, title disputes, construction delays, or monetary payments between sellers and buyers.
                </p>
                <p>
                  <strong>RERA Verification:</strong> While we verify state Real Estate Regulatory Authority (RERA) registration numbers where available, users are strongly advised to independently verify all property documents, approvals, title deeds, and developer clearances on the respective state government RERA portals before entering into any financial commitment.
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section id="eligibility" className="bg-white rounded-2xl border border-[#aeaeaf]/40 p-6 sm:p-8 scroll-mt-24 space-y-3">
              <h2 className="text-lg font-medium text-[#262626]">3. User Eligibility &amp; Account Security</h2>
              <p className="text-sm text-[#757577] leading-relaxed">
                You must be at least 18 years of age and competent to enter into a legally binding contract under the Indian Contract Act, 1872 to use this platform.
              </p>
              <ul className="list-disc list-inside text-sm text-[#757577] space-y-1.5 pl-2">
                <li>You agree to provide true, accurate, current, and complete information during registration and property submission.</li>
                <li>You are solely responsible for maintaining the confidentiality of any OTPs, account credentials, and passwords.</li>
                <li>You must immediately notify House Hunt .com of any unauthorized use or security breach of your account.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="listings" className="bg-white rounded-2xl border border-[#aeaeaf]/40 p-6 sm:p-8 scroll-mt-24 space-y-3">
              <h2 className="text-lg font-medium text-[#262626]">4. Property Listings &amp; Accuracy of Content</h2>
              <p className="text-sm text-[#757577] leading-relaxed">
                When you post a property listing on House Hunt .com:
              </p>
              <ul className="list-disc list-inside text-sm text-[#757577] space-y-1.5 pl-2">
                <li>You represent and warrant that you own the property or have explicit legal authorization from the lawful owner to list and advertise it.</li>
                <li>All photos, floor plans, pricing figures, furnishing details, and carpet area measurements must be authentic, truthful, and representative of the actual property.</li>
                <li>We reserve the right, without prior notice, to review, edit, unpublish, or delete any listing that violates our quality guidelines, contains inaccurate data, or is reported as misleading.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section id="zero-brokerage" className="bg-white rounded-2xl border border-[#aeaeaf]/40 p-6 sm:p-8 scroll-mt-24 space-y-3">
              <h2 className="text-lg font-medium text-[#262626]">5. Zero Brokerage &amp; Direct Connecting</h2>
              <p className="text-sm text-[#757577] leading-relaxed">
                Direct owner listings marked as &quot;Zero Brokerage&quot; connect verified owners with tenants or buyers directly without any commission fees payable to House Hunt .com. When interacting with certified third-party dealers or developers, any brokerage or advisory terms agreed between you and the respective dealer remain strictly between those parties.
              </p>
            </section>

            {/* Section 6 */}
            <section id="privacy" className="bg-white rounded-2xl border border-[#aeaeaf]/40 p-6 sm:p-8 scroll-mt-24 space-y-3">
              <div className="flex items-center gap-2 text-[#008ae8]">
                <Lock className="w-5 h-5 shrink-0" />
                <h2 className="text-lg font-medium text-[#262626]">6. Privacy Policy &amp; Data Protection</h2>
              </div>
              <p className="text-sm text-[#757577] leading-relaxed">
                We take your privacy seriously. This Privacy Policy details how House Hunt .com collects, stores, protects, and uses your personal information:
              </p>
              <div className="space-y-3 text-sm text-[#757577]">
                <div>
                  <h4 className="font-semibold text-[#262626]">Information We Collect:</h4>
                  <p className="mt-1">
                    Contact details (phone number, name, email), property specifications, location preferences, and technical browsing data (cookies, IP address, device type) to personalize your real estate search.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-[#262626]">How We Use Your Data:</h4>
                  <p className="mt-1">
                    To facilitate property callbacks, route inquiries to verified owners or builders you choose to contact, deliver price drop alerts, and prevent fraudulent postings.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-[#262626]">Anti-Spam Commitment:</h4>
                  <p className="mt-1">
                    We will never sell or rent your personal contact information to unauthorized marketing agencies. Your phone number is only shared with the specific seller, builder, or dealer for the property you enquire about.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 7 */}
            <section id="prohibited" className="bg-white rounded-2xl border border-[#aeaeaf]/40 p-6 sm:p-8 scroll-mt-24 space-y-3">
              <h2 className="text-lg font-medium text-[#262626]">7. Prohibited Conduct</h2>
              <p className="text-sm text-[#757577] leading-relaxed">
                Users are strictly prohibited from engaging in the following actions:
              </p>
              <ul className="list-disc list-inside text-sm text-[#757577] space-y-1.5 pl-2">
                <li>Scraping, crawling, or extracting listing data using automated bots without written consent.</li>
                <li>Posting fake, duplicate, expired, or fraudulent property listings.</li>
                <li>Harassing, spamming, or sending unsolicited commercial offers to other users.</li>
                <li>Attempting to compromise the security, integrity, or server infrastructure of House Hunt .com.</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section id="liability" className="bg-white rounded-2xl border border-[#aeaeaf]/40 p-6 sm:p-8 scroll-mt-24 space-y-3">
              <h2 className="text-lg font-medium text-[#262626]">8. Limitation of Liability</h2>
              <p className="text-sm text-[#757577] leading-relaxed">
                To the maximum extent permitted under applicable law, House Hunt .com, its parent company, directors, employees, and agents shall not be liable for any indirect, incidental, punitive, or consequential damages arising out of property transactions, server downtimes, listing inaccuracies, or disputes between buyers and sellers.
              </p>
            </section>

            {/* Section 9 */}
            <section id="disputes" className="bg-white rounded-2xl border border-[#aeaeaf]/40 p-6 sm:p-8 scroll-mt-24 space-y-3">
              <h2 className="text-lg font-medium text-[#262626]">9. Governing Law &amp; Jurisdiction</h2>
              <p className="text-sm text-[#757577] leading-relaxed">
                These Terms and Conditions and Privacy Policy shall be governed by and construed in accordance with the laws of India. Any legal dispute, controversy, or claim arising out of your use of the platform shall be subject to the exclusive jurisdiction of the competent courts in New Delhi, India.
              </p>
            </section>

            {/* Section 10 */}
            <section id="contact" className="bg-white rounded-2xl border border-[#aeaeaf]/40 p-6 sm:p-8 scroll-mt-24 space-y-4">
              <h2 className="text-lg font-medium text-[#262626]">10. Contact Us &amp; Grievance Redressal</h2>
              <p className="text-sm text-[#757577] leading-relaxed">
                If you have questions regarding these terms, need help with a listing, or wish to report a compliance concern, our support team is available Monday through Saturday (9:30 AM to 6:30 PM IST):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#fafafa] border border-[#aeaeaf]/30 space-y-1">
                  <span className="text-xs font-semibold text-[#008ae8]">Customer Support</span>
                  <p className="text-xs text-[#757577]">Email: support@househunt.com</p>
                  <p className="text-xs text-[#757577]">Toll-Free: 1800-41-99099</p>
                </div>
                <div className="p-4 rounded-xl bg-[#fafafa] border border-[#aeaeaf]/30 space-y-1">
                  <span className="text-xs font-semibold text-[#008ae8]">Corporate Address</span>
                  <p className="text-xs text-[#757577]">House Hunt .com Portal Operations</p>
                  <p className="text-xs text-[#757577]">B-8, Sector 132, Noida, UP 201304</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
