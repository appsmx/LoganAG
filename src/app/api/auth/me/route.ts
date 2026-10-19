import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** GET /api/auth/me — usuario autenticado actual (o null). */
export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({ user });
}
