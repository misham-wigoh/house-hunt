import { cookies } from "next/headers";
import { AuthError, SESSION_COOKIE, SESSION_TTL_S } from "@/lib/auth/config";
import { setName } from "@/lib/auth/members";
import { cleanName, fail, isHttps, json, sameOrigin } from "@/lib/auth/http";
import { cookieOptions, getMember, sessionToken } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    if (!sameOrigin(request)) throw new AuthError("Request blocked.", 403);
    const member = await getMember();
    if (!member) throw new AuthError("Please log in first.", 401);
    const body = (await request.json().catch(() => null)) as { name?: unknown } | null;
    const name = cleanName(body?.name);
    if (name.length < 2) throw new AuthError("Please enter your name.", 400);

    const updated = await setName(member.id, name);
    (await cookies()).set(
      SESSION_COOKIE,
      sessionToken({ id: member.id, email: member.email, name: updated.name }),
      cookieOptions(isHttps(request), SESSION_TTL_S),
    );
    return json({ ok: true, member: { name: updated.name, email: member.email } });
  } catch (err) {
    return fail(err);
  }
}
