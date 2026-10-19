import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const schema = z.object({ token: z.string().min(1) });

/**
 * POST /api/invitations/accept — el usuario autenticado acepta una invitación
 * (DEC-011). Crea la Membership con el rol de la invitación.
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Inicia sesión para aceptar la invitación.", needsAuth: true },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Token inválido." }, { status: 400 });
  }

  const inv = await prisma.invitation.findUnique({
    where: { token: parsed.data.token },
  });
  if (!inv || inv.status !== "PENDING") {
    return NextResponse.json(
      { error: "La invitación no es válida o ya fue usada." },
      { status: 400 }
    );
  }
  if (inv.expiresAt && inv.expiresAt < new Date()) {
    await prisma.invitation.update({
      where: { id: inv.id },
      data: { status: "EXPIRED" },
    });
    return NextResponse.json({ error: "La invitación caducó." }, { status: 400 });
  }

  // Crear membresía (idempotente) + marcar invitación aceptada.
  await prisma.$transaction([
    prisma.membership.upsert({
      where: { treeId_userId: { treeId: inv.treeId, userId: user.id } },
      update: { role: inv.role },
      create: { treeId: inv.treeId, userId: user.id, role: inv.role },
    }),
    prisma.invitation.update({
      where: { id: inv.id },
      data: { status: "ACCEPTED" },
    }),
  ]);

  return NextResponse.json({ ok: true, treeId: inv.treeId });
}
