"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useCmsCities } from "@/components/sites/house-hunt/cms-context";
import {
  defaultLocation,
  isLocalCity,
  locationForCity,
  resolveDetected,
  type DetectedPlace,
  type UserLocation,
} from "@/lib/location/resolve";

/**
 * Knows which city the visitor is in. Auto-detected once from their IP (via
 * /api/geo) and remembered; a city picked in the header wins over detection.
 * Pages stay statically cached: this all happens in the browser, like login.
 */

const STORAGE_KEY = "hh_location_v1";
/** People travel and change networks, so an auto-detected place is re-checked weekly. */
const AUTO_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type Stored =
  | { mode: "manual"; cityId: string; name: string }
  | { mode: "auto"; place: DetectedPlace | null; at: number };

/* ---- tiny external store over localStorage (with an in-memory fallback for private windows) ---- */

let memory: string | null | undefined;
const listeners = new Set<() => void>();

function readRaw(): string | null {
  if (memory !== undefined) return memory;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStored(value: Stored | null) {
  memory = value ? JSON.stringify(value) : null;
  try {
    if (memory) window.localStorage.setItem(STORAGE_KEY, memory);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage blocked: the in-memory copy still works for this tab */
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      memory = undefined;
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

function parseStored(raw: string | null | undefined): Stored | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as Stored;
    if (v && (v.mode === "manual" || v.mode === "auto")) return v;
  } catch {
    /* corrupt value: treat as nothing stored */
  }
  return null;
}

/** Dev-only: /?sim_location=Kochi,Kerala shows the site as if you were there. */
function readSimulated(): { city: string; region: string } | null {
  if (process.env.NODE_ENV === "production") return null;
  const v = new URLSearchParams(window.location.search).get("sim_location");
  if (!v) return null;
  const [city, region] = v.split(",").map((s) => s.trim());
  return { city: city ?? "", region: region ?? "" };
}

async function fetchPlace(sim: { city: string; region: string } | null): Promise<DetectedPlace | null> {
  try {
    const qs = sim ? `?city=${encodeURIComponent(sim.city)}&region=${encodeURIComponent(sim.region)}` : "";
    const res = await fetch(`/api/geo${qs}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as DetectedPlace;
  } catch {
    return null;
  }
}

/* ---- context ---- */

interface LocationContextValue {
  /** Null until we know (first paint, or while the first lookup runs). */
  location: UserLocation | null;
  /** The visitor picked a city in the header; this overrides auto-detection. */
  selectCity: (city: { id: string; name: string }) => void;
  /** Forget a manual pick and go back to the detected location. */
  resetToDetected: () => void;
}

const LocationContext = createContext<LocationContextValue>({
  location: null,
  selectCity: () => {},
  resetToDetected: () => {},
});

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const cities = useCmsCities();
  // undefined on the server and during hydration, so server and client markup match.
  const raw = useSyncExternalStore(subscribe, readRaw, () => undefined);
  const stored = useMemo(() => parseStored(raw), [raw]);
  const sim = useMemo(() => (raw === undefined ? null : readSimulated()), [raw]);
  const [simPlace, setSimPlace] = useState<DetectedPlace | null | undefined>(undefined);
  const inFlight = useRef(false);

  useEffect(() => {
    if (raw === undefined) return; // not hydrated yet
    const needsDetection = sim || !stored || (stored.mode === "auto" && Date.now() - stored.at > AUTO_TTL_MS);
    if (!needsDetection || inFlight.current) return;
    inFlight.current = true;
    fetchPlace(sim)
      .then((place) => {
        if (sim) setSimPlace(place);
        else writeStored({ mode: "auto", place, at: Date.now() });
      })
      .finally(() => {
        inFlight.current = false;
      });
  }, [raw, stored, sim]);

  const location = useMemo<UserLocation | null>(() => {
    if (raw === undefined) return null;
    if (sim) return simPlace === undefined ? null : (resolveDetected(simPlace, cities) ?? defaultLocation(cities));
    if (!stored) return null; // first visit, lookup still running
    if (stored.mode === "manual") {
      const city = cities.find((c) => c.id === stored.cityId);
      return locationForCity(city ?? { name: stored.name }, cities);
    }
    return resolveDetected(stored.place, cities) ?? defaultLocation(cities);
  }, [raw, sim, simPlace, stored, cities]);

  const selectCity = useCallback((city: { id: string; name: string }) => {
    writeStored({ mode: "manual", cityId: city.id, name: city.name });
  }, []);

  const resetToDetected = useCallback(() => {
    writeStored(null); // the effect above notices and looks the visitor up again
  }, []);

  const value = useMemo(() => ({ location, selectCity, resetToDetected }), [location, selectCity, resetToDetected]);
  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation(): LocationContextValue {
  return useContext(LocationContext);
}

/** Keys of T whose value is a string, e.g. "city". */
type StringKey<T> = { [K in keyof T]: T[K] extends string ? K : never }[keyof T];

/**
 * Stable partition: items in the visitor's city first, everything else after
 * in its original order. Nothing is hidden. Returns `items` untouched until
 * the location is known or when nothing is listed locally. `cityKey` names
 * the field that holds the item's city.
 */
export function usePrioritized<T>(items: T[], cityKey: StringKey<T>): T[] {
  const { location } = useLocation();
  return useMemo(() => {
    if (!location || location.cities.length === 0) return items;
    const local: T[] = [];
    const rest: T[] = [];
    for (const item of items) (isLocalCity(location, item[cityKey] as string) ? local : rest).push(item);
    return local.length ? [...local, ...rest] : items;
  }, [items, cityKey, location]);
}

/**
 * For home-page rails that show a handful of "featured" items: local items
 * from the wider `pool` go first (featured ones before the rest, none cut off), and the
 * normal featured items fill whatever room is left.
 */
export function useLocalFirst<T extends { id: string }>(
  featured: T[],
  pool: T[],
  cityKey: StringKey<T>,
  limit: number,
): T[] {
  const { location } = useLocation();
  return useMemo(() => {
    const base = featured.slice(0, limit);
    if (!location || location.cities.length === 0) return base;
    const isLocal = (item: T) => isLocalCity(location, item[cityKey] as string);
    const featuredIds = new Set(featured.map((f) => f.id));
    const local = [...featured.filter(isLocal), ...pool.filter((p) => isLocal(p) && !featuredIds.has(p.id))];
    if (local.length === 0) return base;
    // Every local item is shown (never cut off at `limit`); other cities only fill any room that is left.
    return [...local, ...featured.filter((f) => !isLocal(f))].slice(0, Math.max(limit, local.length));
  }, [featured, pool, cityKey, location, limit]);
}
