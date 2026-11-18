import { AuthError } from "@/lib/auth/config";
import { getShortlist, setShortlisted } from "@/lib/auth/members";
import { fail, json, sameOrigin } from "@/lib/auth/http";
import { getMember } from "@/lib/auth/session";

export async function GET() {
  try {
    const member = await getMember();
    if (!member) return json({ ok: true, shortlist: [] });
    return json({ ok: true, shortlist: await getShortlist(member.id) });
  } catch (err) {
    return fail(err);
  }
}

export async function POST(request: Request) {
  try {
    if (!sameOrigin(request)) throw new AuthError("Request blocked.", 403);
    const member = await getMember();
    if (!member) throw new AuthError("Please log in first.", 401);
    const body = (await request.json().catch(() => null)) as { slug?: unknown; on?: unknown } | null;
    const slug = String(body?.slug ?? "").toLowerCase();
    if (!/^[a-z0-9][a-z0-9-]{0,198}$/.test(slug)) throw new AuthError("Invalid property.", 400);
    return json({ ok: true, shortlist: await setShortlisted(member.id, slug, body?.on !== false) });
  } catch (err) {
    return fail(err);
  }
}
