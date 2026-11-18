import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/sites/house-hunt/header";
import { Footer } from "@/components/sites/house-hunt/footer";
import {
  ShieldCheck,
  Sparkles,
  Award,
  TrendingUp,
  ArrowRight,
  MapPin,
  HeartHandshake,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | House Hunt .com - India's Premier Real Estate Portal",
  description:
    "Learn about House Hunt .com's mission to transform Indian real estate through verified listings, zero-brokerage direct connections, and transparent property intelligence.",
};

const STATS = [
  { value: "1.2M+", label: "Verified Properties", sub: "Pan-India Residential & Commercial" },
  { value: "40+", label: "Cities Covered", sub: "Tier-1 Metros & High-Growth Corridors" },
  { value: "15M+", label: "Monthly Buyers", sub: "Active searches across India" },
  { value: "100%", label: "RERA Compliant", sub: "Independently verified registration" },
];

const PILLARS = [
  {
    icon: ShieldCheck,
    title: "100% Verified Inventory",
    desc: "Every listing on House Hunt undergoes multi-stage phone verification, location confirmation, and RERA registration checks to protect you from phantom or duplicate ads.",
  },
  {
    icon: HeartHandshake,
    title: "Zero Brokerage Movement",
    desc: "We empower owners and buyers to connect directly on WhatsApp and phone calls without middleman commissions, saving families lakhs in transaction costs.",
  },
  {
    icon: TrendingUp,
    title: "Live Market Intelligence",
    desc: "We analyze actual registry transactions to provide transparent price per sq.ft data, 3-year capital appreciation heatmaps, and locality growth reports.",
  },
  {
    icon: Sparkles,
    title: "Complete Property Ecosystem",
    desc: "From competitive home loans starting @ 8.35% p.a. to 30+ title legal verifications and doorstep biometric rent agreements, we support your entire journey.",
  },
];

const METROS = [
  { city: "Delhi / NCR", highlight: "Gurgaon, Noida, Greater Noida, Faridabad" },
  { city: "Mumbai", highlight: "South Mumbai, Western Suburbs, Navi Mumbai, Thane" },
  { city: "Bangalore", highlight: "Whitefield, Sarjapur, Electronic City, Bellandur" },
  { city: "Hyderabad", highlight: "Gachibowli, Hitec City, Kondapur, Tellapur" },
  { city: "Pune", highlight: "Hinjawadi, Wakad, Baner, Kharadi, Magarpatta" },
  { city: "Chennai", highlight: "OMR, ECR, Anna Nagar, Velachery, Perungudi" },
  { city: "Ahmedabad", highlight: "SG Highway, Bopal, Prahlad Nagar, Shela" },
  { city: "Lucknow", highlight: "Gomti Nagar, Amar Shaheed Path, Sushant Golf City" },
];

