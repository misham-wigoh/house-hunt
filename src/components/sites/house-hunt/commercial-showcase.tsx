"use client";

import Link from "next/link";
import { ArrowRight, MapPin, Briefcase } from "lucide-react";
import { CmsImage } from "./cms-image";
import { useLocalFirst } from "@/components/location/location-context";
import type { Listing } from "@/lib/cms/types";

export function CommercialShowcase({ listings, pool = listings }: { listings: Listing[]; pool?: Listing[] }) {
  const shownListings = useLocalFirst(listings, pool, "city", 3);
  return (
    <section data-ui="commercial-showcase" className="py-12 bg-[#262626] text-white">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#008ae8] mb-1">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Enterprise &amp; Investment Portfolios</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-light tracking-normal text-white">
              Commercial Properties &amp; <span className="font-serif italic font-normal">Offices</span>
            </h2>
            <p className="text-sm text-[#aeaeaf] mt-1">
              High-yield corporate offices, retail spaces, and warehousing hubs across India.
            </p>
          </div>
          <Link
            href="/properties?type=commercial"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#008ae8] hover:text-[#0077c8] self-start md:self-auto group"
          >
            <span>Browse All Commercial Listings</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {shownListings.map((comm) => (
            <div
              key={comm.id}
              data-ui="commercial-card"
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1c1c1e] p-3 hover:border-[#008ae8] transition-colors"
            >
              <div className="relative aspect-16/10 overflow-hidden rounded-xl bg-[#262626]">
                <CmsImage
                  src={comm.image}
                  alt={comm.title}
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute bottom-3 left-3 rounded-[4px] border border-white/20 bg-[#1c1c1e]/50 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-md">
                  {comm.badge || comm.possession}
                </span>
              </div>

              <div className="flex flex-1 flex-col px-2 pt-4">
                <h3 className="text-base font-normal text-white group-hover:text-[#008ae8] transition-colors">
                  {comm.society || comm.title}
                </h3>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-[#aeaeaf]">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-[#008ae8]" />
                  <span>{comm.location}{comm.city ? `, ${comm.city}` : ""}</span>
                </p>

                <div data-ui="specs" className="mt-3 flex flex-wrap gap-1.5">
                  {[comm.area, comm.furnishing].filter(Boolean).map((chip) => (
                    <span key={chip} className="rounded-[4px] border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white">
                      {chip}
                    </span>
                  ))}
                </div>

                {/* Ticket divider: dashed line with notches at the card edges */}
                <div aria-hidden="true" className="relative my-4">
                  <div className="border-t border-dashed border-white/20" />
                  <span className="absolute -left-7 -top-2 h-4 w-4 rounded-full bg-[#262626]" />
                  <span className="absolute -right-7 -top-2 h-4 w-4 rounded-full bg-[#262626]" />
                </div>

                <div data-ui="action" className="mt-auto flex items-center justify-between pb-2">
                  <div>
                    <span className="block text-[11px] text-[#aeaeaf]">{comm.listingType === "sale" ? "Price" : "Rent"}</span>
                    <strong className="text-xl font-light text-[#008ae8]">{comm.price}</strong>
                  </div>
                  <Link
                    href={`/property/${comm.id}`}
                    aria-label={`View details of ${comm.title}`}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#008ae8] text-white hover:bg-[#0077c8] transition-colors"
                  >
                    <ArrowRight className="h-4 w-4 -rotate-45" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
