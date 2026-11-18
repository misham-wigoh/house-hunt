import Link from "next/link";
import {
  Building2,
  Sparkles,
  TrendingUp,
  Percent,
  Calculator,
  FileCheck2,
} from "lucide-react";

const QUICK_SERVICES = [
  {
    title: "Buy Commercial",
    desc: "Offices, Retail & Shops",
    icon: Building2,
    href: "/properties?type=commercial",
    badge: "High ROI",
    iconColor: "text-[#008ae8] bg-[#e0f2fe] border-[#008ae8]/20",
  },
  {
    title: "Handpicked Projects",
    desc: "100% RERA Registered",
    icon: Sparkles,
    href: "/properties?type=project",
    badge: "Trending",
    iconColor: "text-[#008ae8] bg-[#e0f2fe] border-[#008ae8]/20",
  },
  {
    title: "Price Trends & Insights",
    desc: "Locality Growth Rates",
    icon: TrendingUp,
    href: "#insights",
    badge: "2026 Data",
    iconColor: "text-[#008ae8] bg-[#e0f2fe] border-[#008ae8]/20",
  },
  {
    title: "Home Loans @ 8.35%*",
    desc: "Lowest Interest Rates",
    icon: Percent,
    href: "#services",
    badge: "Instant Approval",
    iconColor: "text-[#008ae8] bg-[#e0f2fe] border-[#008ae8]/20",
  },
  {
    title: "Area Calculator",
    desc: "Sq.ft, Bigha, Acres",
    icon: Calculator,
    href: "#calculator",
    badge: "Free Tool",
    iconColor: "text-[#008ae8] bg-[#e0f2fe] border-[#008ae8]/20",
  },
  {
    title: "Online Rent Agreement",
    desc: "Doorstep Biometrics",
    icon: FileCheck2,
    href: "#services",
    badge: "Govt. Approved",
    iconColor: "text-[#008ae8] bg-[#e0f2fe] border-[#008ae8]/20",
  },
];

export function QuickLinks() {
  return (
    <section data-ui="quick-links" className="py-6 bg-[#fafafa]">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {QUICK_SERVICES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                href={item.href}
                className="group p-2.5 sm:p-3.5 rounded-2xl border border-[#aeaeaf]/40 hover:border-[#008ae8] transition-colors bg-white flex flex-col justify-between shadow-xs"
              >
                <div className="flex items-center justify-between gap-1 mb-2 sm:mb-2.5">
                  <span className={`p-1.5 sm:p-2 rounded-xl border shrink-0 ${item.iconColor}`}>
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-[#fafafa] text-[#262626] group-hover:bg-[#008ae8] group-hover:text-white transition-colors truncate">
                    {item.badge}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#262626] group-hover:text-[#008ae8] transition-colors leading-snug line-clamp-1 sm:line-clamp-none">
                    {item.title}
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-[#757577] mt-0.5 truncate">{item.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
