"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/sites/house-hunt/header";
import { Footer } from "@/components/sites/house-hunt/footer";
import { EnquiryHoneypot } from "@/components/sites/house-hunt/enquiry-honeypot";
import { sendEnquiry } from "@/lib/enquiry";
import {
  Calculator,
  TrendingUp,
  CheckCircle2,
  Scale,
  LineChart,
} from "lucide-react";

export default function PropertyValuationServicePage() {
  const [city, setCity] = useState("Delhi / NCR");
  const [locality, setLocality] = useState("");
  const [propertyType, setPropertyType] = useState("Flat / Apartment");
  const [carpetArea, setCarpetArea] = useState(1200);
  const [bhk, setBhk] = useState("3");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [trap, setTrap] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Approximate baseline calculation
  const baseRatePerSqFt = city === "Mumbai" ? 22000 : city === "Delhi / NCR" ? 14000 : city === "Bangalore" ? 11500 : city === "Hyderabad" ? 8500 : 7500;
  const estimatedValue = Math.round(carpetArea * baseRatePerSqFt);
  const estimatedMin = Math.round(estimatedValue * 0.95);
  const estimatedMax = Math.round(estimatedValue * 1.08);

  const formatInr = (num: number) => {
    if (num >= 10_000_000) return `₹${(num / 10_000_000).toFixed(2)} Cr`;
    if (num >= 100_000) return `₹${(num / 100_000).toFixed(2)} Lac`;
    return `₹${num.toLocaleString("en-IN")}`;
  };

  const handleEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setError("");

    const res = await sendEnquiry({
      source: "service_property_valuation",
      name,
      phone,
      propertyTitle: `Valuation Request (${propertyType}, ${bhk} BHK, ${carpetArea} sq.ft in ${locality || city} - Est. ${formatInr(estimatedValue)})`,
      website: trap,
    });

    setSending(false);
    if (!res.ok) return setError(res.error);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setName("");
      setPhone("");
    }, 3500);
  };

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
          <Link href="/services" className="hover:text-[#008ae8] transition-colors">
            Services
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#262626]">Property Valuation</span>
        </div>
      </div>

      <main className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-8 sm:py-12 flex-1 w-full space-y-12">
        {/* Header Hero Banner */}
        <div className="bg-white rounded-3xl border border-[#aeaeaf]/40 p-6 sm:p-12 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#e0f2fe] text-[#008ae8] border border-[#008ae8]/30">
              <Calculator className="w-3.5 h-3.5" />
              Registry-Backed Market Intelligence
            </span>
            <h1 className="text-3xl sm:text-5xl font-light tracking-tight text-[#262626] leading-tight">
              Instant Property <span className="font-serif italic font-normal text-[#008ae8]">Valuation Report</span>
            </h1>
            <p className="text-base sm:text-lg text-[#757577] leading-relaxed">
              Find out the true market worth of any property based on actual registered circle rates, historical sale deeds, and active demand trends in your exact locality.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-[#262626]">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#008ae8]" /> Registered Circle Rates</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#008ae8]" /> 3-Year Appreciation Data</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#008ae8]" /> Accurate Within 5%</span>
            </div>
          </div>

          {/* Calculator Card */}
          <div className="lg:col-span-5 bg-[#fafafa] rounded-2xl border border-[#aeaeaf]/40 p-6">
            <h3 className="text-base font-semibold text-[#262626]">Estimate Property Value</h3>
            <p className="text-xs text-[#757577] mt-0.5">Instant market appraisal with full valuation report.</p>

            <div className="mt-4 p-4 rounded-xl bg-[#e0f2fe] border border-[#008ae8]/30 text-center">
              <span className="text-xs font-medium text-[#008ae8] block">Estimated Market Valuation</span>
              <span className="text-2xl sm:text-3xl font-light text-[#262626] block mt-1">
                {formatInr(estimatedMin)} - {formatInr(estimatedMax)}
              </span>
              <span className="text-[11px] text-[#757577] mt-0.5 block">
                Average @ ₹{baseRatePerSqFt.toLocaleString("en-IN")} / sq.ft in {city}
              </span>
            </div>

            {success ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-10 h-10 text-[#008ae8] mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-[#262626]">Detailed Report Generated!</h4>
                <p className="text-xs text-[#757577] mt-1">We have sent the PDF valuation breakdown to +91 {phone}.</p>
              </div>
            ) : (
              <form onSubmit={handleEstimate} className="mt-4 space-y-3">
                <EnquiryHoneypot value={trap} onChange={setTrap} />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#262626] mb-1">City</label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-[#aeaeaf]/40"
                    >
                      <option>Delhi / NCR</option>
                      <option>Mumbai</option>
                      <option>Bangalore</option>
                      <option>Hyderabad</option>
                      <option>Pune</option>
                      <option>Chennai</option>
                      <option>Lucknow</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#262626] mb-1">Locality</label>
                    <input
                      type="text"
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      placeholder="e.g. CyberHub / Bopal"
                      className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-[#aeaeaf]/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#262626] mb-1">Property Type</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-[#aeaeaf]/40"
                  >
                    <option>Flat / Apartment</option>
                    <option>Independent House / Villa</option>
                    <option>Builder Floor</option>
                    <option>Commercial Office</option>
                    <option>Plot / Land</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#262626] mb-1">Carpet Area (sq.ft)</label>
                    <input
                      type="number"
                      min={200}
                      max={15000}
                      value={carpetArea}
                      onChange={(e) => setCarpetArea(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-[#aeaeaf]/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#262626] mb-1">Bedrooms</label>
                    <select
                      value={bhk}
                      onChange={(e) => setBhk(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-[#aeaeaf]/40"
                    >
                      <option value="1">1 BHK</option>
                      <option value="2">2 BHK</option>
                      <option value="3">3 BHK</option>
                      <option value="4">4+ BHK</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-[#aeaeaf]/40"
                  />
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit Phone"
                    className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-[#aeaeaf]/40"
                  />
                </div>

                {error && <p className="text-xs text-[#E4572E] font-medium">{error}</p>}

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-2.5 px-4 rounded-full text-xs font-semibold text-white bg-[#008ae8] hover:bg-[#0077c8] transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {sending ? "Generating..." : "Download Full Valuation PDF"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-[#aeaeaf]/40 p-6 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#e0f2fe] text-[#008ae8] flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-[#262626]">3-Year Appreciation Trajectory</h3>
            <p className="text-xs text-[#757577] leading-relaxed">
              Track historical annual growth rates in your specific micro-market to time your property purchase or exit accurately.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-[#aeaeaf]/40 p-6 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#e0f2fe] text-[#008ae8] flex items-center justify-center font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-[#262626]">Circle Rate vs Market Rate</h3>
            <p className="text-xs text-[#757577] leading-relaxed">
              Understand the official government circle rate floor versus true market transaction prices to calculate exact stamp duty costs.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-[#aeaeaf]/40 p-6 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#e0f2fe] text-[#008ae8] flex items-center justify-center font-bold">
              <LineChart className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-[#262626]">Rental Yield &amp; ROI Forecast</h3>
            <p className="text-xs text-[#757577] leading-relaxed">
              Calculate projected gross rental yields, vacancy risk indices, and long-term capital compounding potential.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
