import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { relationshipCreateSchema } from "@/lib/validation";
import { resolveContext, isResponse } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

/** POST /api/relationships — crea un vínculo entre dos personas (rol editor). */
export async function POST(req: NextRequest) {
  const ctx = await resolveContext();
  if (isResponse(ctx)) return ctx;
  if (!ctx.access.canEdit) {
    return NextResponse.json({ error: "Solo lectura." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = relationshipCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { type, personAId, personBId } = parsed.data;
  if (personAId === personBId) {
    return NextResponse.json(
      { error: "Una persona no puede vincularse consigo misma." },
      { status: 400 }
    );
  }

  const count = await prisma.person.count({
    where: { treeId: ctx.treeId, id: { in: [personAId, personBId] } },
  });
  if (count !== 2) {
    return NextResponse.json(
      { error: "Ambas personas deben existir en el árbol." },
      { status: 400 }
    );
  }

  try {
    const relationship = await prisma.relationship.create({
      data: { treeId: ctx.treeId, type, personAId, personBId },
    });
    return NextResponse.json({ relationship }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Ese vínculo ya existe." }, { status: 409 });
  }
}

/** DELETE /api/relationships?id=... — elimina un vínculo (rol editor). */
export async function DELETE(req: NextRequest) {
  const ctx = await resolveContext();
  if (isResponse(ctx)) return ctx;
  if (!ctx.access.canEdit) {
    return NextResponse.json({ error: "Solo lectura." }, { status: 403 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Falta el id." }, { status: 400 });
  }
  const existing = await prisma.relationship.findFirst({
    where: { id, treeId: ctx.treeId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Vínculo no encontrado." }, { status: 404 });
  }
  await prisma.relationship.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
