import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateDemoTree, parseDate } from "@/lib/tree-service";
import { personUpdateSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** PATCH /api/persons/[id] — actualiza una persona. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const treeId = await getOrCreateDemoTree();

  const existing = await prisma.person.findFirst({ where: { id, treeId } });
  if (!existing) {
    return NextResponse.json({ error: "Persona no encontrada." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = personUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const person = await prisma.person.update({
    where: { id },
    data: {
      ...(d.firstName !== undefined && { firstName: d.firstName }),
      ...(d.lastName !== undefined && { lastName: d.lastName }),
      ...(d.nickname !== undefined && { nickname: d.nickname }),
      ...(d.gender !== undefined && { gender: d.gender }),
      ...(d.birthDate !== undefined && { birthDate: parseDate(d.birthDate) }),
      ...(d.birthPlace !== undefined && { birthPlace: d.birthPlace }),
      ...(d.deathDate !== undefined && { deathDate: parseDate(d.deathDate) }),
      ...(d.deathPlace !== undefined && { deathPlace: d.deathPlace }),
      ...(d.photoUrl !== undefined && { photoUrl: d.photoUrl }),
      ...(d.notes !== undefined && { notes: d.notes }),
      ...(d.isLiving !== undefined && { isLiving: d.isLiving }),
    },
  });

  return NextResponse.json({ person });
}

/** DELETE /api/persons/[id] — elimina una persona y sus relaciones. */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const treeId = await getOrCreateDemoTree();

  const existing = await prisma.person.findFirst({ where: { id, treeId } });
  if (!existing) {
    return NextResponse.json({ error: "Persona no encontrada." }, { status: 404 });
  }

  // onDelete: Cascade en Relationship elimina las aristas asociadas.
  await prisma.person.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
