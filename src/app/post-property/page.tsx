"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/sites/house-hunt/header";
import { useCmsCities } from "@/components/sites/house-hunt/cms-context";
import { Footer } from "@/components/sites/house-hunt/footer";
import {
  CheckCircle2,
  ShieldCheck,
  Zap,
  Users,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  Trash2,
} from "lucide-react";
import {
  AGE_OPTIONS,
  AMENITY_OPTIONS,
  AREA_UNITS,
  FACING_OPTIONS,
  FURNISHING_OPTIONS,
  MAX_HIGHLIGHTS,
  MAX_NEARBY,
  NEARBY_CATEGORIES,
  OWNERSHIP_OPTIONS,
  POSSESSION_STATUS,
  POSTED_BY_OPTIONS,
  PROPERTY_TYPES,
  type NearbyPlace,
} from "@/lib/post-property-options";
import { PhotoUploader, SingleImageUpload } from "./photo-upload";
import { useAuth } from "@/components/auth/auth-context";

const FALLBACK_CITIES = [
  "Gurgaon",
  "Noida",
  "Delhi / NCR",
  "Mumbai",
  "Bangalore",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
];

const STEPS = [
  "Basic Details",
  "Property Profile",
  "Features & Amenities",
  "Pricing & Description",
  "Photos & Media",
  "Contact Details",
];
const LAST_STEP = STEPS.length;

const inputCls =
  "w-full px-3 py-2 rounded-[4px] border border-[#aeaeaf]/40 text-xs focus:outline-hidden focus:border-[#008ae8] text-[#262626] bg-white";
const selectCls =
  "w-full px-3 py-2 rounded-[4px] border border-[#aeaeaf]/40 text-xs font-medium focus:outline-hidden focus:border-[#008ae8] bg-[#fafafa] text-[#262626]";

interface FormState {
  intent: "sell" | "rent";
  propertyType: string;
  city: string;
  locality: string;
  society: string;
  fullAddress: string;
  landmark: string;
  pincode: string;
  mapsUrl: string;

  bhk: string;
  bathrooms: string;
  balconies: string;
  carpetArea: string;
  builtUpArea: string;
  areaUnit: string;
  floorNumber: string;
  totalFloors: string;
  facing: string;
  furnishing: string;
  furnishingNotes: string;
  propertyAge: string;
  parking: string;
  reraNumber: string;
  possessionStatus: string;
  possessionDate: string;

  ownership: string;
  approvedBy: string;
  gatedSociety: boolean;
  openSides: string;
  cornerProperty: boolean;
  roadWidth: string;
  floorsAllowed: string;
  overlooking: string;
  boundaryWall: boolean;
  constructionDone: boolean;
  plotLength: string;
  plotWidth: string;
  amenities: string[];
  highlights: string[];

  expectedPrice: string;
  priceNegotiable: boolean;
  priceOnRequest: boolean;
  priceNote: string;
  maintenance: string;
  description: string;

  videoUrl: string;
  tourUrl: string;
  nearby: NearbyPlace[];

  postedBy: string;
  ownerName: string;
  agencyName: string;
  mobileNumber: string;
  email: string;
  whatsapp: string;
  whatsappSame: boolean;
  commission: string;
}

const INITIAL: FormState = {
  intent: "sell",
  propertyType: "Flat / Apartment",
  city: "",
  locality: "",
  society: "",
  fullAddress: "",
  landmark: "",
  pincode: "",
  mapsUrl: "",

  bhk: "3",
  bathrooms: "",
  balconies: "",
  carpetArea: "",
  builtUpArea: "",
  areaUnit: "sqft",
  floorNumber: "",
  totalFloors: "",
  facing: "",
  furnishing: "Semi-Furnished",
  furnishingNotes: "",
  propertyAge: "",
  parking: "",
  reraNumber: "",
  possessionStatus: "Ready to Move",
  possessionDate: "",

  ownership: "",
  approvedBy: "",
  gatedSociety: false,
  openSides: "",
  cornerProperty: false,
  roadWidth: "",
  floorsAllowed: "",
  overlooking: "",
  boundaryWall: false,
  constructionDone: false,
  plotLength: "",
  plotWidth: "",
  amenities: [],
  highlights: [],

  expectedPrice: "",
  priceNegotiable: false,
  priceOnRequest: false,
  priceNote: "",
  maintenance: "Included",
  description: "",

  videoUrl: "",
  tourUrl: "",
  nearby: [],

  postedBy: "owner",
  ownerName: "",
  agencyName: "",
  mobileNumber: "",
  email: "",
  whatsapp: "",
  whatsappSame: true,
  commission: "",
};

