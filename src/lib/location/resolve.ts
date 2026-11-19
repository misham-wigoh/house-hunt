/**
 * Turns "where the visitor is" into "which CMS cities count as local".
 *
 * Pure and isomorphic (no server-only imports) so the API route, the provider
 * and the tests all share it. The CMS has no state field, so a visitor in
 * Kerala only lines up with the Kochi listings through the CITY_STATE table
 * below. Add a row there when the CMS gets a city that is not listed yet.
 */

import type { CityItem } from "@/lib/cms/types";

/** What an IP lookup (or the platform's geo headers) tells us. Any field may be empty. */
export interface DetectedPlace {
  city: string;
  /** State / union territory name, e.g. "Kerala". */
  region: string;
  /** ISO 3166-1 alpha-2, e.g. "IN". */
  country: string;
}

export interface UserLocation {
  /** What the header shows: "Chennai", "Delhi / NCR", "Kerala". */
  label: string;
  /** Canonical (see canonicalCity) names of the CMS cities that count as "here". Empty = nothing listed here. */
  cities: string[];
  source: "auto" | "manual" | "default";
}

/** Lower-case, letters and single spaces only. */
export function norm(s: string | null | undefined): string {
  return (s ?? "").toLowerCase().replace(/[^a-z]+/g, " ").trim();
}

/** Other names a city goes by, mapped to the name the CMS uses. */
const CITY_ALIASES: Record<string, string> = {
  bengaluru: "bangalore",
  "bengaluru urban": "bangalore",
  "bangalore urban": "bangalore",
  gurugram: "gurgaon",
  mysuru: "mysore",
  cochin: "kochi",
  ernakulam: "kochi",
  calcutta: "kolkata",
  bombay: "mumbai",
  madras: "chennai",
  "new delhi": "delhi",
  "delhi ncr": "delhi",
  trivandrum: "thiruvananthapuram",
  calicut: "kozhikode",
  vizag: "visakhapatnam",
  baroda: "vadodara",
  poona: "pune",
};

const REGION_ALIASES: Record<string, string> = {
  orissa: "odisha",
  pondicherry: "puducherry",
  "national capital territory of delhi": "delhi",
  "nct of delhi": "delhi",
  uttaranchal: "uttarakhand",
};

export function canonicalCity(s: string | null | undefined): string {
  const n = norm(s);
  return CITY_ALIASES[n] ?? n;
}

function canonicalRegion(s: string | null | undefined): string {
  const n = norm(s).replace(/^state of /, "");
  return REGION_ALIASES[n] ?? n;
}

/** Cities that a visitor thinks of as one market. */
const CLUSTERS: Array<{ label: string; members: string[] }> = [
  { label: "Delhi / NCR", members: ["delhi", "gurgaon", "noida", "greater noida", "ghaziabad", "faridabad"] },
  { label: "Mumbai", members: ["mumbai", "navi mumbai", "thane"] },
];

/** City (canonical) to state (canonical). Lets "Kerala" resolve to Kochi listings. */
const CITY_STATE: Record<string, string> = {
  bangalore: "karnataka", mysore: "karnataka", mangalore: "karnataka", hubli: "karnataka", belgaum: "karnataka",
  chennai: "tamil nadu", coimbatore: "tamil nadu", madurai: "tamil nadu", trichy: "tamil nadu", salem: "tamil nadu",
  kochi: "kerala", thiruvananthapuram: "kerala", kozhikode: "kerala", thrissur: "kerala",
  mumbai: "maharashtra", pune: "maharashtra", nagpur: "maharashtra", nashik: "maharashtra", thane: "maharashtra", aurangabad: "maharashtra",
  hyderabad: "telangana", secunderabad: "telangana", warangal: "telangana",
  visakhapatnam: "andhra pradesh", vijayawada: "andhra pradesh", amaravati: "andhra pradesh", tirupati: "andhra pradesh",
  kolkata: "west bengal", howrah: "west bengal", siliguri: "west bengal",
  ahmedabad: "gujarat", surat: "gujarat", vadodara: "gujarat", rajkot: "gujarat", gandhinagar: "gujarat",
  jaipur: "rajasthan", jodhpur: "rajasthan", udaipur: "rajasthan", kota: "rajasthan",
  lucknow: "uttar pradesh", kanpur: "uttar pradesh", agra: "uttar pradesh", varanasi: "uttar pradesh", noida: "uttar pradesh", ghaziabad: "uttar pradesh", "greater noida": "uttar pradesh",
  gurgaon: "haryana", faridabad: "haryana", panipat: "haryana",
  indore: "madhya pradesh", bhopal: "madhya pradesh",
  goa: "goa",
  chandigarh: "chandigarh",
  delhi: "delhi",
  ludhiana: "punjab", amritsar: "punjab", mohali: "punjab",
  bhubaneswar: "odisha", patna: "bihar", ranchi: "jharkhand", dehradun: "uttarakhand",
};

