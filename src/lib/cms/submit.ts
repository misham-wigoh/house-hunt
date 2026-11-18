import "server-only";

import {
  AGE_OPTIONS,
  AMENITY_OPTIONS,
  AREA_UNITS,
  FACING_OPTIONS,
  MAX_HIGHLIGHTS,
  MAX_NEARBY,
  NEARBY_CATEGORIES,
  OWNERSHIP_OPTIONS,
  POSSESSION_STATUS,
  POSTED_BY_OPTIONS,
  type NearbyPlace,
} from "@/lib/post-property-options";

/**
 * Sends a property submitted through the public "Post Property" form to the
 * WordPress submissions plugin (`acres-submit`), which creates a PENDING REVIEW
 * listing (never public until staff publish it) and stores every answer in the
 * matching ACF field. The owner's contact details are stored as private fields that
 * REST and GraphQL never expose.
 *
 * The request is authenticated with a shared secret header (WORDPRESS_SUBMIT_SECRET),
 * read from the server environment only. No WordPress login is involved.
 */

export interface SubmissionInput {
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

  expectedPrice: string;
  priceNegotiable: boolean;
  priceOnRequest: boolean;
  priceNote: string;
  maintenance: string;
  description: string;

  amenities: string[];
  highlights: string[];
  nearby: NearbyPlace[];

  videoUrl: string;
  tourUrl: string;
  floorPlan: string;
  images: string[];

  postedBy: string;
  ownerName: string;
  agencyName: string;
  mobileNumber: string;
  email: string;
  whatsapp: string;
  commission: string;
}

export class SubmissionError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

/* ---------- validation helpers ---------- */

const TYPE_TERM: Record<string, string> = {
  "Flat / Apartment": "Flat / Apartment",
  "Independent House": "Independent House",
  Villa: "Villa",
  "Builder Floor": "Builder Floor",
  "Plot / Land": "Plot / Land",
  "Commercial Office": "Commercial",
};

const FURNISHING: Record<string, { value: string; term: string }> = {
  "Fully Furnished": { value: "fully_furnished", term: "Fully Furnished" },
  "Semi-Furnished": { value: "semi_furnished", term: "Semi-Furnished" },
  Unfurnished: { value: "unfurnished", term: "Unfurnished" },
  "Bare Shell": { value: "bare_shell", term: "Bare Shell" },
  "Warm Shell": { value: "warm_shell", term: "Warm Shell" },
};

/** "2.40 Cr" / "85 Lac" / "45,000 / month" / "10000/ month" / "7000 / month" -> rupees, or null when it can't be read. */
export function parsePrice(input: string, rent?: boolean): number | null {
  if (typeof input !== "string" || !input.trim()) return null;
  const s = input
    .toLowerCase()
    .replace(/[₹,\s]/g, "")
    .replace(/\/-$/, "")
    .replace(/\/?(permonth|permo|per_month|month|mo|pm|p\.m\.)$/, "");

  const m = s.match(/^(\d+(?:\.\d+)?)(k|thousand|l|lac|lacs|lakh|lakhs|cr|crore|crores)?$/);
  if (!m) return null;

  const n = parseFloat(m[1]);
  const unit = m[2];
  let multiplier = 1;
  if (unit) {
    if (unit.startsWith("k") || unit.startsWith("thou")) multiplier = 1_000;
    else if (unit.startsWith("c")) multiplier = 10_000_000;
    else multiplier = 100_000;
  }

  const amount = Math.round(n * multiplier);
  if (isNaN(amount) || amount <= 0) return null;

  // Auto-detect rent if explicitly requested, has rent keywords, or is under 100,000
  const isRent = rent === true || amount < 100_000 || /\/?(month|mo|pm)/i.test(input);
  if (isRent) {
    return amount >= 500 && amount <= 10_000_000 ? amount : null;
  }
  return amount >= 100_000 && amount <= 100_000_000_000 ? amount : null;
}

const clean = (v: unknown, max: number) =>
  String(v ?? "")
    .replace(/[\u0000-\u001f<>]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

/** Multi-line text: keeps line breaks, strips tags and control characters. */
const cleanBlock = (v: unknown, max: number) =>
  String(v ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f<>]/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max);

const bool = (v: unknown) => v === true || v === "true" || v === 1 || v === "1";

/** A whole number as digits only (max `maxDigits` long), or "". */
const whole = (v: unknown, maxDigits: number) => {
  const s = clean(v, 12).replace(/\D/g, "");
  return s && s.length <= maxDigits ? String(Number(s)) : "";
};

