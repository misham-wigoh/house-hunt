import {
  formatArticleDate,
  formatInr,
  formatListingPrice,
  formatPerSqFt,
  formatReadTime,
  htmlToParagraphs,
} from "./format";
import { sanitizeArticleHtml } from "./sanitize";
import type {
  BuilderItem,
  CityItem,
  HeroBanner,
  InsightDetail,
  InsightItem,
  Listing,
  ListingDetail,
  LocalityItem,
  ProjectItem,
} from "./types";

/* ---------- raw GraphQL shapes (only what we query) ---------- */

type Maybe<T> = T | null | undefined;
interface Media { sourceUrl: string; altText?: Maybe<string> }
interface Term { name: string; slug?: string }
interface Nodes<T> { nodes: T[] }
type Select = Maybe<string[] | string>;

export interface RawListing {
  databaseId: number;
  slug: string;
  title: string;
  content?: Maybe<string>;
  featuredImage?: Maybe<{ node: Maybe<Media> }>;
  propertyBasicInfo?: Maybe<{
    propertyRef?: Maybe<string>;
    listingType?: Select;
    propertyPrice?: Maybe<number>;
    propertyPriceType?: Select;
    priceOnRequest?: Maybe<boolean>;
    priceNegotiable?: Maybe<boolean>;
    pricePerSqft?: Maybe<number>;
    isVerified?: Maybe<boolean>;
    listingBadge?: Maybe<string>;
    featuredOnHome?: Maybe<boolean>;
    possessionLabel?: Maybe<string>;
    shortDescription?: Maybe<string>;
    propertyBuilder?: Maybe<Nodes<{ slug?: string; title?: string }>>;
  }>;
  propertySpecs?: Maybe<{
    areaLabel?: Maybe<string>;
    builtUpArea?: Maybe<number>;
    bedrooms?: Maybe<number>;
    floorLabel?: Maybe<string>;
    furnishingStatus?: Select;
    furnishingNotes?: Maybe<string>;
    reraNumber?: Maybe<string>;
    propertyFacing?: Select;
    parkingSpaces?: Maybe<number>;
  }>;
  propertyLocation?: Maybe<{ societyName?: Maybe<string>; locationLine?: Maybe<string> }>;
  propertyContact?: Maybe<{ brokerName?: Maybe<string> }>;
  date?: Maybe<string>;
  propertyDetails?: Maybe<{
    ownershipType?: Select;
    approvedBy?: Maybe<string>;
    gatedSociety?: Maybe<boolean>;
    openSides?: Maybe<number>;
    cornerProperty?: Maybe<boolean>;
    facingRoadWidth?: Maybe<string>;
    floorsAllowed?: Maybe<number>;
    overlooking?: Maybe<string>;
    boundaryWall?: Maybe<boolean>;
    constructionDone?: Maybe<boolean>;
    plotLength?: Maybe<number>;
    plotWidth?: Maybe<number>;
    priceNote?: Maybe<string>;
    highlights?: Maybe<Array<{ highlight?: Maybe<string> }>>;
    localityPriceChange?: Maybe<number>;
    priceHistory?: Maybe<Array<{ period?: Maybe<string>; avgRate?: Maybe<number> }>>;
    propertyDealer?: Maybe<
      Nodes<{
        title?: string;
        dealerInfo?: Maybe<{
          dealerCompany?: Maybe<string>;
          dealerReraRegistered?: Maybe<boolean>;
          dealerReraId?: Maybe<string>;
          dealerExperience?: Maybe<string>;
          dealerLocalities?: Maybe<string>;
          dealerAbout?: Maybe<string>;
          dealerAddress?: Maybe<string>;
        }>;
      }>
    >;
  }>;
  propertyConnectivity?: Maybe<{
    connectivity?: Maybe<
      Array<{ landmark?: Maybe<string>; distance?: Maybe<string>; category?: Select }>
    >;
  }>;
  propertyMedia?: Maybe<{ propertyGallery?: Maybe<Nodes<Media>>; propertyVideo?: Maybe<string> }>;
  propertyCities?: Maybe<Nodes<Term>>;
  propertyLocalities?: Maybe<Nodes<Term>>;
  propertyTypes?: Maybe<Nodes<Term>>;
  propertyStatuses?: Maybe<Nodes<Term>>;
  propertyAmenities?: Maybe<Nodes<Term>>;
}

