"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/sites/house-hunt/header";
import { Footer } from "@/components/sites/house-hunt/footer";
import { EnquiryHoneypot } from "@/components/sites/house-hunt/enquiry-honeypot";
import { sendEnquiry } from "@/lib/enquiry";
import {
  Percent,
  CheckCircle2,
} from "lucide-react";

const BANKS = [
  { name: "State Bank of India (SBI)", rate: "8.35% - 8.90%", fee: "Nil - ₹5,000", tenure: "Up to 30 Yrs" },
  { name: "HDFC Bank", rate: "8.40% - 9.05%", fee: "0.25% - 0.50%", tenure: "Up to 30 Yrs" },
  { name: "ICICI Bank", rate: "8.45% - 9.15%", fee: "0.25% - 0.50%", tenure: "Up to 30 Yrs" },
  { name: "Axis Bank", rate: "8.50% - 9.20%", fee: "Up to ₹10,000", tenure: "Up to 30 Yrs" },
  { name: "Kotak Mahindra Bank", rate: "8.55% - 9.25%", fee: "0.25%", tenure: "Up to 25 Yrs" },
];

export default function HomeLoanServicePage() {
  const [loanAmount, setLoanAmount] = useState(5_000_000); // 50 Lac
  const [tenure, setTenure] = useState(20); // 20 years
  const [interestRate, setInterestRate] = useState(8.35); // 8.35%

  // Callback Form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [trap, setTrap] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // EMI Calculation: P * r * (1 + r)^n / ((1 + r)^n - 1)
  const r = interestRate / 12 / 100;
  const n = tenure * 12;
  const emi = Math.round((loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
  const totalPayment = emi * n;
  const totalInterest = totalPayment - loanAmount;

  const handleCallback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setError("");

    const res = await sendEnquiry({
      source: "service_home_loan",
      name,
      phone,
      propertyTitle: `Home Loan Inquiry (₹${(loanAmount / 100_000).toFixed(0)} Lac @ ${interestRate}%)`,
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
          <span className="font-semibold text-[#262626]">Home Loans</span>
        </div>
      </div>

      <main className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-8 sm:py-12 flex-1 w-full space-y-12">
        {/* Header Hero Banner */}
        <div className="bg-white rounded-3xl border border-[#aeaeaf]/40 p-6 sm:p-12 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#e0f2fe] text-[#008ae8] border border-[#008ae8]/30">
              <Percent className="w-3.5 h-3.5" />
              Lowest Interest Rates Guaranteed
            </span>
            <h1 className="text-3xl sm:text-5xl font-light tracking-tight text-[#262626] leading-tight">
              Home Loans Starting @ <span className="font-serif italic font-normal text-[#008ae8]">8.35% p.a.*</span>
            </h1>
            <p className="text-base sm:text-lg text-[#757577] leading-relaxed">
              Compare home loan quotes across India&apos;s leading PSU and private banks. Get pre-approved sanction letters in 48 hours with doorstep document pickup and zero hidden processing charges.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-[#262626]">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#008ae8]" /> Pre-Approved in 48 Hours</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#008ae8]" /> Minimal Documentation</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#008ae8]" /> Tenures up to 30 Years</span>
            </div>
          </div>

          {/* Quick Callback Card */}
          <div className="lg:col-span-5 bg-[#fafafa] rounded-2xl border border-[#aeaeaf]/40 p-6">
            <h3 className="text-base font-semibold text-[#262626]">Check Your Loan Eligibility</h3>
            <p className="text-xs text-[#757577] mt-0.5">Receive personalized bank rate comparisons within 1 hour.</p>

            {success ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-[#008ae8] mx-auto mb-2" />
                <h4 className="text-base font-medium text-[#262626]">Application Received!</h4>
                <p className="text-xs text-[#757577] mt-1">Our loan specialist will call you shortly on +91 {phone}.</p>
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

                {error && <p className="text-xs text-[#E4572E] font-medium">{error}</p>}

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-2.5 px-4 rounded-full text-xs font-semibold text-white bg-[#008ae8] hover:bg-[#0077c8] transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {sending ? "Submitting..." : "Get Free Bank Offers"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Interactive EMI Calculator Section */}
        <div className="bg-white rounded-3xl border border-[#aeaeaf]/40 p-6 sm:p-10 shadow-xs space-y-6">
          <div>
            <span className="text-xs font-semibold text-[#008ae8] uppercase tracking-wider block mb-1">
              Smart Financial Planning
            </span>
            <h2 className="text-2xl sm:text-3xl font-light text-[#262626]">
              Home Loan <span className="font-serif italic font-normal text-[#008ae8]">EMI Calculator</span>
            </h2>
            <p className="text-sm text-[#757577] mt-1">
              Adjust loan amount, tenure, and interest rate to see your exact monthly payout and interest breakdown.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
            {/* Sliders */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-[#757577]">Loan Amount</span>
                  <span className="text-[#262626] font-bold">
                    {loanAmount >= 10_000_000 ? `₹${(loanAmount / 10_000_000).toFixed(2)} Cr` : `₹${(loanAmount / 100_000).toFixed(0)} Lac`}
                  </span>
                </div>
                <input
                  type="range"
                  min={500_000}
                  max={50_000_000}
                  step={100_000}
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full accent-[#008ae8] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[#757577] mt-1">
                  <span>₹5 Lac</span>
                  <span>₹5 Cr</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-[#757577]">Tenure</span>
                  <span className="text-[#262626] font-bold">{tenure} Years ({n} Months)</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={30}
                  step={1}
                  value={tenure}
                  onChange={(e) => setTenure(Number(e.target.value))}
                  className="w-full accent-[#008ae8] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[#757577] mt-1">
                  <span>5 Yrs</span>
                  <span>30 Yrs</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-[#757577]">Interest Rate</span>
                  <span className="text-[#008ae8] font-bold">{interestRate.toFixed(2)}% p.a.</span>
                </div>
                <input
                  type="range"
                  min={7.5}
                  max={12}
                  step={0.05}
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full accent-[#008ae8] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[#757577] mt-1">
                  <span>7.50%</span>
                  <span>12.00%</span>
                </div>
              </div>
            </div>

            {/* Calculated Results Card */}
            <div className="lg:col-span-5 bg-[#e0f2fe] rounded-3xl p-6 sm:p-8 border border-[#008ae8]/30 flex flex-col justify-between space-y-6">
              <div>
                <span className="text-xs font-semibold text-[#008ae8] uppercase tracking-wider block">
                  Estimated Monthly Installment
                </span>
                <span className="text-3xl sm:text-4xl font-light text-[#262626] block mt-1">
                  ₹{emi.toLocaleString("en-IN")}
                </span>
                <span className="text-xs text-[#757577] mt-0.5 block">
                  Per month for {tenure} years @ {interestRate}%
                </span>
              </div>

              <div className="space-y-3 pt-4 border-t border-[#008ae8]/20 text-xs text-[#262626]">
                <div className="flex justify-between">
                  <span className="text-[#757577]">Principal Loan Amount:</span>
                  <span className="font-semibold">₹{loanAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#757577]">Total Interest Payable:</span>
                  <span className="font-semibold text-[#008ae8]">₹{totalInterest.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between border-t border-[#008ae8]/20 pt-2 font-bold">
                  <span>Total Amount (P + I):</span>
                  <span>₹{totalPayment.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bank Comparisons Table */}
        <div className="bg-white rounded-3xl border border-[#aeaeaf]/40 p-6 sm:p-10 shadow-xs space-y-6">
          <div>
            <h2 className="text-2xl font-light text-[#262626]">
              Current Bank Rates Comparison (2026)
            </h2>
            <p className="text-xs sm:text-sm text-[#757577] mt-1">
              Compare prevailing interest rates, processing fee limits, and maximum repayment tenures across partner banks.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-left">
              <thead>
                <tr className="border-b border-[#aeaeaf]/30 text-[#757577] uppercase text-[11px] font-semibold">
                  <th className="py-3 pr-4">Lending Bank</th>
                  <th className="py-3 px-4">Interest Rate (Floating)</th>
                  <th className="py-3 px-4">Processing Charges</th>
                  <th className="py-3 pl-4">Max Tenure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#aeaeaf]/20">
                {BANKS.map((b, idx) => (
                  <tr key={idx} className="hover:bg-[#fafafa] transition-colors">
                    <td className="py-3.5 pr-4 font-semibold text-[#262626]">{b.name}</td>
                    <td className="py-3.5 px-4 font-medium text-[#008ae8]">{b.rate}</td>
                    <td className="py-3.5 px-4 text-[#757577]">{b.fee}</td>
                    <td className="py-3.5 pl-4 text-[#757577]">{b.tenure}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
