import React from "react";
import Link from "next/link";
import { HouseHuntLogo } from "./icons";
import { Phone, Mail, ShieldCheck } from "lucide-react";

const METRO_LINKS = [
  { label: "Property in Delhi / NCR", href: "/properties?city=delhi-ncr" },
  { label: "Property in Mumbai", href: "/properties?city=mumbai" },
  { label: "Property in Bangalore", href: "/properties?city=bangalore" },
  { label: "Property in Hyderabad", href: "/properties?city=hyderabad" },
  { label: "Property in Pune", href: "/properties?city=pune" },
  { label: "Property in Chennai", href: "/properties?city=chennai" },
];

const RESIDENTIAL_SEARCHES = [
  { label: "Flats for Sale in Gurgaon", href: "/properties?intent=buy&city=gurgaon" },
  { label: "Apartments for Sale in Mumbai", href: "/properties?intent=buy&city=mumbai" },
  { label: "House for Rent in Bangalore", href: "/properties?intent=rent&city=bangalore" },
  { label: "Villas for Sale in Hyderabad", href: "/properties?intent=buy&type=villa" },
  { label: "Furnished Flats in Pune", href: "/properties?intent=rent&city=pune" },
  { label: "New Builder Projects", href: "/projects" },
];

const COMMERCIAL_LINKS = [
  { label: "Office Space in CyberCity", href: "/properties?type=commercial" },
  { label: "Commercial Offices in BKC", href: "/properties?type=commercial" },
  { label: "Shops for Sale in Noida", href: "/properties?type=commercial" },
  { label: "Warehouses for Lease", href: "/properties?type=commercial" },
  { label: "Co-working Spaces in Bangalore", href: "/properties?type=commercial" },
  { label: "Commercial Land & Plots", href: "/properties?type=commercial" },
];

const SERVICES_TOOLS = [
  { label: "All Property Services", href: "/services", highlight: true },
  { label: "Home Loans @ 8.35%", href: "/services/home-loan" },
  { label: "Legal Title Verification", href: "/services/legal-verification" },
  { label: "Online Rent Agreement", href: "/services/rent-agreement" },
  { label: "Property Valuation", href: "/services/property-valuation" },
  { label: "Post Free Property Ad", href: "/post-property" },
];

const CORPORATE_LINKS = [
  { label: "About House Hunt", href: "/about" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/terms#privacy" },
];

const NETWORK_BRANDS = [
  { name: "Naukri.com", href: "https://www.naukri.com" },
  { name: "Jeevansathi.com", href: "https://www.jeevansathi.com" },
  { name: "Shiksha.com", href: "https://www.shiksha.com" },
  { name: "Jobhai.com", href: "https://www.jobhai.com" },
  { name: "AmbitionBox", href: "https://www.ambitionbox.com" },
];

export function Footer() {
  return (
    <footer data-ui="site-footer" className="bg-[#262626] text-[#aeaeaf] font-sans pt-12 pb-8 border-t border-white/10">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 space-y-10">
        {/* Top Header Row: Brand Identity & Verified Helplines */}
        <div data-ui="footer-header" className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/"
              className="inline-flex items-center shrink-0 hover:opacity-90 transition-opacity"
              aria-label="House Hunt Home"
            >
              <HouseHuntLogo light={true} className="h-9 sm:h-10" />
            </Link>
            <div className="border-l border-white/20 pl-4 sm:pl-5">
              <h2 className="text-sm font-medium text-white tracking-tight leading-tight">
                India&apos;s No. 1 Property Portal
              </h2>
              <p className="text-[11px] text-[#008ae8] mt-0.5">
                A Part of Info Edge (India) Limited (NSE: NAUKRI)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-[#aeaeaf]">
            <a
              href="tel:18004199099"
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#008ae8]" />
              <span>Toll Free: 1800-41-99099 (9:30 AM to 6:30 PM)</span>
            </a>

            <a
              href="mailto:support@househunt.com"
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-[#008ae8]" />
              <span>support@househunt.com</span>
            </a>

            <div className="flex items-center gap-2 text-[#008ae8]">
              <ShieldCheck className="w-4 h-4 text-[#008ae8]" />
              <span className="font-medium text-[#008ae8]">100% RERA Compliant Network</span>
            </div>
          </div>
        </div>

        {/* 5 Neat Columns of Links */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 text-xs">
          {/* Column 1: Metros */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-[#008ae8] tracking-tight">
              Real Estate in India
            </h3>
            <ul className="space-y-2">
              {METRO_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-white/80 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Residential */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-[#008ae8] tracking-tight">
              Buy &amp; Rent
            </h3>
            <ul className="space-y-2">
              {RESIDENTIAL_SEARCHES.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-white/80 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Commercial */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-[#008ae8] tracking-tight">
              Commercial Spaces
            </h3>
            <ul className="space-y-2">
              {COMMERCIAL_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-white/80 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Services */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-[#008ae8] tracking-tight">
              Services &amp; Tools
            </h3>
            <ul className="space-y-2">
              {SERVICES_TOOLS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className={
                      link.highlight
                        ? "font-medium text-[#008ae8] hover:text-[#0077c8] transition-colors"
                        : "text-white/80 hover:text-white transition-colors"
                    }
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: About House Hunt */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-[#008ae8] tracking-tight">
              About House Hunt
            </h3>
            <ul className="space-y-2">
              {CORPORATE_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-white/80 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Network & Corporate Row */}
        <div data-ui="footer-network" className="pt-6 border-t border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs text-[#aeaeaf]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-white">Info Edge Network:</span>
            {NETWORK_BRANDS.map((brand, i) => (
              <React.Fragment key={brand.name}>
                <a
                  href={brand.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  {brand.name}
                </a>
                {i < NETWORK_BRANDS.length - 1 && <span className="text-white/20">·</span>}
              </React.Fragment>
            ))}
          </div>
          <div className="text-[#757577]">B-8, Sector 132, Noida, Uttar Pradesh 201304</div>
        </div>

        {/* Legal Disclaimer & Copyright */}
        <div data-ui="footer-disclaimer" className="pt-4 border-t border-white/10 text-[11px] text-[#757577] leading-relaxed space-y-4">
          <p>
            <strong className="text-white">Disclaimer:</strong> HouseHunt.com is an intermediary offering its platform to facilitate the transactions between Sellers and Customers/Buyers. HouseHunt.com is not and cannot be a party to or control in any manner any transactions between the Seller and the Customer. All prices and project details are provided by builders or individual sellers and are subject to change without notice. Please verify all RERA registration numbers independently before investing.
          </p>
          <div className="text-center text-[#757577] pt-2">
            © 2026 Info Edge (India) Limited. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
