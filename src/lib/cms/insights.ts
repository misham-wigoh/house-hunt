import { formatListingPrice, formatPerSqFt } from "./format";
import type { Listing, ListingDetail } from "./types";

export interface SimilarLocality {
  name: string;
  city: string;
  rate: string;
  change: number | null;
  current: boolean;
}

export interface PriceInsights {
  /** "₹28.8 Lac" style text for the cheapest comparable property. */
  rangeStart: string;
  changePct: number | null;
  localityName: string;
  similar: SimilarLocality[];
}

/** Plots, offices, PGs and homes are priced very differently, so only compare like with like. */
function kindOf(type: string): string {
  if (type === "Plot / Land") return "plot";
  if (type === "Commercial") return "commercial";
  if (type.startsWith("PG")) return "pg";
  return "residential";
}

/**
 * Price insight numbers derived from the other listings in WordPress:
 * the cheapest comparable listing and an average rate per locality.
 */
export function buildPriceInsights(property: ListingDetail, all: Listing[]): PriceInsights {
  const kind = kindOf(property.type);
  const comparable = all.filter((l) => l.listingType === property.listingType && kindOf(l.type) === kind);
  const sameCity = comparable.filter((l) => l.city === property.city);
  const pool = sameCity.length ? sameCity : comparable;

  const cheapest = [...pool].filter((l) => l.priceNum > 0).sort((a, b) => a.priceNum - b.priceNum)[0] ?? property;
  const rent = property.listingType !== "sale";
  const rangeStart = formatListingPrice(
    Math.round(cheapest.priceNum * 100_000),
    rent ? "per_month" : "total",
    false,
  );

  const group = (rows: Listing[]) => {
    const map = new Map<string, { city: string; rates: number[]; changes: number[] }>();
    for (const l of rows) {
      if (!l.locality || !l.pricePerSqFtNum) continue;
      const row = map.get(`${l.city}|${l.locality}`) ?? { city: l.city, rates: [], changes: [] };
      row.rates.push(l.pricePerSqFtNum);
      if (l.localityChange !== null) row.changes.push(l.localityChange);
      map.set(`${l.city}|${l.locality}`, row);
    }
    return [...map.entries()].map(([key, v]) => ({
      name: key.split("|")[1],
      city: v.city,
      rate: Math.round(v.rates.reduce((a, b) => a + b, 0) / v.rates.length),
      change: v.changes.length ? Math.round((v.changes.reduce((a, b) => a + b, 0) / v.changes.length) * 10) / 10 : null,
    }));
  };

  let rows = group(sameCity);
  if (rows.length < 2) rows = group(comparable);

  const similar = rows
    .map((r) => ({
      name: r.name,
      city: r.city,
      rate: formatPerSqFt(r.rate, rent),
      change: r.change,
      current: r.name === property.locality && r.city === property.city,
    }))
    .sort((a, b) => Number(b.current) - Number(a.current))
    .slice(0, 5);

  return {
    rangeStart,
    changePct: property.localityChange,
    localityName: property.locality || property.city,
    similar: similar.length >= 2 ? similar : [],
  };
}