export interface RawProject {
  databaseId?: number;
  slug: string;
  title: string;
  content?: Maybe<string>;
  featuredImage?: Maybe<{ node: Maybe<Media> }>;
  propertyCities?: Maybe<Nodes<Term>>;
  projectInfo?: Maybe<{
    projectBuilder?: Maybe<Nodes<{ slug?: string; title?: string }>>;
    projectTag?: Maybe<string>;
    locationLine?: Maybe<string>;
    priceMin?: Maybe<number>;
    priceMax?: Maybe<number>;
    pricePerSqft?: Maybe<number>;
    unitConfigurations?: Maybe<string>;
    possessionLabel?: Maybe<string>;
    projectReraNumber?: Maybe<string>;
    featuredOnHome?: Maybe<boolean>;
    projectGallery?: Maybe<Nodes<Media>>;
  }>;
}

export interface RawBuilder {
  slug: string;
  title: string;
  propertyCities?: Maybe<Nodes<Term>>;
  builderInfo?: Maybe<{
    builderTagline?: Maybe<string>;
    experienceLabel?: Maybe<string>;
    builderInitials?: Maybe<string>;
    brandColor?: Maybe<string>;
    brandTextColor?: Maybe<string>;
    establishedYear?: Maybe<number>;
    totalProjects?: Maybe<number>;
    displayOrder?: Maybe<number>;
    isFeatured?: Maybe<boolean>;
    builderLogo?: Maybe<{ node: Maybe<Media> }>;
  }>;
}

export interface RawInsight {
  slug: string;
  title: string;
  date: string;
  content?: Maybe<string>;
  featuredImage?: Maybe<{ node: Maybe<Media> }>;
  insightCategories?: Maybe<Nodes<Term>>;
  insightInfo?: Maybe<{
    insightSummary?: Maybe<string>;
    readTime?: Maybe<number>;
    reportSource?: Maybe<string>;
  }>;
}

export interface RawBanner {
  slug: string;
  title: string;
  bannerInfo?: Maybe<{
    bannerLocality?: Maybe<string>;
    bannerCity?: Maybe<string>;
    bannerBadge?: Maybe<string>;
    bannerPrice?: Maybe<string>;
    bannerSpecs?: Maybe<string>;
    bannerShortName?: Maybe<string>;
    bannerDesktopImage?: Maybe<{ node: Maybe<Media> }>;
    displayOrder?: Maybe<number>;
    bannerActive?: Maybe<boolean>;
  }>;
}

export interface RawCity {
  databaseId: number;
  name: string;
  slug: string;
  count?: Maybe<number>;
  cityInfo?: Maybe<{
    cityDisplayName?: Maybe<string>;
    cityShortCode?: Maybe<string>;
    cityTagline?: Maybe<string>;
    cityCountLabel?: Maybe<string>;
    cityDisplayOrder?: Maybe<number>;
    showInHeader?: Maybe<boolean>;
    showInDirectory?: Maybe<boolean>;
  }>;
}

export interface RawLocality {
  databaseId: number;
  name: string;
  slug: string;
  count?: Maybe<number>;
  localityInfo?: Maybe<{
    localityCity?: Maybe<Nodes<Term>>;
    averagePriceSqft?: Maybe<number>;
    priceChangePercent?: Maybe<number>;
    localityTag?: Maybe<string>;
    localityDisplayOrder?: Maybe<number>;
    localityImage?: Maybe<{ node: Maybe<Media> }>;
  }>;
}

/* ---------- helpers ---------- */

const first = (v: Select): string => (Array.isArray(v) ? (v[0] ?? "") : (v ?? ""));
const firstName = (t: Maybe<Nodes<Term>>): string => t?.nodes?.[0]?.name ?? "";
const mediaUrl = (m: Maybe<{ node: Maybe<Media> }>): string | null => m?.node?.sourceUrl ?? null;

