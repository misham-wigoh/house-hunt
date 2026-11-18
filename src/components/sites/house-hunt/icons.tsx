
export function HouseHuntLogo({ className = "h-9", light = false }: { className?: string; light?: boolean }) {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`} aria-label="HouseHunt.com">
      {/* House Hunt Architectural Emblem */}
      <div className="h-full aspect-square rounded-xl bg-[#008ae8] text-white flex items-center justify-center p-1.5 shrink-0 shadow-sm">
        <svg
          viewBox="0 0 32 32"
          className="w-full h-full fill-current"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M16 3L3 13.5V28C3 28.55 3.45 29 4 29H12V20H20V29H28C28.55 29 29 28.55 29 28V13.5L16 3Z" />
        </svg>
      </div>

      {/* Brand Name Wordmark: House Hunt .com */}
      <div className="flex flex-col justify-center leading-tight">
        <div className="flex items-baseline leading-none">
          <span className="text-xl sm:text-2xl font-black tracking-tight text-[#008ae8]">
            House
          </span>
          <span className={`text-xl sm:text-2xl font-black tracking-tight ml-1 ${light ? "text-white" : "text-[#262626]"}`}>
            Hunt
          </span>
          <span className="text-xs sm:text-sm font-black ml-1 text-[#008ae8]">
            .com
          </span>
        </div>
        <span className={`block text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase mt-0.5 ${light ? "text-[#aeaeaf]" : "text-[#757577]"}`}>
          India&apos;s Property Portal
        </span>
      </div>
    </div>
  );
}

export function VerifiedBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-[#e0f2fe] text-[#008ae8] border border-[#008ae8]/30 shrink-0 ${className}`}
    >
      <svg className="w-3.5 h-3.5 text-[#008ae8] fill-current shrink-0" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
      <span>Verified</span>
    </span>
  );
}

export function PriceDropBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#1c1c1e] text-[#008ae8] border border-[#008ae8]/30 shrink-0 ${className}`}
    >
      Price drop
    </span>
  );
}

export function ReraBadge({ reraId }: { reraId?: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-[#fafafa] text-[#262626] border border-[#aeaeaf]">
      <span className="font-bold text-[10px] bg-[#008ae8] text-white px-1 rounded">RERA</span>
      {reraId ? <span className="truncate max-w-[140px]">{reraId}</span> : <span>Registered</span>}
    </span>
  );
}
