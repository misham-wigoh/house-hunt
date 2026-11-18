import { getMember } from "@/lib/auth/session";
import { json } from "@/lib/auth/http";

export async function GET() {
  const member = await getMember();
  return json({ ok: true, member: member ? { name: member.name, email: member.email } : null });
}