const FURNISHING_LABELS: Record<string, string> = {
  unfurnished: "Unfurnished",
  semi_furnished: "Semi-Furnished",
  fully_furnished: "Fully Furnished",
  bare_shell: "Bare Shell",
  warm_shell: "Warm Shell",
};

const FACING_LABELS: Record<string, string> = {
  east: "East",
  west: "West",
  north: "North",
  south: "South",
  north_east: "North-East",
  north_west: "North-West",
  south_east: "South-East",
  south_west: "South-West",
};

/* ---------- listings ---------- */

export function mapListing(n: RawListing): Listing {
  const basic = n.propertyBasicInfo;
  const specs = n.propertySpecs;
  const priceType = first(basic?.propertyPriceType) || "total";
  const price = basic?.propertyPrice ?? null;
  const rent = priceType !== "total" && priceType !== "per_sqft";
  const status = n.propertyStatuses?.nodes?.[0]?.name;
  const furnishingKey = first(specs?.furnishingStatus);
  const listingType = (first(basic?.listingType) || "sale") as Listing["listingType"];

  return {
    id: n.slug,
    title: n.title,
    society: n.propertyLocation?.societyName ?? "",
    location: n.propertyLocation?.locationLine ?? "",
    city: firstName(n.propertyCities),
    locality: firstName(n.propertyLocalities),
    price: formatListingPrice(price, priceType, Boolean(basic?.priceOnRequest)),
    priceNum: price ? price / 100_000 : 0,
    pricePerSqFt: formatPerSqFt(basic?.pricePerSqft ?? null, rent),
    bhk: specs?.bedrooms ?? 0,
    type: firstName(n.propertyTypes),
    area: specs?.areaLabel ?? "",
    possession: basic?.possessionLabel || status || "",
    furnishing: specs?.furnishingNotes || FURNISHING_LABELS[furnishingKey] || "",
    floor: specs?.floorLabel ?? "",
    verified: Boolean(basic?.isVerified),
    rera: specs?.reraNumber || undefined,
    image: mediaUrl(n.featuredImage),
    postedBy: n.propertyContact?.brokerName ?? "",
    reference: basic?.propertyRef ?? "",
    badge: basic?.listingBadge || undefined,
    listingType,
    featuredOnHome: Boolean(basic?.featuredOnHome),
    pricePerSqFtNum: basic?.pricePerSqft ?? 0,
    localityChange: n.propertyDetails?.localityPriceChange ?? null,
    dealerName: n.propertyDetails?.propertyDealer?.nodes?.[0]?.title ?? "",
  };
}

const OWNERSHIP_LABELS: Record<string, string> = {
  freehold: "Freehold",
  leasehold: "Leasehold",
  power_of_attorney: "Power of Attorney",
  co_operative_society: "Co-operative Society",
};

const NEARBY_CATEGORIES = ["hospital", "school", "transit", "shopping", "dining", "other"] as const;

const bool = (v: Maybe<boolean>): boolean | null => (v === null || v === undefined ? null : Boolean(v));

