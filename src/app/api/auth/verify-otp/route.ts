import { cookies } from "next/headers";
import { AuthError, OTP_COOKIE, SESSION_COOKIE, SESSION_TTL_S } from "@/lib/auth/config";
import { allow } from "@/lib/auth/limit";
import { checkOtp } from "@/lib/auth/otp";
import { startSession } from "@/lib/auth/members";
import { cleanEmail, cleanName, clientIp, fail, isHttps, json, sameOrigin } from "@/lib/auth/http";
import { cookieOptions, sessionToken } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    if (!sameOrigin(request)) throw new AuthError("Request blocked.", 403);
    if (!allow(`verify:ip:${clientIp(request)}`, 40, 60 * 60 * 1000)) {
      throw new AuthError("Too many attempts. Please try again later.", 429);
    }
    const body = (await request.json().catch(() => null)) as { email?: unknown; code?: unknown; name?: unknown } | null;
    const email = cleanEmail(body?.email);
    const code = String(body?.code ?? "").replace(/\D/g, "");
    if (!email || !/^\d{6}$/.test(code)) throw new AuthError("Enter the 6 digit code.", 400);

    const secure = isHttps(request);
    const jar = await cookies();
    const result = checkOtp(jar.get(OTP_COOKIE)?.value, email, code);

    if (!result.ok) {
      if (result.token) jar.set(OTP_COOKIE, result.token, cookieOptions(secure, 300, "/api/auth"));
      if (result.reason === "locked") jar.delete({ name: OTP_COOKIE, path: "/api/auth" });
      const message = {
        missing: "That code isn't valid any more. Please request a new one.",
        expired: "That code has expired. Please request a new one.",
        locked: "Too many wrong codes. Please request a new one.",
        wrong: `Incorrect code. ${result.left} ${result.left === 1 ? "try" : "tries"} left.`,
      }[result.reason];
      throw new AuthError(message, result.reason === "wrong" ? 401 : 400, { reason: result.reason });
    }

    const member = await startSession(email, cleanName(body?.name));
    jar.delete({ name: OTP_COOKIE, path: "/api/auth" });
    jar.set(SESSION_COOKIE, sessionToken({ id: member.id, email: member.email, name: member.name }), cookieOptions(secure, SESSION_TTL_S));
    return json({ ok: true, member: { name: member.name, email: member.email }, isNew: Boolean(member.created) });
  } catch (err) {
    return fail(err);
  }
}
