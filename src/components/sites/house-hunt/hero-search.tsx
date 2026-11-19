"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  ChevronDown,
  Building,
  Home,
  Briefcase,
  Layers,
  Sparkles,
  Check,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  ArrowRight,
} from "lucide-react";
import { useLocation, usePrioritized } from "@/components/location/location-context";
import { isLocalCity } from "@/lib/location/resolve";
import type { HeroBanner, SearchOptions } from "@/lib/cms/types";

const SEARCH_TABS = [
  { id: "buy", label: "Buy", icon: Home },
  { id: "rent", label: "Rent", icon: Building },
  { id: "new-projects", label: "New Projects", icon: Sparkles, hot: true },
  { id: "commercial", label: "Commercial", icon: Briefcase },
  { id: "plots", label: "Plots / Land", icon: Layers },
  { id: "pg", label: "PG / Co-living", icon: Building },
];

const BUDGET_OPTIONS = [
  { label: "Any Budget", value: "all" },
  { label: "Under ₹50 Lac", value: "0-50" },
  { label: "₹50 Lac - ₹1 Cr", value: "50-100" },
  { label: "₹1 Cr - ₹2 Cr", value: "100-200" },
  { label: "₹2 Cr - ₹5 Cr", value: "200-500" },
  { label: "₹5 Cr+", value: "500+" },
];

const SLIDE_DURATION_MS = 10000;
/** With a banner set per city the list gets long; keep the slider and thumbnail rail to a handful. */
const MAX_HERO_SLIDES = 8;

