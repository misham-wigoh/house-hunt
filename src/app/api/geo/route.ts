import { NextResponse } from "next/server";
import type { DetectedPlace } from "@/lib/location/resolve";

/**
 * Best-effort "where is this visitor": returns { city, region, country }, with
 * empty strings when unknown. Never errors, so the site just falls back to its
 * default city when detection fails.
 *
 * Order: the hosting platform's geo headers (free, no extra request), then an
 * IP lookup. The lookup service sees the visitor's IP; swap IP_LOOKUP_URL for
 * your own provider (MaxMind, ipinfo...) if that is a concern.
 */

export const dynamic = "force-dynamic";

const IP_LOOKUP_URL = "https://ipwho.is";

/** Vercel sends ISO 3166-2 subdivision codes for India. */
const IN_REGION_CODES: Record<string, string> = {
  AN: "Andaman and Nicobar Islands", AP: "Andhra Pradesh", AR: "Arunachal Pradesh", AS: "Assam", BR: "Bihar",
  CH: "Chandigarh", CG: "Chhattisgarh", CT: "Chhattisgarh", DD: "Daman and Diu", DH: "Dadra and Nagar Haveli",
  DL: "Delhi", DN: "Dadra and Nagar Haveli", GA: "Goa", GJ: "Gujarat", HP: "Himachal Pradesh", HR: "Haryana",
  JH: "Jharkhand", JK: "Jammu and Kashmir", KA: "Karnataka", KL: "Kerala", LA: "Ladakh", LD: "Lakshadweep",
  MH: "Maharashtra", ML: "Meghalaya", MN: "Manipur", MP: "Madhya Pradesh", MZ: "Mizoram", NL: "Nagaland",
  OD: "Odisha", OR: "Odisha", PB: "Punjab", PY: "Puducherry", RJ: "Rajasthan", SK: "Sikkim", TG: "Telangana",
  TN: "Tamil Nadu", TR: "Tripura", TS: "Telangana", UK: "Uttarakhand", UP: "Uttar Pradesh", UT: "Uttarakhand",
  WB: "West Bengal",
};

function decode(v: string | null): string {
  if (!v) return "";
  try {
    return decodeURIComponent(v).trim();
  } catch {
    return v.trim();
  }
}

function fromPlatformHeaders(h: Headers): DetectedPlace | null {
  // Vercel
  const vCountry = decode(h.get("x-vercel-ip-country"));
  if (vCountry) {
    const code = decode(h.get("x-vercel-ip-country-region")).toUpperCase();
    return {
      city: decode(h.get("x-vercel-ip-city")),
      region: (vCountry.toUpperCase() === "IN" && IN_REGION_CODES[code]) || code,
      country: vCountry,
    };
  }
  // Cloudflare (needs "Add visitor location headers" turned on)
  const cfCountry = decode(h.get("cf-ipcountry"));
  if (cfCountry && cfCountry !== "XX") {
    return { city: decode(h.get("cf-ipcity")), region: decode(h.get("cf-region")), country: cfCountry };
  }
  return null;
}

function clientIp(h: Headers): string {
  const raw = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip")?.trim() || "";
  return raw.replace(/^::ffff:/, "");
}

function isPrivateIp(ip: string): boolean {
  return (
    !ip ||
    ip === "::1" ||
    /^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(ip) ||
    /^(fc|fd|fe80)/i.test(ip)
  );
}

async function fromIpLookup(ip: string): Promise<DetectedPlace | null> {
  // For a private address (local dev) ask without one: the service uses the caller's public IP.
  const url = `${IP_LOOKUP_URL}/${isPrivateIp(ip) ? "" : encodeURIComponent(ip)}?fields=success,city,region,country_code`;
  try {
    const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    const j = (await res.json()) as { success?: boolean; city?: string; region?: string; country_code?: string };
    if (!j.success) return null;
    return { city: j.city ?? "", region: j.region ?? "", country: j.country_code ?? "" };
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const noStore = { "Cache-Control": "private, no-store" };
  const empty: DetectedPlace = { city: "", region: "", country: "" };

  // Test override so you can see the site "from" another city without travelling. Never honoured in production.
  if (process.env.NODE_ENV !== "production") {
    const q = new URL(req.url).searchParams;
    const city = q.get("city");
    const region = q.get("region");
    if (city || region) {
      return NextResponse.json({ city: city ?? "", region: region ?? "", country: "IN" }, { headers: noStore });
    }
  }

  const place = fromPlatformHeaders(req.headers) ?? (await fromIpLookup(clientIp(req.headers))) ?? empty;
  return NextResponse.json(place, { headers: noStore });
}
