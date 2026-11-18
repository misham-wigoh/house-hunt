import Link from "next/link";
import { Award } from "lucide-react";
import { CmsImage } from "./cms-image";
import type { BuilderItem } from "@/lib/cms/types";

export function TopBuilders({ builders }: { builders: BuilderItem[] }) {
  return (
    <section data-ui="top-builders" className="py-12 bg-white border-b border-[#aeaeaf]/40">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#008ae8] mb-1">
              <Award className="w-3.5 h-3.5" />
              <span>Trusted Development Partners</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-light tracking-normal text-[#262626]">
              India&apos;s Top Builders &amp; <span className="font-serif italic font-normal">Developers</span>
            </h2>
            <p className="text-sm text-[#757577] mt-1">
              Invest with confidence in projects built by RERA-certified developers with established delivery track records.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {builders.map((b) => (
            <Link
              key={b.id}
              data-ui="builder-card"
              href={`/properties?q=${encodeURIComponent(b.name)}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-[#aeaeaf]/40 bg-white hover:border-[#008ae8] transition-colors"
            >
              <div className="h-16" style={{ backgroundColor: b.bg }} aria-hidden="true" />
              <div className="-mt-8 flex flex-1 flex-col items-center px-2.5 sm:px-4 pb-4 text-center">
                <div
                  style={b.logo ? undefined : { backgroundColor: b.bg, color: b.text }}
                  className="relative mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white text-sm font-black group-hover:scale-105 transition-transform"
                >
                  {b.logo ? <CmsImage src={b.logo} alt={b.name} sizes="64px" className="object-contain" /> : b.initials}
                </div>
                <h3 className="text-xs sm:text-sm font-medium text-[#262626] group-hover:text-[#008ae8] transition-colors">
                  {b.name}
                </h3>
                <p className="mt-0.5 text-[11px] text-[#757577]">{b.experience}</p>

                <div data-ui="stats" className="mt-3 flex flex-wrap justify-center gap-1.5">
                  {b.projects && (
                    <span className="rounded-[4px] bg-[#e0f2fe] px-2 py-0.5 text-[11px] font-medium text-[#008ae8]">{b.projects}</span>
                  )}
                  {b.tag && (
                    <span className="max-w-full truncate rounded-[4px] border border-[#aeaeaf]/40 px-2 py-0.5 text-[10px] text-[#757577]">{b.tag}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
