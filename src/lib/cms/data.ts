import "server-only";

import { cmsFetch, cmsFetchAll } from "./client";
import {
  mapBanner,
  mapBuilder,
  mapCity,
  mapInsight,
  mapInsightDetail,
  mapListing,
  mapListingDetail,
  mapLocalities,
  mapProject,
  type RawBanner,
  type RawBuilder,
  type RawCity,
  type RawInsight,
  type RawListing,
  type RawLocality,
  type RawProject,
} from "./mappers";
import {
  BANNERS_QUERY,
  BUILDERS_QUERY,
  CITIES_QUERY,
  INSIGHT_DETAIL_QUERY,
  INSIGHTS_QUERY,
  LISTING_DETAIL_QUERY,
  LISTING_SLUGS_QUERY,
  LISTINGS_QUERY,
  LOCALITIES_QUERY,
  PROJECT_DETAIL_QUERY,
  PROJECTS_QUERY,
  PROPERTY_TYPES_QUERY,
} from "./queries";
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
  SearchOptions,
} from "./types";

/* ---------- listings ---------- */

/** All published listings in reference order (AC-10001, AC-10002, ...). */
export async function getListings(): Promise<Listing[]> {
  const raw = await cmsFetchAll<RawListing>(LISTINGS_QUERY, "propertyListings", {
    tags: ["listings"],
  });
  return raw
    .map(mapListing)
    .sort((a, b) => a.reference.localeCompare(b.reference, "en", { numeric: true }));
}

export async function getListingSlugs(): Promise<string[]> {
  const raw = await cmsFetchAll<{ slug: string }>(LISTING_SLUGS_QUERY, "propertyListings", {
    tags: ["listings"],
  });
  return raw.map((l) => l.slug);
}

export async function getListingBySlug(slug: string): Promise<ListingDetail | null> {
  const data = await cmsFetch<{ propertyListing: RawListing | null }>(
    LISTING_DETAIL_QUERY,
    { slug },
    { tags: ["listings", `listing:${slug}`] },
  );
  return data.propertyListing ? mapListingDetail(data.propertyListing) : null;
}

export async function getFeaturedCommercialListings(limit = 3): Promise<Listing[]> {
  const all = await getListings();
  const commercial = all.filter((l) => l.type === "Commercial");
  const flagged = commercial.filter((l) => l.featuredOnHome);
  return (flagged.length ? flagged : commercial).slice(0, limit);
}

/** Every rental, residential and co-living ones first when there are enough of them. */
function rentalPool(all: Listing[], limit: number): Listing[] {
  const rentals = all.filter(
    (l) =>
      l.listingType === "rent" ||
      l.type === "PG / Co-living" ||
      l.price.includes("/ mo") ||
      l.price.includes("/ month") ||
      l.price.includes("/mo") ||
      l.price.includes("/month")
  );
  // Prefer residential & co-living rentals over commercial leases
  const residentialRentals = rentals.filter((l) => l.type !== "Commercial");
  return residentialRentals.length >= limit ? residentialRentals : rentals;
}

export async function getFeaturedRentalListings(limit = 4): Promise<Listing[]> {
  const pool = rentalPool(await getListings(), limit);
  const flagged = pool.filter((l) => l.featuredOnHome);
  return (flagged.length ? flagged : pool).slice(0, limit);
}

/** All rentals the home page may show; the visitor's city is picked from these. */
export async function getRentalListingPool(limit = 4): Promise<Listing[]> {
  return rentalPool(await getListings(), limit);
}

/** All commercial listings; the visitor's city is picked from these. */
export async function getCommercialListingPool(): Promise<Listing[]> {
  return (await getListings()).filter((l) => l.type === "Commercial");
}

/* ---------- projects ---------- */

async function getOrderedProjects(): Promise<RawProject[]> {
  const raw = await cmsFetchAll<RawProject>(PROJECTS_QUERY, "propertyProjects", {
    tags: ["projects"],
  });
  // Projects have no display-order field yet, so keep creation order (oldest first).
  return [...raw].sort((a, b) => (a.databaseId ?? 0) - (b.databaseId ?? 0));
}

