import { CheckCircle, Star } from "lucide-react";

export function AppBanner() {
  return (
    <section data-ui="app-banner" className="py-12 bg-[#262626] text-white border-y border-white/10 relative overflow-hidden">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text & Features */}
          <div className="lg:col-span-7 space-y-4">
            <span className="inline-block px-3 py-1 rounded-[4px] text-xs font-semibold bg-[#1c1c1e] text-[#008ae8] border border-white/10">
              India&apos;s Highest Rated Real Estate App
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-normal text-white leading-tight">
              Experience the House Hunt App on <span className="font-serif italic font-normal">Mobile</span>
            </h2>
            <p className="text-sm text-[#aeaeaf] max-w-xl">
              Get instant price drop alerts, browse verified owner contacts without middlemen, and take interactive 3D virtual tours directly from your smartphone.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-medium text-[#fafafa]">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#008ae8] shrink-0" />
                <span>Zero Brokerage Owner Listings</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#008ae8] shrink-0" />
                <span>Instant Push Alerts on Price Drops</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#008ae8] shrink-0" />
                <span>Radius &amp; Metro Distance Search</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#008ae8] shrink-0" />
                <span>Direct WhatsApp Chat with Builders</span>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 flex-wrap">
              <a
                href="https://play.google.com/store"
                target="_blank"
                rel="noreferrer"
                className="bg-[#008ae8] hover:bg-[#0077c8] text-white px-4 py-2.5 rounded-[4px] border border-[#008ae8] flex items-center gap-3 transition-colors shadow-xs"
              >
                <div className="text-left">
                  <div className="text-[10px] text-white/80">Get it on</div>
                  <div className="text-xs font-semibold text-white">Google Play</div>
                </div>
              </a>

              <a
                href="https://apple.com/app-store"
                target="_blank"
                rel="noreferrer"
                className="bg-[#008ae8] hover:bg-[#0077c8] text-white px-4 py-2.5 rounded-[4px] border border-[#008ae8] flex items-center gap-3 transition-colors shadow-xs"
              >
                <div className="text-left">
                  <div className="text-[10px] text-white/80">Download on the</div>
                  <div className="text-xs font-semibold text-white">App Store</div>
                </div>
              </a>

              <div className="flex items-center gap-2 px-3 py-2 bg-[#1c1c1e] rounded-[4px] border border-white/10">
                <div className="flex text-[#008ae8]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="text-xs font-medium text-white">4.8 / 5 (380K+ Reviews)</span>
              </div>
            </div>
          </div>

          {/* Right QR Code & Mockup Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div data-ui="qr-card" className="bg-white text-[#262626] p-6 rounded-2xl border border-[#aeaeaf]/40 max-w-xs text-center flex flex-col items-center">
              <div className="p-3 bg-[#fafafa] rounded-xl border border-[#aeaeaf]/40 mb-3">
                {/* Clean SVG QR Code */}
                <svg className="w-36 h-36" viewBox="0 0 100 100" fill="none">
                  <rect width="100" height="100" fill="#fafafa" />
                  <path
                    d="M10 10h30v30h-30z M60 10h30v30h-30z M10 60h30v30h-30z M20 20h10v10h-10z M70 20h10v10h-10z M20 70h10v10h-10z M50 15h5v15h-5z M50 45h15v5h-15z M70 50h15v10h-15z M50 70h20v5h-20z M80 75h10v15h-10z M50 85h20v5h-20z"
                    fill="#262626"
                  />
                </svg>
              </div>
              <h4 className="text-sm font-medium text-[#262626]">Scan to Download</h4>
              <p className="text-xs text-[#757577] mt-1">
                Point your camera at this QR code to download the official House Hunt App instantly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
