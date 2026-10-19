import { NextResponse } from "next/server";
import { logout } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** POST /api/auth/logout — cierra la sesión. */
export async function POST() {
  await logout();
  return NextResponse.json({ ok: true });
}
