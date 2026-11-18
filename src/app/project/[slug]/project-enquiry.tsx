"use client";

import { useState } from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { EnquiryHoneypot } from "@/components/sites/house-hunt/enquiry-honeypot";
import { sendEnquiry } from "@/lib/enquiry";

export function ProjectEnquiry({ builder, projectName, projectId }: { builder: string; projectName: string; projectId: string }) {
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [trap, setTrap] = useState("");

  if (sent) {
    return (
      <div className="text-center py-6">
        <CheckCircle2 className="w-12 h-12 text-[#008ae8] mx-auto mb-2" />
        <h4 className="text-sm font-medium text-[#262626]">Enquiry Confirmed!</h4>
        <p className="text-xs text-[#757577] mt-1">
          {builder ? `The ${builder} sales desk` : "The sales desk"} will call you on +91 {phone}.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (sending) return;
        setSending(true);
        setError("");
        const res = await sendEnquiry({ source: "project_enquiry", phone, propertyTitle: projectName, propertyId: projectId, dealer: builder, website: trap });
        setSending(false);
        if (!res.ok) return setError(res.error);
        setSent(true);
      }}
      className="relative space-y-3"
    >
      <EnquiryHoneypot value={trap} onChange={setTrap} />
      <label className="block text-xs font-semibold text-[#262626]">Your Phone Number</label>
      <div className="flex rounded-xl border border-[#aeaeaf]/40 overflow-hidden focus-within:border-[#008ae8]">
        <span className="bg-[#fafafa] px-3 py-2 text-xs font-semibold text-[#262626] border-r border-[#aeaeaf]/40">+91</span>
        <input
          type="tel"
          required
          pattern="[0-9]{10}"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter 10 digit number"
          className="w-full px-3 py-2 text-xs focus:outline-hidden bg-white text-[#262626]"
        />
      </div>
      <div className="flex items-center gap-1.5 text-[11px] text-[#757577]">
        <ShieldCheck className="w-3.5 h-3.5 text-[#008ae8] shrink-0" />
        <span>Zero spam guarantee</span>
      </div>
      {error && <p role="alert" className="text-xs font-medium text-[#E4572E]">{error}</p>}
      <button
        type="submit"
        disabled={sending}
        className="w-full py-2.5 px-4 rounded-[4px] font-medium text-white bg-[#008ae8] hover:bg-[#0077c8] border border-[#008ae8] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {sending ? "Sending..." : "Request Callback Now"}
      </button>
    </form>
  );
}
