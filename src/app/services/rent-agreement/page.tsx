"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/sites/house-hunt/header";
import { Footer } from "@/components/sites/house-hunt/footer";
import { EnquiryHoneypot } from "@/components/sites/house-hunt/enquiry-honeypot";
import { sendEnquiry } from "@/lib/enquiry";
import {
  FileCheck2,
  CheckCircle2,
} from "lucide-react";

const STEPS = [
  { step: "01", title: "Fill Details Online", desc: "Enter landlord, tenant, rent amount, security deposit, and tenancy dates in our simple 5-minute form." },
  { step: "02", title: "Review Digital Draft", desc: "Preview your customized agreement on WhatsApp with standard legal protections for both parties." },
  { step: "03", title: "Government E-Stamping", desc: "We purchase official state government e-stamp papers with unique QR code verification." },
  { step: "04", title: "Doorstep Biometrics", desc: "Our field executive visits both parties at convenient times for Aadhaar biometric signing." },
];

export default function RentAgreementServicePage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Delhi / NCR");
  const [role, setRole] = useState<"tenant" | "owner">("tenant");
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
      source: "service_rent_agreement",
      name,
      phone,
      role,
      propertyTitle: `Rent Agreement Service (${role.toUpperCase()} in ${city})`,
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
          <span className="font-semibold text-[#262626]">Rent Agreement</span>
        </div>
      </div>

      <main className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-8 sm:py-12 flex-1 w-full space-y-12">
        {/* Header Hero Banner */}
        <div className="bg-white rounded-3xl border border-[#aeaeaf]/40 p-6 sm:p-12 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#e0f2fe] text-[#008ae8] border border-[#008ae8]/30">
              <FileCheck2 className="w-3.5 h-3.5" />
              100% Legal &amp; Govt. E-Stamped
            </span>
            <h1 className="text-3xl sm:text-5xl font-light tracking-tight text-[#262626] leading-tight">
              Online E-Stamped <span className="font-serif italic font-normal text-[#008ae8]">Rent Agreement</span>
            </h1>
            <p className="text-base sm:text-lg text-[#757577] leading-relaxed">
              Create, customize, and execute a legally binding residential or commercial rental agreement without standing in queues at sub-registrar offices. Includes doorstep biometric signing and police verification assistance.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-[#262626]">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#008ae8]" /> Delivered in 24-48 Hours</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#008ae8]" /> Doorstep Biometric Service</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#008ae8]" /> 100% Legally Admissible</span>
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-5 bg-[#fafafa] rounded-2xl border border-[#aeaeaf]/40 p-6">
            <h3 className="text-base font-semibold text-[#262626]">Create Rent Agreement</h3>
            <p className="text-xs text-[#757577] mt-0.5">Start your agreement draft now for doorstep delivery.</p>

            {success ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-[#008ae8] mx-auto mb-2" />
                <h4 className="text-base font-medium text-[#262626]">Order Initiated!</h4>
                <p className="text-xs text-[#757577] mt-1">Our documentation team will send the draft link to +91 {phone}.</p>
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
                  <label className="block text-xs font-semibold text-[#262626] mb-1">Mobile Number (for WhatsApp Draft)</label>
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
                    <label className="block text-xs font-semibold text-[#262626] mb-1">You Are</label>
                    <div className="flex gap-2 pt-1 text-xs">
                      <label className="flex items-center gap-1">
                        <input
                          type="radio"
                          name="role"
                          checked={role === "tenant"}
                          onChange={() => setRole("tenant")}
                          className="accent-[#008ae8]"
                        />
                        Tenant
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="radio"
                          name="role"
                          checked={role === "owner"}
                          onChange={() => setRole("owner")}
                          className="accent-[#008ae8]"
                        />
                        Owner
                      </label>
                    </div>
                  </div>
                </div>

                {error && <p className="text-xs text-[#E4572E] font-medium">{error}</p>}

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-2.5 px-4 rounded-full text-xs font-semibold text-white bg-[#008ae8] hover:bg-[#0077c8] transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {sending ? "Processing..." : "Generate Agreement Draft"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* 4 Steps Process */}
        <div className="space-y-6">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold text-[#008ae8] uppercase tracking-wider block mb-1">
              How It Works
            </span>
            <h2 className="text-2xl sm:text-3xl font-light text-[#262626]">
              Executed in 4 Simple <span className="font-serif italic font-normal text-[#008ae8]">Steps</span>
            </h2>
            <p className="text-sm text-[#757577] mt-1">
              Zero courthouse visits, zero notary queues. From digital draft to doorstep biometric verification in 24 hours.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[#aeaeaf]/40 p-6 flex flex-col justify-between hover:border-[#008ae8] transition-colors shadow-xs group"
              >
                <div className="space-y-3">
                  <span className="text-3xl font-light text-[#008ae8] block">{s.step}</span>
                  <h3 className="text-base font-semibold text-[#262626] group-hover:text-[#008ae8] transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-xs text-[#757577] leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Advantages */}
        <div className="bg-white rounded-3xl border border-[#aeaeaf]/40 p-6 sm:p-10 shadow-xs space-y-4">
          <h3 className="text-xl font-medium text-[#262626]">Key Legal Protections Included:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#fafafa] border border-[#aeaeaf]/30 space-y-1">
              <span className="font-semibold text-[#008ae8]">QR Code E-Stamp</span>
              <p className="text-[#757577]">Government verified stamp duty payment certificate with online barcode validation.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#fafafa] border border-[#aeaeaf]/30 space-y-1">
              <span className="font-semibold text-[#008ae8]">Clear Notice &amp; Deposit Clauses</span>
              <p className="text-[#757577]">Standard dispute-prevention terms for lock-in periods, notice periods, and security refunds.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#fafafa] border border-[#aeaeaf]/30 space-y-1">
              <span className="font-semibold text-[#008ae8]">Police Verification Ready</span>
              <p className="text-[#757577]">Formatted for immediate submission to local police stations for tenant background intimation.</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
