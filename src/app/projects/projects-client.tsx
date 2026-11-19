"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, Building2 } from "lucide-react";
import { Header } from "@/components/sites/house-hunt/header";
import { Footer } from "@/components/sites/house-hunt/footer";
import { CmsImage } from "@/components/sites/house-hunt/cms-image";
import { useLocation, usePrioritized } from "@/components/location/location-context";
import { isLocalCity } from "@/lib/location/resolve";
import type { ProjectItem } from "@/lib/cms/types";

const ALL = "All Cities";

export function ProjectsClient({ projects }: { projects: ProjectItem[] }) {
  const { location } = useLocation();
  // The visitor's own city leads, in the cards and in the filter pills. Nothing is hidden.
  const ordered = usePrioritized(projects, "city");
  const [picked, setPicked] = useState<string | null>(null);

  const cities = useMemo(
    () => Array.from(new Set(ordered.map((p) => p.city).filter(Boolean))),
    [ordered],
  );
  const selected = picked ?? ALL;
  const shown = selected === ALL ? ordered : ordered.filter((p) => p.city === selected);

  const localCount = ordered.filter((p) => isLocalCity(location, p.city)).length;
  const localFirstLabel = selected === ALL && localCount > 0 ? location?.label : null;

  return (
    <div className="min-h-dvh bg-[#fafafa] flex flex-col font-sans text-[#262626] selection:bg-[#008ae8] selection:text-white">
      <Header />

      <div data-ui="breadcrumb-bar" className="bg-white border-b border-[#aeaeaf]/40 py-3 px-4 sm:px-6 lg:px-8 2xl:px-12">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between text-xs text-[#757577]">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-[#008ae8] transition-colors">Home</Link>
            <span>/</span>
            <span className="font-medium text-[#262626]">Projects</span>
            {selected !== ALL && <span className="text-[#008ae8] font-medium">• {selected}</span>}
          </div>
          <span className="font-medium hidden sm:inline">
            {localFirstLabel && <span className="text-[#008ae8]">{localFirstLabel} projects first · </span>}
            {projects.length} {projects.length === 1 ? "Project" : "Projects"}
          </span>
        </div>
      </div>

      <main className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-8 sm:py-10 flex-1 w-full">
        <header className="mb-6 max-w-2xl">
          <span className="text-xs font-semibold text-[#008ae8]">New Launches &amp; Ready Homes</span>
          <h1 className="mt-1 text-3xl sm:text-4xl font-light tracking-normal">
            Builder <span className="font-serif italic font-normal text-[#008ae8]">Projects</span>
          </h1>
          <p className="mt-2 text-sm text-[#757577]">
            Apartments, villas and plotted townships with starting prices, possession dates and builder details.
          </p>
        </header>

        {cities.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 no-scrollbar" role="group" aria-label="Filter projects by city">
            {[ALL, ...cities].map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => setPicked(city === ALL ? null : city)}
                className={`px-3 py-1.5 rounded-[4px] text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selected === city
                    ? "bg-[#008ae8] text-white border border-[#008ae8] shadow-xs"
                    : "bg-white text-[#262626] border border-[#aeaeaf]/40 hover:bg-[#e0f2fe]"
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        )}

        {shown.length === 0 ? (
          <div className="rounded-2xl border border-[#aeaeaf]/40 bg-white p-10 text-center">
            <Building2 className="w-8 h-8 text-[#aeaeaf] mx-auto mb-2" />
            <p className="text-sm text-[#757577]">No projects to show yet. Please check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {shown.map((proj) => (
              <Link
                key={proj.id}
                href={`/project/${proj.id}`}
                data-ui="project-card"
                className="group relative block aspect-[4/4.8] sm:aspect-[4/5] overflow-hidden rounded-2xl bg-[#1c1c1e] shadow-xs hover:shadow-lg transition-all duration-300"
              >
                <CmsImage
                  src={proj.image}
                  alt={proj.name}
                  sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-[#1c1c1e]/90 via-[#1c1c1e]/25 to-[#1c1c1e]/15" />

                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-1.5">
                  {proj.tag ? (
                    <span className="px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-[#1c1c1e]/60 backdrop-blur-md border border-white/20 text-white">
                      {proj.tag}
                    </span>
                  ) : (
                    <span />
                  )}
                  {proj.pricePerSqFt && (
                    <span className="px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-[#1c1c1e]/60 backdrop-blur-md border border-white/20 text-white">
                      {proj.pricePerSqFt}
                    </span>
                  )}
                </div>

                <div className="absolute inset-x-2.5 bottom-2.5 rounded-xl border border-white/25 bg-black/40 p-3 text-white backdrop-blur-md">
                  <h2 className="text-base font-normal leading-snug truncate" title={proj.name}>
                    {proj.name}
                  </h2>
                  {proj.builder && <p className="text-[11px] text-white/75 truncate">by {proj.builder}</p>}
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-white/85">
                    <MapPin className="w-3 h-3 shrink-0 text-[#008ae8]" />
                    <span className="truncate">{[proj.location, proj.city].filter(Boolean).join(", ")}</span>
                  </p>
                  <div className="mt-2 flex items-end justify-between gap-2">
                    <div>
                      <span className="block text-[10px] text-white/75">Starting from</span>
                      <span className="text-lg font-light leading-tight">{proj.price}</span>
                    </div>
                    {proj.possession && (
                      <span className="flex items-center gap-1 text-[10px] text-white/85 shrink-0">
                        <Calendar className="w-3 h-3 shrink-0" />
                        {proj.possession}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-[10px] text-white/75 truncate">
                    {[proj.bhk, proj.rera && `RERA ${proj.rera}`].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