/** A positive decimal such as "40.5", or "". */
const decimal = (v: unknown) => {
  const s = clean(v, 12);
  return /^\d+(\.\d{1,2})?$/.test(s) && Number(s) > 0 ? s : "";
};

const oneOf = (v: unknown, allowed: readonly string[]) => (allowed.includes(String(v)) ? String(v) : "");

/** Only http(s) links, so a pasted "javascript:" string is dropped. */
const link = (v: unknown) => {
  const s = clean(v, 300);
  if (!s) return "";
  try {
    const u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : "";
  } catch {
    return "";
  }
};

const imageList = (v: unknown, max: number) =>
  Array.isArray(v)
    ? v.filter((img): img is string => typeof img === "string" && img.startsWith("data:image/")).slice(0, max)
    : [];

export function validate(raw: Partial<Record<keyof SubmissionInput, unknown>>): SubmissionInput {
  const rawPrice = clean(raw.expectedPrice, 30);
  const parsedPrice = parsePrice(rawPrice, raw.intent === "rent");
  if (parsedPrice === null) {
    throw new SubmissionError(
      "Enter a valid price like ₹10,000 / month (rent) or ₹85 Lac / 2.40 Cr (sale).",
      400,
    );
  }

  // Auto-detect rent vs sell
  const rentCues = /\/?(month|mo|pm|permonth|permo)/i.test(rawPrice);
  const isRent = raw.intent === "rent" || rentCues || parsedPrice < 100_000;
  const intent = isRent ? "rent" : "sell";

  const amenityAllowed: readonly string[] = AMENITY_OPTIONS;
  const amenities = Array.isArray(raw.amenities)
    ? [...new Set(raw.amenities.map(String).filter((a) => amenityAllowed.includes(a)))]
    : [];

  const highlights = Array.isArray(raw.highlights)
    ? raw.highlights
        .map((h) => clean(h, 120))
        .filter(Boolean)
        .slice(0, MAX_HIGHLIGHTS)
    : [];

  const categories = NEARBY_CATEGORIES.map((c) => c.value);
  const nearby: NearbyPlace[] = Array.isArray(raw.nearby)
    ? raw.nearby
        .map((n): NearbyPlace => {
          const row = (n ?? {}) as Record<string, unknown>;
          return {
            landmark: clean(row.landmark, 100),
            distance: clean(row.distance, 30),
            category: oneOf(row.category, categories) || "other",
          };
        })
        .filter((n) => n.landmark)
        .slice(0, MAX_NEARBY)
    : [];

  const postedBy = oneOf(raw.postedBy, POSTED_BY_OPTIONS.map((o) => o.value)) || "owner";
  const floorPlan = typeof raw.floorPlan === "string" && raw.floorPlan.startsWith("data:image/") ? raw.floorPlan : "";

  const input: SubmissionInput = {
    intent,
    propertyType: clean(raw.propertyType, 40),
    city: clean(raw.city, 60),
    locality: clean(raw.locality, 80),
    society: clean(raw.society, 80),
    fullAddress: cleanBlock(raw.fullAddress, 300),
    landmark: clean(raw.landmark, 120),
    pincode: clean(raw.pincode, 10).replace(/\D/g, ""),
    mapsUrl: link(raw.mapsUrl),

    bhk: clean(raw.bhk, 3),
    bathrooms: whole(raw.bathrooms, 2),
    balconies: whole(raw.balconies, 2),
    carpetArea: clean(raw.carpetArea, 10),
    builtUpArea: whole(raw.builtUpArea, 7),
    areaUnit: oneOf(raw.areaUnit, AREA_UNITS.map((o) => o.value)) || "sqft",
    floorNumber: whole(raw.floorNumber, 3),
    totalFloors: whole(raw.totalFloors, 3),
    facing: oneOf(raw.facing, FACING_OPTIONS.map((o) => o.value)),
    furnishing: clean(raw.furnishing, 30),
    furnishingNotes: clean(raw.furnishingNotes, 120),
    propertyAge: oneOf(raw.propertyAge, AGE_OPTIONS.map((o) => o.value)),
    parking: whole(raw.parking, 2),
    reraNumber: clean(raw.reraNumber, 60),
    possessionStatus: oneOf(raw.possessionStatus, POSSESSION_STATUS),
    possessionDate: /^\d{4}-\d{2}-\d{2}$/.test(clean(raw.possessionDate, 10)) ? clean(raw.possessionDate, 10) : "",

    ownership: oneOf(raw.ownership, OWNERSHIP_OPTIONS.map((o) => o.value)),
    approvedBy: clean(raw.approvedBy, 120),
    gatedSociety: bool(raw.gatedSociety),
    openSides: whole(raw.openSides, 1),
    cornerProperty: bool(raw.cornerProperty),
    roadWidth: clean(raw.roadWidth, 40),
    floorsAllowed: whole(raw.floorsAllowed, 2),
    overlooking: clean(raw.overlooking, 120),
    boundaryWall: bool(raw.boundaryWall),
    constructionDone: bool(raw.constructionDone),
    plotLength: decimal(raw.plotLength),
    plotWidth: decimal(raw.plotWidth),

    expectedPrice: rawPrice,
    priceNegotiable: bool(raw.priceNegotiable),
    priceOnRequest: bool(raw.priceOnRequest),
    priceNote: clean(raw.priceNote, 160),
    maintenance: clean(raw.maintenance, 20),
    description: cleanBlock(raw.description, 1500),

    amenities,
    highlights,
    nearby,

    videoUrl: link(raw.videoUrl),
    tourUrl: link(raw.tourUrl),
    floorPlan,
    images: imageList(raw.images, 10),

    postedBy,
    ownerName: clean(raw.ownerName, 80),
    agencyName: clean(raw.agencyName, 80),
    mobileNumber: clean(raw.mobileNumber, 15).replace(/\D/g, ""),
    email: clean(raw.email, 120),
    whatsapp: clean(raw.whatsapp, 15).replace(/\D/g, ""),
    commission: decimal(raw.commission),
  };

  const isPlot = input.propertyType === "Plot / Land";
  if (!TYPE_TERM[input.propertyType]) throw new SubmissionError("Please choose a property type.", 400);
  if (!input.city) throw new SubmissionError("Please choose a city.", 400);
  if (input.locality.length < 2) throw new SubmissionError("Please enter the locality.", 400);
  if (input.pincode && !/^\d{6}$/.test(input.pincode)) throw new SubmissionError("Pincode must be 6 digits.", 400);
  if (!/^\d{3,7}$/.test(input.carpetArea) || Number(input.carpetArea) <= 0) {
    throw new SubmissionError(
      isPlot ? "Please enter the plot area." : "Please enter the carpet area in sq.ft.",
      400,
    );
  }
  if (!isPlot && input.totalFloors && input.floorNumber && Number(input.floorNumber) > Number(input.totalFloors)) {
    throw new SubmissionError("Floor number can't be higher than the total floors.", 400);
  }
  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.email)) {
    throw new SubmissionError("Please enter a valid email address.", 400);
  }
  if (input.whatsapp && !/^\d{10}$/.test(input.whatsapp)) {
    throw new SubmissionError("WhatsApp number must be 10 digits.", 400);
  }
  if (input.ownerName.length < 2) throw new SubmissionError("Please enter your name.", 400);
  if (!/^\d{10}$/.test(input.mobileNumber)) throw new SubmissionError("Enter a 10 digit mobile number.", 400);
  return input;
}

