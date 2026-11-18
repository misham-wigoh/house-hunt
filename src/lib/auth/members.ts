import "server-only";
import { AuthError } from "./config";

export interface MemberRecord {
  id: number;
  email: string;
  name: string;
  shortlist: string[];
  created?: boolean;
}

/** Calls the WordPress submissions plugin (`acres-submit`), which keeps members as a private post type. */
async function call<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const graphql = process.env.WORDPRESS_GRAPHQL_URL;
  const secret = process.env.WORDPRESS_SUBMIT_SECRET;
  if (!graphql || !secret) throw new AuthError("Login isn't switched on yet. Please try again later.", 503);

  // Shared hosting now and then drops a request: try once more before giving up.
  const url = `${new URL(graphql).origin}/wp-json/acres/v1/member/${path}`;
  const init: RequestInit = {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Acres-Key": secret },
    body: JSON.stringify(body),
    cache: "no-store",
  };
  let res: Response | null = null;
  for (let attempt = 0; attempt < 2 && !res; attempt++) {
    try {
      const r = await fetch(url, init);
      if (r.status >= 500 && attempt === 0) continue;
      res = r;
    } catch (err) {
      if (attempt === 1) {
        console.error("Could not reach WordPress for members", err);
        throw new AuthError("We couldn't reach our servers. Please try again.", 502);
      }
    }
  }
  if (!res) throw new AuthError("We couldn't reach our servers. Please try again.", 502);
  const json = (await res.json().catch(() => ({}))) as T & { ok?: boolean; code?: string; message?: string };
  if (!res.ok || !json.ok) {
    console.error("WordPress members call failed", path, res.status, json.code, json.message);
    throw new AuthError("Something went wrong. Please try again.", 502);
  }
  return json;
}

/** Finds the member for this number, creating them on first login. */
export const startSession = (email: string, name?: string) =>
  call<{ member: MemberRecord }>("session", { email, name: name ?? "" }).then((r) => r.member);

export const setName = (id: number, name: string) =>
  call<{ member: MemberRecord }>("profile", { id, name }).then((r) => r.member);

export const getShortlist = (id: number) =>
  call<{ shortlist: string[] }>("shortlist", { id }).then((r) => r.shortlist);

export const setShortlisted = (id: number, slug: string, on: boolean) =>
  call<{ shortlist: string[] }>("shortlist", { id, slug, on }).then((r) => r.shortlist);
