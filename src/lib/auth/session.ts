import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE, SESSION_TTL_S } from "./config";
import { sign, verify } from "./token";

export interface Member {
  id: number;
  email: string;
  name: string;
}

interface SessionPayload {
  t: "sess";
  m: number;
  p: string;
  n: string;
  e: number; // expires at (seconds)
}

export const sessionToken = (m: Member) =>
  sign({ t: "sess", m: m.id, p: m.email, n: m.name, e: Math.floor(Date.now() / 1000) + SESSION_TTL_S } satisfies SessionPayload);

/** The logged in member for this request, or null. Reads and verifies the signed cookie only. */
export async function getMember(): Promise<Member | null> {
  const jar = await cookies();
  let payload: SessionPayload | null;
  try {
    payload = verify<SessionPayload>(jar.get(SESSION_COOKIE)?.value, "sess");
  } catch {
    return null; // login isn't configured
  }
  if (!payload || payload.e < Date.now() / 1000) return null;
  return { id: payload.m, email: payload.p, name: payload.n };
}

export const cookieOptions = (secure: boolean, maxAge: number, path = "/") => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure,
  path,
  maxAge,
});
