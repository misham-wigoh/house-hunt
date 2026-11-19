"use client";

import { useState } from "react";
import Link from "next/link";
import { TrendingUp, ArrowUpRight } from "lucide-react";
import { CmsImage } from "./cms-image";
import { useLocation, usePrioritized } from "@/components/location/location-context";
import { isLocalCity } from "@/lib/location/resolve";
import type { LocalityItem } from "@/lib/cms/types";

const hasListings = (loc: LocalityItem) => {
  const str = (loc.totalListings || "").toLowerCase().trim();
  return !str.startsWith("0 ") && str !== "0";
};

export function PopularLocalities({ localities: allLocalities }: { localities: LocalityItem[] }) {
  const { location } = useLocation();
  // The visitor's city comes first, in the cards and in the filter pills.
  const localities = usePrioritized(allLocalities, "city");
  const [pickedFilter, setPickedFilter] = useState<string | null>(null);
  const cityFilters = ["All Cities", ...Array.from(new Set(localities.map((l) => l.city).filter(Boolean)))];

  // Until the visitor picks a pill, open on their own city when it is a single city (not a multi-city market like NCR).
  const localCities = Array.from(new Set(localities.filter((l) => hasListings(l) && isLocalCity(location, l.city)).map((l) => l.city)));
  const activeFilter = pickedFilter ?? (localCities.length === 1 ? localCities[0] : "All Cities");
  const setActiveFilter = setPickedFilter;

  const filteredLocalities = (
    activeFilter === "All Cities"
      ? localities
      : localities.filter((l) => l.city.toLowerCase() === activeFilter.toLowerCase())
  ).filter(hasListings);

  return (
    <section data-ui="popular-localities" className="py-12 bg-[#fafafa] border-b border-[#aeaeaf]/40">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
        {/* Header & Filter Pills */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#008ae8] mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Locality Insights &amp; Price Trends</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-light tracking-normal text-[#262626]">
              Explore Popular Real Estate <span className="font-serif italic font-normal text-[#008ae8]">Hubs</span>
            </h2>
            <p className="text-sm text-[#757577] mt-1">
              Track average price/sq.ft and annual capital appreciation across India&apos;s top markets.
            </p>
          </div>

          {/* City Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {cityFilters.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => setActiveFilter(city)}
                className={`px-3 py-1.5 rounded-[4px] text-xs font-medium whitespace-nowrap transition-colors ${activeFilter === city
                  ? "bg-[#008ae8] text-white border border-[#008ae8] shadow-xs"
                  : "bg-white text-[#262626] border border-[#aeaeaf]/40 hover:bg-[#e0f2fe]"
                  }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Localities Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLocalities.map((loc) => (
            <Link
              key={loc.id}
              data-ui="locality-card"
              href={`/properties?q=${encodeURIComponent(loc.name)}`}
              className="group flex gap-4 rounded-2xl border border-[#aeaeaf]/40 bg-white p-3 hover:border-[#008ae8] transition-colors"
            >
              <div className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-xl bg-[#fafafa]">
                <CmsImage
                  src={loc.image}
                  alt={loc.name}
                  sizes="112px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    {loc.tag && (
                      <span className="mb-1 inline-block rounded-[4px] bg-[#e0f2fe] px-2 py-0.5 text-[10px] font-medium text-[#008ae8]">
                        {loc.tag}
                      </span>
                    )}
                    <h3 className="truncate text-base font-normal text-[#262626] group-hover:text-[#008ae8] transition-colors">
                      {loc.name}
                    </h3>
                    <p className="text-xs text-[#757577]">{loc.city}</p>
                  </div>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#aeaeaf]/40 text-[#757577] group-hover:border-[#008ae8] group-hover:text-[#008ae8] transition-colors">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-[#aeaeaf]/40 pt-2">
                  <div>
                    <span className="block text-[10px] uppercase text-[#757577]">Avg. rate</span>
                    <strong className="text-sm font-light text-[#262626]">{loc.avgPrice}</strong>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] uppercase text-[#757577]">{loc.totalListings}</span>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-[#008ae8]">
                      <TrendingUp className="h-3 w-3" />
                      {loc.growth} YoY
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