export function mapListingDetail(n: RawListing): ListingDetail {
  const base = mapListing(n);
  const specs = n.propertySpecs;
  const d = n.propertyDetails;
  const builder = n.propertyBasicInfo?.propertyBuilder?.nodes?.[0];
  const dealerNode = d?.propertyDealer?.nodes?.[0];
  const di = dealerNode?.dealerInfo;
  const facing = FACING_LABELS[first(specs?.propertyFacing)] ?? "";
  const gallery = (n.propertyMedia?.propertyGallery?.nodes ?? []).map((m) => m.sourceUrl);
  const images = [base.image, ...gallery].filter((u): u is string => Boolean(u));
  const body = n.content || n.propertyBasicInfo?.shortDescription || "";
  const posted = n.date ? new Date(n.date) : null;

  return {
    ...base,
    descriptionHtml: sanitizeArticleHtml(body),
    overview: htmlToParagraphs(body),
    postedOn:
      posted && !Number.isNaN(posted.getTime())
        ? posted.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
        : "",
    facing,
    parking: specs?.parkingSpaces ? `${specs.parkingSpaces} Covered Car Park${specs.parkingSpaces > 1 ? "s" : ""}` : "",
    images,
    video: n.propertyMedia?.propertyVideo ?? "",
    amenities: (n.propertyAmenities?.nodes ?? []).map((a) => a.name),
    connectivity: (n.propertyConnectivity?.connectivity ?? [])
      .filter((c) => c.landmark)
      .map((c) => ({ landmark: c.landmark ?? "", distance: c.distance ?? "" })),
    nearby: (n.propertyConnectivity?.connectivity ?? [])
      .filter((c) => c.landmark)
      .map((c) => {
        const cat = first(c.category) as (typeof NEARBY_CATEGORIES)[number];
        return {
          landmark: c.landmark ?? "",
          distance: c.distance ?? "",
          category: (NEARBY_CATEGORIES as readonly string[]).includes(cat) ? cat : "other",
        };
      }),
    builderName: builder?.title || base.postedBy,
    builderSlug: builder?.slug ?? null,
    negotiable: Boolean(n.propertyBasicInfo?.priceNegotiable),
    priceNote: d?.priceNote ?? "",
    ownership: OWNERSHIP_LABELS[first(d?.ownershipType)] ?? "",
    approvedBy: d?.approvedBy ?? "",
    gatedSociety: bool(d?.gatedSociety),
    openSides: d?.openSides ?? null,
    cornerProperty: bool(d?.cornerProperty),
    roadWidth: d?.facingRoadWidth ?? "",
    floorsAllowed: d?.floorsAllowed ?? null,
    overlooking: d?.overlooking ?? "",
    boundaryWall: bool(d?.boundaryWall),
    constructionDone: bool(d?.constructionDone),
    plotDimensions: d?.plotLength && d?.plotWidth ? { length: d.plotLength, width: d.plotWidth } : null,
    highlights: (d?.highlights ?? []).map((h) => h.highlight ?? "").filter(Boolean),
    priceHistory: (d?.priceHistory ?? [])
      .filter((p) => p.period && p.avgRate)
      .map((p) => ({ period: p.period ?? "", rate: p.avgRate ?? 0 })),
    dealer: dealerNode
      ? {
          name: dealerNode.title ?? "",
          company: di?.dealerCompany ?? "",
          reraRegistered: Boolean(di?.dealerReraRegistered),
          reraId: di?.dealerReraId ?? "",
          experience: di?.dealerExperience ?? "",
          localities: di?.dealerLocalities ?? "",
          about: di?.dealerAbout ?? "",
          address: di?.dealerAddress ?? "",
        }
      : null,
  };
}

/* ---------- projects ---------- */

function projectPriceRange(min: Maybe<number>, max: Maybe<number>): string {
  if (min && max && min !== max) return `${formatInr(min)} - ${formatInr(max)}`;
  const one = min || max;
  return one ? formatInr(one) : "Price on Request";
}

export function mapProject(n: RawProject): ProjectItem {
  const info = n.projectInfo;
  const builder = info?.projectBuilder?.nodes?.[0];
  return {
    id: n.slug,
    name: n.title,
    location: info?.locationLine ?? "",
    city: firstName(n.propertyCities),
    builder: builder?.title ?? "",
    builderSlug: builder?.slug ?? null,
    price: projectPriceRange(info?.priceMin, info?.priceMax),
    pricePerSqFt: formatPerSqFt(info?.pricePerSqft ?? null, false),
    bhk: info?.unitConfigurations ?? "",
    possession: info?.possessionLabel ?? "",
    rera: info?.projectReraNumber ?? "",
    tag: info?.projectTag ?? "",
    image: mediaUrl(n.featuredImage),
    overview: htmlToParagraphs(n.content),
    gallery: (info?.projectGallery?.nodes ?? []).map((m) => m.sourceUrl),
  };
}

/* ---------- builders ---------- */

