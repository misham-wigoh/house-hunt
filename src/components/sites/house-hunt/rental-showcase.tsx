"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  PhoneCall,
  CheckCircle2,
  X,
  ArrowRight,
  KeyRound,
} from "lucide-react";
import { CmsImage } from "./cms-image";
import { EnquiryHoneypot } from "./enquiry-honeypot";
import { sendEnquiry } from "@/lib/enquiry";
import type { Listing } from "@/lib/cms/types";

export function RentalShowcase({ listings }: { listings: Listing[] }) {
  const [selectedRental, setSelectedRental] = useState<Listing | null>(null);
  const [phone, setPhone] = useState("");
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [trap, setTrap] = useState("");

  const handleEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRental || sending) return;
    setSending(true);
    setError("");
    const res = await sendEnquiry({
      source: "listing_contact",
      phone,
      propertyTitle: selectedRental.title,
      propertyId: selectedRental.id,
      propertyRef: selectedRental.reference,
      dealer: selectedRental.dealerName,
      website: trap,
    });
    setSending(false);
    if (!res.ok) return setError(res.error);
    setEnquirySuccess(true);
    setTimeout(() => {
      setEnquirySuccess(false);
      setSelectedRental(null);
      setPhone("");
    }, 2500);
  };

  const displayListings = (listings || []).slice(0, 4);

  return (
    <section id="rental-homes" data-ui="rental-showcase" className="py-10 sm:py-12 bg-white border-b border-[#aeaeaf]/40">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#008ae8] mb-1">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Zero-Brokerage Rentals</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-light tracking-normal text-[#262626]">
              Verified Homes &amp; Flats for <span className="font-serif italic font-normal text-[#008ae8]">Rent</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#757577] mt-1">
              Direct owner flats, independent houses, and fully-managed co-living spaces with doorstep biometric agreements.
            </p>
          </div>
          <Link
            href="/properties?intent=rent"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#008ae8] hover:text-[#0077c8] self-start sm:self-auto group"
          >
            <span>Explore All Rental Homes</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 4-Card Rental Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {displayListings.map((item) => (
            <article
              key={item.id}
              data-ui="rental-card"
              className="group relative aspect-[4/4.8] sm:aspect-[4/5] lg:aspect-[4/4.7] max-h-[440px] overflow-hidden rounded-2xl bg-[#1c1c1e] shadow-xs hover:shadow-lg transition-all duration-300"
            >
              <CmsImage
                src={item.image}
                alt={item.title}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-[#1c1c1e]/90 via-[#1c1c1e]/25 to-[#1c1c1e]/15" />

              {/* Top Badges */}
              <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-1.5">
                <span className="px-2 py-0.5 rounded-[4px] text-[10px] sm:text-[11px] font-medium bg-[#1c1c1e]/60 backdrop-blur-md border border-white/20 text-white flex items-center gap-1">
                  <KeyRound className="w-2.5 h-2.5 text-[#008ae8]" />
                  Zero Brokerage
                </span>
                {item.furnishing ? (
                  <span className="px-2 py-0.5 rounded-[4px] text-[10px] sm:text-[11px] font-medium bg-[#008ae8]/80 backdrop-blur-md border border-white/20 text-white truncate max-w-[130px]">
                    {item.furnishing}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-[4px] text-[10px] sm:text-[11px] font-medium bg-emerald-600/80 backdrop-blur-md border border-white/20 text-white">
                    Verified
                  </span>
                )}
              </div>

              {/* Bottom Frosted Details Panel */}
              <div className="absolute inset-x-2.5 bottom-2.5 rounded-xl border border-white/25 bg-black/40 p-3 text-white backdrop-blur-md">
                <h3 className="text-sm sm:text-base font-normal leading-snug truncate" title={item.title}>
                  {item.title}
                </h3>
                <p className="mt-0.5 flex items-center gap-1 text-[11px] text-white/85">
                  <MapPin className="w-3 h-3 shrink-0 text-[#008ae8]" />
                  <span className="truncate">{[item.location, item.city].filter(Boolean).join(", ")}</span>
                </p>

                <div className="mt-2 flex items-end justify-between gap-2">
                  <div>
                    <span className="block text-[10px] text-white/75">Monthly Rent</span>
                    <span className="text-base sm:text-lg font-light leading-tight text-white">
                      {item.price}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#008ae8] bg-[#e0f2fe]/90 px-1.5 py-0.5 rounded font-medium">
                    {item.type || "Rental"}
                  </span>
                </div>

                <p className="mt-1.5 text-[10px] text-white/75 truncate">
                  {[item.bhk ? `${item.bhk} BHK` : null, item.area, item.floor || "Direct Owner"].filter(Boolean).join(" · ")}
                </p>

                {/* Action Buttons */}
                <div data-ui="actions" className="mt-2.5 grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedRental(item)}
                    className="w-full py-1.5 px-2 rounded-[4px] text-[11px] font-medium bg-white/15 hover:bg-white/25 text-white border border-white/30 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <PhoneCall className="w-3 h-3" />
                    Enquire Now
                  </button>
                  <Link
                    href={`/property/${item.id}`}
                    className="w-full py-1.5 px-2 rounded-[4px] text-[11px] font-medium bg-white hover:bg-[#e0f2fe] text-[#262626] flex items-center justify-center gap-1 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Instant Enquiry Callback Modal */}
      {selectedRental && (
        <div data-ui="enquiry-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative border border-[#aeaeaf]/40 text-[#262626] shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedRental(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-[#757577] hover:text-[#262626] bg-[#fafafa] hover:bg-[#e0f2fe] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {enquirySuccess ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-12 h-12 text-[#008ae8] mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-[#262626]">Callback Requested!</h3>
                <p className="text-xs text-[#757577] mt-1">
                  The owner or property manager will contact you at <strong>+91 {phone}</strong> shortly.
                </p>
              </div>
            ) : (
              <div>
                <span className="text-[11px] font-semibold text-[#008ae8] uppercase tracking-wider block mb-1">
                  Direct Owner Contact
                </span>
                <h3 className="text-base font-bold text-[#262626] leading-snug">
                  Enquire About {selectedRental.title}
                </h3>
                <p className="text-xs text-[#757577] mt-1">
                  Monthly Rent: <strong className="text-[#262626]">{selectedRental.price}</strong> · Zero Brokerage
                </p>

                <form onSubmit={handleEnquiry} className="mt-4 space-y-3">
                  <EnquiryHoneypot value={trap} onChange={setTrap} />
                  <div>
                    <label className="block text-xs font-semibold text-[#262626] mb-1">
                      Your 10-Digit Mobile Number
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 text-xs bg-[#fafafa] border border-r-0 border-[#aeaeaf]/40 rounded-l-[4px] text-[#757577] font-medium">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        pattern="[0-9]{10}"
                        placeholder="e.g. 9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        className="w-full px-3 py-2 text-xs border border-[#aeaeaf]/40 rounded-r-[4px] focus:outline-hidden focus:border-[#008ae8] bg-white text-[#262626]"
                      />
                    </div>
                  </div>

                  {error && <p className="text-xs text-red-500">{error}</p>}

                  <button
                    type="submit"
                    disabled={sending || phone.length !== 10}
                    className="w-full py-2.5 px-4 rounded-[4px] text-xs font-medium text-white bg-[#008ae8] hover:bg-[#0077c8] disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
                  >
                    {sending ? "Submitting..." : "Get Owner Details & Free Callback"}
                  </button>

                  <p className="text-[10px] text-[#757577] text-center">
                    Your number is safe. We never share your details with spam brokers.
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
