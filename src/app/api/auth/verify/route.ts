import { NextRequest, NextResponse } from "next/server";
import { consumeMagicLink, setSessionCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** GET /api/auth/verify?token=... — consume el enlace y crea la sesión (DEC-010). */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const appUrl = process.env.APP_URL ?? req.nextUrl.origin;

  if (!token) {
    return NextResponse.redirect(`${appUrl}/entrar?error=missing`);
  }

  const result = await consumeMagicLink(token);
  if (!result.ok || !result.sessionToken) {
    return NextResponse.redirect(`${appUrl}/entrar?error=invalid`);
  }

  await setSessionCookie(result.sessionToken);
  return NextResponse.redirect(`${appUrl}/arbol`);
}