export function mapBuilder(n: RawBuilder): BuilderItem & { order: number; featured: boolean } {
  const info = n.builderInfo;
  const initials =
    info?.builderInitials ||
    n.title
      .split(/\s+/)
      .slice(0, 3)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  return {
    id: n.slug,
    name: n.title,
    experience: info?.experienceLabel ?? "",
    projects: info?.totalProjects ? `${info.totalProjects}+ Projects` : "",
    presence: (n.propertyCities?.nodes ?? []).map((c) => c.name).join(", "),
    tag: info?.builderTagline ?? "",
    initials,
    bg: info?.brandColor || "#262626",
    text: info?.brandTextColor || "#FFFFFF",
    logo: mediaUrl(info?.builderLogo),
    order: info?.displayOrder ?? 100,
    featured: Boolean(info?.isFeatured),
  };
}

/* ---------- insights ---------- */

export function mapInsight(n: RawInsight): InsightItem {
  return {
    id: n.slug,
    title: n.title,
    summary: n.insightInfo?.insightSummary || htmlToParagraphs(n.content)[0] || "",
    date: formatArticleDate(n.date),
    readTime: formatReadTime(n.insightInfo?.readTime ?? null),
    category: firstName(n.insightCategories),
    categorySlug: n.insightCategories?.nodes?.[0]?.slug ?? "",
    image: mediaUrl(n.featuredImage),
  };
}

export function mapInsightDetail(n: RawInsight): InsightDetail {
  return {
    ...mapInsight(n),
    contentHtml: sanitizeArticleHtml(n.content),
    source: n.insightInfo?.reportSource || "House Hunt Editorial Desk",
    dateIso: n.date,
  };
}

/* ---------- banners ---------- */

export function mapBanner(n: RawBanner): (HeroBanner & { order: number }) | null {
  const info = n.bannerInfo;
  const image = mediaUrl(info?.bannerDesktopImage);
  if (!info || info.bannerActive === false || !image) return null;
  return {
    id: n.slug,
    title: n.title,
    locality: info.bannerLocality ?? "",
    city: info.bannerCity ?? "",
    badge: info.bannerBadge ?? "",
    price: info.bannerPrice ?? "",
    specs: info.bannerSpecs ?? "",
    image,
    shortName: info.bannerShortName || n.title,
    order: info.displayOrder ?? 0,
  };
}

/* ---------- cities & localities ---------- */

export function mapCity(n: RawCity): CityItem {
  const info = n.cityInfo;
  const count = typeof n.count === "number" ? n.count : undefined;
  return {
    id: n.slug,
    name: n.name,
    displayName: info?.cityDisplayName || n.name,
    shortCode: info?.cityShortCode ?? "",
    tagline: info?.cityTagline ?? "",
    countLabel: info?.cityCountLabel ?? (count && count > 0 ? `${count.toLocaleString()} ${count === 1 ? "Property" : "Properties"}` : ""),
    count,
    order: info?.cityDisplayOrder ?? 0,
    showInHeader: Boolean(info?.showInHeader),
    showInDirectory: Boolean(info?.showInDirectory),
  };
}

/**
 * Locality terms can exist twice with the same name (one carrying the market
 * data, one auto-created from listings). Merge by name so counts add up and
 * the data-bearing term wins.
 */
export function mapLocalities(raw: RawLocality[]): LocalityItem[] {
  const byName = new Map<string, RawLocality[]>();
  for (const l of raw) {
    const key = l.name.toLowerCase();
    byName.set(key, [...(byName.get(key) ?? []), l]);
  }

  const out: Array<LocalityItem & { order: number }> = [];
  for (const group of byName.values()) {
    const withData = group.find((g) => g.localityInfo?.averagePriceSqft);
    if (!withData) continue;
    const info = withData.localityInfo!;
    const listings = group.reduce((sum, g) => sum + (g.count ?? 0), 0);
    const change = info.priceChangePercent ?? 0;
    out.push({
      id: withData.slug,
      name: withData.name,
      city: firstName(info.localityCity),
      avgPrice: formatPerSqFt(info.averagePriceSqft ?? null, false),
      growth: `${change >= 0 ? "+" : ""}${change}%`,
      positive: change >= 0,
      totalListings: listings > 0 ? `${listings} ${listings === 1 ? "Listing" : "Listings"}` : "View Listings",
      tag: info.localityTag ?? "",
      image: mediaUrl(info.localityImage),
      order: info.localityDisplayOrder ?? 0,
    });
  }
  return out.sort((a, b) => a.order - b.order);
}