/* ---------- small form pieces ---------- */

function Field({
  label,
  hint,
  className = "",
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-[#262626] uppercase mb-1">{label}</label>
      {children}
      {hint && <span className="text-[10px] text-[#757577] mt-1 block">{hint}</span>}
    </div>
  );
}

function Chips({
  options,
  value,
  onChange,
  cols = "grid-cols-2 sm:grid-cols-3",
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  cols?: string;
}) {
  return (
    <div className={`grid ${cols} gap-2`}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={`p-2.5 rounded-[4px] text-xs font-medium border text-left transition-colors ${value === o.value
              ? "bg-[#008ae8] text-white border-[#008ae8] shadow-xs"
              : "bg-[#fafafa] border-[#aeaeaf]/40 text-[#262626] hover:bg-[#e0f2fe]"
            }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Check2({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-[#262626] cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 accent-[#008ae8]"
      />
      {label}
    </label>
  );
}

function SectionTitle({ children, note }: { children: React.ReactNode; note?: string }) {
  return (
    <div className="pt-1">
      <h3 className="text-sm font-semibold text-[#262626]">{children}</h3>
      {note && <p className="text-[11px] text-[#757577] mt-0.5">{note}</p>}
    </div>
  );
}

const toOptions = (list: readonly string[]) => list.map((v) => ({ value: v, label: v }));

export default function PostPropertyPage() {
  const cmsCities = useCmsCities().map((c) => c.name);
  const cityOptions = cmsCities.length > 0 ? cmsCities : FALLBACK_CITIES;
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [listingId, setListingId] = useState("");

  const [form, setForm] = useState<FormState>(INITIAL);
  const { member } = useAuth();

  // Logged in members don't have to retype their name and email.
  useEffect(() => {
    if (!member) return;
    setForm((f) => ({ ...f, ownerName: f.ownerName || member.name, email: f.email || member.email }));
  }, [member]);
  const [images, setImages] = useState<string[]>([]);
  const [floorPlan, setFloorPlan] = useState("");
  const [website, setWebsite] = useState(""); // Honeypot field (anti-spam)
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const isPlot = form.propertyType === "Plot / Land";
  const isCommercial = form.propertyType === "Commercial Office";
  const noRooms = isPlot || isCommercial;
  const isRent = form.intent === "rent";

  const handlePriceChange = (val: string) => {
    setForm((f) => ({
      ...f,
      expectedPrice: val,
      intent: /\/?(month|mo|pm|permonth)/i.test(val) ? "rent" : f.intent,
    }));
  };

  const toggleAmenity = (a: string) =>
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }));

  const setHighlight = (i: number, v: string) =>
    setForm((f) => ({ ...f, highlights: f.highlights.map((h, idx) => (idx === i ? v : h)) }));

  const setNearby = (i: number, patch: Partial<NearbyPlace>) =>
    setForm((f) => ({ ...f, nearby: f.nearby.map((n, idx) => (idx === i ? { ...n, ...patch } : n)) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/post-property", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          city: form.city || cityOptions[0],
          whatsapp: form.whatsappSame ? form.mobileNumber : form.whatsapp,
          highlights: form.highlights.filter((h) => h.trim()),
          nearby: form.nearby.filter((n) => n.landmark.trim()),
          floorPlan,
          images,
          website,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Submission failed. Please check your inputs.");
      }

      setListingId(data.reference || data.listingId || "");
      setIsSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission failed. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const goTo = (n: number) => {
    setError(null);
    setStep(n);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-dvh bg-[#fafafa] flex flex-col font-sans text-[#262626] selection:bg-[#008ae8] selection:text-white">
      <Header />

      <main className="flex-1 py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Top Banner */}
          <div data-ui="top-banner" className="bg-[#262626] text-white rounded-2xl p-6 sm:p-8 mb-8 border border-white/10">
            <div className="max-w-xl">
              <span className="inline-block px-2.5 py-1 rounded-[4px] text-[11px] font-medium bg-[#1c1c1e] text-[#008ae8] border border-white/10 mb-2">
                100% Free Listing
              </span>
              <h1 className="text-2xl sm:text-3xl font-light tracking-normal text-white">
                Sell or Rent Your Property at Zero Brokerage
              </h1>
              <p className="text-xs sm:text-sm text-[#aeaeaf] mt-1.5">
                Join 1,000,000+ owners who have sold or rented their properties on House Hunt .com without paying any agent commission.
              </p>
            </div>

            {/* Benefit Badges */}
            <div data-ui="benefits" className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/10 text-xs">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#008ae8] shrink-0" />
                <span>15M+ Monthly Property Buyers</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#008ae8] shrink-0" />
                <span>Direct WhatsApp Inquiries</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#008ae8] shrink-0" />
                <span>100% Spam &amp; Privacy Protection</span>
              </div>
            </div>
          </div>

          {/* Form Wizard Container */}
          <div data-ui="post-wizard" className="bg-white rounded-2xl border border-[#aeaeaf]/40 p-6 sm:p-8">
            {isSubmitted ? (
              <div className="text-center py-10">
                <CheckCircle2 className="w-16 h-16 text-[#008ae8] mx-auto mb-4" />
                <h2 className="text-2xl font-light text-[#262626]">Property Submitted for Review</h2>
                <p className="text-sm text-[#757577] mt-2 max-w-md mx-auto">
                  Your ad for <strong>{form.propertyType} in {form.society || form.locality || form.city}</strong> has been received with reference{" "}
                  <span className="font-semibold text-[#008ae8]">{listingId}</span>. Our team will verify it and publish it shortly.
                </p>
                <div className="mt-8 flex justify-center gap-3">
                  <Link
                    href="/properties"
                    className="py-2.5 px-6 rounded-[4px] font-medium text-sm bg-[#008ae8] text-white border border-[#008ae8] hover:bg-[#0077c8] transition-colors shadow-xs"
                  >
                    View All Listings
                  </Link>
                  <Link
                    href="/"
                    className="py-2.5 px-6 rounded-[4px] font-medium text-sm bg-[#fafafa] text-[#262626] hover:bg-[#e0f2fe] transition-colors"
                  >
                    Back to Homepage
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                {/* Step Indicators */}
                <div data-ui="steps" className="flex items-center justify-between border-b border-[#aeaeaf]/40 pb-5 mb-6 text-xs font-medium">
                  {STEPS.map((label, i) => {
                    const num = i + 1;
                    return (
                      <div
                        key={label}
                        className={`flex items-center gap-2 ${step === num ? "text-[#008ae8]" : step > num ? "text-[#262626]" : "text-[#757577]/60"
                          }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-medium ${step === num
                              ? "bg-[#008ae8] text-white"
                              : step > num
                                ? "bg-[#262626] text-white"
                                : "bg-[#fafafa] text-[#757577]"
                            }`}
                        >
                          {step > num ? <Check className="w-3.5 h-3.5" /> : num}
                        </span>
                        <span className="hidden lg:inline">{label}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="lg:hidden text-xs font-medium text-[#008ae8] -mt-3 mb-5">
                  Step {step} of {LAST_STEP}: {STEPS[step - 1]}
                </p>

                {/* Form Steps */}
                <form
                  onSubmit={
                    step === LAST_STEP
                      ? handleSubmit
                      : (e) => {
                        e.preventDefault();
                        goTo(step + 1);
                      }
                  }
                >
                  {/* Step 1: Basic Details */}
                  {step === 1 && (
                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-medium text-[#262626] uppercase mb-2">I Want To</label>
                        <div className="grid grid-cols-2 gap-3 max-w-sm">
                          {(
                            [
                              ["sell", "Sell Property"],
                              ["rent", "Rent Out Property"],
                            ] as const
                          ).map(([v, label]) => (
                            <button
                              key={v}
                              type="button"
                              aria-pressed={form.intent === v}
                              onClick={() => set("intent", v)}
                              className={`py-2.5 rounded-[4px] text-sm font-medium border transition-colors ${form.intent === v
                                  ? "bg-[#008ae8] border-[#008ae8] text-white shadow-xs"
                                  : "border-[#aeaeaf]/40 text-[#262626] hover:bg-[#fafafa] bg-[#fafafa]"
                                }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#262626] uppercase mb-2">Property Type</label>
                        <Chips
                          options={toOptions(PROPERTY_TYPES)}
                          value={form.propertyType}
                          onChange={(v) => set("propertyType", v)}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Field label="City">
                          <select
                            value={form.city || cityOptions[0]}
                            onChange={(e) => set("city", e.target.value)}
                            className={selectCls}
                          >
                            {cityOptions.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Locality">
                          <input
                            type="text"
                            required
                            placeholder="e.g. Golf Course Ext Rd"
                            value={form.locality}
                            onChange={(e) => set("locality", e.target.value)}
                            className={inputCls}
                          />
                        </Field>
                        <Field label="Society / Project">
                          <input
                            type="text"
                            placeholder="e.g. DLF Magnolias"
                            value={form.society}
                            onChange={(e) => set("society", e.target.value)}
                            className={inputCls}
                          />
                        </Field>
                      </div>

                      <Field label="Complete Address" hint="Shown to our team only until the listing is published.">
                        <textarea
                          rows={2}
                          maxLength={300}
                          placeholder="House / tower number, street, area"
                          value={form.fullAddress}
                          onChange={(e) => set("fullAddress", e.target.value)}
                          className={inputCls}
                        />
                      </Field>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Field label="Landmark">
                          <input
                            type="text"
                            placeholder="e.g. Near Metro Station"
                            value={form.landmark}
                            onChange={(e) => set("landmark", e.target.value)}
                            className={inputCls}
                          />
                        </Field>
                        <Field label="Pincode">
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]{6}"
                            maxLength={6}
                            placeholder="6 digits"
                            value={form.pincode}
                            onChange={(e) => set("pincode", e.target.value.replace(/\D/g, ""))}
                            className={inputCls}
                          />
                        </Field>
                        <Field label="Google Maps Link">
                          <input
                            type="url"
                            placeholder="https://maps.google.com/..."
                            value={form.mapsUrl}
                            onChange={(e) => set("mapsUrl", e.target.value)}
                            className={inputCls}
                          />
                        </Field>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Property Profile */}
                  {step === 2 && (
                    <div className="space-y-5">
                      {!noRooms && (
                        <>
                          <div>
                            <label className="block text-xs font-medium text-[#262626] uppercase mb-2">Bedrooms (BHK)</label>
                            <div className="grid grid-cols-5 gap-2 max-w-md">
                              {["1", "2", "3", "4", "5+"].map((b) => (
                                <button
                                  key={b}
                                  type="button"
                                  aria-pressed={form.bhk === b}
                                  onClick={() => set("bhk", b)}
                                  className={`py-2 rounded-[4px] text-xs font-medium border transition-colors ${form.bhk === b
                                      ? "bg-[#008ae8] text-white border-[#008ae8] shadow-xs"
                                      : "border-[#aeaeaf]/40 bg-[#fafafa] text-[#262626] hover:bg-[#e0f2fe]"
                                    }`}
                                >
                                  {b} BHK
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 max-w-md">
                            <Field label="Bathrooms">
                              <input
                                type="number"
                                min={0}
                                max={20}
                                placeholder="e.g. 3"
                                value={form.bathrooms}
                                onChange={(e) => set("bathrooms", e.target.value)}
                                className={inputCls}
                              />
                            </Field>
                            <Field label="Balconies">
                              <input
                                type="number"
                                min={0}
                                max={20}
                                placeholder="e.g. 2"
                                value={form.balconies}
                                onChange={(e) => set("balconies", e.target.value)}
                                className={inputCls}
                              />
                            </Field>
                          </div>
                        </>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Field label={isPlot ? "Plot Area" : "Carpet Area (sq.ft)"}>
                          <input
                            type="number"
                            required
                            min={1}
                            placeholder="e.g. 1850"
                            value={form.carpetArea}
                            onChange={(e) => set("carpetArea", e.target.value)}
                            className={inputCls}
                          />
                        </Field>
                        {isPlot ? (
                          <Field label="Area Unit">
                            <select
                              value={form.areaUnit}
                              onChange={(e) => set("areaUnit", e.target.value)}
                              className={selectCls}
                            >
                              {AREA_UNITS.map((u) => (
                                <option key={u.value} value={u.value}>
                                  {u.label}
                                </option>
                              ))}
                            </select>
                          </Field>
                        ) : (
                          <Field label="Built-up Area (sq.ft)" hint="Optional">
                            <input
                              type="number"
                              min={1}
                              placeholder="e.g. 2200"
                              value={form.builtUpArea}
                              onChange={(e) => set("builtUpArea", e.target.value)}
                              className={inputCls}
                            />
                          </Field>
                        )}
                        <Field label="Facing">
                          <select value={form.facing} onChange={(e) => set("facing", e.target.value)} className={selectCls}>
                            <option value="">Select</option>
                            {FACING_OPTIONS.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </Field>
                      </div>

                      {!isPlot && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <Field label="Floor Number" hint="0 = ground">
                            <input
                              type="number"
                              min={0}
                              max={200}
                              placeholder="e.g. 6"
                              value={form.floorNumber}
                              onChange={(e) => set("floorNumber", e.target.value)}
                              className={inputCls}
                            />
                          </Field>
                          <Field label="Total Floors">
                            <input
                              type="number"
                              min={0}
                              max={200}
                              placeholder="e.g. 18"
                              value={form.totalFloors}
                              onChange={(e) => set("totalFloors", e.target.value)}
                              className={inputCls}
                            />
                          </Field>
                          <Field label="Parking Spaces">
                            <input
                              type="number"
                              min={0}
                              max={99}
                              placeholder="e.g. 2"
                              value={form.parking}
                              onChange={(e) => set("parking", e.target.value)}
                              className={inputCls}
                            />
                          </Field>
                          <Field label="Property Age">
                            <select
                              value={form.propertyAge}
                              onChange={(e) => set("propertyAge", e.target.value)}
                              className={selectCls}
                            >
                              <option value="">Select</option>
                              {AGE_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                          </Field>
                        </div>
                      )}

                      {isPlot && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Field label="Parking Spaces">
                            <input
                              type="number"
                              min={0}
                              max={99}
                              value={form.parking}
                              onChange={(e) => set("parking", e.target.value)}
                              className={inputCls}
                            />
                          </Field>
                        </div>
                      )}

                      {!isPlot && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Field label="Furnishing Status">
                            <select
                              value={form.furnishing}
                              onChange={(e) => set("furnishing", e.target.value)}
                              className={selectCls}
                            >
                              {FURNISHING_OPTIONS.map((f) => (
                                <option key={f} value={f}>
                                  {f}
                                </option>
                              ))}
                            </select>
                          </Field>
                          <Field label="Furnishing Notes" hint="Optional, e.g. modular kitchen, 3 ACs, wardrobes">
                            <input
                              type="text"
                              maxLength={120}
                              value={form.furnishingNotes}
                              onChange={(e) => set("furnishingNotes", e.target.value)}
                              className={inputCls}
                            />
                          </Field>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-medium text-[#262626] uppercase mb-2">Possession Status</label>
                        <Chips
                          options={toOptions(POSSESSION_STATUS)}
                          value={form.possessionStatus}
                          onChange={(v) => set("possessionStatus", v)}
                          cols="grid-cols-1 sm:grid-cols-3"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {form.possessionStatus !== "Ready to Move" && (
                          <Field label="Possession Date">
                            <input
                              type="date"
                              value={form.possessionDate}
                              onChange={(e) => set("possessionDate", e.target.value)}
                              className={inputCls}
                            />
                          </Field>
                        )}
                        <Field label="RERA Number" hint="Optional">
                          <input
                            type="text"
                            maxLength={60}
                            placeholder="e.g. RC/REP/HARERA/GGM/123"
                            value={form.reraNumber}
                            onChange={(e) => set("reraNumber", e.target.value)}
                            className={inputCls}
                          />
                        </Field>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Features & Amenities */}
                  {step === 3 && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Ownership">
                          <select
                            value={form.ownership}
                            onChange={(e) => set("ownership", e.target.value)}
                            className={selectCls}
                          >
                            <option value="">Select</option>
                            {OWNERSHIP_OPTIONS.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Approved By" hint="Optional, e.g. DDA, BDA, HMDA">
                          <input
                            type="text"
                            maxLength={120}
                            value={form.approvedBy}
                            onChange={(e) => set("approvedBy", e.target.value)}
                            className={inputCls}
                          />
                        </Field>
                      </div>

                      {isPlot ? (
                        <div className="space-y-4">
                          <SectionTitle note="Dimensions are in feet.">Plot details</SectionTitle>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <Field label="Plot Length">
                              <input
                                type="number"
                                min={0}
                                step="any"
                                value={form.plotLength}
                                onChange={(e) => set("plotLength", e.target.value)}
                                className={inputCls}
                              />
                            </Field>
                            <Field label="Plot Width">
                              <input
                                type="number"
                                min={0}
                                step="any"
                                value={form.plotWidth}
                                onChange={(e) => set("plotWidth", e.target.value)}
                                className={inputCls}
                              />
                            </Field>
                            <Field label="Open Sides">
                              <select
                                value={form.openSides}
                                onChange={(e) => set("openSides", e.target.value)}
                                className={selectCls}
                              >
                                <option value="">Select</option>
                                {["1", "2", "3", "4"].map((n) => (
                                  <option key={n} value={n}>
                                    {n}
                                  </option>
                                ))}
                              </select>
                            </Field>
                            <Field label="Floors Allowed">
                              <input
                                type="number"
                                min={0}
                                max={99}
                                value={form.floorsAllowed}
                                onChange={(e) => set("floorsAllowed", e.target.value)}
                                className={inputCls}
                              />
                            </Field>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Facing Road Width" hint="e.g. 30 ft">
                              <input
                                type="text"
                                maxLength={40}
                                value={form.roadWidth}
                                onChange={(e) => set("roadWidth", e.target.value)}
                                className={inputCls}
                              />
                            </Field>
                            <Field label="Overlooking" hint="e.g. Park, main road">
                              <input
                                type="text"
                                maxLength={120}
                                value={form.overlooking}
                                onChange={(e) => set("overlooking", e.target.value)}
                                className={inputCls}
                              />
                            </Field>
                          </div>
                          <div className="flex flex-wrap gap-x-6 gap-y-3">
                            <Check2 label="Corner plot" checked={form.cornerProperty} onChange={(v) => set("cornerProperty", v)} />
                            <Check2 label="Boundary wall" checked={form.boundaryWall} onChange={(v) => set("boundaryWall", v)} />
                            <Check2
                              label="Construction already done"
                              checked={form.constructionDone}
                              onChange={(v) => set("constructionDone", v)}
                            />
                            <Check2 label="In a gated society" checked={form.gatedSociety} onChange={(v) => set("gatedSociety", v)} />
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                          <Field label="Overlooking" hint="Optional, e.g. Park, garden, main road">
                            <input
                              type="text"
                              maxLength={120}
                              value={form.overlooking}
                              onChange={(e) => set("overlooking", e.target.value)}
                              className={inputCls}
                            />
                          </Field>
                          <div className="flex flex-wrap gap-x-6 gap-y-3 pb-2">
                            <Check2 label="In a gated society" checked={form.gatedSociety} onChange={(v) => set("gatedSociety", v)} />
                            <Check2 label="Corner property" checked={form.cornerProperty} onChange={(v) => set("cornerProperty", v)} />
                          </div>
                        </div>
                      )}

                      {!isPlot && (
                        <div>
                          <SectionTitle note="Tick everything your property or society offers.">Amenities</SectionTitle>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {AMENITY_OPTIONS.map((a) => {
                              const on = form.amenities.includes(a);
                              return (
                                <button
                                  key={a}
                                  type="button"
                                  aria-pressed={on}
                                  onClick={() => toggleAmenity(a)}
                                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${on
                                      ? "bg-[#008ae8] text-white border-[#008ae8]"
                                      : "bg-[#fafafa] border-[#aeaeaf]/40 text-[#262626] hover:bg-[#e0f2fe]"
                                    }`}
                                >
                                  {on && <Check className="inline w-3 h-3 mr-1 -mt-0.5" />}
                                  {a}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div>
                        <SectionTitle note={`Short selling points shown on your listing, up to ${MAX_HIGHLIGHTS}.`}>
                          Property highlights
                        </SectionTitle>
                        <div className="mt-3 space-y-2">
                          {form.highlights.map((h, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <input
                                type="text"
                                maxLength={120}
                                placeholder="e.g. Vastu-compliant, corner unit with park view"
                                value={h}
                                onChange={(e) => setHighlight(i, e.target.value)}
                                className={inputCls}
                              />
                              <button
                                type="button"
                                aria-label="Remove highlight"
                                onClick={() => set("highlights", form.highlights.filter((_, idx) => idx !== i))}
                                className="p-2 rounded-[4px] text-[#757577] hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          {form.highlights.length < MAX_HIGHLIGHTS && (
                            <button
                              type="button"
                              onClick={() => set("highlights", [...form.highlights, ""])}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#008ae8] bg-[#e0f2fe] hover:bg-[#bae6fd] border border-[#008ae8]/30"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Add highlight
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Pricing & Description */}
                  {step === 4 && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-semibold text-[#262626] uppercase">
                              {isRent ? "Monthly Rent (₹)" : "Expected Price (₹)"}
                            </label>
                            <div className="flex items-center gap-1 bg-[#fafafa] p-0.5 rounded border border-[#aeaeaf]/40 text-[10px]">
                              {(
                                [
                                  ["sell", "For Sale"],
                                  ["rent", "For Rent"],
                                ] as const
                              ).map(([v, label]) => (
                                <button
                                  key={v}
                                  type="button"
                                  onClick={() => set("intent", v)}
                                  className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${form.intent === v
                                      ? "bg-[#008ae8] text-white font-medium"
                                      : "text-[#757577] hover:text-[#262626]"
                                    }`}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                          </div>
                          <input
                            type="text"
                            required
                            placeholder={isRent ? "e.g. 10,000 / month or 7,000" : "e.g. 85 Lac or 2.40 Cr"}
                            value={form.expectedPrice}
                            onChange={(e) => handlePriceChange(e.target.value)}
                            className={inputCls}
                          />
                          <span className="text-[10px] text-[#757577] mt-1 block">
                            {isRent
                              ? "Format: 10,000 / month, 7000 / month, 7,000, 10k, etc."
                              : "Format: 85 Lac, 2.40 Cr, 1.5 Crore, or total rupees"}
                          </span>
                        </div>
                        <Field label="Monthly Maintenance">
                          <select
                            value={form.maintenance}
                            onChange={(e) => set("maintenance", e.target.value)}
                            className={selectCls}
                          >
                            <option value="Included">Included in price</option>
                            <option value="Extra">Extra as applicable</option>
                          </select>
                        </Field>
                      </div>

                      <div className="flex flex-wrap gap-x-6 gap-y-3">
                        <Check2
                          label="Price is negotiable"
                          checked={form.priceNegotiable}
                          onChange={(v) => set("priceNegotiable", v)}
                        />
                        <Check2
                          label="Show “Price on request” instead of the amount"
                          checked={form.priceOnRequest}
                          onChange={(v) => set("priceOnRequest", v)}
                        />
                      </div>

                      <Field label="Price Note" hint="Optional, e.g. Includes 2 car parks, registration extra">
                        <input
                          type="text"
                          maxLength={160}
                          value={form.priceNote}
                          onChange={(e) => set("priceNote", e.target.value)}
                          className={inputCls}
                        />
                      </Field>

                      <Field
                        label="Describe Your Property"
                        hint={`${form.description.length} / 1500. Layout, surroundings, what makes it special.`}
                      >
                        <textarea
                          rows={6}
                          maxLength={1500}
                          placeholder="Tell buyers about the layout, light, neighbourhood, recent upgrades…"
                          value={form.description}
                          onChange={(e) => set("description", e.target.value)}
                          className={inputCls}
                        />
                      </Field>
                    </div>
                  )}

                  {/* Step 5: Photos & Media */}
                  {step === 5 && (
                    <div className="space-y-6">
                      <PhotoUploader images={images} setImages={setImages} />

                      <SingleImageUpload
                        label="Floor Plan"
                        hint="Optional. A photo or scan of the floor plan."
                        value={floorPlan}
                        onChange={setFloorPlan}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Video Link" hint="Optional, a YouTube or Vimeo link">
                          <input
                            type="url"
                            placeholder="https://youtube.com/watch?v=…"
                            value={form.videoUrl}
                            onChange={(e) => set("videoUrl", e.target.value)}
                            className={inputCls}
                          />
                        </Field>
                        <Field label="Virtual Tour Link" hint="Optional, a 360° tour link">
                          <input
                            type="url"
                            placeholder="https://…"
                            value={form.tourUrl}
                            onChange={(e) => set("tourUrl", e.target.value)}
                            className={inputCls}
                          />
                        </Field>
                      </div>

                      <div>
                        <SectionTitle note={`Metro, schools, hospitals and more, up to ${MAX_NEARBY}.`}>
                          Nearby places
                        </SectionTitle>
                        <div className="mt-3 space-y-2">
                          {form.nearby.map((n, i) => (
                            <div key={i} className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_120px_170px_auto] gap-2 items-center">
                              <input
                                type="text"
                                maxLength={100}
                                placeholder="e.g. Rapid Metro Station"
                                value={n.landmark}
                                onChange={(e) => setNearby(i, { landmark: e.target.value })}
                                className={`${inputCls} col-span-2 sm:col-span-1`}
                              />
                              <input
                                type="text"
                                maxLength={30}
                                placeholder="e.g. 1.2 km"
                                value={n.distance}
                                onChange={(e) => setNearby(i, { distance: e.target.value })}
                                className={inputCls}
                              />
                              <select
                                value={n.category}
                                onChange={(e) => setNearby(i, { category: e.target.value })}
                                className={selectCls}
                                aria-label="Type of place"
                              >
                                {NEARBY_CATEGORIES.map((c) => (
                                  <option key={c.value} value={c.value}>
                                    {c.label}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                aria-label="Remove place"
                                onClick={() => set("nearby", form.nearby.filter((_, idx) => idx !== i))}
                                className="p-2 rounded-[4px] text-[#757577] hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          {form.nearby.length < MAX_NEARBY && (
                            <button
                              type="button"
                              onClick={() =>
                                set("nearby", [...form.nearby, { landmark: "", distance: "", category: "transit" }])
                              }
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#008ae8] bg-[#e0f2fe] hover:bg-[#bae6fd] border border-[#008ae8]/30"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Add a nearby place
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 6: Contact Info */}
                  {step === 6 && (
                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-medium text-[#262626] uppercase mb-2">I am posting as</label>
                        <div className="max-w-md">
                          <Chips
                            options={POSTED_BY_OPTIONS}
                            value={form.postedBy}
                            onChange={(v) => set("postedBy", v)}
                            cols="grid-cols-3"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Your Full Name">
                          <input
                            type="text"
                            required
                            placeholder="e.g. Rajesh Sharma"
                            value={form.ownerName}
                            onChange={(e) => set("ownerName", e.target.value)}
                            className={inputCls}
                          />
                        </Field>
                        {form.postedBy !== "owner" && (
                          <Field label={form.postedBy === "builder" ? "Company Name" : "Agency Name"} hint="Shown publicly on the listing">
                            <input
                              type="text"
                              maxLength={80}
                              value={form.agencyName}
                              onChange={(e) => set("agencyName", e.target.value)}
                              className={inputCls}
                            />
                          </Field>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Mobile Number (for buyer WhatsApp inquiries)">
                          <div className="flex rounded-[4px] border border-[#aeaeaf]/40 overflow-hidden focus-within:border-[#008ae8]">
                            <span data-ui="prefix" className="bg-[#fafafa] px-3 py-2 text-xs font-medium text-[#262626] border-r border-[#aeaeaf]/40">
                              +91
                            </span>
                            <input
                              type="tel"
                              required
                              pattern="[0-9]{10}"
                              placeholder="10 digit mobile"
                              value={form.mobileNumber}
                              onChange={(e) => set("mobileNumber", e.target.value)}
                              className="w-full px-3 py-2 text-xs focus:outline-hidden bg-white text-[#262626]"
                            />
                          </div>
                        </Field>
                        <Field label="Email" hint="Optional">
                          <input
                            type="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={(e) => set("email", e.target.value)}
                            className={inputCls}
                          />
                        </Field>
                      </div>

                      <div className="space-y-3">
                        <Check2
                          label="My WhatsApp number is the same as my mobile number"
                          checked={form.whatsappSame}
                          onChange={(v) => set("whatsappSame", v)}
                        />
                        {!form.whatsappSame && (
                          <div className="max-w-xs">
                            <Field label="WhatsApp Number" hint="Optional">
                              <input
                                type="tel"
                                pattern="[0-9]{10}"
                                placeholder="10 digit WhatsApp number"
                                value={form.whatsapp}
                                onChange={(e) => set("whatsapp", e.target.value)}
                                className={inputCls}
                              />
                            </Field>
                          </div>
                        )}
                      </div>

                      {form.postedBy === "broker" && (
                        <div className="max-w-xs">
                          <Field label="Brokerage (%)" hint="Optional, never shown publicly">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              step="0.1"
                              value={form.commission}
                              onChange={(e) => set("commission", e.target.value)}
                              className={inputCls}
                            />
                          </Field>
                        </div>
                      )}

                      <p className="text-[11px] text-[#757577] flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#008ae8] shrink-0" />
                        Your mobile number, email and WhatsApp number are kept private. Buyers reach you through our
                        enquiry form and our team shares them with you.
                      </p>
                    </div>
                  )}

                  {/* Honeypot field: invisible to people, bots fill it in */}
                  <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                    <label>
                      Website
                      <input
                        type="text"
                        name="website"
                        tabIndex={-1}
                        autoComplete="off"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                      />
                    </label>
                  </div>

                  {error && (
                    <p role="alert" className="mt-5 text-xs font-medium text-[#c2410c]">
                      {error}
                    </p>
                  )}

                  {/* Form Footer Buttons */}
                  <div data-ui="wizard-nav" className="mt-8 pt-5 border-t border-[#aeaeaf]/40 flex items-center justify-between">
                    {step > 1 ? (
                      <button
                        type="button"
                        onClick={() => goTo(step - 1)}
                        className="py-2 px-4 rounded-[4px] text-xs font-medium text-[#757577] hover:bg-[#fafafa] flex items-center gap-1.5"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Previous
                      </button>
                    ) : (
                      <div />
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="py-2.5 px-6 rounded-[4px] font-medium text-xs sm:text-sm bg-[#008ae8] hover:bg-[#0077c8] text-white border border-[#008ae8] flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {step === LAST_STEP ? (submitting ? "Submitting..." : "Post Property FREE") : "Continue to Next Step"}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
