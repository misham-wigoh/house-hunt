"use client";

import { useAuth } from "@/components/auth/auth-context";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/sites/house-hunt/header";
import { Footer } from "@/components/sites/house-hunt/footer";
import { VerifiedBadge, PriceDropBadge, ReraBadge } from "@/components/sites/house-hunt/icons";
import { CmsImage } from "@/components/sites/house-hunt/cms-image";
import { EnquiryHoneypot } from "@/components/sites/house-hunt/enquiry-honeypot";
import { sendEnquiry } from "@/lib/enquiry";
import { useLocation } from "@/components/location/location-context";
import { isLocalCity } from "@/lib/location/resolve";
import type { Listing } from "@/lib/cms/types";
import {
  MapPin,
  Building,
  Heart,
  PhoneCall,
  SlidersHorizontal,
  ArrowUpDown,
  CheckCircle2,
  X,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

/** Preferred display order; any other type from the CMS follows alphabetically. */
const TYPE_ORDER = [
  "Commercial",
  "Plot / Land",
  "PG / Co-living",
  "Flat / Apartment",
  "Villa",
  "Builder Floor",
  "Independent House",
];

function resolveType(options: string[], typeParam: string, tabParam: string): string {
  if (typeParam) {
    const match = options.find((t) => t.toLowerCase().includes(typeParam.toLowerCase()));
    if (match) return match;
  } else if (tabParam) {
    const byTab: Record<string, string> = { commercial: "Commercial", plots: "Plot / Land", pg: "PG / Co-living" };
    const wanted = byTab[tabParam];
    if (wanted && options.includes(wanted)) return wanted;
  }
  return "All Types";
}

function PropertiesContent({ listings }: { listings: Listing[] }) {
  const searchParams = useSearchParams();
  const qParam = searchParams.get("q") || "";
  const typeParam = searchParams.get("type") || "";
  const cityParam = searchParams.get("city") || "";
  const tabParam = searchParams.get("tab") || "";
  const budgetParam = searchParams.get("budget") || "";
  const { location } = useLocation();

  const typeOptions = useMemo(() => {
    const present = Array.from(new Set(listings.map((l) => l.type).filter(Boolean)));
    const ordered = TYPE_ORDER.filter((t) => present.includes(t));
    const rest = present.filter((t) => !TYPE_ORDER.includes(t)).sort();
    return ["All Types", ...ordered, ...rest];
  }, [listings]);

  const cityOptions = useMemo(
    () => ["All Cities", ...Array.from(new Set(listings.map((l) => l.city).filter(Boolean))).sort()],
    [listings],
  );

  // Initial filters come from the URL; the wrapper remounts this component when the URL changes.
  const [selectedType, setSelectedType] = useState<string>(() => resolveType(typeOptions, typeParam, tabParam));
  const [selectedCity, setSelectedCity] = useState<string>(
    () => cityOptions.find((c) => c.toLowerCase() === cityParam.toLowerCase()) ?? "All Cities",
  );
  const [selectedBhk, setSelectedBhk] = useState<number[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedPossession, setSelectedPossession] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("relevance");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const { isShortlisted, toggleShortlist } = useAuth();
  const [contactModalItem, setContactModalItem] = useState<Listing | null>(null);
  const [phoneInput, setPhoneInput] = useState("");
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactSending, setContactSending] = useState(false);
  const [contactError, setContactError] = useState("");
  const [contactTrap, setContactTrap] = useState("");

  const submitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactModalItem || contactSending) return;
    setContactSending(true);
    setContactError("");
    const res = await sendEnquiry({
      source: "listing_contact",
      phone: phoneInput,
      propertyTitle: contactModalItem.title,
      propertyId: contactModalItem.id,
      propertyRef: contactModalItem.reference,
      dealer: contactModalItem.dealerName,
      website: contactTrap,
    });
    setContactSending(false);
    if (!res.ok) return setContactError(res.error);
    setContactSuccess(true);
  };

  const closeContact = () => {
    setContactModalItem(null);
    setContactSuccess(false);
    setContactError("");
    setPhoneInput("");
  };

  const toggleBhk = (bhk: number) => {
    setSelectedBhk((prev) =>
      prev.includes(bhk) ? prev.filter((item) => item !== bhk) : [...prev, bhk]
    );
  };

  const resetAllFilters = () => {
    setSelectedType("All Types");
    setSelectedCity("All Cities");
    setSelectedBhk([]);
    setVerifiedOnly(false);
    setSelectedPossession("all");
    setSortBy("relevance");
  };

  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      // Keyword search in title, location, city, society, or type
      if (qParam) {
        const q = qParam.toLowerCase();
        const matchesQ =
          item.title.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          item.city.toLowerCase().includes(q) ||
          item.society.toLowerCase().includes(q) ||
          item.type.toLowerCase().includes(q);
        if (!matchesQ) return false;
      }

      // City filter
      if (selectedCity !== "All Cities" && item.city.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }

      // Tab parameter filter
      if (tabParam === "commercial" && item.type !== "Commercial") return false;
      if (tabParam === "plots" && item.type !== "Plot / Land") return false;
      if (tabParam === "pg" && item.type !== "PG / Co-living") return false;

      // Type filter
      if (selectedType !== "All Types") {
        if (!item.type.toLowerCase().includes(selectedType.toLowerCase())) {
          return false;
        }
      }

      // BHK filter (only applies to properties that have BHK > 0)
      if (selectedBhk.length > 0 && item.bhk > 0 && !selectedBhk.includes(item.bhk)) {
        return false;
      }

      // Verified filter
      if (verifiedOnly && !item.verified) {
        return false;
      }

      // Possession filter
      if (selectedPossession !== "all" && item.possession !== selectedPossession) {
        return false;
      }

      // Budget filter (e.g. 0-50, 50-100, 100-200, 200-500, 500+)
      if (budgetParam && budgetParam !== "all") {
        if (budgetParam === "0-50" && item.priceNum > 50) return false;
        if (budgetParam === "50-100" && (item.priceNum < 50 || item.priceNum > 100)) return false;
        if (budgetParam === "100-200" && (item.priceNum < 100 || item.priceNum > 200)) return false;
        if (budgetParam === "200-500" && (item.priceNum < 200 || item.priceNum > 500)) return false;
        if (budgetParam === "500+" && item.priceNum < 500) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "price-low") return a.priceNum - b.priceNum;
      if (sortBy === "price-high") return b.priceNum - a.priceNum;
      // Relevance: the visitor's own city first (the sort is stable, so the rest keep their order).
      return Number(isLocalCity(location, b.city)) - Number(isLocalCity(location, a.city));
    });
  }, [listings, qParam, selectedCity, tabParam, selectedType, selectedBhk, verifiedOnly, selectedPossession, budgetParam, sortBy, location]);

  const localFirstLabel =
    sortBy === "relevance" && selectedCity === "All Cities" && listings.some((l) => isLocalCity(location, l.city))
      ? location?.label
      : null;

  return (
    <div className="min-h-dvh bg-[#fafafa] flex flex-col font-sans text-[#262626] selection:bg-[#008ae8] selection:text-white">
      <Header />

      {/* Breadcrumb & Subheading */}
      <div data-ui="breadcrumb-bar" className="bg-white border-b border-[#aeaeaf]/40 py-3 px-4 sm:px-6 lg:px-8 2xl:px-12">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between text-xs text-[#757577]">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-[#008ae8] transition-colors">Home</Link>
            <span>/</span>
            <span className="font-medium text-[#262626]">Properties in India</span>
            {qParam && <span>({qParam})</span>}
            {selectedType !== "All Types" && <span className="text-[#008ae8] font-medium">• {selectedType}</span>}
            {selectedCity !== "All Cities" && <span className="text-[#008ae8] font-medium">• {selectedCity}</span>}
          </div>
          <span className="text-[#757577] font-medium hidden sm:inline">
            {localFirstLabel && (
              <span className="text-[#008ae8]">{localFirstLabel} properties first · </span>
            )}
            {listings.length} Verified Listings
          </span>
        </div>
      </div>

      <main className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-4 sm:py-6 flex-1 w-full">
        {/* Mobile Filter Toggle Header Bar */}
        <div className="lg:hidden flex items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-[#aeaeaf]/40 mb-4 shadow-xs">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#e0f2fe] text-[#008ae8] border border-[#008ae8]/30 font-medium text-xs active:scale-95 transition-all"
            aria-expanded={mobileFiltersOpen}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>
              {mobileFiltersOpen ? "Hide Filters" : "Filter Properties"}
              {(selectedType !== "All Types" || selectedCity !== "All Cities" || selectedBhk.length > 0 || verifiedOnly || selectedPossession !== "all") && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-[#008ae8] text-white text-[10px] font-bold">
                  Active
                </span>
              )}
            </span>
          </button>
          <div className="flex items-center gap-1.5 text-xs text-[#757577]">
            <span className="font-medium text-[#262626]">{filteredListings.length}</span>
            <span>found</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Filter Sidebar (3 cols) */}
          <aside className={`lg:col-span-3 ${mobileFiltersOpen ? "block mb-4 lg:mb-0" : "hidden lg:block"}`}>
            <div data-ui="filter-panel" className="bg-white rounded-2xl border border-[#aeaeaf]/40 p-4 sm:p-5 sticky top-20 space-y-6">
              <div data-ui="filter-head" className="flex items-center justify-between pb-3 border-b border-[#aeaeaf]/40">
                <span className="font-medium text-sm text-[#262626] flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-[#008ae8]" />
                  Filters
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="text-xs text-[#008ae8] font-medium hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                  {mobileFiltersOpen && (
                    <button
                      type="button"
                      onClick={() => setMobileFiltersOpen(false)}
                      className="lg:hidden text-xs font-semibold px-2 py-1 rounded bg-[#008ae8] text-white"
                    >
                      Done
                    </button>
                  )}
                </div>
              </div>

              {/* Property Category Filter */}
              <div>
                <span className="block text-xs font-semibold text-[#262626] uppercase mb-2">
                  Property Category
                </span>
                <div className="space-y-1 max-h-44 overflow-y-auto no-scrollbar">
                  {typeOptions.map((type) => {
                    const isSelected = selectedType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSelectedType(type)}
                        className={`w-full text-left px-3 py-1.5 rounded-[4px] text-xs font-medium flex items-center justify-between transition-colors ${isSelected
                          ? "bg-[#008ae8] text-white"
                          : "text-[#262626] hover:bg-[#fafafa]"
                          }`}
                      >
                        <span>{type}</span>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* City Filter */}
              <div>
                <span className="block text-xs font-semibold text-[#262626] uppercase mb-2">
                  Select City
                </span>
                <select
                  data-ui="city-select"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-[#fafafa] border border-[#aeaeaf]/40 rounded-[4px] px-3 py-2 text-xs font-medium text-[#262626] focus:outline-hidden focus:border-[#008ae8]"
                >
                  {cityOptions.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Verified Only Filter Card */}
              <div>
                <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl bg-[#e0f2fe] border border-[#008ae8]/30 hover:bg-[#e0f2fe]/80 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-[4px] bg-[#008ae8] text-white flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-[#008ae8] block leading-tight">
                        Verified Only
                      </span>
                      <span className="text-[10px] text-[#757577] block mt-0.5">
                        RERA &amp; direct owner vetted
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="w-4 h-4 text-[#008ae8] rounded border-[#aeaeaf]/40 focus:ring-[#008ae8] cursor-pointer"
                  />
                </label>
              </div>

              {/* Bedrooms (BHK) Filter */}
              <div>
                <span className="block text-xs font-semibold text-[#262626] uppercase mb-2">
                  Bedrooms (BHK)
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 4].map((bhk) => {
                    const isSelected = selectedBhk.includes(bhk);
                    return (
                      <button
                        key={bhk}
                        type="button"
                        onClick={() => toggleBhk(bhk)}
                        className={`py-2 text-xs font-medium rounded-[4px] border transition-colors ${isSelected
                          ? "bg-[#008ae8] text-white border-[#008ae8] shadow-xs"
                          : "bg-[#fafafa] text-[#262626] border-[#aeaeaf]/40 hover:bg-[#e0f2fe]"
                          }`}
                      >
                        {bhk} BHK
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Possession Status */}
              <div>
                <span className="block text-xs font-semibold text-[#262626] uppercase mb-2">
                  Possession Status
                </span>
                <div className="space-y-1.5 text-xs text-[#262626]">
                  {[
                    { label: "All Properties", value: "all" },
                    { label: "Ready to Move", value: "Ready to Move" },
                    { label: "Under Construction", value: "Under Construction" },
                  ].map((pos) => (
                    <label
                      key={pos.value}
                      className="flex items-center gap-2 p-1.5 rounded hover:bg-[#fafafa] cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="possession"
                        checked={selectedPossession === pos.value}
                        onChange={() => setSelectedPossession(pos.value)}
                        className="accent-[#008ae8]"
                      />
                      <span>{pos.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Post Free Property Ad banner */}
              <div data-ui="filter-cta" className="pt-4 border-t border-[#aeaeaf]/40 text-center">
                <span className="text-xs text-[#757577] block mb-2">Are you an owner or builder?</span>
                <Link
                  href="/post-property"
                  className="block w-full py-2 px-3 rounded-[4px] bg-[#008ae8] text-white border border-[#008ae8] font-medium text-xs hover:bg-[#0077c8] transition-colors shadow-xs"
                >
                  Post Property for Free
                </Link>
              </div>
            </div>
          </aside>

          {/* Right Listings Grid (9 cols) */}
          <div className="lg:col-span-9 space-y-4">
            {/* List Header with Count & Sort */}
            <div data-ui="sort-bar" className="bg-white p-4 rounded-2xl border border-[#aeaeaf]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-base sm:text-lg font-light tracking-normal text-[#262626]">
                  {filteredListings.length} Verified Properties Found
                </h1>
                <p className="text-xs text-[#757577] mt-0.5">
                  Across {cityOptions.length - 1} Indian cities, commercial corridors &amp; gated hubs
                </p>
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#757577] font-medium flex items-center gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#008ae8]" />
                  Sort:
                </span>
                <select
                  data-ui="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#fafafa] border border-[#aeaeaf]/40 rounded-[4px] px-2.5 py-1.5 font-medium text-[#262626] focus:outline-hidden focus:border-[#008ae8]"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Listings Items */}
            {filteredListings.length === 0 ? (
              <div data-ui="empty-state" className="bg-white rounded-2xl border border-[#aeaeaf]/40 p-12 text-center">
                <Building className="w-12 h-12 text-[#757577] mx-auto mb-3" />
                <h3 className="text-base font-medium text-[#262626]">No properties matched your criteria</h3>
                <p className="text-xs text-[#757577] mt-1 max-w-sm mx-auto">
                  Try clearing some filters or searching for another city or locality.
                </p>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="mt-4 px-4 py-2 bg-[#008ae8] hover:bg-[#0077c8] text-white border border-[#008ae8] rounded-[4px] text-xs font-medium transition-colors shadow-xs"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-5 gap-y-8">
                {filteredListings.map((item, idx) => {
                  const isSaved = isShortlisted(item.id);
                  // alternate Price Drop badge on top listings to match user's mockup
                  const showPriceDrop = idx % 2 === 0;
                  const specs = [
                    { label: "Area", value: item.area },
                    { label: "Status", value: item.possession },
                    { label: "Furnishing", value: item.furnishing },
                  ].filter((s) => s.value);

                  return (
                    <article key={item.id} data-ui="property-card" className="group flex flex-col">
                      {/* Photo */}
                      <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-[#fafafa]">
                        <CmsImage
                          src={item.image}
                          alt={item.title}
                          sizes="(min-width: 1024px) 34vw, (min-width: 768px) 45vw, 100vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                          {item.verified && <VerifiedBadge />}
                          <span className="inline-block px-2 py-0.5 rounded-[4px] text-[10px] font-medium bg-[#1c1c1e]/80 text-white">
                            {item.type}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleShortlist(item.id)}
                          aria-pressed={isSaved}
                          className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${isSaved
                            ? "bg-[#1c1c1e] text-[#008ae8]"
                            : "bg-[#1c1c1e]/60 text-white hover:bg-[#1c1c1e]"
                            }`}
                          title={isSaved ? "Remove from shortlist" : "Shortlist Property"}
                          aria-label={isSaved ? "Remove from shortlist" : "Shortlist Property"}
                        >
                          <Heart className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
                        </button>
                      </div>

                      {/* Floating info panel overlapping the photo */}
                      <div className="relative -mt-12 mx-3 rounded-2xl bg-white border border-[#aeaeaf]/40 group-hover:border-[#008ae8] transition-colors p-4 flex flex-col gap-3">
                        <div>
                          <Link
                            href={`/property/${item.id}`}
                            className="text-base font-medium text-[#262626] group-hover:text-[#008ae8] transition-colors line-clamp-1"
                          >
                            {item.title}
                          </Link>
                          <p className="flex items-center gap-1.5 text-xs text-[#757577] mt-1">
                            <MapPin className="w-3.5 h-3.5 text-[#008ae8] shrink-0" />
                            <span className="truncate">{[item.location, item.city].filter(Boolean).join(", ")}</span>
                          </p>
                        </div>

                        <div className="flex items-end justify-between gap-3">
                          <div>
                            <span className="text-xl font-light text-[#262626] block leading-tight">{item.price}</span>
                            {item.pricePerSqFt && (
                              <span className="text-[11px] text-[#757577]">{item.pricePerSqFt}</span>
                            )}
                          </div>
                          {showPriceDrop && <PriceDropBadge />}
                        </div>

                        {specs.length > 0 && (
                          <dl className="grid grid-cols-3 gap-2 py-2.5 border-y border-[#aeaeaf]/40 text-xs">
                            {specs.map((spec) => (
                              <div key={spec.label} className="min-w-0">
                                <dt className="text-[#757577] text-[10px] uppercase font-semibold">{spec.label}</dt>
                                <dd className="text-[#262626] font-medium truncate">{spec.value}</dd>
                              </div>
                            ))}
                          </dl>
                        )}

                        <div data-ui="card-actions" className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                          <div className="min-w-0 max-w-full text-[11px] text-[#757577]">
                            {item.rera ? <ReraBadge reraId={item.rera} /> : <span>ID: {item.reference}</span>}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setContactModalItem(item)}
                              aria-label={`Contact seller for ${item.title}`}
                              title="Contact Seller"
                              className="w-9 h-9 rounded-full bg-[#fafafa] hover:bg-[#e0f2fe] text-[#008ae8] border border-[#aeaeaf]/40 flex items-center justify-center transition-colors"
                            >
                              <PhoneCall className="w-4 h-4" />
                            </button>
                            <Link
                              href={`/property/${item.id}`}
                              className="py-2 px-4 rounded-[4px] text-xs font-medium bg-[#008ae8] hover:bg-[#0077c8] text-white border border-[#008ae8] transition-colors"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Contact Seller Modal */}
      {contactModalItem && (
        <div data-ui="contact-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#262626]/80 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 relative border border-[#aeaeaf]/40 text-[#262626]">
            <button
              type="button"
              onClick={closeContact}
              aria-label="Close"
              className="absolute top-4 right-4 p-1 rounded-full text-[#757577] hover:text-[#262626] hover:bg-[#fafafa]"
            >
              <X className="w-5 h-5" />
            </button>

            {contactSuccess ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-16 h-16 text-[#008ae8] mx-auto mb-3" />
                <h4 className="text-lg font-medium text-[#262626]">Request Sent</h4>
                <p className="text-xs text-[#757577] mt-1">
                  {contactModalItem?.postedBy || "The seller"} will call you on +91 {phoneInput} shortly.
                </p>
                <button type="button" onClick={closeContact} className="mt-4 text-xs font-medium text-[#008ae8] hover:text-[#0077c8]">
                  Close
                </button>
              </div>
            ) : (
              <div>
                <h3 className="text-base font-medium text-[#262626] mb-1">
                  Contact {contactModalItem.postedBy}
                </h3>
                <p className="text-xs text-[#757577] mb-4">{contactModalItem.title}</p>
                <form onSubmit={submitContact} className="relative space-y-3">
                  <EnquiryHoneypot value={contactTrap} onChange={setContactTrap} />
                  <div>
                    <label className="block text-xs font-semibold text-[#262626] mb-1">
                      Enter your mobile number to get a call back
                    </label>
                    <div className="flex rounded-[4px] border border-[#aeaeaf]/40 overflow-hidden focus-within:border-[#008ae8]">
                      <span data-ui="prefix" className="bg-[#fafafa] px-3 py-2 text-xs font-semibold text-[#262626] border-r border-[#aeaeaf]/40">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        pattern="[0-9]{10}"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="10 digit mobile"
                        className="w-full px-3 py-2 text-xs focus:outline-hidden bg-white text-[#262626]"
                      />
                    </div>
                  </div>
                  {contactError && <p role="alert" className="text-xs font-medium text-[#E4572E]">{contactError}</p>}
                  <button
                    type="submit"
                    disabled={contactSending}
                    className="w-full py-2.5 px-4 rounded-[4px] font-medium text-white bg-[#008ae8] hover:bg-[#0077c8] border border-[#008ae8] text-xs transition-colors shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {contactSending ? "Sending..." : "Request Call Back"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export function PropertiesClient({ listings }: { listings: Listing[] }) {
  const searchParams = useSearchParams();
  return <PropertiesContent key={searchParams.toString()} listings={listings} />;
}
