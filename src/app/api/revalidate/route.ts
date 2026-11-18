import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

/**
 * Called by WordPress (e.g. a webhook on post save) so pages refresh without a
 * redeploy:  POST /api/revalidate  { "secret": "...", "tag": "listings" }
 * Omit `tag` to refresh everything fetched from the CMS.
 */
export async function POST(request: Request) {
  const expected = process.env.REVALIDATE_SECRET;
  const body = (await request.json().catch(() => ({}))) as { secret?: string; tag?: string };

  if (!expected || body.secret !== expected) {
    return NextResponse.json({ ok: false, error: "Invalid secret" }, { status: 401 });
  }

  const tag = body.tag && /^[a-z:_-]+$/i.test(body.tag) ? body.tag : "cms";
  revalidateTag(tag, "max");
  return NextResponse.json({ ok: true, revalidated: tag });
}