export default function AboutPage() {
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
          <span className="font-semibold text-[#262626]">About Us</span>
        </div>
      </div>

      <main className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-8 sm:py-12 flex-1 w-full space-y-12">
        {/* Hero Section */}
        <div className="bg-white rounded-3xl border border-[#aeaeaf]/40 p-6 sm:p-12 shadow-xs">
          <div className="max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#e0f2fe] text-[#008ae8] border border-[#008ae8]/30">
              <Award className="w-3.5 h-3.5" />
              About House Hunt .com
            </span>
            <h1 className="text-3xl sm:text-5xl font-light tracking-tight text-[#262626] leading-tight">
              Transforming the way India <span className="font-serif italic font-normal text-[#008ae8]">finds home</span>.
            </h1>
            <p className="text-base sm:text-lg text-[#757577] font-normal leading-relaxed">
              House Hunt .com was established with a clear mission: to bring absolute transparency, zero-brokerage freedom, and verifiable trust to Indian real estate. We replace opaque pricing and endless cold calls with verified property data, verified owners, and institutional-grade legal checks.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                href="/properties"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-[#008ae8] hover:bg-[#0077c8] text-white border border-[#008ae8] transition-colors shadow-xs"
              >
                <span>Explore Properties</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/post-property"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-[#fafafa] hover:bg-[#e0f2fe] text-[#262626] border border-[#aeaeaf]/40 hover:border-[#008ae8] transition-colors"
              >
                <span>Post Free Property Ad</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Key Metrics Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {STATS.map((s, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-[#aeaeaf]/40 p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:border-[#008ae8] transition-colors"
            >
              <div>
                <span className="text-3xl sm:text-4xl font-light text-[#008ae8] block">
                  {s.value}
                </span>
                <span className="text-sm sm:text-base font-medium text-[#262626] block mt-1">
                  {s.label}
                </span>
              </div>
              <span className="text-xs text-[#757577] mt-3 block">
                {s.sub}
              </span>
            </div>
          ))}
        </div>

        {/* Our Core Values / Pillars */}
        <div className="space-y-6">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold text-[#008ae8] uppercase tracking-wider block mb-1">
              Why We Are Different
            </span>
            <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-[#262626]">
              Built on Trust, Verified with <span className="font-serif italic font-normal text-[#008ae8]">Precision</span>
            </h2>
            <p className="text-sm text-[#757577] mt-1.5">
              We design every feature around one principle: putting property buyers, tenants, and verified owners in direct control.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PILLARS.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-[#aeaeaf]/40 p-6 sm:p-8 flex flex-col justify-between hover:border-[#008ae8] transition-colors shadow-xs group"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-[#e0f2fe] text-[#008ae8] border border-[#008ae8]/30 flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-medium text-[#262626] group-hover:text-[#008ae8] transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-sm text-[#757577] leading-relaxed">
                      {p.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pan-India Presence */}
        <div className="bg-white rounded-3xl border border-[#aeaeaf]/40 p-6 sm:p-10 shadow-xs space-y-6">
          <div>
            <span className="text-xs font-semibold text-[#008ae8] uppercase tracking-wider block mb-1">
              Pan-India Footprint
            </span>
            <h2 className="text-2xl sm:text-3xl font-light text-[#262626]">
              Deep Local Presence in Top <span className="font-serif italic font-normal text-[#008ae8]">Metros</span>
            </h2>
            <p className="text-sm text-[#757577] mt-1">
              Active boots-on-the-ground presence, verified registry price data, and local builder relationships across all key markets.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {METROS.map((m, idx) => (
              <Link
                key={idx}
                href={`/properties?city=${encodeURIComponent(m.city.split("/")[0].trim())}`}
                className="p-4 rounded-2xl bg-[#fafafa] border border-[#aeaeaf]/30 hover:bg-[#e0f2fe] hover:border-[#008ae8] transition-colors group block"
              >
                <div className="flex items-center gap-1.5 text-sm font-semibold text-[#262626] group-hover:text-[#008ae8] transition-colors">
                  <MapPin className="w-4 h-4 text-[#008ae8] shrink-0" />
                  <span>{m.city}</span>
                </div>
                <p className="text-xs text-[#757577] mt-1 truncate">
                  {m.highlight}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="bg-[#262626] text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/10">
          <div className="max-w-xl space-y-2">
            <h3 className="text-2xl sm:text-3xl font-light">
              Are you an Owner, Builder, or Broker?
            </h3>
            <p className="text-sm text-[#aeaeaf]">
              Join over 1,000,000+ verified sellers who list their properties on House Hunt .com for zero brokerage and connect with 15M+ active buyers monthly.
            </p>
          </div>
          <Link
            href="/post-property"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium bg-[#008ae8] hover:bg-[#0077c8] text-white border border-[#008ae8] transition-colors shadow-xs shrink-0 self-start md:self-auto"
          >
            <Sparkles className="w-4 h-4" />
            <span>Post Free Property Ad</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
