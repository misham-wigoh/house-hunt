"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/sites/house-hunt/header";
import { Footer } from "@/components/sites/house-hunt/footer";
import { EnquiryHoneypot } from "@/components/sites/house-hunt/enquiry-honeypot";
import { sendEnquiry } from "@/lib/enquiry";
import {
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

const CHECKS = [
  { title: "30-Year Chain Deed Search", desc: "Trace ownership continuity and verify original sale deeds, gift deeds, partitions, and wills across 30 years." },
  { title: "Encumbrance Certificate (EC)", desc: "Examine sub-registrar records to verify zero mortgages, bank liens, legal attachments, or tax defaults on the property." },
  { title: "RERA & Court Litigation Search", desc: "Search civil courts, consumer forums, high courts, and RERA tribunal records for ongoing disputes or stay orders." },
  { title: "Master Plan & Zoning Clearances", desc: "Verify land zoning (residential/commercial), agricultural conversion (CLU/NA orders), and layout approval authority." },
  { title: "Municipal Sanctions & OC/CC", desc: "Validate building sanction plans, fire NOC, Commencement Certificate (CC), and final Occupancy Certificate (OC)." },
  { title: "Property Tax & Utility Dues", desc: "Confirm full payment of municipal property taxes, development charges, and water/electricity board clearances." },
];

export default function LegalVerificationServicePage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [propertyCity, setPropertyCity] = useState("Delhi / NCR");
  const [propertyType, setPropertyType] = useState("Flat / Apartment");
  const [trap, setTrap] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleCallback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setError("");

    const res = await sendEnquiry({
      source: "service_legal_verification",
      name,
      phone,
      propertyTitle: `Legal Title Verification (${propertyType} in ${propertyCity})`,
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
          <span className="font-semibold text-[#262626]">Legal Verification</span>
        </div>
      </div>

      <main className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-8 sm:py-12 flex-1 w-full space-y-12">
        {/* Header Hero Banner */}
        <div className="bg-white rounded-3xl border border-[#aeaeaf]/40 p-6 sm:p-12 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#e0f2fe] text-[#008ae8] border border-[#008ae8]/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              Institutional-Grade Title Due Diligence
            </span>
            <h1 className="text-3xl sm:text-5xl font-light tracking-tight text-[#262626] leading-tight">
              Property Legal &amp; <span className="font-serif italic font-normal text-[#008ae8]">Title Verification</span>
            </h1>
            <p className="text-base sm:text-lg text-[#757577] leading-relaxed">
              Never risk your life savings on disputed or encumbered property. Our empanelled senior real estate lawyers conduct 30+ comprehensive checks across sub-registrar offices, courts, and RERA registries to ensure 100% clean title ownership.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-[#262626]">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#008ae8]" /> 30-Year Title Search</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#008ae8]" /> Zero Litigation Guarantee</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#008ae8]" /> 15-Page Certified Lawyer Report</span>
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-5 bg-[#fafafa] rounded-2xl border border-[#aeaeaf]/40 p-6">
            <h3 className="text-base font-semibold text-[#262626]">Order Legal Verification</h3>
            <p className="text-xs text-[#757577] mt-0.5">Talk to a senior property advocate within 30 minutes.</p>

            {success ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-[#008ae8] mx-auto mb-2" />
                <h4 className="text-base font-medium text-[#262626]">Verification Request Booked!</h4>
                <p className="text-xs text-[#757577] mt-1">Our legal coordinator will call you shortly on +91 {phone}.</p>
              </div>
            ) : (
              <form onSubmit={handleCallback} className="mt-4 space-y-3">
                <EnquiryHoneypot value={trap} onChange={setTrap} />
                <div>
                  <label className="block text-xs font-semibold text-[#262626] mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-[#aeaeaf]/40 focus:outline-hidden focus:border-[#008ae8]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#262626] mb-1">Mobile Number</label>
                  <div className="flex rounded-xl border border-[#aeaeaf]/40 overflow-hidden focus-within:border-[#008ae8] bg-white">
                    <span className="bg-[#fafafa] px-3 py-2 text-xs font-semibold text-[#262626] border-r border-[#aeaeaf]/40">+91</span>
                    <input
                      type="tel"
                      required
                      pattern="[0-9]{10}"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit number"
                      className="w-full px-3 py-2 text-xs focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#262626] mb-1">City</label>
                    <select
                      value={propertyCity}
                      onChange={(e) => setPropertyCity(e.target.value)}
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
                    <label className="block text-xs font-semibold text-[#262626] mb-1">Property Type</label>
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-[#aeaeaf]/40"
                    >
                      <option>Flat / Apartment</option>
                      <option>Independent Villa</option>
                      <option>Plot / Land</option>
                      <option>Commercial Unit</option>
                    </select>
                  </div>
                </div>

                {error && <p className="text-xs text-[#E4572E] font-medium">{error}</p>}

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-2.5 px-4 rounded-full text-xs font-semibold text-white bg-[#008ae8] hover:bg-[#0077c8] transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {sending ? "Booking..." : "Request Lawyer Callback"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* 6 Key Verification Checks */}
        <div className="space-y-6">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold text-[#008ae8] uppercase tracking-wider block mb-1">
              Rigorous Due Diligence
            </span>
            <h2 className="text-2xl sm:text-3xl font-light text-[#262626]">
              30+ Checks Conducted by <span className="font-serif italic font-normal text-[#008ae8]">Senior Advocates</span>
            </h2>
            <p className="text-sm text-[#757577] mt-1">
              We investigate past transaction deeds, government mutation registers, and active court litigations so you have total peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CHECKS.map((c, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[#aeaeaf]/40 p-6 flex flex-col justify-between hover:border-[#008ae8] transition-colors shadow-xs group"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#e0f2fe] text-[#008ae8] flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>
                  <h3 className="text-base font-semibold text-[#262626] group-hover:text-[#008ae8] transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-xs text-[#757577] leading-relaxed">
                    {c.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deliverables Box */}
        <div className="bg-white rounded-3xl border border-[#aeaeaf]/40 p-6 sm:p-10 shadow-xs space-y-4">
          <h3 className="text-xl font-medium text-[#262626]">What You Receive in the Certified Legal Report:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#fafafa] border border-[#aeaeaf]/30 space-y-1">
              <span className="font-semibold text-[#008ae8]">1. Legal Opinion Letter</span>
              <p className="text-[#757577]">Signed title clearance certificate by High Court advocate.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#fafafa] border border-[#aeaeaf]/30 space-y-1">
              <span className="font-semibold text-[#008ae8]">2. Encumbrance Validation</span>
              <p className="text-[#757577]">Certified Sub-Registrar record check with zero-mortgage proof.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#fafafa] border border-[#aeaeaf]/30 space-y-1">
              <span className="font-semibold text-[#008ae8]">3. RERA &amp; Court Search</span>
              <p className="text-[#757577]">Search report confirming no active injunctions or stay orders.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#fafafa] border border-[#aeaeaf]/30 space-y-1">
              <span className="font-semibold text-[#008ae8]">4. Red-Flag Checklist</span>
              <p className="text-[#757577]">Clear go / no-go risk assessment before paying token money.</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
