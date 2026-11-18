"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  X,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { CmsImage } from "./cms-image";
import { EnquiryHoneypot } from "./enquiry-honeypot";
import { sendEnquiry } from "@/lib/enquiry";
import type { ProjectItem } from "@/lib/cms/types";

export function FeaturedProjects({ projects }: { projects: ProjectItem[] }) {
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [phone, setPhone] = useState("");
  const [enquirySuccess, setEnquirySuccess] = useState(false);

  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [trap, setTrap] = useState("");

  const handleEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || sending) return;
    setSending(true);
    setError("");
    const res = await sendEnquiry({
      source: "project_enquiry",
      phone,
      propertyTitle: selectedProject.name,
      propertyId: selectedProject.id,
      dealer: selectedProject.builder,
      website: trap,
    });
    setSending(false);
    if (!res.ok) return setError(res.error);
    setEnquirySuccess(true);
    setTimeout(() => {
      setEnquirySuccess(false);
      setSelectedProject(null);
      setPhone("");
    }, 2500);
  };

  return (
    <section data-ui="featured-projects" className="py-12 bg-white border-b border-[#aeaeaf]/40">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#008ae8] mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Handpicked Residential Launches</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-light tracking-normal text-[#262626]">
              Featured Real Estate <span className="font-serif italic font-normal text-[#008ae8]">Projects</span>
            </h2>
            <p className="text-sm text-[#757577] mt-1">
              Top-selling gated communities and luxury high-rises by India&apos;s A-grade developers.
            </p>
          </div>
          <Link
            href="/properties?type=project"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#008ae8] hover:text-[#0077c8] self-start sm:self-auto group"
          >
            <span>View All Projects</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {projects.slice(0, 4).map((proj) => (
            <article
              key={proj.id}
              data-ui="project-card"
              className="group relative aspect-[4/4.8] sm:aspect-[4/5] lg:aspect-[4/4.7] max-h-[440px] overflow-hidden rounded-2xl bg-[#1c1c1e] shadow-xs hover:shadow-lg transition-all duration-300"
            >
              <CmsImage
                src={proj.image}
                alt={proj.name}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-[#1c1c1e]/90 via-[#1c1c1e]/25 to-[#1c1c1e]/15" />

              <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-1.5">
                {proj.tag ? (
                  <span className="px-2 py-0.5 rounded-[4px] text-[10px] sm:text-[11px] font-medium bg-[#1c1c1e]/60 backdrop-blur-md border border-white/20 text-white">
                    {proj.tag}
                  </span>
                ) : (
                  <span />
                )}
                {proj.pricePerSqFt && (
                  <span className="px-2 py-0.5 rounded-[4px] text-[10px] sm:text-[11px] font-medium bg-[#1c1c1e]/60 backdrop-blur-md border border-white/20 text-white">
                    {proj.pricePerSqFt}
                  </span>
                )}
              </div>

              <div className="absolute inset-x-2.5 bottom-2.5 rounded-xl border border-white/25 bg-black/40 p-3 text-white backdrop-blur-md">
                <h3 className="text-sm sm:text-base font-normal leading-snug truncate" title={proj.name}>
                  {proj.name}
                </h3>
                <p className="mt-0.5 flex items-center gap-1 text-[11px] text-white/85">
                  <MapPin className="w-3 h-3 shrink-0 text-[#008ae8]" />
                  <span className="truncate">{[proj.location, proj.city].filter(Boolean).join(", ")}</span>
                </p>

                <div className="mt-2 flex items-end justify-between gap-2">
                  <div>
                    <span className="block text-[10px] text-white/75">Starting from</span>
                    <span className="text-base sm:text-lg font-light leading-tight">{proj.price}</span>
                  </div>
                  {proj.possession && (
                    <span className="flex items-center gap-1 text-[10px] text-white/85 shrink-0">
                      <Calendar className="w-3 h-3 shrink-0" />
                      {proj.possession}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-[10px] text-white/75 truncate">
                  {[proj.bhk, proj.rera && `RERA ${proj.rera}`].filter(Boolean).join(" · ")}
                </p>

                <div data-ui="actions" className="mt-2.5 grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedProject(proj)}
                    className="w-full py-1.5 px-2 rounded-[4px] text-[11px] font-medium bg-white/15 hover:bg-white/25 text-white border border-white/30 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <PhoneCall className="w-3 h-3" />
                    Enquire Now
                  </button>
                  <Link
                    href={`/project/${proj.id}`}
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

      {/* Instant Enquiry Modal */}
      {selectedProject && (
        <div data-ui="enquiry-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#262626]/80 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative border border-[#aeaeaf]/40 text-[#262626]">
            <button
              type="button"
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 p-1 rounded-full text-[#757577] hover:text-[#262626] hover:bg-[#fafafa]"
            >
              <X className="w-5 h-5" />
            </button>

            {enquirySuccess ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-16 h-16 text-[#008ae8] mx-auto mb-3" />
                <h4 className="text-xl font-light text-[#262626]">Enquiry Submitted!</h4>
                <p className="text-sm text-[#757577] mt-1">
                  The verified representative of <strong>{selectedProject.builder}</strong> will call you shortly on +91 {phone}.
                </p>
              </div>
            ) : (
              <div>
                <div data-ui="modal-head" className="flex items-center gap-3 mb-4 pb-4 border-b border-[#aeaeaf]/30">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[#fafafa]">
                    <CmsImage src={selectedProject.image} alt={selectedProject.name} sizes="64px" className="object-cover" />
                  </div>
                  <div>
                    <h4 className="text-base font-normal text-[#262626] leading-tight">
                      {selectedProject.name}
                    </h4>
                    <p className="text-xs text-[#757577] mt-0.5">{selectedProject.location}</p>
                    <span className="text-xs font-medium text-[#008ae8]">{selectedProject.price}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <h5 className="text-sm font-medium text-[#262626]">Request Callback &amp; Brochure</h5>
                  <p className="text-xs text-[#757577] mt-0.5">
                    Get instant WhatsApp floor plans, latest price sheet, and schedule a site visit.
                  </p>
                </div>

                <form onSubmit={handleEnquiry} className="relative space-y-3">
                  <EnquiryHoneypot value={trap} onChange={setTrap} />
                  <div>
                    <label className="block text-xs font-semibold text-[#262626] mb-1">
                      Your Phone Number
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
                        placeholder="Enter 10 digit mobile"
                        className="w-full px-3 py-2 text-sm focus:outline-hidden bg-white text-[#262626]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#757577]">
                    <ShieldCheck className="w-4 h-4 text-[#008ae8] shrink-0" />
                    <span>Your contact details are encrypted and 100% spam-free.</span>
                  </div>

                  {error && <p role="alert" className="text-xs font-medium text-[#E4572E]">{error}</p>}
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full py-2.5 px-4 rounded-[4px] font-medium text-white bg-[#008ae8] hover:bg-[#0077c8] border border-[#008ae8] transition-colors shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {sending ? "Sending..." : "Get Instant Callback"}
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
