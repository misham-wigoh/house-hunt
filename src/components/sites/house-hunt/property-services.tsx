"use client";

import React, { useState } from "react";
import {
  Percent,
  ShieldCheck,
  Calculator,
  FileCheck2,
  UserCheck,
  Paintbrush,
  CheckCircle2,
  X,
} from "lucide-react";

const SERVICES = [
  {
    id: "home-loan",
    title: "Home Loans from 8.35%*",
    desc: "Pre-approved loans with minimal documentation from SBI, HDFC, ICICI & Axis Bank.",
    badge: "Fast Disbursal",
    icon: Percent,
    color: "bg-[#e0f2fe] text-[#008ae8] border-[#008ae8]/20",
  },
  {
    id: "legal",
    title: "Property Legal Verification",
    desc: "Rigorous 30+ title checks, RERA litigation search, and encumbrance verification by senior lawyers.",
    badge: "100% Secure",
    icon: ShieldCheck,
    color: "bg-[#fafafa] text-[#262626] border-[#aeaeaf]/40",
  },
  {
    id: "valuation",
    title: "Instant Property Valuation",
    desc: "Accurate real-time market estimation based on actual registry transactions in your locality.",
    badge: "Free Tool",
    icon: Calculator,
    color: "bg-[#e0f2fe] text-[#008ae8] border-[#aeaeaf]/40",
  },
  {
    id: "agreement",
    title: "Online Rent Agreement",
    desc: "Legally compliant e-stamped rent agreement delivered at your doorstep with biometric signing.",
    badge: "Doorstep Service",
    icon: FileCheck2,
    color: "bg-[#e0f2fe] text-[#008ae8] border-[#008ae8]/20",
  },
  {
    id: "tenant-verification",
    title: "Tenant Background Check",
    desc: "Police intimation, identity confirmation, and credit history verification delivered within 24 hours.",
    badge: "Verified Tenants",
    icon: UserCheck,
    color: "bg-[#fafafa] text-[#262626] border-[#aeaeaf]/40",
  },
  {
    id: "interiors",
    title: "Full Home Interiors",
    desc: "Custom modular kitchens, wardrobes, and turnkey interior design with 10-year warranty.",
    badge: "Top Designers",
    icon: Paintbrush,
    color: "bg-[#e0f2fe] text-[#008ae8] border-[#008ae8]/20",
  },
];

export function PropertyServices() {
  const [modalService, setModalService] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setModalService(null);
      setPhone("");
    }, 2000);
  };

  return (
    <section id="services" data-ui="property-services" className="py-12 bg-[#fafafa] border-b border-[#aeaeaf]/40">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-semibold text-[#008ae8] block mb-1">
            Complete Real Estate Ecosystem
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-light tracking-normal text-[#262626]">
            Property Services &amp; Financial <span className="font-serif italic font-normal">Assistance</span>
          </h2>
          <p className="text-sm text-[#757577] mt-2">
            Complete support across your entire real estate journey, backed by certified professionals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((srv) => {
            const Icon = srv.icon;
            return (
              <div
                key={srv.id}
                data-ui="service-card"
                className="bg-white p-5 rounded-2xl border border-[#aeaeaf]/40 hover:border-[#008ae8] transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`p-3 rounded-xl border ${srv.color}`}>
                      <Icon className="w-6 h-6" />
                    </span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#e0f2fe] text-[#008ae8]">
                      {srv.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-medium text-[#262626]">{srv.title}</h3>
                  <p className="text-xs text-[#757577] mt-1.5 leading-relaxed">{srv.desc}</p>
                </div>

                <div data-ui="action" className="mt-5 pt-4 border-t border-[#aeaeaf]/40">
                  <button
                    type="button"
                    onClick={() => setModalService(srv.title)}
                    className="w-full py-2 px-3 rounded-[4px] text-xs font-medium bg-[#008ae8] hover:bg-[#0077c8] text-white border border-[#008ae8] transition-colors shadow-xs"
                  >
                    Get Free Consultation
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {modalService && (
        <div data-ui="consult-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#262626]/80">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative border border-[#aeaeaf]/40 text-[#262626]">
            <button
              type="button"
              onClick={() => setModalService(null)}
              className="absolute top-4 right-4 p-1 rounded-full text-[#757577] hover:text-[#262626] hover:bg-[#fafafa]"
            >
              <X className="w-5 h-5" />
            </button>

            {submitted ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-16 h-16 text-[#008ae8] mx-auto mb-3" />
                <h4 className="text-xl font-light text-[#262626]">Request Received</h4>
                <p className="text-sm text-[#757577] mt-1">
                  Our specialist for <strong>{modalService}</strong> will get in touch with you shortly.
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-medium text-[#262626] mb-1">{modalService}</h3>
                <p className="text-xs text-[#757577] mb-4">
                  Please provide your phone number so our verified advisor can share rates and documentation checklists.
                </p>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#262626] mb-1">
                      Phone Number
                    </label>
                    <div className="flex rounded-[4px] border border-[#aeaeaf]/40 overflow-hidden focus-within:border-[#008ae8]">
                      <span data-ui="prefix" className="bg-[#fafafa] px-3 py-2 text-sm font-semibold text-[#262626] border-r border-[#aeaeaf]/40">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        pattern="[0-9]{10}"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter 10 digit number"
                        className="w-full px-3 py-2 text-sm focus:outline-hidden bg-white text-[#262626]"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-[4px] font-medium text-white bg-[#008ae8] hover:bg-[#0077c8] border border-[#008ae8] transition-colors shadow-xs"
                  >
                    Request Consultation
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