export function HeroSearch({
  slides,
  searchOptions,
}: {
  slides: HeroBanner[];
  searchOptions: SearchOptions;
}) {
  // Banners and locality suggestions from the visitor's city come first.
  const { location } = useLocation();
  const prioritizedSlides = usePrioritized(slides, "city");
  // Every banner from the visitor's own city is kept (even above the cap); other cities fill the rest.
  const HERO_SLIDES = useMemo(() => {
    const localCount = prioritizedSlides.filter((s) => isLocalCity(location, s.city)).length;
    return prioritizedSlides.slice(0, Math.max(MAX_HERO_SLIDES, localCount));
  }, [prioritizedSlides, location]);
  const PROPERTY_TYPES = searchOptions.propertyTypes;
  const LOCALITY_SUGGESTIONS = usePrioritized(searchOptions.localities, "city");
  const router = useRouter();

  // Slider State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Search State
  const [activeTab, setActiveTab] = useState("buy");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(() => {
    const preferred = PROPERTY_TYPES.find((t) => t.toLowerCase().startsWith("flat")) ?? PROPERTY_TYPES[0];
    return preferred ? [preferred] : [];
  });
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(BUDGET_OPTIONS[0]);
  const [budgetDropdownOpen, setBudgetDropdownOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const railRef = useRef<HTMLDivElement>(null);

  // Navigation handlers
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (HERO_SLIDES.length ? (prev + 1) % HERO_SLIDES.length : 0));
  }, [HERO_SLIDES.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (HERO_SLIDES.length ? (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length : 0));
  }, [HERO_SLIDES.length]);

  // Autoplay effect - advances every 10 seconds, resets on slide change
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, SLIDE_DURATION_MS);

    return () => clearInterval(interval);
  }, [isPaused, nextSlide, currentSlide]);

  // Keep the active card at the start of the rail (horizontal scroll only, the page never moves)
  useEffect(() => {
    const rail = railRef.current;
    const card = rail?.children[currentSlide] as HTMLElement | undefined;
    if (!rail || !card) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    rail.scrollTo({ left: Math.max(0, card.offsetLeft - 4), behavior: reduce ? "auto" : "smooth" });
  }, [currentSlide]);

  // Touch Swipe Handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  // Quick action from slide pill
  const handleSelectSlideLocality = (slide: HeroBanner) => {
    setSearchQuery(`${slide.locality}`);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const togglePropertyType = (type: string) => {
    if (selectedTypes.includes(type)) {
      if (selectedTypes.length > 1) {
        setSelectedTypes(selectedTypes.filter((t) => t !== type));
      }
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    params.set("tab", activeTab);
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (selectedTypes.length > 0) params.set("type", selectedTypes.join(","));
    if (selectedBudget.value !== "all") params.set("budget", selectedBudget.value);
    router.push(`/properties?${params.toString()}`);
  };

  const activeSlideData: HeroBanner | undefined = HERO_SLIDES[currentSlide];

  return (
    <section
      className="relative bg-[#262626] text-white min-h-[640px] md:min-h-[720px] flex flex-col justify-between"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Featured Properties Slider"
    >
      {/* Background: crossfading slides with a slow zoom (photos come from the CMS banners) */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#1c1c1e]">
        {HERO_SLIDES.map((slide, index) => {
          const isCurrent = index === currentSlide;
          const isEager = index === 0 || isCurrent;
          return (
            <div
              key={slide.id}
              aria-hidden={!isCurrent}
              className={`absolute inset-0 transition-opacity duration-1000 ease-out ${isCurrent ? "opacity-100" : "opacity-0"}`}
            >
              <div
                key={isCurrent ? `${slide.id}-on` : `${slide.id}-off`}
                className={`absolute inset-0 will-change-transform ${isCurrent ? "animate-hero-zoom" : ""}`}
                style={{ animationPlayState: isPaused ? "paused" : "running" }}
              >
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority={isEager}
                  loading={isEager ? "eager" : "lazy"}
                  className="object-cover object-center"
                  sizes="100vw"
                />
              </div>
            </div>
          );
        })}
        {/* Left-to-right scrim keeps the copy readable while the photo stays visible on the right */}
        <div className="absolute inset-0 bg-linear-to-r from-[#1c1c1e]/90 via-[#1c1c1e]/55 to-[#1c1c1e]/15" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-[#1c1c1e]/80 to-transparent" />
      </div>

      {/* Stage: headline + active slide on the left, slide rail on the right */}
      <div className="relative z-30 max-w-[1920px] mx-auto w-full px-4 sm:px-6 lg:px-8 2xl:px-12 pt-10 sm:pt-16 pb-6 sm:pb-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
        <div className="lg:col-span-7">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-light tracking-normal text-white leading-tight">
            Find a home you&apos;ll <span className="font-serif italic font-normal text-[#008ae8]">love</span> across India.
          </h1>
          <p className="mt-3 text-base sm:text-lg text-white/80 font-normal max-w-xl">
            Explore 1,200,000+ verified owner properties, upcoming residential townships, and prime commercial spaces.
          </p>

          {activeSlideData && (
            <div
              key={activeSlideData.id}
              data-ui="featured-hud"
              className="mt-7 max-w-xl animate-in fade-in slide-in-from-bottom-2 duration-500"
            >
              {activeSlideData.badge && (
                <span className="inline-block rounded-[4px] border border-white/25 bg-[#1c1c1e]/50 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
                  {activeSlideData.badge}
                </span>
              )}
              <h2 className="mt-3 text-2xl sm:text-3xl font-light text-white leading-snug">
                {activeSlideData.title}
              </h2>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/85">
                <MapPin className="w-4 h-4 text-[#008ae8] shrink-0" />
                <span>{activeSlideData.locality}</span>
                {activeSlideData.specs && (
                  <>
                    <span className="text-white/40">·</span>
                    <span>{activeSlideData.specs}</span>
                  </>
                )}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
                {activeSlideData.price && (
                  <span className="text-2xl font-light text-white">{activeSlideData.price}</span>
                )}
                <button
                  type="button"
                  onClick={() => handleSelectSlideLocality(activeSlideData)}
                  className="py-2.5 px-4 rounded-[4px] bg-[#008ae8] hover:bg-[#0077c8] text-xs sm:text-sm font-medium text-white flex items-center gap-1.5 transition-colors border border-[#008ae8]"
                >
                  <span>Search in this locality</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {HERO_SLIDES.length > 1 && (
          <div className="lg:col-span-5 min-w-0">
            <div className="mb-3 flex items-center justify-between text-white/85">
              <span className="text-xs tabular-nums" aria-live="polite">
                {String(currentSlide + 1).padStart(2, "0")} / {String(HERO_SLIDES.length).padStart(2, "0")}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaused(!isPaused)}
                  className="w-8 h-8 rounded-full border border-white/25 bg-[#1c1c1e]/50 hover:bg-[#1c1c1e] text-white flex items-center justify-center backdrop-blur-md transition-colors"
                  title={isPaused ? "Play slide rotation" : "Pause slide rotation"}
                  aria-label={isPaused ? "Play slide rotation" : "Pause slide rotation"}
                >
                  {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={prevSlide}
                  className="w-8 h-8 rounded-full border border-white/25 bg-[#1c1c1e]/50 hover:bg-[#1c1c1e] text-white flex items-center justify-center backdrop-blur-md transition-colors"
                  title="Previous property slide"
                  aria-label="Previous property slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  className="w-8 h-8 rounded-full border border-white/25 bg-[#1c1c1e]/50 hover:bg-[#1c1c1e] text-white flex items-center justify-center backdrop-blur-md transition-colors"
                  title="Next property slide"
                  aria-label="Next property slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              ref={railRef}
              role="tablist"
              aria-label="Featured properties"
              className="relative flex gap-3 overflow-x-auto no-scrollbar py-1 -mx-1 px-1"
              style={{
                maskImage: "linear-gradient(to right, black calc(100% - 36px), transparent)",
                WebkitMaskImage: "linear-gradient(to right, black calc(100% - 36px), transparent)",
              }}
            >
              {HERO_SLIDES.map((slide, idx) => {
                const isCurrent = idx === currentSlide;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    role="tab"
                    aria-selected={isCurrent}
                    aria-label={`Show ${slide.title}`}
                    onClick={() => setCurrentSlide(idx)}
                    className={`group relative h-40 w-24 sm:w-28 shrink-0 overflow-hidden rounded-xl text-left transition-all duration-300 ${
                      isCurrent ? "ring-2 ring-white" : "opacity-75 hover:opacity-100"
                    }`}
                  >
                    <Image src={slide.image} alt="" fill sizes="128px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <span aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-[#1c1c1e]/85 via-[#1c1c1e]/10 to-transparent" />
                    <span className="absolute inset-x-2 bottom-3 text-white">
                      <span className="block text-[11px] font-medium leading-tight">{slide.shortName}</span>
                      {slide.price && <span className="block text-[11px] text-white/80">{slide.price}</span>}
                    </span>
                    {isCurrent && (
                      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1 bg-white/25">
                        <span
                          key={currentSlide}
                          className="block h-full bg-[#008ae8]"
                          style={{ animation: !isPaused ? `heroProgress ${SLIDE_DURATION_MS}ms linear forwards` : "none" }}
                        />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Lower Hero: Integrated Search Panel */}
      <div className="relative z-30 max-w-[1920px] mx-auto w-full px-4 sm:px-6 lg:px-8 2xl:px-12 pb-8 sm:pb-12">
        <div data-ui="search-panel" className="bg-white rounded-2xl p-4 sm:p-6 text-[#262626] border border-[#aeaeaf]/40 shadow-2xl">
          {/* Search Category Tabs */}
          <div className="flex items-center gap-1 sm:gap-2 pb-3 overflow-x-auto no-scrollbar">
            {SEARCH_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-[4px] text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${isActive
                    ? "bg-[#008ae8] text-white shadow-xs"
                    : "text-[#262626] hover:text-[#008ae8] hover:bg-[#fafafa]"
                    }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                  {tab.hot && (
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-[4px] bg-[#1c1c1e] text-[#008ae8]"
                    >
                      NEW
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Form Inputs Grid */}
          <form onSubmit={handleSearch} className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Location Autocomplete Input (6 cols) */}
            <div className="relative md:col-span-6">
              <div className="flex items-center bg-[#fafafa] rounded-xl px-3.5 py-2.5 border border-[#aeaeaf]/40 focus-within:border-[#008ae8] focus-within:ring-2 focus-within:ring-[#008ae8]/20 transition-colors">
                <MapPin className="w-5 h-5 text-[#008ae8] shrink-0 mr-2.5" />
                <div className="w-full">
                  <label htmlFor="hero-search-input" className="block text-xs font-semibold text-[#757577] leading-none">
                    City, Locality, or Project Name
                  </label>
                  <input
                    id="hero-search-input"
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => {
                      setShowSuggestions(true);
                      setIsPaused(true);
                    }}
                    onBlur={() => {
                      setIsPaused(false);
                    }}
                    placeholder="e.g. Chennai, 3 BHK, under 1.5 Cr"
                    className="w-full bg-transparent text-sm font-semibold text-[#262626] placeholder-[#757577]/60 focus:outline-hidden pt-1"
                  />
                </div>
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowSuggestions(false)}
                  />
                  <div data-ui="dropdown" className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-2xl border border-[#aeaeaf]/40 py-2 z-50 max-h-72 overflow-y-auto">
                    <div className="px-3.5 py-1.5 text-xs font-semibold text-[#757577]">
                      Popular Localities
                    </div>
                    {LOCALITY_SUGGESTIONS.filter((s) =>
                      s.name.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map((loc, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSearchQuery(`${loc.name}, ${loc.city}`);
                          setShowSuggestions(false);
                        }}
                        className="w-full px-3.5 py-2 text-left hover:bg-[#fafafa] flex items-center justify-between transition-colors"
                      >
                        <div>
                          <div className="text-sm font-semibold text-[#262626]">{loc.name}</div>
                          <div className="text-xs text-[#757577]">{loc.city}</div>
                        </div>
                        <span className="text-xs text-[#008ae8] font-semibold bg-[#e0f2fe] px-2 py-0.5 rounded border border-[#008ae8]/20">
                          {loc.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Property Type Dropdown (3 cols) */}
            <div className="relative md:col-span-3">
              <button
                type="button"
                onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
                className="w-full flex items-center justify-between bg-[#fafafa] rounded-xl px-3.5 py-2.5 border border-[#aeaeaf]/40 hover:border-[#008ae8] transition-colors text-left"
              >
                <div>
                  <span className="block text-xs font-semibold text-[#757577] leading-none">
                    Property Type
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-[#262626] truncate block mt-1">
                    {selectedTypes.length === 1
                      ? selectedTypes[0]
                      : `${selectedTypes.length} Types Selected`}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-[#757577] shrink-0" />
              </button>

              {typeDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setTypeDropdownOpen(false)}
                  />
                  <div data-ui="dropdown" className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-2xl border border-[#aeaeaf]/40 p-2 z-50 space-y-1">
                    {PROPERTY_TYPES.map((type) => {
                      const isChecked = selectedTypes.includes(type);
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => togglePropertyType(type)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-left transition-colors ${isChecked
                            ? "bg-[#e0f2fe] text-[#008ae8]"
                            : "text-[#262626] hover:bg-[#fafafa]"
                            }`}
                        >
                          <span>{type}</span>
                          {isChecked && <Check className="w-4 h-4 text-[#008ae8]" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Budget Range (2 cols) */}
            <div className="relative md:col-span-2">
              <button
                type="button"
                onClick={() => setBudgetDropdownOpen(!budgetDropdownOpen)}
                className="w-full flex items-center justify-between bg-[#fafafa] rounded-xl px-3.5 py-2.5 border border-[#aeaeaf]/40 hover:border-[#008ae8] transition-colors text-left"
              >
                <div>
                  <span className="block text-xs font-semibold text-[#757577] leading-none">
                    Budget
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-[#262626] truncate block mt-1">
                    {selectedBudget.label}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-[#757577] shrink-0" />
              </button>

              {budgetDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setBudgetDropdownOpen(false)}
                  />
                  <div data-ui="dropdown" className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-2xl border border-[#aeaeaf]/40 py-1.5 z-50">
                    {BUDGET_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setSelectedBudget(opt);
                          setBudgetDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-[#fafafa] transition-colors ${selectedBudget.value === opt.value
                          ? "bg-[#e0f2fe] text-[#008ae8] font-bold"
                          : "text-[#262626]"
                          }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Search Submit CTA in Solid Aave Violet */}
            <div className="md:col-span-1">
              <button
                type="submit"
                className="w-full h-13 bg-[#008ae8] hover:bg-[#0077c8] text-white font-medium rounded-[4px] border border-[#008ae8] flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                title="Search Properties"
                aria-label="Search Properties"
              >
                <Search className="w-5 h-5" />
                <span className="md:hidden font-semibold">Search</span>
              </button>
            </div>
          </form>

          {/* Quick Filters Row */}
          <div className="mt-4 pt-3 flex items-center gap-2 flex-wrap text-xs text-[#757577]">
            <span className="font-semibold text-[#262626]">Quick Searches:</span>
            {[
              "Ready to Move",
              "Owner Properties",
              "Luxury Condos",
              "Studio Flats",
              "Gated Societies",
            ].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setSearchQuery(tag);
                  router.push(`/properties?q=${encodeURIComponent(tag)}`);
                }}
                className="px-2.5 py-1 rounded-full bg-[#fafafa] hover:bg-[#e0f2fe] text-[#262626] font-medium transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
