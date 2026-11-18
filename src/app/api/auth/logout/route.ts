import { cookies } from "next/headers";
import { AuthError, SESSION_COOKIE } from "@/lib/auth/config";
import { fail, json, sameOrigin } from "@/lib/auth/http";

export async function POST(request: Request) {
  try {
    if (!sameOrigin(request)) throw new AuthError("Request blocked.", 403);
    (await cookies()).delete({ name: SESSION_COOKIE, path: "/" });
    return json({ ok: true });
  } catch (err) {
    return fail(err);
  }
}