function titleCase(s: string): string {
  return s.replace(/\b[a-z]/g, (c) => c.toUpperCase());
}

/** Canonical names of the CMS cities that appear in `members`. */
function cmsCitiesIn(cities: CityItem[], members: string[]): string[] {
  return cities.map((c) => canonicalCity(c.name)).filter((n) => members.includes(n));
}

/** True when `city` (a listing's city) is one of the visitor's local cities. */
export function isLocalCity(loc: UserLocation | null, city: string | null | undefined): boolean {
  return !!loc && loc.cities.length > 0 && loc.cities.includes(canonicalCity(city));
}

/** The location for a city picked from the header list. */
export function locationForCity(
  city: { name: string; displayName?: string },
  cities: CityItem[],
  source: UserLocation["source"] = "manual",
): UserLocation {
  const canon = canonicalCity(city.name);
  const cluster = CLUSTERS.find((c) => c.members.includes(canon));
  return {
    label: city.displayName || city.name,
    cities: cluster ? cmsCitiesIn(cities, cluster.members) : [canon],
    source,
  };
}

/** Used when we can't tell where the visitor is: the first header city, like before. */
export function defaultLocation(cities: CityItem[]): UserLocation {
  const first = cities.find((c) => c.showInHeader) ?? cities[0];
  if (first) return locationForCity(first, cities, "default");
  return { label: "Delhi / NCR", cities: CLUSTERS[0].members, source: "default" };
}

/**
 * Maps a detected place onto the CMS. Returns null when the visitor is outside
 * India or nothing usable came back; the caller then falls back to the default.
 */
export function resolveDetected(place: DetectedPlace | null | undefined, cities: CityItem[]): UserLocation | null {
  if (!place) return null;
  if (place.country && place.country.toUpperCase() !== "IN") return null;

  const city = canonicalCity(place.city);
  const region = canonicalRegion(place.region);
  if (!city && !region) return null;

  // 1. A market made of several cities (Gurgaon and Noida are "Delhi / NCR").
  const cluster = CLUSTERS.find((c) => c.members.includes(city) || (!city && c.members.includes(region)));
  if (cluster) {
    return { label: cluster.label, cities: cmsCitiesIn(cities, cluster.members), source: "auto" };
  }

  // 2. The visitor's own city is in the CMS.
  const hit = cities.find((c) => canonicalCity(c.name) === city);
  if (hit) return { label: hit.displayName || hit.name, cities: [canonicalCity(hit.name)], source: "auto" };

  // 3. Their city isn't listed, but their state has listed cities (Thrissur, Kerala shows Kochi).
  if (region) {
    const inState = cities.filter((c) => CITY_STATE[canonicalCity(c.name)] === region).map((c) => canonicalCity(c.name));
    if (inState.length > 0) return { label: titleCase(region), cities: inState, source: "auto" };
  }

  // 4. Nothing listed there yet: still say where they are, but don't hide anything.
  return { label: titleCase(city || region), cities: [], source: "auto" };
}
