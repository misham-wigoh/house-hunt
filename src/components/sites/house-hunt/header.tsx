"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  ChevronDown,
  User,
  Menu,
  X,
  Building2,
  Home as HomeIcon,
  Phone,
  ShieldCheck,
  Percent,
  FileText,
  Sparkles,
  Calculator,
  ArrowRight,
} from "lucide-react";
import { HouseHuntLogo } from "./icons";
import { useCmsCities } from "./cms-context";
import { useAuth } from "@/components/auth/auth-context";
import { useLocation } from "@/components/location/location-context";

const DEFAULT_CITIES = [
  { id: "delhi-ncr", name: "Delhi / NCR", tag: "DL" },
  { id: "mumbai", name: "Mumbai", tag: "BOM" },
  { id: "bangalore", name: "Bangalore", tag: "BLR" },
  { id: "hyderabad", name: "Hyderabad", tag: "HYD" },
  { id: "pune", name: "Pune", tag: "PNQ" },
  { id: "chennai", name: "Chennai", tag: "MAA" },
];

export function Header() {
  const cmsCities = useCmsCities();
  const cmsHeaderCities = (Array.isArray(cmsCities) ? cmsCities : [])
    .filter((c) => c && c.showInHeader)
    .map((c) => ({ id: c.id, name: c.displayName, tag: c.shortCode }));

  const CITIES = cmsHeaderCities.length > 0 ? cmsHeaderCities : DEFAULT_CITIES;

  // Where the visitor is: detected from their IP, or the city they picked here.
  const { location, selectCity, resetToDetected } = useLocation();
  const selectedCity = location?.label ?? "";
  // Detected somewhere that isn't in the list (e.g. "Kerala"): show it as the current pick.
  const detectedExtra =
    location && location.source === "auto" && !CITIES.some((c) => c.name === location.label) ? location.label : null;
  const [cityOpen, setCityOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { member, ready, openLogin, logout } = useAuth();

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = () => {
      setCityOpen(false);
      setActiveDropdown(null);
    };
    if (cityOpen || activeDropdown) {
      window.addEventListener("click", handleOutsideClick);
    }
    return () => window.removeEventListener("click", handleOutsideClick);
  }, [cityOpen, activeDropdown]);

  return (
    <>
      <header
        data-ui="site-header"
        className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-[#aeaeaf]/40 shadow-[0_4px_30px_rgba(0,0,0,0.08)] supports-[backdrop-filter]:bg-white/85 text-[#262626] transition-all duration-200"
      >
        {/* Subtle top specular glass highlight line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#008ae8]/40 to-transparent pointer-events-none" />

        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 h-16 flex items-center justify-between gap-3 sm:gap-4">
          {/* Left: Brand Identity & Glass City Capsule */}
          <div className="flex items-center gap-2 sm:gap-5 shrink-0">
            <Link href="/" className="shrink-0 flex items-center group">
              <HouseHuntLogo light={false} className="h-8 sm:h-9 transition-transform group-hover:scale-[1.02]" />
            </Link>

            {/* Glass City Selector Pill */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setCityOpen(!cityOpen)}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all backdrop-blur-md cursor-pointer border ${
                  cityOpen
                    ? "bg-[#e0f2fe] border-[#008ae8] text-[#008ae8] shadow-[0_0_15px_rgba(0,138,232,0.25)]"
                    : "bg-[#fafafa] hover:bg-[#e0f2fe] border-[#aeaeaf]/50 text-[#262626] hover:border-[#008ae8]/40"
                }`}
                aria-expanded={cityOpen}
              >
                <MapPin className="w-3.5 h-3.5 text-[#008ae8] shrink-0" />
                {location ? (
                  <span className="max-w-[70px] xs:max-w-[85px] sm:max-w-[130px] truncate">{selectedCity}</span>
                ) : (
                  // Still working out where the visitor is: hold the pill's width so nothing jumps.
                  <span aria-label="Detecting your location" className="inline-block h-3 w-14 sm:w-20 rounded bg-[#aeaeaf]/30 animate-pulse" />
                )}
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#757577] transition-transform duration-200 shrink-0 ${
                    cityOpen ? "rotate-180 text-[#008ae8]" : ""
                  }`}
                />
              </button>

              {/* Frosted Glass City Dropdown */}
              {cityOpen && (
                <div
                  data-ui="dropdown"
                  className="absolute left-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-[#aeaeaf]/40 p-2 z-50 text-[#262626] animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div data-ui="dropdown-header" className="px-3 py-1.5 text-xs font-semibold text-[#757577] border-b border-[#aeaeaf]/30 flex items-center justify-between">
                    <span>Select City</span>
                    <span className="text-[10px] text-[#757577]">{CITIES.length} available</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto py-1 space-y-0.5">
                    {detectedExtra && (
                      <div className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl flex items-center justify-between bg-[#e0f2fe] text-[#008ae8] font-semibold border border-[#008ae8]/30">
                        <span>{detectedExtra}</span>
                        <span className="text-[10px] font-medium text-[#008ae8]">Your location</span>
                      </div>
                    )}
                    {CITIES.map((city) => (
                      <button
                        key={city.id}
                        type="button"
                        onClick={() => {
                          selectCity(city);
                          setCityOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs sm:text-sm rounded-xl flex items-center justify-between transition-colors ${
                          selectedCity === city.name
                            ? "bg-[#e0f2fe] text-[#008ae8] font-semibold border border-[#008ae8]/30"
                            : "text-[#262626] hover:bg-[#fafafa] hover:text-[#008ae8]"
                        }`}
                      >
                        <span>{city.name}</span>
                        <span className="text-[10px] font-mono text-[#757577] bg-[#fafafa] border border-[#aeaeaf]/40 px-1.5 py-0.5 rounded-md">
                          {city.tag}
                        </span>
                      </button>
                    ))}
                  </div>
                  {location && location.source !== "auto" && (
                    <button
                      type="button"
                      onClick={() => {
                        resetToDetected();
                        setCityOpen(false);
                      }}
                      className="mt-1 w-full text-left px-3 py-2 text-xs rounded-xl flex items-center gap-1.5 border-t border-[#aeaeaf]/30 text-[#008ae8] font-medium hover:bg-[#e0f2fe] transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      Detect my location
                    </button>
                  )}
                  {location && location.cities.length === 0 && (
                    <p className="px-3 pt-2 pb-1 text-[11px] leading-snug text-[#757577] border-t border-[#aeaeaf]/30">
                      No listings in {location.label} yet, so you&apos;re seeing properties from all cities.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Center: Desktop Glass Navigation Pills */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5" onClick={(e) => e.stopPropagation()}>
            {/* Buy Tab */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === "buy" ? null : "buy")}
                className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-full flex items-center gap-1 transition-all ${
                  activeDropdown === "buy"
                    ? "bg-[#e0f2fe] text-[#008ae8] border border-[#008ae8]/30 shadow-xs"
                    : "text-[#262626] hover:text-[#008ae8] hover:bg-[#fafafa] border border-transparent"
                }`}
              >
                <span>Buy</span>
                <ChevronDown
                  className={`w-3 h-3 text-[#757577] transition-transform duration-200 ${
                    activeDropdown === "buy" ? "rotate-180 text-[#008ae8]" : ""
                  }`}
                />
              </button>

              {activeDropdown === "buy" && (
                <div
                  data-ui="dropdown"
                  className="absolute left-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-[#aeaeaf]/40 p-2.5 z-50 text-[#262626] animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <p className="text-[11px] font-semibold text-[#757577] uppercase px-2.5 py-1 tracking-wider">
                    Residential Properties
                  </p>
                  <ul className="space-y-0.5 text-xs sm:text-sm">
                    <li>
                      <Link
                        href="/properties?type=flat"
                        onClick={() => setActiveDropdown(null)}
                        className="block px-2.5 py-1.5 rounded-xl hover:bg-[#fafafa] text-[#262626] hover:text-[#008ae8] transition-colors"
                      >
                        Ready to Move Flats
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/properties?type=villa"
                        onClick={() => setActiveDropdown(null)}
                        className="block px-2.5 py-1.5 rounded-xl hover:bg-[#fafafa] text-[#262626] hover:text-[#008ae8] transition-colors"
                      >
                        Independent Houses &amp; Villas
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/properties?type=builder-floor"
                        onClick={() => setActiveDropdown(null)}
                        className="block px-2.5 py-1.5 rounded-xl hover:bg-[#fafafa] text-[#262626] hover:text-[#008ae8] transition-colors"
                      >
                        Luxury Builder Floors
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/properties?type=plot"
                        onClick={() => setActiveDropdown(null)}
                        className="block px-2.5 py-1.5 rounded-xl hover:bg-[#fafafa] text-[#262626] hover:text-[#008ae8] transition-colors"
                      >
                        Residential Plots &amp; Land
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Rent Tab */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === "rent" ? null : "rent")}
                className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-full flex items-center gap-1 transition-all ${
                  activeDropdown === "rent"
                    ? "bg-[#e0f2fe] text-[#008ae8] border border-[#008ae8]/30 shadow-xs"
                    : "text-[#262626] hover:text-[#008ae8] hover:bg-[#fafafa] border border-transparent"
                }`}
              >
                <span>Rent</span>
                <ChevronDown
                  className={`w-3 h-3 text-[#757577] transition-transform duration-200 ${
                    activeDropdown === "rent" ? "rotate-180 text-[#008ae8]" : ""
                  }`}
                />
              </button>

              {activeDropdown === "rent" && (
                <div
                  data-ui="dropdown"
                  className="absolute left-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-[#aeaeaf]/40 p-2.5 z-50 text-[#262626] animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <p className="text-[11px] font-semibold text-[#757577] uppercase px-2.5 py-1 tracking-wider">
                    Rental Options
                  </p>
                  <ul className="space-y-0.5 text-xs sm:text-sm">
                    <li>
                      <Link
                        href="/properties?intent=rent"
                        onClick={() => setActiveDropdown(null)}
                        className="block px-2.5 py-1.5 rounded-xl hover:bg-[#fafafa] text-[#262626] hover:text-[#008ae8] transition-colors"
                      >
                        Owner Listed Flats (Zero Brokerage)
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/properties?intent=rent&furnished=full"
                        onClick={() => setActiveDropdown(null)}
                        className="block px-2.5 py-1.5 rounded-xl hover:bg-[#fafafa] text-[#262626] hover:text-[#008ae8] transition-colors"
                      >
                        Fully Furnished Apartments
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/properties?intent=rent&type=pg"
                        onClick={() => setActiveDropdown(null)}
                        className="block px-2.5 py-1.5 rounded-xl hover:bg-[#fafafa] text-[#262626] hover:text-[#008ae8] transition-colors"
                      >
                        PG &amp; Co-Living Spaces
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Commercial */}
            <Link
              href="/properties?type=commercial"
              className="px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-full text-[#262626] hover:text-[#008ae8] hover:bg-[#fafafa] transition-all border border-transparent"
            >
              Commercial
            </Link>

            {/* New Projects */}
            <Link
              href="/projects"
              className="px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-full text-[#262626] hover:text-[#008ae8] hover:bg-[#fafafa] flex items-center gap-1.5 transition-all border border-transparent group"
            >
              <span>Projects</span>
              <span className="text-[9px] font-bold bg-[#e0f2fe] text-[#008ae8] border border-[#008ae8]/30 px-1.5 py-0.2 rounded-full tracking-wide">
                HOT
              </span>
            </Link>

            {/* Blog */}
            <Link
              href="/blog"
              className="px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-full text-[#262626] hover:text-[#008ae8] hover:bg-[#fafafa] transition-all border border-transparent"
            >
              Blog
            </Link>

            {/* Services Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === "services" ? null : "services")}
                className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-full flex items-center gap-1 transition-all ${
                  activeDropdown === "services"
                    ? "bg-[#e0f2fe] text-[#008ae8] border border-[#008ae8]/30 shadow-xs"
                    : "text-[#262626] hover:text-[#008ae8] hover:bg-[#fafafa] border border-transparent"
                }`}
              >
                <span>Services</span>
                <ChevronDown
                  className={`w-3 h-3 text-[#757577] transition-transform duration-200 ${
                    activeDropdown === "services" ? "rotate-180 text-[#008ae8]" : ""
                  }`}
                />
              </button>

              {activeDropdown === "services" && (
                <div
                  data-ui="dropdown"
                  className="absolute right-0 top-full mt-2 w-80 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-[#aeaeaf]/40 p-2.5 z-50 text-[#262626] animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div className="flex items-center justify-between px-2.5 py-1">
                    <p className="text-[11px] font-semibold text-[#757577] uppercase tracking-wider">
                      Ecosystem Services
                    </p>
                    <Link
                      href="/services"
                      onClick={() => setActiveDropdown(null)}
                      className="text-[11px] font-semibold text-[#008ae8] hover:underline"
                    >
                      All Services →
                    </Link>
                  </div>
                  <ul className="space-y-1 text-xs sm:text-sm">
                    <li>
                      <Link
                        href="/services/home-loan"
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#fafafa] transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#e0f2fe] border border-[#008ae8]/30 flex items-center justify-center shrink-0">
                          <Percent className="w-4 h-4 text-[#008ae8]" />
                        </div>
                        <div>
                          <div className="font-medium text-[#262626] group-hover:text-[#008ae8] transition-colors">Home Loans</div>
                          <div className="text-[11px] text-[#757577]">Lowest rates @ 8.35% p.a.</div>
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/services/legal-verification"
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#fafafa] transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#e0f2fe] border border-[#008ae8]/30 flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-4 h-4 text-[#008ae8]" />
                        </div>
                        <div>
                          <div className="font-medium text-[#262626] group-hover:text-[#008ae8] transition-colors">Legal Verification</div>
                          <div className="text-[11px] text-[#757577]">30+ title &amp; RERA checks</div>
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/services/rent-agreement"
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#fafafa] transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#e0f2fe] border border-[#008ae8]/30 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-[#008ae8]" />
                        </div>
                        <div>
                          <div className="font-medium text-[#262626] group-hover:text-[#008ae8] transition-colors">Rent Agreement</div>
                          <div className="text-[11px] text-[#757577]">Doorstep biometric e-stamp</div>
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/services/property-valuation"
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#fafafa] transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#e0f2fe] border border-[#008ae8]/30 flex items-center justify-center shrink-0">
                          <Calculator className="w-4 h-4 text-[#008ae8]" />
                        </div>
                        <div>
                          <div className="font-medium text-[#262626] group-hover:text-[#008ae8] transition-colors">Property Valuation</div>
                          <div className="text-[11px] text-[#757577]">Circle rates &amp; AI appraisal</div>
                        </div>
                      </Link>
                    </li>
                  </ul>
                  <div className="mt-1 pt-1.5 border-t border-[#aeaeaf]/20">
                    <Link
                      href="/services"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[#008ae8] hover:bg-[#e0f2fe] transition-colors"
                    >
                      <span>Explore all 4+ Services</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right: Compact Glass Quick Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Login / account menu */}
            {member ? (
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={activeDropdown === "account"}
                  onClick={() => {
                    setCityOpen(false);
                    setActiveDropdown(activeDropdown === "account" ? null : "account");
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium text-[#262626] hover:text-[#008ae8] bg-[#fafafa] hover:bg-[#e0f2fe] border border-[#aeaeaf]/50 hover:border-[#008ae8]/40 transition-all shrink-0 cursor-pointer shadow-xs"
                >
                  <User className="w-3.5 h-3.5 text-[#008ae8] shrink-0" />
                  <span className="hidden sm:inline max-w-[110px] truncate">{member.name || member.email.split("@")[0]}</span>
                </button>
                {activeDropdown === "account" && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white border border-[#aeaeaf]/40 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.25)] p-1.5 z-50"
                  >
                    <div className="px-3 py-2 border-b border-[#aeaeaf]/30 mb-1">
                      <p className="text-sm font-semibold text-[#262626] truncate">{member.name || "Welcome"}</p>
                      <p className="text-[11px] text-[#757577] truncate">{member.email}</p>
                    </div>
                    <Link
                      role="menuitem"
                      href="/account/shortlist"
                      onClick={() => setActiveDropdown(null)}
                      className="block px-3 py-2 rounded-xl text-sm text-[#262626] hover:bg-[#e0f2fe]"
                    >
                      My Shortlist
                    </Link>
                    <button
                      role="menuitem"
                      type="button"
                      onClick={async () => {
                        setActiveDropdown(null);
                        await logout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-sm text-[#262626] hover:bg-[#e0f2fe]"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openLogin()}
                disabled={!ready}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium text-[#262626] hover:text-[#008ae8] bg-[#fafafa] hover:bg-[#e0f2fe] border border-[#aeaeaf]/50 hover:border-[#008ae8]/40 transition-all shrink-0 cursor-pointer shadow-xs disabled:opacity-70"
              >
                <User className="w-3.5 h-3.5 text-[#008ae8] shrink-0" />
                <span className="hidden sm:inline">Login</span>
              </button>
            )}

            {/* Post Property FREE Button with Signal Blue Glow */}
            <Link
              href="/post-property"
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium text-white bg-[#008ae8] hover:bg-[#0077c8] border border-[#008ae8] shadow-[0_4px_16px_rgba(0,138,232,0.35)] hover:shadow-[0_6px_22px_rgba(0,138,232,0.5)] transition-all shrink-0 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-white shrink-0" />
              <span>
                Post<span className="hidden sm:inline"> Property</span>
              </span>
              <span className="hidden sm:inline text-[9px] bg-white/25 text-white px-1.5 py-0.2 rounded-full font-bold uppercase">
                Free
              </span>
            </Link>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-9 h-9 rounded-full bg-[#fafafa] hover:bg-[#e0f2fe] border border-[#aeaeaf]/40 flex items-center justify-center text-[#262626] transition-all shrink-0 cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Glass Drawer */}
        {mobileMenuOpen && (
          <div
            data-ui="mobile-drawer"
            className="lg:hidden bg-white/95 backdrop-blur-2xl border-t border-[#aeaeaf]/30 px-4 py-4 space-y-4 shadow-2xl text-[#262626] animate-in slide-in-from-top-4 duration-200"
          >
            <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm font-medium">
              <Link
                href="/properties?intent=buy"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-3 rounded-2xl bg-[#fafafa] hover:bg-[#e0f2fe] border border-[#aeaeaf]/30 text-[#262626] font-medium transition-all"
              >
                <HomeIcon className="w-4 h-4 text-[#008ae8]" />
                Buy Property
              </Link>
              <Link
                href="/properties?intent=rent"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-3 rounded-2xl bg-[#fafafa] hover:bg-[#e0f2fe] border border-[#aeaeaf]/30 text-[#262626] font-medium transition-all"
              >
                <Building2 className="w-4 h-4 text-[#008ae8]" />
                Rent Homes
              </Link>
              <Link
                href="/properties?type=commercial"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-3 rounded-2xl bg-[#fafafa] hover:bg-[#e0f2fe] border border-[#aeaeaf]/30 text-[#262626] font-medium transition-all"
              >
                <Building2 className="w-4 h-4 text-[#008ae8]" />
                Commercial
              </Link>
              <Link
                href="/services"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-3 rounded-2xl bg-[#fafafa] hover:bg-[#e0f2fe] border border-[#aeaeaf]/30 text-[#262626] font-medium transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-[#008ae8]" />
                All Services
              </Link>
              <Link
                href="/blog"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-3 rounded-2xl bg-[#fafafa] hover:bg-[#e0f2fe] border border-[#aeaeaf]/30 text-[#262626] font-medium transition-all"
              >
                <FileText className="w-4 h-4 text-[#008ae8]" />
                Blog
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-3 rounded-2xl bg-[#fafafa] hover:bg-[#e0f2fe] border border-[#aeaeaf]/30 text-[#262626] font-medium transition-all"
              >
                <Sparkles className="w-4 h-4 text-[#008ae8]" />
                About Us
              </Link>
            </div>

            <div data-ui="drawer-footer" className="pt-3 border-t border-[#aeaeaf]/30 space-y-2.5 text-xs sm:text-sm">
              <Link
                href="/post-property"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-full font-medium text-white bg-[#008ae8] hover:bg-[#0077c8] transition-all shadow-[0_4px_16px_rgba(0,138,232,0.35)]"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Post Free Property Ad
                </span>
                <span className="text-[10px] bg-white text-[#008ae8] px-2 py-0.5 rounded-full font-bold">
                  FREE
                </span>
              </Link>

              <div className="flex items-center justify-between px-2 pt-1 text-xs text-[#757577]">
                <a
                  href="tel:18004199099"
                  className="flex items-center gap-1.5 hover:text-[#262626] transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#008ae8]" />
                  <span>1800-41-99099</span>
                </a>
                <span className="text-[#aeaeaf]">•</span>
                <Link
                  href="/terms"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-[#262626] transition-colors underline"
                >
                  Terms &amp; Privacy
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