/* ---------- WordPress ---------- */

function wpConfig() {
  const graphql = process.env.WORDPRESS_GRAPHQL_URL;
  const secret = process.env.WORDPRESS_SUBMIT_SECRET;
  if (!graphql || !secret) {
    throw new SubmissionError("Property submissions are not switched on yet. Please try again later.", 503);
  }
  return { base: new URL(graphql).origin, secret };
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const SQFT_PER_UNIT: Record<string, number> = { sqft: 1, sqyd: 9, sqm: 10.7639 };
const UNIT_LABEL: Record<string, string> = { sqft: "sq.ft", sqyd: "sq.yd", sqm: "sq.m" };

type FieldValue = string | number | boolean;

export async function createSubmission(input: SubmissionInput): Promise<{ reference: string }> {
  const cfg = wpConfig();
  const rent = input.intent === "rent";
  const price = parsePrice(input.expectedPrice, rent) as number;
  const isPlot = input.propertyType === "Plot / Land";
  const isCommercial = input.propertyType === "Commercial Office";
  const noRooms = isPlot || isCommercial;
  const unit = isPlot ? input.areaUnit : "sqft";
  const enteredArea = Number(input.carpetArea);
  const areaSqft = Math.max(1, Math.round(enteredArea * SQFT_PER_UNIT[unit]));
  const bedrooms = noRooms ? 0 : parseInt(input.bhk, 10) || 0;
  const furnishing = isPlot ? undefined : FURNISHING[input.furnishing];
  const reference = `SUB-${Math.floor(100000 + Math.random() * 900000)}`;

  const where = input.society || input.locality;
  const title = bedrooms
    ? `${bedrooms} BHK ${input.propertyType} in ${where}`
    : `${input.propertyType} in ${where}`;

  const summary =
    `${title}, ${input.locality}, ${input.city}. ` +
    `${rent ? "Available for rent" : "Available for sale"}. ` +
    `Maintenance: ${input.maintenance === "Extra" ? "extra as applicable" : "included in price"}.`;
  const shortDescription = (input.description.split("\n")[0] || summary).slice(0, 300);
  const content =
    `<p>${escapeHtml(summary)}</p>` +
    (input.description
      ? input.description
          .split(/\n{2,}/)
          .map((para) => `<p>${escapeHtml(para).replace(/\n/g, "<br>")}</p>`)
          .join("")
      : "");

  // Possession: the visible label plus the taxonomy terms.
  const possessionDateLabel = input.possessionDate
    ? new Date(`${input.possessionDate}T00:00:00Z`).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      })
    : "";
  const possessionLabel =
    input.possessionStatus === "Under Construction" && possessionDateLabel
      ? `Possession ${possessionDateLabel}`
      : input.possessionStatus;

  const fields: Record<string, FieldValue> = {};
  const put = (name: string, value: FieldValue | undefined | null) => {
    if (value === undefined || value === null || value === "") return;
    fields[name] = value;
  };

  // Basic
  put("price_negotiable", input.priceNegotiable);
  put("price_on_request", input.priceOnRequest);
  put("short_description", shortDescription);
  put("possession_label", possessionLabel);
  // Specifications
  if (isPlot) {
    put("plot_area", enteredArea);
    put("area_unit", unit);
    put("area_label", `${enteredArea.toLocaleString("en-IN")} ${UNIT_LABEL[unit]}`);
    put("carpet_area", 0);
    put("built_up_area", 0);
  } else {
    put("carpet_area", enteredArea);
    put("built_up_area", input.builtUpArea ? Number(input.builtUpArea) : enteredArea);
  }
  put("bathrooms", noRooms ? "" : input.bathrooms);
  put("balconies", noRooms ? "" : input.balconies);
  put("floor_number", isPlot ? "" : input.floorNumber);
  put("total_floors", isPlot ? "" : input.totalFloors);
  put("property_facing", input.facing);
  put("furnishing_notes", isPlot ? "" : input.furnishingNotes);
  put("property_age", input.propertyAge);
  put("parking_spaces", input.parking);
  put("rera_number", input.reraNumber);
  put("possession_date", input.possessionDate);
  // Location
  put("full_address", input.fullAddress);
  put("landmark", input.landmark);
  put("pincode", input.pincode);
  put("google_maps_url", input.mapsUrl);
  // Media links
  put("property_video", input.videoUrl);
  put("virtual_tour_url", input.tourUrl);
  // Details
  put("ownership_type", input.ownership);
  put("approved_by", input.approvedBy);
  put("gated_society", input.gatedSociety);
  put("open_sides", input.openSides);
  put("corner_property", input.cornerProperty);
  put("facing_road_width", input.roadWidth);
  put("floors_allowed", input.floorsAllowed);
  put("overlooking", input.overlooking);
  put("boundary_wall", input.boundaryWall);
  put("construction_done", input.constructionDone);
  put("plot_length", input.plotLength);
  put("plot_width", input.plotWidth);
  put(
    "price_note",
    [input.priceNote, input.maintenance === "Extra" ? "Maintenance charges extra" : ""].filter(Boolean).join(". "),
  );
  // Posted by / private contact
  put("contact_type", input.postedBy);
  put(
    "broker_name",
    input.postedBy === "owner"
      ? "Direct Owner"
      : input.agencyName || (input.postedBy === "broker" ? `${input.ownerName} (Agent)` : input.ownerName),
  );
  put("contact_email", input.email);
  put("whatsapp_number", input.whatsapp);
  put("whatsapp_available", Boolean(input.whatsapp));
  put("broker_commission", input.postedBy === "broker" ? input.commission : "");

  let res: Response;
  try {
    res = await fetch(`${cfg.base}/wp-json/acres/v1/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Acres-Key": cfg.secret },
      body: JSON.stringify({
        reference,
        title,
        content,
        listing_type: rent ? "rent" : "sale",
        price,
        price_type: rent ? "per_month" : "total",
        area: areaSqft,
        bedrooms,
        furnishing_value: furnishing?.value ?? "",
        furnishing_term: furnishing?.term ?? "",
        society: input.society,
        locality: input.locality,
        city: input.city,
        type_term: TYPE_TERM[input.propertyType],
        bhk_term: bedrooms ? `${bedrooms} BHK` : "",
        status_term: input.possessionStatus,
        possession_term: input.possessionStatus
          ? input.possessionStatus === "Ready to Move"
            ? "Immediate"
            : "Future"
          : "",
        owner_name: input.ownerName,
        owner_phone: input.mobileNumber,
        fields,
        amenities: input.amenities,
        highlights: input.highlights,
        connectivity: input.nearby,
        floor_plan: input.floorPlan,
        images: input.images,
      }),
      cache: "no-store",
    });
  } catch (err) {
    console.error("Could not reach WordPress for submission", err);
    throw new SubmissionError("We couldn't save your property right now. Please try again.", 502);
  }

  const json = (await res.json().catch(() => ({}))) as { ok?: boolean; code?: string; message?: string };
  if (!res.ok || !json.ok) {
    console.error("WordPress rejected the submission", res.status, json.code, json.message);
    throw new SubmissionError("We couldn't save your property right now. Please try again.", 502);
  }
  return { reference };
}

/* ---------- enquiries ---------- */

export const ENQUIRY_SOURCES = [
  "property_dealer",
  "property_callback",
  "listing_contact",
  "project_enquiry",
  "city_enquiry",
  "service_home_loan",
  "service_legal_verification",
  "service_rent_agreement",
  "service_property_valuation",
] as const;

export type EnquirySource = (typeof ENQUIRY_SOURCES)[number];

export interface EnquiryInput {
  source: EnquirySource;
  name: string;
  phone: string;
  message: string;
  role: "individual" | "dealer" | "tenant" | "owner";
  propertyTitle: string;
  propertyId: string;
  propertyRef: string;
  dealer: string;
}

export function validateEnquiry(raw: Record<string, unknown>): EnquiryInput {
  const source = ENQUIRY_SOURCES.includes(raw.source as EnquirySource) ? (raw.source as EnquirySource) : "listing_contact";
  const role =
    raw.role === "dealer"
      ? "dealer"
      : raw.role === "tenant"
      ? "tenant"
      : raw.role === "owner"
      ? "owner"
      : "individual";
  const input: EnquiryInput = {
    source,
    name: clean(raw.name, 80),
    phone: clean(raw.phone, 15).replace(/\D/g, ""),
    message: clean(raw.message, 400),
    role,
    propertyTitle: clean(raw.propertyTitle, 160),
    propertyId: clean(raw.propertyId, 120),
    propertyRef: clean(raw.propertyRef, 30),
    dealer: clean(raw.dealer, 80),
  };
  if (!/^\d{10}$/.test(input.phone)) throw new SubmissionError("Enter a 10 digit mobile number.", 400);
  return input;
}

/** Sends one enquiry to the private Enquiries inbox in WordPress. */
export async function createEnquiry(input: EnquiryInput): Promise<void> {
  const cfg = wpConfig();
  let res: Response;
  try {
    res = await fetch(`${cfg.base}/wp-json/acres/v1/lead`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Acres-Key": cfg.secret },
      body: JSON.stringify({
        source: input.source,
        name: input.name,
        phone: input.phone,
        message: input.message,
        role: input.role,
        property_title: input.propertyTitle,
        property_id: input.propertyId,
        property_ref: input.propertyRef,
        dealer: input.dealer,
      }),
      cache: "no-store",
    });
  } catch (err) {
    console.error("Could not reach WordPress for enquiry", err);
    throw new SubmissionError("We couldn't send your enquiry right now. Please try again.", 502);
  }

  const json = (await res.json().catch(() => ({}))) as { ok?: boolean; code?: string; message?: string };
  if (res.status === 429) throw new SubmissionError("Too many enquiries from this number. Please try again later.", 429);
  if (!res.ok || !json.ok) {
    console.error("WordPress rejected the enquiry", res.status, json.code, json.message);
    throw new SubmissionError("We couldn't send your enquiry right now. Please try again.", 502);
  }
}
