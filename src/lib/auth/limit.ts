import "server-only";

// Best-effort limiter kept in server memory (the same approach as the other forms). With several
// server instances each keeps its own count; put a shared store behind this if you scale out.
const hits = new Map<string, number[]>();

/** Records a hit and returns false once `max` hits have happened inside `windowMs`. */
export function allow(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return false;
  }
  hits.set(key, [...recent, now]);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= windowMs)) hits.delete(k);
  }
  return true;
}
