import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/sites/house-hunt/header";
import { Footer } from "@/components/sites/house-hunt/footer";
import {
  Percent,
  ShieldCheck,
  FileCheck2,
  Calculator,
  ArrowRight,
  Sparkles,
  PhoneCall,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Property Services & Financial Ecosystem | House Hunt .com",
  description:
    "Explore our complete property ecosystem: Home loans from 8.35%, 30+ title legal checks, online doorstep rent agreements, and instant algorithmic property valuation.",
};

const SERVICES = [
  {
    id: "home-loan",
    slug: "/services/home-loan",
    icon: Percent,
    title: "Home Loans from 8.35%*",
    subtitle: "Lowest Interest Rates & Instant Pre-Approvals",
    desc: "Partnered with SBI, HDFC Bank, ICICI Bank, and Axis Bank. Minimal documentation, doorstep document pickup, and zero processing fee assistance for verified properties.",
    badge: "Lowest Rate Guarantee",
    stats: "Pre-approved in 48 Hours",
    bullets: [
      "Compare 15+ top lending banks in India",
      "Flexible tenures up to 30 years",
      "Loan amounts up to 90% of property cost",
      "Dedicated loan relationship manager",
    ],
  },
  {
    id: "legal-verification",
    slug: "/services/legal-verification",
    icon: ShieldCheck,
    title: "Property Legal Title Verification",
    subtitle: "30+ Rigorous Title & RERA Checks",
    desc: "Comprehensive encumbrance search, mutation certificate verification, municipal plan sanction checks, and dispute search conducted by experienced high-court property lawyers.",
    badge: "100% Secure Purchase",
    stats: "Detailed 15-Page Report",
    bullets: [
      "30-year chain deed verification",
      "RERA litigation & consumer court search",
      "Local municipal master-plan compliance",
      "Encumbrance certificate (EC) validation",
    ],
  },
  {
    id: "rent-agreement",
    slug: "/services/rent-agreement",
    icon: FileCheck2,
    title: "Online E-Stamped Rent Agreement",
    subtitle: "Legally Compliant with Biometric Signing",
    desc: "Draft, customize, and execute a legally binding rental agreement without visiting sub-registrar offices. Includes government e-stamping and doorstep biometric identity confirmation.",
    badge: "Govt. Approved E-Stamp",
    stats: "Delivered in 24-48 Hours",
    bullets: [
      "Valid in all major Indian states",
      "Doorstep biometric verification",
      "Digital draft review on WhatsApp",
      "Legally admissible in court of law",
    ],
  },
  {
    id: "property-valuation",
    slug: "/services/property-valuation",
    icon: Calculator,
    title: "Instant Property Valuation Report",
    subtitle: "Registry-Backed Market Estimation",
    desc: "Get an accurate price-per-square-foot valuation based on actual registered circle rates and sale deed transactions in your exact society and micro-market.",
    badge: "AI & Registry Backed",
    stats: "Instant 60-Second Estimate",
    bullets: [
      "Real circle rate vs market rate delta",
      "3-year locality capital appreciation",
      "Rental yield and ROI projection",
      "Negotiation power guide for buyers",
    ],
  },
];

export default function ServicesPage() {
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
          <span className="font-semibold text-[#262626]">Property Services</span>
        </div>
      </div>

      <main className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-8 sm:py-12 flex-1 w-full space-y-12">
        {/* Hero Section */}
        <div className="bg-white rounded-3xl border border-[#aeaeaf]/40 p-6 sm:p-12 shadow-xs">
          <div className="max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#e0f2fe] text-[#008ae8] border border-[#008ae8]/30">
              <Sparkles className="w-3.5 h-3.5" />
              Complete Real Estate Ecosystem
            </span>
            <h1 className="text-3xl sm:text-5xl font-light tracking-tight text-[#262626] leading-tight">
              Property Services Built for <span className="font-serif italic font-normal text-[#008ae8]">Peace of Mind</span>
            </h1>
            <p className="text-base sm:text-lg text-[#757577] font-normal leading-relaxed">
              Buying, renting, or selling real estate involves legal checks, financing, and official registrations. House Hunt .com provides verified, end-to-end assistance backed by certified lawyers, lending banks, and property advisors.
            </p>
          </div>
        </div>

        {/* 4 Main Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {SERVICES.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.id}
                className="bg-white rounded-3xl border border-[#aeaeaf]/40 p-6 sm:p-8 flex flex-col justify-between hover:border-[#008ae8] transition-all shadow-xs group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#e0f2fe] text-[#008ae8] border border-[#008ae8]/30 flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#fafafa] text-[#008ae8] border border-[#aeaeaf]/40">
                      {s.badge}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-xl sm:text-2xl font-light text-[#262626] group-hover:text-[#008ae8] transition-colors">
                      {s.title}
                    </h2>
                    <p className="text-xs font-semibold text-[#008ae8] mt-0.5">
                      {s.subtitle}
                    </p>
                    <p className="text-sm text-[#757577] mt-2 leading-relaxed">
                      {s.desc}
                    </p>
                  </div>

                  <ul className="space-y-2 pt-2 border-t border-[#aeaeaf]/30 text-xs text-[#262626]">
                    {s.bullets.map((b, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#008ae8] shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 mt-6 border-t border-[#aeaeaf]/30 flex items-center justify-between gap-4">
                  <span className="text-xs font-semibold text-[#757577]">
                    {s.stats}
                  </span>
                  <Link
                    href={s.slug}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-[#008ae8] hover:bg-[#0077c8] text-white border border-[#008ae8] transition-colors shadow-xs"
                  >
                    <span>View Service</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Support Helpline Bar */}
        <div className="bg-[#262626] text-white rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/10">
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-light">
              Need personalized guidance on real estate paperwork?
            </h3>
            <p className="text-xs sm:text-sm text-[#aeaeaf]">
              Speak directly with our senior property advisors. No pushy sales calls, 100% impartial guidance.
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <a
              href="tel:18004199099"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-white text-[#262626] hover:bg-[#e0f2fe] transition-colors"
            >
              <PhoneCall className="w-4 h-4 text-[#008ae8]" />
              <span>1800-41-99099</span>
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
