"use client";

import React, { createContext, useContext } from "react";
import type { CityItem } from "@/lib/cms/types";

interface CmsContextValue {
  cities: CityItem[];
}

const CmsContext = createContext<CmsContextValue>({ cities: [] });

/** Gives client components (header, post-property form) the CMS city list fetched in the root layout. */
export function CmsProvider({ cities, children }: { cities: CityItem[]; children: React.ReactNode }) {
  return <CmsContext.Provider value={{ cities }}>{children}</CmsContext.Provider>;
}

export function useCmsCities(): CityItem[] {
  return useContext(CmsContext).cities;
}
