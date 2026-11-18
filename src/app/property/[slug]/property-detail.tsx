"use client";

import { useAuth } from "@/components/auth/auth-context";
import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/sites/house-hunt/header";
import { Footer } from "@/components/sites/house-hunt/footer";
import { CmsImage } from "@/components/sites/house-hunt/cms-image";
import { BlogCard } from "@/components/sites/house-hunt/blog-card";
import { VerifiedBadge, ReraBadge } from "@/components/sites/house-hunt/icons";
import { EnquiryHoneypot } from "@/components/sites/house-hunt/enquiry-honeypot";
import { sendEnquiry } from "@/lib/enquiry";
import {
  ArrowUpRight,
  BadgeCheck,
  BedDouble,
  BellRing,
  Calendar,
  Car,
  CheckCircle2,
  CloudRain,
  Compass,
  Droplets,
  Dumbbell,
  Flame,
  Footprints,
  Heart,
  Hospital,
  IndianRupee,
  KeyRound,
  Layers,
  Lock,
  Maximize,
  MapPin,
  MoveVertical,
  PhoneCall,
  PlugZap,
  Ruler,
  School,
  ShieldCheck,
  ShoppingBag,
  Smile,
  Snowflake,
  Sofa,
  TrainFront,
  Trees,
  UtensilsCrossed,
  Waves,
  Wifi,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { InsightItem, ListingDetail, NearbyPlace } from "@/lib/cms/types";
import type { PriceInsights } from "@/lib/cms/insights";

/* ---------- helpers ---------- */

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

function emiFor(principal: number, years = 20, rate = 8.35) {
  const r = rate / 12 / 100;
  const n = years * 12;
  return Math.round((principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
}

const yesNo = (v: boolean | null) => (v === null ? "" : v ? "Yes" : "No");

const AMENITY_ICONS: Array<[RegExp, LucideIcon]> = [
  [/pool|swim/i, Waves],
  [/gym|fitness/i, Dumbbell],
  [/secur|cctv|guard|biometric/i, ShieldCheck],
  [/power|backup|dg /i, Zap],
  [/park(ing)?\b.*(car|cover|valet|visitor)|car park|parking/i, Car],
  [/garden|park|green|landscap|lawn|plantation|tree/i, Trees],
  [/play|children|kids/i, Smile],
  [/jogging|walk|track|cycl/i, Footprints],
  [/lift|elevator/i, MoveVertical],
  [/water|sewage|drain/i, Droplets],
  [/air condition|ac\b|hvac|central ac/i, Snowflake],
  [/wi-?fi|internet|fib(re|er)/i, Wifi],
  [/food|cafeteria|court|dining|restaurant/i, UtensilsCrossed],
  [/fire/i, Flame],
  [/gated|boundary|entrance|access/i, Lock],
  [/concierge|reception|valet/i, BellRing],
  [/rain/i, CloudRain],
  [/ev |charging/i, PlugZap],
];

function amenityIcon(name: string): LucideIcon {
  return AMENITY_ICONS.find(([re]) => re.test(name))?.[1] ?? CheckCircle2;
}

const NEARBY_META: Record<NearbyPlace["category"], { label: string; icon: LucideIcon }> = {
  hospital: { label: "Hospitals", icon: Hospital },
  school: { label: "Schools", icon: School },
  transit: { label: "Transit", icon: TrainFront },
  shopping: { label: "Shopping", icon: ShoppingBag },
  dining: { label: "Dining", icon: UtensilsCrossed },
  other: { label: "Other", icon: MapPin },
};

/* ---------- price trend chart (inline SVG, data comes from WordPress) ---------- */

function PriceTrendChart({ points }: { points: Array<{ period: string; rate: number }> }) {
  const W = 640;
  const H = 240;
  const pad = { l: 56, r: 40, t: 16, b: 34 };
  const rates = points.map((p) => p.rate);
  const lo = Math.min(...rates) * 0.9;
  const hi = Math.max(...rates) * 1.05;
  const x = (i: number) => pad.l + (i * (W - pad.l - pad.r)) / Math.max(points.length - 1, 1);
  const y = (v: number) => pad.t + (1 - (v - lo) / (hi - lo || 1)) * (H - pad.t - pad.b);
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.rate).toFixed(1)}`).join(" ");
  const area = `${line} L${x(points.length - 1).toFixed(1)},${H - pad.b} L${x(0).toFixed(1)},${H - pad.b} Z`;
  const ticks = [lo, (lo + hi) / 2, hi];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Average price per square foot over time" className="w-full h-auto">
      <defs>
        <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#008ae8" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#008ae8" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="#aeaeaf" strokeOpacity="0.35" strokeDasharray="3 4" />
          <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#757577">
            {inr(t)}
          </text>
        </g>
      ))}
      <path d={area} fill="url(#trendFill)" />
      <path d={line} fill="none" stroke="#008ae8" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <g key={p.period}>
          <circle cx={x(i)} cy={y(p.rate)} r="4" fill="#fff" stroke="#008ae8" strokeWidth="2">
            <title>{`${p.period}: ${inr(p.rate)} / sq.ft`}</title>
          </circle>
          <text x={x(i)} y={H - 10} textAnchor="middle" fontSize="11" fill="#757577">
            {p.period}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ---------- page ---------- */

export function PropertyDetail({
  property,
  insights,
  dealerListed,
  articles,
}: {
  property: ListingDetail;
  insights: PriceInsights;
  dealerListed: number;
  articles: InsightItem[];
}) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [nearbyTab, setNearbyTab] = useState<"all" | NearbyPlace["category"]>("all");
  const { member, isShortlisted, toggleShortlist } = useAuth();
  const saved = isShortlisted(property.id);

  const initialLoan = Math.min(100_000_000, Math.max(1_000_000, Math.round((property.priceNum * 100_000 * 0.8) / 500_000) * 500_000));
  const [loanAmount, setLoanAmount] = useState(initialLoan);
  const [tenure, setTenure] = useState(20);
  const emi = emiFor(loanAmount, tenure);
  const headerEmi = property.listingType === "sale" && property.priceNum > 0 ? emiFor(property.priceNum * 100_000 * 0.8) : 0;

  // Sidebar quick callback
  // The name starts from the logged in member; typing overrides it.
  const [phone, setPhone] = useState("");
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [sidebarSending, setSidebarSending] = useState(false);
  const [sidebarError, setSidebarError] = useState("");
  const [trap, setTrap] = useState("");
  // Dealer enquiry form
  const [role, setRole] = useState<"individual" | "dealer">("individual");
  const [nameInput, setName] = useState<string | null>(null);
  const name = nameInput ?? member?.name ?? "";
  const [dealerPhone, setDealerPhone] = useState("");
  const [message, setMessage] = useState("I am interested in this property.");
  const [agree, setAgree] = useState(false);
  const [dealerSent, setDealerSent] = useState(false);
  const [dealerSending, setDealerSending] = useState(false);
  const [dealerError, setDealerError] = useState("");

  const enquiryBase = {
    propertyTitle: property.title,
    propertyId: property.id,
    propertyRef: property.reference,
    dealer: property.dealer?.name ?? "",
    website: trap,
  };

  const submitSidebar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sidebarSending) return;
    setSidebarSending(true);
    setSidebarError("");
    const res = await sendEnquiry({ ...enquiryBase, source: "property_callback", phone });
    setSidebarSending(false);
    if (!res.ok) return setSidebarError(res.error);
    setEnquirySuccess(true);
    setPhone("");
  };

  const submitDealer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dealerSending) return;
    setDealerSending(true);
    setDealerError("");
    const res = await sendEnquiry({ ...enquiryBase, source: "property_dealer", phone: dealerPhone, name, message, role });
    setDealerSending(false);
    if (!res.ok) return setDealerError(res.error);
    setDealerSent(true);
  };

  const isPlot = property.type === "Plot / Land";
  const contactName = property.dealer?.name || property.builderName || "the Seller";

  const facts: Array<{ icon: LucideIcon; label: string; value: string; sub?: string }> = [
    {
      icon: Ruler,
      label: isPlot ? "Plot Area" : "Area",
      value: property.area,
      sub: property.plotDimensions ? `L x B: ${property.plotDimensions.length.toFixed(2)} ft x ${property.plotDimensions.width.toFixed(2)} ft` : undefined,
    },
    {
      icon: IndianRupee,
      label: property.listingType === "sale" ? "Price" : "Rent",
      value: property.price,
      sub: [property.priceNote, property.pricePerSqFt && `@ ${property.pricePerSqFt}`, property.negotiable ? "Negotiable" : ""].filter(Boolean).join(" · "),
    },
    { icon: KeyRound, label: "Property Ownership", value: property.ownership },
    { icon: Compass, label: "Facing", value: property.facing },
    { icon: BadgeCheck, label: "Approved By", value: property.approvedBy },
    { icon: Lock, label: "Gated Society", value: yesNo(property.gatedSociety) },
    { icon: Maximize, label: "No. of Open Sides", value: property.openSides !== null ? String(property.openSides) : "" },
    { icon: Calendar, label: "Possession", value: property.possession },
    { icon: Layers, label: "Floor", value: property.floor },
    { icon: BedDouble, label: "Configuration", value: property.bhk > 0 ? `${property.bhk} BHK` : "" },
    { icon: Sofa, label: "Furnishing", value: property.furnishing },
    { icon: Car, label: "Parking", value: property.parking },
  ].filter((f) => f.value);

  const extra: Array<[string, string]> = (
    [
      ["Width of facing road", property.roadWidth],
      ["Corner property", yesNo(property.cornerProperty)],
      ["No. of floors permissible (FAR)", property.floorsAllowed !== null ? String(property.floorsAllowed) : ""],
      ["Overlooking", property.overlooking],
      ["Boundary wall available", yesNo(property.boundaryWall)],
      ["Any construction done", yesNo(property.constructionDone)],
    ] as Array<[string, string]>
  ).filter(([, v]) => v);

  const amenities = showAllAmenities ? property.amenities : property.amenities.slice(0, 6);
  const nearbyCats = Array.from(new Set(property.nearby.map((n) => n.category)));
  const nearbyShown = nearbyTab === "all" ? property.nearby : property.nearby.filter((n) => n.category === nearbyTab);

  const tabs = [
    { id: "overview", label: "Overview", show: true },
    { id: "dealer", label: "Dealer Details", show: Boolean(property.dealer) },
    { id: "price-trends", label: "Price Trends", show: property.priceHistory.length > 1 },
    { id: "articles", label: "Articles", show: articles.length > 0 },
  ].filter((t) => t.show);

  const trendRate = property.priceHistory.length ? property.priceHistory[property.priceHistory.length - 1].rate : 0;

  return (
    <div className="min-h-dvh bg-[#fafafa] flex flex-col font-sans text-[#262626] selection:bg-[#008ae8] selection:text-white">
      <Header />

      {/* Breadcrumb */}
      <div data-ui="breadcrumb" className="bg-white border-b border-[#aeaeaf]/40 py-3 px-4 sm:px-6 lg:px-8 2xl:px-12">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-3 text-xs text-[#757577]">
          <div className="flex items-center gap-2 min-w-0">
            <Link href="/" className="hover:text-[#008ae8] transition-colors">Home</Link>
            <span>/</span>
            <Link href="/properties" className="hover:text-[#008ae8] transition-colors">Properties</Link>
            {property.city && (
              <>
                <span>/</span>
                <Link href={`/properties?city=${encodeURIComponent(property.city)}`} className="hover:text-[#008ae8] transition-colors">{property.city}</Link>
              </>
            )}
            <span>/</span>
            <span className="font-medium text-[#262626] truncate">{property.title}</span>
          </div>
          {property.postedOn && <span className="hidden sm:inline shrink-0">Posted on {property.postedOn}</span>}
        </div>
      </div>

      <main className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-6 flex-1 w-full space-y-6">
        {/* Title / price header */}
        <div data-ui="title-card" className="bg-white p-5 sm:p-6 rounded-2xl border border-[#aeaeaf]/40 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:items-center">
          <div className="lg:col-span-4">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-3xl font-light text-[#262626]">{property.price}</span>
              {property.priceNote && <span className="text-xs text-[#008ae8]">{property.priceNote}</span>}
            </div>
            <p className="mt-1 text-xs text-[#757577]">
              {[property.pricePerSqFt && `@ ${property.pricePerSqFt}`, headerEmi ? `EMI approx. ${inr(headerEmi)}` : ""].filter(Boolean).join(" · ")}
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="px-2.5 py-0.5 rounded-[4px] text-[11px] font-medium bg-[#1c1c1e] text-white">{property.badge || property.type}</span>
              {property.verified && <VerifiedBadge />}
              {property.rera && <ReraBadge reraId={property.rera} />}
              {property.localityChange !== null && (
                <span className="inline-flex items-center gap-1 rounded-[4px] bg-[#e0f2fe] px-2 py-0.5 text-[11px] font-medium text-[#008ae8]">
                  <ArrowUpRight className="w-3 h-3" /> {property.localityChange}% (1Y)
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-light tracking-normal text-[#262626] leading-snug">{property.title}</h1>
            <p className="flex items-center gap-1.5 text-xs sm:text-sm text-[#757577] mt-1">
              <MapPin className="w-4 h-4 text-[#008ae8] shrink-0" />
              <span>{[property.location, property.city].filter(Boolean).join(", ")}</span>
            </p>
          </div>

          <div className="lg:col-span-3 flex flex-row lg:flex-col gap-2">
            <a
              href="#dealer-enquiry"
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-[4px] border border-[#008ae8] bg-[#008ae8] px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium text-white hover:bg-[#0077c8] transition-colors"
            >
              <PhoneCall className="w-4 h-4 shrink-0" /> <span>Contact {property.dealer ? "Dealer" : "Seller"}</span>
            </a>
            <button
              type="button"
              onClick={() => toggleShortlist(property.id)}
              aria-pressed={saved}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-[4px] border px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium transition-colors ${saved ? "border-[#008ae8] bg-[#e0f2fe] text-[#008ae8]" : "border-[#aeaeaf]/40 bg-white text-[#262626] hover:bg-[#fafafa]"
                }`}
            >
              <Heart className={`w-4 h-4 shrink-0 ${saved ? "fill-current" : ""}`} /> <span>{saved ? "Shortlisted" : "Shortlist"}</span>
            </button>
          </div>
        </div>

        {/* Sticky section tabs */}
        <nav aria-label="Property sections" className="sticky top-16 z-30 -mx-1 px-1">
          <div className="flex gap-1 overflow-x-auto no-scrollbar rounded-2xl border border-[#aeaeaf]/40 bg-white p-1.5">
            {tabs.map((t) => (
              <a
                key={t.id}
                href={`#${t.id}`}
                className="whitespace-nowrap rounded-[4px] px-4 py-2 text-xs sm:text-sm font-medium text-[#262626] hover:bg-[#e0f2fe] hover:text-[#008ae8] transition-colors"
              >
                {t.label}
              </a>
            ))}
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Gallery */}
            <section id="overview" className="scroll-mt-32 space-y-6">
              <div data-ui="gallery" className="bg-white p-4 rounded-2xl border border-[#aeaeaf]/40 space-y-3">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <span className="rounded-[4px] bg-[#1c1c1e] px-2.5 py-1 text-white">Property ({property.images.length})</span>
                  {property.video && (
                    <a href={property.video} target="_blank" rel="noopener noreferrer" className="rounded-[4px] border border-[#aeaeaf]/40 px-2.5 py-1 hover:bg-[#e0f2fe]">
                      Video (1)
                    </a>
                  )}
                </div>
                <div className="relative aspect-16/9 rounded-xl overflow-hidden bg-[#fafafa]">
                  <CmsImage src={property.images[activeImageIndex]} alt={property.title} sizes="(min-width: 1024px) 66vw, 100vw" priority className="object-cover" />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {property.images.map((img: string, idx: number) => (
                    <button
                      key={img + idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      aria-label={`Show photo ${idx + 1}`}
                      className={`relative aspect-16/10 rounded-lg overflow-hidden border-2 transition-colors ${activeImageIndex === idx ? "border-[#008ae8]" : "border-transparent"}`}
                    >
                      <CmsImage src={img} alt={`${property.title} photo ${idx + 1}`} sizes="25vw" className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Key facts */}
              <div data-ui="specs-grid" className="bg-white p-6 rounded-2xl border border-[#aeaeaf]/40">
                <h2 className="text-base font-medium text-[#262626] mb-4">Property Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  {facts.map((f) => {
                    const Icon = f.icon;
                    return (
                      <div key={f.label} className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e0f2fe] text-[#008ae8]">
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <span className="block text-[11px] uppercase font-semibold text-[#757577]">{f.label}</span>
                          <strong className="block text-sm font-medium text-[#262626]">{f.value}</strong>
                          {f.sub && <span className="block text-[11px] text-[#757577]">{f.sub}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {property.rera && (
                  <p className="mt-4 rounded-xl bg-[#fafafa] px-3 py-2 text-xs text-[#757577]">
                    RERA number: <strong className="font-medium text-[#262626]">{property.rera}</strong>
                  </p>
                )}
              </div>

              {/* Highlights */}
              {property.highlights.length > 0 && (
                <div data-ui="highlights" className="rounded-2xl border border-[#008ae8]/20 bg-[#e0f2fe]/50 p-6">
                  <h2 className="text-base font-medium text-[#262626]">Key Highlights <span className="text-xs font-normal text-[#757577]">of the property</span></h2>
                  <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
                    {property.highlights.map((h) => (
                      <li key={h} className="flex items-center gap-2 text-sm text-[#262626]">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#008ae8]" /> {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Additional facts */}
              {extra.length > 0 && (
                <div data-ui="extra-facts" className="bg-white p-6 rounded-2xl border border-[#aeaeaf]/40">
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    {extra.map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4 border-b border-[#aeaeaf]/30 pb-2">
                        <dt className="text-[#757577]">{k}</dt>
                        <dd className="font-medium text-[#262626] text-right">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {/* About */}
              {property.descriptionHtml && (
                <div data-ui="overview" className="bg-white p-6 rounded-2xl border border-[#aeaeaf]/40">
                  <h2 className="text-base font-medium text-[#262626] mb-3">About Property</h2>
                  <div className="blog-content is-compact" dangerouslySetInnerHTML={{ __html: property.descriptionHtml }} />
                </div>
              )}

              {/* Amenities */}
              {property.amenities.length > 0 && (
                <div data-ui="amenities" className="bg-white p-6 rounded-2xl border border-[#aeaeaf]/40">
                  <h2 className="text-base font-medium text-[#262626] mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {amenities.map((am) => {
                      const Icon = amenityIcon(am);
                      return (
                        <div key={am} className="flex items-center gap-3 rounded-xl border border-[#aeaeaf]/30 bg-[#fafafa] p-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#008ae8]">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="text-xs font-medium text-[#262626] leading-snug">{am}</span>
                        </div>
                      );
                    })}
                  </div>
                  {property.amenities.length > 6 && (
                    <button type="button" onClick={() => setShowAllAmenities(!showAllAmenities)} className="mt-4 text-sm font-medium text-[#008ae8] hover:text-[#0077c8]">
                      {showAllAmenities ? "Show fewer" : `View all ${property.amenities.length}`}
                    </button>
                  )}
                </div>
              )}

              {/* Nearby */}
              {property.nearby.length > 0 && (
                <div data-ui="connectivity" className="bg-white p-6 rounded-2xl border border-[#aeaeaf]/40">
                  <h2 className="text-base font-medium text-[#262626]">Places nearby</h2>
                  <p className="text-xs text-[#757577] mt-0.5">{[property.location, property.city].filter(Boolean).join(", ")}</p>
                  <div className="mt-4 flex gap-1.5 overflow-x-auto no-scrollbar" role="tablist" aria-label="Nearby place types">
                    {(["all", ...nearbyCats] as const).map((c) => (
                      <button
                        key={c}
                        type="button"
                        role="tab"
                        aria-selected={nearbyTab === c}
                        onClick={() => setNearbyTab(c)}
                        className={`whitespace-nowrap rounded-[4px] border px-3 py-1.5 text-xs font-medium transition-colors ${nearbyTab === c ? "border-[#008ae8] bg-[#008ae8] text-white" : "border-[#aeaeaf]/40 bg-white text-[#262626] hover:bg-[#e0f2fe]"
                          }`}
                      >
                        {c === "all" ? "All" : NEARBY_META[c].label}
                      </button>
                    ))}
                  </div>
                  <ul data-ui="distances" className="mt-3 divide-y divide-[#aeaeaf]/30">
                    {nearbyShown.map((n) => {
                      const Icon = NEARBY_META[n.category].icon;
                      return (
                        <li key={n.landmark} className="flex items-center justify-between gap-3 py-3 text-sm">
                          <span className="flex items-center gap-3 font-medium text-[#262626]">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e0f2fe] text-[#008ae8]"><Icon className="h-4 w-4" /></span>
                            {n.landmark}
                          </span>
                          <span className="shrink-0 text-xs font-semibold text-[#008ae8]">{n.distance}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </section>

            {/* Dealer */}
            {property.dealer && (
              <section id="dealer" className="scroll-mt-32 bg-white rounded-2xl border border-[#aeaeaf]/40 p-6">
                <h2 className="text-base font-medium text-[#262626] mb-5">Dealer Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <div className="flex items-center gap-4">
                      <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#e0f2fe] text-lg font-medium text-[#008ae8]" aria-hidden="true">
                        {property.dealer.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                      </span>
                      <div>
                        <h3 className="text-base font-medium text-[#262626]">{property.dealer.name}</h3>
                        {property.dealer.company && <p className="text-xs text-[#757577]">{property.dealer.company}</p>}
                        {property.dealer.reraRegistered && (
                          <span className="mt-1 inline-flex items-center gap-1 rounded-[4px] border border-[#008ae8]/30 bg-[#e0f2fe] px-2 py-0.5 text-[10px] font-medium text-[#008ae8]">
                            <BadgeCheck className="h-3 w-3" /> RERA Registered {property.dealer.reraId && `· ${property.dealer.reraId}`}
                          </span>
                        )}
                      </div>
                    </div>
                    <a href="#dealer-enquiry" className="mt-4 inline-flex rounded-[4px] border border-[#008ae8] bg-[#008ae8] px-4 py-2 text-sm font-medium text-white hover:bg-[#0077c8] transition-colors">
                      View Phone Number
                    </a>
                    <dl className="mt-5 space-y-2 text-sm">
                      <div className="flex gap-2"><dt className="text-[#757577]">Properties listed:</dt><dd className="font-medium">{dealerListed}</dd></div>
                      {property.dealer.experience && <div className="flex gap-2"><dt className="text-[#757577]">Experience:</dt><dd className="font-medium">{property.dealer.experience}</dd></div>}
                      {property.dealer.localities && <div><dt className="text-[#757577] inline">Localities: </dt><dd className="inline">{property.dealer.localities}</dd></div>}
                      {property.dealer.address && <div><dt className="text-[#757577] inline">Address: </dt><dd className="inline">{property.dealer.address}</dd></div>}
                    </dl>
                    {property.dealer.about && <p className="mt-4 text-xs leading-relaxed text-[#757577]">{property.dealer.about}</p>}
                  </div>

                  <div id="dealer-enquiry" className="scroll-mt-32">
                    <h3 className="text-sm font-medium text-[#262626] mb-3">Send enquiry to dealer</h3>
                    {dealerSent ? (
                      <div className="rounded-xl bg-[#e0f2fe] p-5 text-center">
                        <CheckCircle2 className="mx-auto mb-2 h-10 w-10 text-[#008ae8]" />
                        <p className="text-sm font-medium">Enquiry sent</p>
                        <p className="mt-1 text-xs text-[#757577]">{property.dealer.name} will get back to you soon.</p>
                      </div>
                    ) : (
                      <form onSubmit={submitDealer} className="relative space-y-3">
                        <EnquiryHoneypot value={trap} onChange={setTrap} />
                        <fieldset className="flex items-center gap-4 text-xs">
                          <legend className="sr-only">You are</legend>
                          <span className="text-[#757577]">You are</span>
                          {(["individual", "dealer"] as const).map((r) => (
                            <label key={r} className="flex items-center gap-1.5 capitalize">
                              <input type="radio" name="role" checked={role === r} onChange={() => setRole(r)} className="accent-[#008ae8]" /> {r}
                            </label>
                          ))}
                        </fieldset>
                        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full rounded-xl border border-[#aeaeaf]/40 px-3 py-2 text-xs focus:outline-hidden focus:border-[#008ae8]" />
                        <div className="flex rounded-xl border border-[#aeaeaf]/40 overflow-hidden focus-within:border-[#008ae8]">
                          <span className="bg-[#fafafa] px-3 py-2 text-xs font-medium border-r border-[#aeaeaf]/40">+91</span>
                          <input required type="tel" pattern="[0-9]{10}" value={dealerPhone} onChange={(e) => setDealerPhone(e.target.value)} placeholder="Phone number" className="w-full px-3 py-2 text-xs focus:outline-hidden" />
                        </div>
                        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} maxLength={400} className="w-full rounded-xl border border-[#aeaeaf]/40 px-3 py-2 text-xs focus:outline-hidden focus:border-[#008ae8]" />
                        <label className="flex items-start gap-2 text-[11px] text-[#757577]">
                          <input type="checkbox" required checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 accent-[#008ae8]" />
                          I agree to the Terms &amp; Conditions and Privacy Policy
                        </label>
                        {dealerError && <p role="alert" className="text-xs font-medium text-[#E4572E]">{dealerError}</p>}
                        <button type="submit" disabled={dealerSending} className="rounded-[4px] border border-[#008ae8] bg-[#008ae8] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#0077c8] transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                          {dealerSending ? "Sending..." : "Send Enquiry"}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Buying guide */}
            <div data-ui="buying-guide" className="bg-white rounded-2xl border border-[#aeaeaf]/40 p-6 grid grid-cols-1 sm:grid-cols-[1.2fr_1fr_1fr_auto] gap-5 items-center">
              <div>
                <h2 className="text-base font-medium text-[#262626]">Your guide to informed {isPlot ? "land / plot" : "property"} buying</h2>
                <p className="text-[11px] text-[#757577] mt-1">What to look at before you pay a booking amount.</p>
              </div>
              <div>
                <h3 className="text-xs font-medium mb-2">Always verify these</h3>
                {["Seller's identity", "Paperwork involved", "Construction approvals"].map((t) => (
                  <p key={t} className="flex items-center gap-2 text-xs text-[#757577]"><CheckCircle2 className="h-3.5 w-3.5 text-[#008ae8]" /> {t}</p>
                ))}
              </div>
              <div>
                <h3 className="text-xs font-medium mb-2">Watch out for</h3>
                {["Connectivity issues", "Maintenance charges", isPlot ? "Land zone" : "Hidden charges"].map((t) => (
                  <p key={t} className="flex items-center gap-2 text-xs text-[#757577]"><span className="h-1.5 w-1.5 rounded-full bg-[#E4572E]" /> {t}</p>
                ))}
              </div>
              <Link href="/blog" className="rounded-[4px] border border-[#008ae8] bg-[#008ae8] px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-[#0077c8] transition-colors">
                Read Buying Guide
              </Link>
            </div>

            {/* Price insights + trend */}
            {property.priceHistory.length > 1 && (
              <section id="price-trends" className="scroll-mt-32 bg-white rounded-2xl border border-[#aeaeaf]/40 p-6 space-y-6">
                <div>
                  <h2 className="text-base font-medium text-[#262626]">Price Insights</h2>
                  <p className="text-xs text-[#757577] mt-0.5">For {insights.localityName}{property.city && insights.localityName !== property.city ? `, ${property.city}` : ""}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-[#aeaeaf]/30 bg-[#fafafa] p-4">
                    <p className="text-sm font-medium">Price range starts from {insights.rangeStart}</p>
                    <p className="text-xs text-[#757577] mt-1">May vary across property types</p>
                  </div>
                  {insights.changePct !== null && (
                    <div className="rounded-xl border border-[#aeaeaf]/30 bg-[#fafafa] p-4">
                      <p className="text-sm font-medium flex items-center gap-1.5">
                        <ArrowUpRight className="h-4 w-4 text-[#008ae8]" />
                        Prices {insights.changePct >= 0 ? "increased" : "decreased"} by {Math.abs(insights.changePct)}%
                      </p>
                      <p className="text-xs text-[#757577] mt-1">in {insights.localityName} since last year</p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-medium text-[#262626]">Price Trend &amp; Comparison</h3>
                  <p className="text-xs text-[#757577] mt-0.5">Average rate per sq.ft over the last 2.5 years.</p>
                  <p className="mt-3 text-2xl font-light">{inr(trendRate)} <span className="text-xs text-[#757577]">/ sq.ft</span></p>
                  <div className="mt-2">
                    <PriceTrendChart points={property.priceHistory} />
                  </div>
                </div>

                {insights.similar.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#aeaeaf]/40 text-left text-[11px] uppercase text-[#757577]">
                          <th className="py-2 pr-3 font-semibold">Similar localities</th>
                          <th className="py-2 pr-3 font-semibold">Current price</th>
                          <th className="py-2 font-semibold">Last 1 year</th>
                        </tr>
                      </thead>
                      <tbody>
                        {insights.similar.map((s) => (
                          <tr key={`${s.city}-${s.name}`} className={`border-b border-[#aeaeaf]/20 ${s.current ? "bg-[#e0f2fe]/60" : ""}`}>
                            <td className="py-2.5 pr-3">{s.name}{s.city !== property.city && <span className="text-[#757577]">, {s.city}</span>}{s.current && <span className="ml-2 text-[10px] font-medium text-[#008ae8]">This property</span>}</td>
                            <td className="py-2.5 pr-3">{s.rate}</td>
                            <td className="py-2.5 text-[#008ae8]">{s.change !== null ? `${s.change >= 0 ? "▲" : "▼"} ${Math.abs(s.change)}%` : "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {/* EMI Calculator (purchases only) */}
            {property.listingType === "sale" && (
              <div data-ui="emi-calc" className="bg-white p-6 rounded-2xl border border-[#aeaeaf]/40">
                <h2 className="text-base font-medium text-[#262626] mb-2">Home Loan EMI Calculator</h2>
                <p className="text-xs text-[#757577] mb-4">Calculate your estimated monthly installment with prevailing interest rates starting @ 8.35% p.a.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between font-medium text-[#262626] mb-1">
                        <span>Loan Amount</span>
                        <span>{loanAmount >= 10_000_000 ? `₹${(loanAmount / 10_000_000).toFixed(2)} Cr` : `₹${(loanAmount / 100_000).toFixed(0)} Lac`}</span>
                      </div>
                      <input type="range" min={1_000_000} max={100_000_000} step={500_000} value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} className="w-full accent-[#008ae8]" />
                    </div>
                    <div>
                      <div className="flex justify-between font-medium text-[#262626] mb-1">
                        <span>Tenure: {tenure} Years</span>
                        <span>Interest Rate: 8.35% p.a.</span>
                      </div>
                      <input type="range" min={5} max={30} step={1} value={tenure} onChange={(e) => setTenure(Number(e.target.value))} className="w-full accent-[#008ae8]" />
                    </div>
                  </div>
                  <div className="bg-[#e0f2fe] p-5 rounded-2xl border border-[#aeaeaf]/40 text-center">
                    <span className="text-xs text-[#008ae8] font-medium block">Estimated Monthly EMI</span>
                    <span className="text-2xl sm:text-3xl font-light text-[#262626] block mt-1">{inr(emi)}</span>
                    <span className="text-[11px] text-[#757577] block mt-1">Applicable for the selected tenure at 8.35% p.a.*</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="lg:col-span-4">
            <div data-ui="lead-sidebar" className="bg-white p-6 rounded-2xl border border-[#aeaeaf]/40 sticky top-36">
              <div className="mb-4">
                <span className="text-[10px] font-medium text-[#008ae8] bg-[#e0f2fe] px-2 py-0.5 rounded-[4px] border border-[#008ae8]/20">Verified Listing</span>
                <h3 className="text-base font-medium text-[#262626] mt-2">Contact {contactName}</h3>
                <p className="text-xs text-[#757577] mt-1">Get the latest price, floor plan and book a private site visit.</p>
              </div>

              {enquirySuccess ? (
                <div className="text-center py-6">
                  <CheckCircle2 className="w-12 h-12 text-[#008ae8] mx-auto mb-2" />
                  <h4 className="text-sm font-medium text-[#262626]">Enquiry Confirmed!</h4>
                  <p className="text-xs text-[#757577] mt-1">{contactName} has received your request.</p>
                </div>
              ) : (
                <form onSubmit={submitSidebar} className="relative space-y-3">
                  <EnquiryHoneypot value={trap} onChange={setTrap} />
                  <div>
                    <label className="block text-xs font-medium text-[#262626] mb-1">Your Phone Number</label>
                    <div className="flex rounded-xl border border-[#aeaeaf]/40 overflow-hidden focus-within:border-[#008ae8]">
                      <span data-ui="prefix" className="bg-[#fafafa] px-3 py-2 text-xs font-medium text-[#262626] border-r border-[#aeaeaf]/40">+91</span>
                      <input type="tel" required pattern="[0-9]{10}" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter 10 digit number" className="w-full px-3 py-2 text-xs focus:outline-hidden bg-white text-[#262626]" />
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#fafafa] text-[11px] text-[#757577] space-y-1">
                    <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-[#008ae8] shrink-0" /><span>Zero spam guarantee</span></div>
                    <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#008ae8] shrink-0" /><span>Verified seller contact</span></div>
                  </div>
                  {sidebarError && <p role="alert" className="text-xs font-medium text-[#E4572E]">{sidebarError}</p>}
                  <button type="submit" disabled={sidebarSending} className="w-full py-2.5 px-4 rounded-[4px] font-medium text-white bg-[#008ae8] hover:bg-[#0077c8] border border-[#008ae8] transition-colors shadow-xs disabled:opacity-60 disabled:cursor-not-allowed">
                    {sidebarSending ? "Sending..." : "Request Callback Now"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Articles */}
        {articles.length > 0 && (
          <section id="articles" className="scroll-mt-32 pt-4">
            <div className="mb-5 flex items-end justify-between gap-4">
              <h2 className="text-xl font-light">Articles <span className="font-serif italic text-[#008ae8]">worth reading</span></h2>
              <Link href="/blog" className="text-sm font-medium text-[#008ae8] hover:text-[#0077c8]">All articles</Link>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {articles.map((a) => (
                <BlogCard key={a.id} post={a} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
