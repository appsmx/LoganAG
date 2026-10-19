import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Verifica que el usuario autenticado sea administrador (ADMIN_EMAIL). */
async function requireAdmin() {
  const user = await getCurrentUser();
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!user) return { ok: false as const, status: 401 };
  if (!adminEmail || user.email.toLowerCase() !== adminEmail) {
    return { ok: false as const, status: 403 };
  }
  return { ok: true as const, user };
}

/** GET /api/admin/feedback — lista los comentarios (solo admin). */
export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json(
      {
        error: auth.status === 401 ? "No autenticado." : "Solo administrador.",
      },
      { status: auth.status }
    );
  }

  const feedback = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ feedback });
}

/** PATCH /api/admin/feedback?id=... — marca un comentario como atendido (solo admin). */
export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json(
      {
        error: auth.status === 401 ? "No autenticado." : "Solo administrador.",
      },
      { status: auth.status }
    );
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Falta el id." }, { status: 400 });

  const existing = await prisma.feedback.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "No encontrado." }, { status: 404 });
  }

  await prisma.feedback.update({
    where: { id },
    data: { status: existing.status === "NUEVO" ? "ATENDIDO" : "NUEVO" },
  });
  return NextResponse.json({ ok: true });
}
