const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** 65000000 -> "₹6.50 Cr", 8500000 -> "₹85 Lac", 22000 -> "₹22,000". */
export function formatInr(amount: number): string {
  if (amount >= 10_000_000) {
    const cr = amount / 10_000_000;
    return `₹${cr.toFixed(cr >= 10 && cr === Math.round(cr) ? 1 : 2)} Cr`;
  }
  if (amount >= 100_000) {
    const lac = amount / 100_000;
    return `₹${lac % 1 === 0 ? lac.toFixed(0) : lac.toFixed(2)} Lac`;
  }
  return `₹${inr.format(amount)}`;
}

export function formatListingPrice(
  amount: number | null,
  priceType: string,
  onRequest: boolean,
): string {
  if (onRequest || !amount) return "Price on Request";
  const base = formatInr(amount);
  if (priceType === "per_month") return `${base} / mo`;
  if (priceType === "per_sqft_month") return `${base} / sq.ft / mo`;
  if (priceType === "per_sqft") return `${base} / sq.ft`;
  return base;
}

export function formatPerSqFt(amount: number | null, perMonth: boolean): string {
  if (!amount) return "";
  return `₹${inr.format(amount)} / sq.ft${perMonth ? " / mo" : ""}`;
}

/** "5 min read" */
export function formatReadTime(minutes: number | null): string {
  return minutes ? `${minutes} min read` : "";
}

/** "2026-11-12T09:00:00" -> "Nov 12, 2026" (fixed locale so SSR and CSR agree). */
export function formatArticleDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Safe String.fromCodePoint: returns `fallback` for values that are not valid code points. */
function codePointToString(code: number, fallback: string): string {
  return Number.isInteger(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : fallback;
}

/** "<p>Hello &amp; bye</p>" -> ["Hello & bye"]. Strips markup instead of injecting HTML. */
export function htmlToParagraphs(html: string | null | undefined): string[] {
  if (!html) return [];
  return html
    .split(/<\/p>|<br\s*\/?>/i)
    .map((chunk) =>
      chunk
        .replace(/<[^>]*>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&nbsp;/g, " ")
        .replace(/&#8217;|&rsquo;/g, "’")
        .replace(/&#8211;|&ndash;/g, "–")
        .replace(/&quot;/g, '"')
        .replace(/&#039;|&#8217;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        // WordPress turns "24x7" into "24&#215;7" and quotes/dashes into numeric entities.
        .replace(/&#(\d+);/g, (m, n: string) => codePointToString(Number(n), m))
        .replace(/&#x([0-9a-f]+);/gi, (m, h: string) => codePointToString(parseInt(h, 16), m))
        .trim(),
    )
    .filter(Boolean);
}
