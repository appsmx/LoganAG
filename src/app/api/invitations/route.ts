import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { resolveContext, isResponse } from "@/lib/api-helpers";
import { sendMail, invitationEmail } from "@/lib/mailer";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email("Correo inválido."),
  role: z.enum(["COLLABORATOR", "VIEWER"]).default("VIEWER"),
});

/** GET /api/invitations — lista invitaciones y miembros del árbol activo. */
export async function GET() {
  const ctx = await resolveContext();
  if (isResponse(ctx)) return ctx;

  const [invitations, memberships] = await Promise.all([
    prisma.invitation.findMany({
      where: { treeId: ctx.treeId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.membership.findMany({
      where: { treeId: ctx.treeId },
      include: { user: { select: { email: true, name: true } } },
    }),
  ]);

  return NextResponse.json({
    invitations,
    memberships,
    myRole: ctx.access.role,
  });
}

/** POST /api/invitations — invita a un familiar (solo OWNER, DEC-011). */
export async function POST(req: NextRequest) {
  const ctx = await resolveContext();
  if (isResponse(ctx)) return ctx;
  if (!ctx.access.isOwner) {
    return NextResponse.json(
      { error: "Solo el dueño del árbol puede invitar." },
      { status: 403 }
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
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const me = await getCurrentUser();

  // Si ya es miembro, no reinvitar.
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const already = await prisma.membership.findUnique({
      where: { treeId_userId: { treeId: ctx.treeId, userId: existingUser.id } },
    });
    if (already) {
      return NextResponse.json(
        { error: "Esa persona ya es miembro del árbol." },
        { status: 409 }
      );
    }
  }

  const invitation = await prisma.invitation.create({
    data: {
      treeId: ctx.treeId,
      email,
      role: parsed.data.role,
      inviterId: ctx.userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
    },
  });

  const tree = await prisma.tree.findUnique({ where: { id: ctx.treeId } });
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  const link = `${appUrl}/invitacion/${invitation.token}`;
  const { html, text } = invitationEmail(
    link,
    tree?.name ?? "un árbol",
    me?.name ?? me?.email ?? "Alguien"
  );
  const mail = await sendMail({
    to: email,
    subject: "Te invitaron a un árbol genealógico en LoganAG 🌳",
    html,
    text,
  });

  return NextResponse.json(
    {
      ok: true,
      invitation: { id: invitation.id, email, role: invitation.role },
      ...(mail.devPreview ? { devLink: link } : {}),
    },
    { status: 201 }
  );
}

/** DELETE /api/invitations?id=... — revoca una invitación (solo OWNER). */
export async function DELETE(req: NextRequest) {
  const ctx = await resolveContext();
  if (isResponse(ctx)) return ctx;
  if (!ctx.access.isOwner) {
    return NextResponse.json(
      { error: "Solo el dueño puede revocar." },
      { status: 403 }
    );
  }
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Falta el id." }, { status: 400 });

  const inv = await prisma.invitation.findFirst({
    where: { id, treeId: ctx.treeId },
  });
  if (!inv)
    return NextResponse.json({ error: "No encontrada." }, { status: 404 });

  await prisma.invitation.update({
    where: { id },
    data: { status: "REVOKED" },
  });
  return NextResponse.json({ ok: true });
}