export async function getFeaturedProjects(): Promise<ProjectItem[]> {
  const ordered = await getOrderedProjects();
  const featured = ordered.filter((p) => p.projectInfo?.featuredOnHome);
  return (featured.length ? featured : ordered).map(mapProject);
}

/** Every project, so the home page can pull in the visitor's city. */
export async function getAllProjects(): Promise<ProjectItem[]> {
  return (await getOrderedProjects()).map(mapProject);
}

export async function getProjectBySlug(slug: string): Promise<ProjectItem | null> {
  const data = await cmsFetch<{ propertyProject: RawProject | null }>(
    PROJECT_DETAIL_QUERY,
    { slug },
    { tags: ["projects", `project:${slug}`] },
  );
  return data.propertyProject ? mapProject(data.propertyProject) : null;
}

export async function getProjectSlugs(): Promise<string[]> {
  const raw = await cmsFetchAll<RawProject>(PROJECTS_QUERY, "propertyProjects", {
    tags: ["projects"],
  });
  return raw.map((p) => p.slug);
}

/* ---------- builders / insights ---------- */

export async function getFeaturedBuilders(): Promise<BuilderItem[]> {
  const raw = await cmsFetchAll<RawBuilder>(BUILDERS_QUERY, "builders", { tags: ["builders"] });
  const mapped = raw.map(mapBuilder);
  const featured = mapped.filter((b) => b.featured);
  return (featured.length ? featured : mapped).sort((a, b) => a.order - b.order);
}

/** Every published article, newest first. */
export async function getAllInsights(): Promise<InsightItem[]> {
  const raw = await cmsFetchAll<RawInsight>(INSIGHTS_QUERY, "marketInsights", {
    tags: ["insights"],
  });
  return [...raw].sort((a, b) => b.date.localeCompare(a.date)).map(mapInsight);
}

/** Latest articles for the homepage. */
export async function getInsights(limit = 4): Promise<InsightItem[]> {
  return (await getAllInsights()).slice(0, limit);
}

export async function getInsightBySlug(slug: string): Promise<InsightDetail | null> {
  const data = await cmsFetch<{ marketInsight: RawInsight | null }>(
    INSIGHT_DETAIL_QUERY,
    { slug },
    { tags: ["insights", `insight:${slug}`] },
  );
  return data.marketInsight ? mapInsightDetail(data.marketInsight) : null;
}

/* ---------- banners ---------- */

export async function getHeroBanners(): Promise<HeroBanner[]> {
  const raw = await cmsFetchAll<RawBanner>(BANNERS_QUERY, "homepageBanners", { tags: ["banners"] });
  return raw
    .map(mapBanner)
    .filter((b): b is NonNullable<typeof b> => b !== null)
    .sort((a, b) => a.order - b.order)
    .map((b) => ({
      id: b.id,
      title: b.title,
      locality: b.locality,
      city: b.city,
      badge: b.badge,
      price: b.price,
      specs: b.specs,
      image: b.image,
      shortName: b.shortName,
    }));
}

/* ---------- cities / localities / search options ---------- */

export async function getCities(): Promise<CityItem[]> {
  const raw = await cmsFetchAll<RawCity>(CITIES_QUERY, "propertyCities", { tags: ["cities"] });
  return raw.map(mapCity).sort((a, b) => a.order - b.order);
}

export async function getLocalities(): Promise<LocalityItem[]> {
  const raw = await cmsFetchAll<RawLocality>(LOCALITIES_QUERY, "propertyLocalities", {
    tags: ["localities"],
  });
  return mapLocalities(raw);
}

/** Residential types only: Commercial and PG have their own search tabs. */
const TAB_TYPES = new Set(["commercial", "pg-co-living"]);

export async function getSearchOptions(): Promise<SearchOptions> {
  const [types, localities] = await Promise.all([
    cmsFetchAll<{ name: string; slug: string }>(PROPERTY_TYPES_QUERY, "propertyTypes", {
      tags: ["listings"],
    }),
    getLocalities(),
  ]);
  return {
    propertyTypes: types.filter((t) => !TAB_TYPES.has(t.slug)).map((t) => t.name),
    localities: localities.map((l) => ({
      name: l.name,
      city: l.city,
      count: l.totalListings,
    })),
  };
}
