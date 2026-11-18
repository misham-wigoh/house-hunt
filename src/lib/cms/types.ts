/**
 * Shapes the UI consumes. WordPress responses are converted into these by
 * `mappers.ts`, so components never see raw GraphQL.
 */

export interface Listing {
  /** WordPress post slug; drives the /property/[slug] URL. */
  id: string;
  title: string;
  society: string;
  location: string;
  city: string;
  locality: string;
  /** Formatted, e.g. "₹5.85 Cr" or "₹22,000 / mo". */
  price: string;
  /** Price in Lakhs, for budget filtering and sorting (0.22 = ₹22,000). */
  priceNum: number;
  pricePerSqFt: string;
  bhk: number;
  type: string;
  area: string;
  possession: string;
  furnishing: string;
  floor: string;
  verified: boolean;
  rera?: string;
  image: string | null;
  postedBy: string;
  reference: string;
  badge?: string;
  listingType: "sale" | "rent" | "lease";
  featuredOnHome: boolean;
  /** Price per sq.ft as a number (rupees), 0 when unknown. */
  pricePerSqFtNum: number;
  /** Annual price change of the locality, in percent. */
  localityChange: number | null;
  dealerName: string;
}

export interface NearbyPlace {
  landmark: string;
  distance: string;
  category: "hospital" | "school" | "transit" | "shopping" | "dining" | "other";
}

export interface DealerProfile {
  name: string;
  company: string;
  reraRegistered: boolean;
  reraId: string;
  experience: string;
  localities: string;
  about: string;
  address: string;
}

export interface ListingDetail extends Listing {
  /** Sanitised HTML of the description. */
  descriptionHtml: string;
  overview: string[];
  postedOn: string;
  facing: string;
  parking: string;
  images: string[];
  video: string;
  amenities: string[];
  connectivity: Array<{ landmark: string; distance: string }>;
  nearby: NearbyPlace[];
  builderName: string;
  builderSlug: string | null;
  negotiable: boolean;
  priceNote: string;
  ownership: string;
  approvedBy: string;
  gatedSociety: boolean | null;
  openSides: number | null;
  cornerProperty: boolean | null;
  roadWidth: string;
  floorsAllowed: number | null;
  overlooking: string;
  boundaryWall: boolean | null;
  constructionDone: boolean | null;
  plotDimensions: { length: number; width: number } | null;
  highlights: string[];
  priceHistory: Array<{ period: string; rate: number }>;
  dealer: DealerProfile | null;
}

export interface ProjectItem {
  id: string;
  name: string;
  location: string;
  city: string;
  builder: string;
  builderSlug: string | null;
  price: string;
  pricePerSqFt: string;
  bhk: string;
  possession: string;
  rera: string;
  tag: string;
  image: string | null;
  overview: string[];
  gallery: string[];
}

export interface BuilderItem {
  id: string;
  name: string;
  experience: string;
  projects: string;
  presence: string;
  tag: string;
  initials: string;
  bg: string;
  text: string;
  logo: string | null;
}

export interface LocalityItem {
  id: string;
  name: string;
  city: string;
  avgPrice: string;
  growth: string;
  positive: boolean;
  totalListings: string;
  tag: string;
  image: string | null;
}

export interface InsightItem {
  /** WordPress post slug; drives the /blog/[slug] URL. */
  id: string;
  title: string;
  summary: string;
  date: string;
  readTime: string;
  category: string;
  categorySlug: string;
  image: string | null;
}

export interface InsightDetail extends InsightItem {
  /** Sanitised HTML body. */
  contentHtml: string;
  source: string;
  /** ISO date for metadata and structured data. */
  dateIso: string;
}

export interface CityItem {
  id: string;
  /** Term name, used to match listings (e.g. "Delhi"). */
  name: string;
  /** Marketing name (e.g. "Delhi / NCR"). */
  displayName: string;
  shortCode: string;
  tagline: string;
  countLabel: string;
  count?: number;
  order: number;
  showInHeader: boolean;
  showInDirectory: boolean;
}

export interface HeroBanner {
  id: string;
  title: string;
  locality: string;
  city: string;
  badge: string;
  price: string;
  specs: string;
  image: string;
  shortName: string;
}

export interface SearchOptions {
  propertyTypes: string[];
  localities: Array<{ name: string; city: string; count: string }>;
}
