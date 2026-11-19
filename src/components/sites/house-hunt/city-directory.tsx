"use client";

import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  Building,
  Sparkles,
  ArrowRight,
  PhoneCall,
  CheckCircle2,
  X,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { CmsImage } from "./cms-image";
import { VerifiedBadge } from "./icons";
import { EnquiryHoneypot } from "./enquiry-honeypot";
import { sendEnquiry } from "@/lib/enquiry";
import { useLocation, usePrioritized } from "@/components/location/location-context";
import { isLocalCity } from "@/lib/location/resolve";
import type { CityItem, Listing, ProjectItem } from "@/lib/cms/types";

interface CityDirectoryProps {
  cities: CityItem[];
  listings?: Listing[];
  projects?: ProjectItem[];
}

export function CityDirectory({
  cities,
  listings = [],
  projects = [],
}: CityDirectoryProps) {
  const directory = useMemo(() => cities.filter((c) => c.showInDirectory), [cities]);

  // Helper to match an item to a city by name or location
  const matchesCity = (cityVal?: string, locVal?: string, societyVal?: string, targetCity?: CityItem) => {
    if (!targetCity) return false;
    const name = targetCity.name.toLowerCase();
    const display = targetCity.displayName.toLowerCase();
    const c = (cityVal || "").toLowerCase();
    const l = (locVal || "").toLowerCase();
    const s = (societyVal || "").toLowerCase();

    return (
      c === name ||
      c.includes(name) ||
      l.includes(name) ||
      l.includes(display) ||
      s.includes(name) ||
      s.includes(display)
    );
  };

  // Pre-calculate counts for each city card in directory
  const cityStats = useMemo(() => {
    const stats: Record<string, { count: number; label: string; liveCount: number }> = {};

    directory.forEach((c) => {
      const cityListings = listings.filter((item) =>
        matchesCity(item.city, item.location, item.society, c)
      );
      const cityProjects = projects.filter((item) =>
        matchesCity(item.city, item.location, undefined, c)
      );
      const live = cityListings.length + cityProjects.length;

      stats[c.id] = {
        count: live,
        label: `${live} Verified ${live === 1 ? "Property" : "Properties"}`,
        liveCount: live,
      };
    });

    return stats;
  }, [directory, listings, projects]);

  // Filter out any location/city with 0 properties (don't show cards with 0)
  const nonEmptyDirectory = useMemo(() => {
    return directory.filter((c) => (cityStats[c.id]?.count ?? 0) > 0);
  }, [directory, cityStats]);

  // The visitor's own city leads the carousel.
  const visibleDirectory = usePrioritized(nonEmptyDirectory, "name");
  const { location } = useLocation();

  // Open on the visitor's city; otherwise Lucknow if present, else the first city.
  const defaultCity = useMemo(() => {
    return (
      visibleDirectory.find((c) => isLocalCity(location, c.name)) ||
      visibleDirectory.find(
        (c) =>
          c.name.toLowerCase() === "lucknow" ||
          c.displayName.toLowerCase().includes("lucknow")
      ) ||
      visibleDirectory[0]
    );
  }, [visibleDirectory, location]);

  // Empty until the visitor clicks a city; selectedCity falls back to defaultCity.
  const [selectedCityId, setSelectedCityId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"all" | "residential" | "commercial" | "projects">("all");
  const [enquireItem, setEnquireItem] = useState<{ id: string; title: string; location: string; price: string; image: string | null; reference?: string } | null>(null);
  const [phone, setPhone] = useState("");
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [trap, setTrap] = useState("");

  const selectedCity = useMemo(() => {
    return visibleDirectory.find((c) => c.id === selectedCityId) || defaultCity;
  }, [visibleDirectory, selectedCityId, defaultCity]);

  // Dynamic items for the currently selected city
  const cityListings = useMemo(() => {
    if (!selectedCity) return [];
    return listings.filter((item) =>
      matchesCity(item.city, item.location, item.society, selectedCity)
    );
  }, [selectedCity, listings]);

  const cityProjects = useMemo(() => {
    if (!selectedCity) return [];
    return projects.filter((item) =>
      matchesCity(item.city, item.location, undefined, selectedCity)
    );
  }, [selectedCity, projects]);

  // Tab filtered items
  const displayListings = useMemo(() => {
    if (activeTab === "projects") return [];
    if (activeTab === "commercial") {
      return cityListings.filter((l) => l.type.toLowerCase().includes("commercial"));
    }
    if (activeTab === "residential") {
      return cityListings.filter((l) => !l.type.toLowerCase().includes("commercial"));
    }
    return cityListings;
  }, [cityListings, activeTab]);

  const displayProjects = useMemo(() => {
    if (activeTab === "commercial") return [];
    return cityProjects;
  }, [cityProjects, activeTab]);

  const totalDynamicCount = cityListings.length + cityProjects.length;

  // Fallback listings to show if selected city has 0 listings in database
  const fallbackListings = useMemo(() => {
    if (totalDynamicCount > 0) return [];
    return listings.slice(0, 4);
  }, [totalDynamicCount, listings]);

  // Carousel State & Handlers
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = useCallback(() => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    updateScrollButtons();
    el.addEventListener("scroll", updateScrollButtons, { passive: true });
    window.addEventListener("resize", updateScrollButtons);
    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [updateScrollButtons, visibleDirectory]);

  const scrollCarousel = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    const offset = carouselRef.current.clientWidth * 0.75;
    carouselRef.current.scrollBy({
      left: direction === "left" ? -offset : offset,
      behavior: "smooth",
    });
  };

  const handleEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquireItem || sending) return;
    setSending(true);
    setError("");
    const res = await sendEnquiry({
      source: "city_enquiry",
      phone,
      propertyTitle: enquireItem.title,
      propertyId: enquireItem.id,
      propertyRef: enquireItem.reference,
      website: trap,
    });
    setSending(false);
    if (!res.ok) return setError(res.error);
    setEnquirySuccess(true);
    setTimeout(() => {
      setEnquirySuccess(false);
      setEnquireItem(null);
      setPhone("");
    }, 2500);
  };

  if (visibleDirectory.length === 0) return null;

  return (
    <section data-ui="city-directory" className="py-12 bg-[#fafafa] border-b border-[#aeaeaf]/40">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
        {/* Section Header with Carousel Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
          <div>
            <span className="text-xs font-semibold text-[#008ae8] block mb-1">
              Pan-India Network
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-light tracking-normal text-[#262626]">
              Explore Real Estate in Top Indian <span className="font-serif italic font-normal">Cities</span>
            </h2>
            <p className="text-sm text-[#757577] mt-1">
              Browse verified residential apartments, independent villas, builder floors, and plots across major metro hubs.
            </p>
          </div>

          {/* Carousel Arrow Controls */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => scrollCarousel("left")}
              disabled={!canScrollLeft}
              className={`w-9 h-9 rounded-full border border-[#aeaeaf]/40 flex items-center justify-center transition-all ${
                canScrollLeft
                  ? "bg-white hover:bg-[#e0f2fe] text-[#262626] hover:text-[#008ae8] hover:border-[#008ae8] shadow-xs cursor-pointer active:scale-95"
                  : "bg-[#fafafa] text-[#aeaeaf] opacity-40 cursor-not-allowed"
              }`}
              title="Previous Cities"
              aria-label="Previous Cities"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollCarousel("right")}
              disabled={!canScrollRight}
              className={`w-9 h-9 rounded-full border border-[#aeaeaf]/40 flex items-center justify-center transition-all ${
                canScrollRight
                  ? "bg-white hover:bg-[#e0f2fe] text-[#262626] hover:text-[#008ae8] hover:border-[#008ae8] shadow-xs cursor-pointer active:scale-95"
                  : "bg-[#fafafa] text-[#aeaeaf] opacity-40 cursor-not-allowed"
              }`}
              title="Next Cities"
              aria-label="Next Cities"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* City Cards Carousel Track */}
        <div
          ref={carouselRef}
          className="flex items-stretch gap-3 overflow-x-auto scroll-smooth no-scrollbar py-2 -mx-1 px-1"
        >
          {visibleDirectory.map((c) => {
            const isSelected = selectedCity?.id === c.id;
            const stat = cityStats[c.id];

            return (
              <button
                key={c.id}
                type="button"
                data-ui="city-card"
                onClick={() => {
                  setSelectedCityId(c.id);
                  setActiveTab("all");
                }}
                className={`w-[190px] sm:w-[210px] md:w-[230px] shrink-0 p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between group cursor-pointer ${
                  isSelected
                    ? "border-[#008ae8] bg-[#e0f2fe] ring-2 ring-[#008ae8]/30 shadow-xs"
                    : "border-[#aeaeaf]/40 bg-white hover:border-[#008ae8] hover:bg-[#e0f2fe]/40"
                }`}
              >
                <div>
                  <span
                    className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                      isSelected ? "text-[#008ae8] font-semibold" : "text-[#262626] group-hover:text-[#008ae8]"
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#008ae8] shrink-0" />
                    <span className="truncate">{c.displayName}</span>
                  </span>
                  <span className="text-[11px] text-[#757577] block mt-1 truncate">
                    {c.tagline}
                  </span>
                </div>
                <div
                  className={`mt-4 text-[11px] font-medium ${
                    isSelected ? "text-[#008ae8] font-semibold" : "text-[#008ae8]"
                  }`}
                >
                  {stat?.label || (stat?.count ? `${stat.count} Verified Properties` : "Explore Properties")}
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Data Showcase Drawer for Selected City */}
        {selectedCity && (
          <div
            data-ui="city-dynamic-showcase"
            className="mt-8 bg-white rounded-2xl border border-[#aeaeaf]/40 p-5 sm:p-6 shadow-xs animate-in fade-in duration-200"
          >
            {/* Showcase Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-[#aeaeaf]/30 gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#008ae8] mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Dynamic Live Inventory</span>
                </div>
                <h3 className="text-lg sm:text-xl font-normal text-[#262626] flex items-center gap-2">
                  <span>Properties in {selectedCity.displayName}</span>
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-[4px] bg-[#e0f2fe] text-[#008ae8] border border-[#008ae8]/30">
                    {totalDynamicCount > 0 ? `${totalDynamicCount} Verified Active` : "Verified Portal"}
                  </span>
                </h3>
                <p className="text-xs text-[#757577] mt-0.5">
                  {selectedCity.tagline
                    ? `Featured in ${selectedCity.tagline} & surrounding corridors.`
                    : `Verified apartments, villas, and commercial spaces in ${selectedCity.displayName}.`}
                </p>
              </div>

              {/* View All City Properties Link Button */}
              <div className="flex items-center gap-3">
                <Link
                  href={`/properties?city=${encodeURIComponent(selectedCity.name)}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[4px] text-xs font-medium bg-[#008ae8] hover:bg-[#0077c8] text-white border border-[#008ae8] transition-colors shadow-xs"
                >
                  <span>Explore All {selectedCity.displayName} Properties</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 pt-4 pb-2 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1.5 rounded-[4px] text-xs font-medium transition-colors ${
                  activeTab === "all"
                    ? "bg-[#262626] text-white"
                    : "bg-[#fafafa] text-[#757577] hover:text-[#262626]"
                }`}
              >
                All ({totalDynamicCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("residential")}
                className={`px-3 py-1.5 rounded-[4px] text-xs font-medium transition-colors ${
                  activeTab === "residential"
                    ? "bg-[#262626] text-white"
                    : "bg-[#fafafa] text-[#757577] hover:text-[#262626]"
                }`}
              >
                Residential ({cityListings.filter((l) => !l.type.toLowerCase().includes("commercial")).length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("commercial")}
                className={`px-3 py-1.5 rounded-[4px] text-xs font-medium transition-colors ${
                  activeTab === "commercial"
                    ? "bg-[#262626] text-white"
                    : "bg-[#fafafa] text-[#757577] hover:text-[#262626]"
                }`}
              >
                Commercial ({cityListings.filter((l) => l.type.toLowerCase().includes("commercial")).length})
              </button>
              {cityProjects.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab("projects")}
                  className={`px-3 py-1.5 rounded-[4px] text-xs font-medium transition-colors ${
                    activeTab === "projects"
                      ? "bg-[#262626] text-white"
                      : "bg-[#fafafa] text-[#757577] hover:text-[#262626]"
                  }`}
                >
                  Projects ({cityProjects.length})
                </button>
              )}
            </div>

            {/* Dynamic Items Cards Grid */}
            {totalDynamicCount > 0 ? (
              displayListings.length === 0 && displayProjects.length === 0 ? (
                <div className="py-8 text-center bg-[#fafafa] rounded-xl border border-[#aeaeaf]/40 mt-4">
                  <Building className="w-8 h-8 text-[#757577] mx-auto mb-2 opacity-60" />
                  <p className="text-sm font-medium text-[#262626]">
                    No {activeTab} properties found in {selectedCity.displayName}
                  </p>
                  <p className="text-xs text-[#757577] mt-1">
                    Explore all {totalDynamicCount} available verified properties in {selectedCity.displayName}.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("all")}
                    className="mt-3 px-3 py-1.5 rounded-[4px] text-xs font-medium bg-[#008ae8] text-white hover:bg-[#0077c8]"
                  >
                    View All {totalDynamicCount} Properties
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                  {/* Active Listings */}
                  {displayListings.map((item) => (
                    <div
                      key={item.id}
                      className="bg-[#fafafa] rounded-2xl border border-[#aeaeaf]/40 hover:border-[#008ae8] overflow-hidden transition-all duration-200 flex flex-col group"
                    >
                      <div className="relative aspect-16/10 bg-white overflow-hidden">
                        <CmsImage
                          src={item.image}
                          alt={item.title}
                          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, 50vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                          {item.verified && <VerifiedBadge />}
                          <span className="inline-block px-2 py-0.5 rounded-[4px] text-[10px] font-medium bg-[#1c1c1e]/80 text-white">
                            {item.type}
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 flex-1 flex flex-col justify-between bg-white">
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <strong className="text-base font-light text-[#262626]">
                              {item.price}
                            </strong>
                            <span className="text-[11px] text-[#757577]">
                              {item.pricePerSqFt}
                            </span>
                          </div>
                          <h4 className="text-xs font-medium text-[#262626] group-hover:text-[#008ae8] transition-colors line-clamp-1">
                            {item.title}
                          </h4>
                          <p className="flex items-center gap-1 text-[11px] text-[#757577] mt-1 truncate">
                            <MapPin className="w-3 h-3 text-[#008ae8] shrink-0" />
                            <span>{item.location || item.society || selectedCity.displayName}</span>
                          </p>

                          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#aeaeaf]/30 text-[11px] text-[#757577]">
                            {item.bhk > 0 && <span>{item.bhk} BHK</span>}
                            {item.bhk > 0 && item.area && <span>•</span>}
                            {item.area && <span>{item.area}</span>}
                            {item.possession && <span>•</span>}
                            {item.possession && <span className="truncate">{item.possession}</span>}
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-[#aeaeaf]/30 grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setEnquireItem({
                                id: item.id,
                                reference: item.reference,
                                title: item.title,
                                location: item.location || selectedCity.displayName,
                                price: item.price,
                                image: item.image,
                              })
                            }
                            className="w-full py-1.5 px-2 rounded-[4px] text-[11px] font-medium bg-[#fafafa] hover:bg-[#e0f2fe] text-[#262626] border border-[#aeaeaf]/40 flex items-center justify-center gap-1 transition-colors"
                          >
                            <PhoneCall className="w-3 h-3 text-[#008ae8]" />
                            Enquire
                          </button>
                          <Link
                            href={`/property/${item.id}`}
                            className="w-full py-1.5 px-2 rounded-[4px] text-[11px] font-medium bg-[#008ae8] hover:bg-[#0077c8] text-white border border-[#008ae8] flex items-center justify-center gap-1 transition-colors"
                          >
                            Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Active Projects */}
                  {displayProjects.map((proj) => (
                    <div
                      key={proj.id}
                      className="bg-[#fafafa] rounded-2xl border border-[#aeaeaf]/40 hover:border-[#008ae8] overflow-hidden transition-all duration-200 flex flex-col group"
                    >
                      <div className="relative aspect-16/10 bg-white overflow-hidden">
                        <CmsImage
                          src={proj.image}
                          alt={proj.name}
                          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, 50vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-medium bg-[#1c1c1e] text-white">
                            Project
                          </span>
                          {proj.tag && (
                            <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-medium bg-[#008ae8] text-white">
                              {proj.tag}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-3.5 flex-1 flex flex-col justify-between bg-white">
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <strong className="text-base font-light text-[#262626]">
                              {proj.price}
                            </strong>
                            <span className="text-[11px] text-[#757577]">
                              By {proj.builder}
                            </span>
                          </div>
                          <h4 className="text-xs font-medium text-[#262626] group-hover:text-[#008ae8] transition-colors line-clamp-1">
                            {proj.name}
                          </h4>
                          <p className="flex items-center gap-1 text-[11px] text-[#757577] mt-1 truncate">
                            <MapPin className="w-3 h-3 text-[#008ae8] shrink-0" />
                            <span>{proj.location}, {selectedCity.displayName}</span>
                          </p>

                          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#aeaeaf]/30 text-[11px] text-[#757577]">
                            <span>{proj.bhk}</span>
                            <span>•</span>
                            <span className="truncate">{proj.possession}</span>
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-[#aeaeaf]/30 grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setEnquireItem({
                                id: proj.id,
                                title: proj.name,
                                location: proj.location,
                                price: proj.price,
                                image: proj.image,
                              })
                            }
                            className="w-full py-1.5 px-2 rounded-[4px] text-[11px] font-medium bg-[#fafafa] hover:bg-[#e0f2fe] text-[#262626] border border-[#aeaeaf]/40 flex items-center justify-center gap-1 transition-colors"
                          >
                            <PhoneCall className="w-3 h-3 text-[#008ae8]" />
                            Enquire
                          </button>
                          <Link
                            href={`/project/${proj.id}`}
                            className="w-full py-1.5 px-2 rounded-[4px] text-[11px] font-medium bg-[#008ae8] hover:bg-[#0077c8] text-white border border-[#008ae8] flex items-center justify-center gap-1 transition-colors"
                          >
                            Project
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              /* When this particular city has 0 direct entries in current database, show live properties across portal */
              <div className="mt-4">
                <div className="p-4 rounded-xl bg-[#e0f2fe]/30 border border-[#008ae8]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-start gap-2.5">
                    <Building className="w-4 h-4 text-[#008ae8] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-[#262626]">
                        Direct verified listings for {selectedCity.displayName} are currently in verification stage.
                      </p>
                      <p className="text-[11px] text-[#757577] mt-0.5">
                        Browse verified properties across India below, or post your {selectedCity.displayName} property for free.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/post-property"
                    className="px-3 py-1.5 rounded-[4px] text-xs font-medium bg-[#008ae8] hover:bg-[#0077c8] text-white whitespace-nowrap self-start sm:self-auto"
                  >
                    Post Property Free
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {fallbackListings.map((item) => (
                    <div
                      key={item.id}
                      className="bg-[#fafafa] rounded-2xl border border-[#aeaeaf]/40 hover:border-[#008ae8] overflow-hidden transition-all duration-200 flex flex-col group"
                    >
                      <div className="relative aspect-16/10 bg-white overflow-hidden">
                        <CmsImage
                          src={item.image}
                          alt={item.title}
                          sizes="(min-width: 1024px) 25vw, 50vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                          {item.verified && <VerifiedBadge />}
                          <span className="inline-block px-2 py-0.5 rounded-[4px] text-[10px] font-medium bg-[#1c1c1e]/80 text-white">
                            {item.city}
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 flex-1 flex flex-col justify-between bg-white">
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <strong className="text-base font-light text-[#262626]">
                              {item.price}
                            </strong>
                            <span className="text-[11px] text-[#757577]">
                              {item.pricePerSqFt}
                            </span>
                          </div>
                          <h4 className="text-xs font-medium text-[#262626] group-hover:text-[#008ae8] transition-colors line-clamp-1">
                            {item.title}
                          </h4>
                          <p className="flex items-center gap-1 text-[11px] text-[#757577] mt-1 truncate">
                            <MapPin className="w-3 h-3 text-[#008ae8] shrink-0" />
                            <span>{item.location || item.city}</span>
                          </p>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-[#aeaeaf]/30 grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setEnquireItem({
                                id: item.id,
                                reference: item.reference,
                                title: item.title,
                                location: item.location || item.city,
                                price: item.price,
                                image: item.image,
                              })
                            }
                            className="w-full py-1.5 px-2 rounded-[4px] text-[11px] font-medium bg-[#fafafa] hover:bg-[#e0f2fe] text-[#262626] border border-[#aeaeaf]/40 flex items-center justify-center gap-1 transition-colors"
                          >
                            <PhoneCall className="w-3 h-3 text-[#008ae8]" />
                            Enquire
                          </button>
                          <Link
                            href={`/property/${item.id}`}
                            className="w-full py-1.5 px-2 rounded-[4px] text-[11px] font-medium bg-[#008ae8] hover:bg-[#0077c8] text-white border border-[#008ae8] flex items-center justify-center gap-1 transition-colors"
                          >
                            Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Instant Callback Enquiry Modal */}
      {enquireItem && (
        <div
          data-ui="enquiry-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#262626]/80 animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative border border-[#aeaeaf]/40 text-[#262626]">
            <button
              type="button"
              onClick={() => setEnquireItem(null)}
              className="absolute top-4 right-4 p-1 rounded-full text-[#757577] hover:text-[#262626] hover:bg-[#fafafa]"
            >
              <X className="w-5 h-5" />
            </button>

            {enquirySuccess ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-16 h-16 text-[#008ae8] mx-auto mb-3" />
                <h4 className="text-xl font-light text-[#262626]">Enquiry Received!</h4>
                <p className="text-sm text-[#757577] mt-1">
                  Our verified property advisor will contact you shortly on +91 {phone}.
                </p>
              </div>
            ) : (
              <div>
                <div data-ui="modal-head" className="flex items-center gap-3 mb-4 pb-4 border-b border-[#aeaeaf]/30">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[#fafafa]">
                    <CmsImage src={enquireItem.image} alt={enquireItem.title} sizes="64px" className="object-cover" />
                  </div>
                  <div>
                    <h4 className="text-base font-normal text-[#262626] leading-tight truncate">
                      {enquireItem.title}
                    </h4>
                    <p className="text-xs text-[#757577] mt-0.5">{enquireItem.location}</p>
                    <span className="text-xs font-medium text-[#008ae8]">{enquireItem.price}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <h5 className="text-sm font-medium text-[#262626]">Request Instant Callback</h5>
                  <p className="text-xs text-[#757577] mt-0.5">
                    Receive verified property documents, floor plans, and price negotiations directly on WhatsApp.
                  </p>
                </div>

                <form onSubmit={handleEnquiry} className="relative space-y-3">
                  <EnquiryHoneypot value={trap} onChange={setTrap} />
                  <div>
                    <label className="block text-xs font-semibold text-[#262626] mb-1">
                      Your Mobile Number
                    </label>
                    <div className="flex rounded-[4px] border border-[#aeaeaf]/40 overflow-hidden focus-within:border-[#008ae8]">
                      <span className="bg-[#fafafa] px-3 py-2 text-sm font-semibold text-[#262626] border-r border-[#aeaeaf]/40">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        pattern="[0-9]{10}"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter 10-digit number"
                        className="w-full px-3 py-2 text-sm focus:outline-hidden bg-white text-[#262626]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#757577]">
                    <ShieldCheck className="w-4 h-4 text-[#008ae8] shrink-0" />
                    <span>Your privacy is protected. No spam calls.</span>
                  </div>

                  {error && <p role="alert" className="text-xs font-medium text-[#E4572E]">{error}</p>}
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full py-2.5 px-4 rounded-[4px] font-medium text-white bg-[#008ae8] hover:bg-[#0077c8] border border-[#008ae8] transition-colors shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {sending ? "Sending..." : "Confirm Callback Request"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
