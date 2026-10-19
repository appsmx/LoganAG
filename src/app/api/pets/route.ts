import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseDate } from "@/lib/tree-service";
import { petCreateSchema } from "@/lib/validation";
import { resolveContext, isResponse } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

/** GET /api/pets — mascotas del árbol activo con sus dueños. */
export async function GET() {
  const ctx = await resolveContext();
  if (isResponse(ctx)) return ctx;

  const pets = await prisma.pet.findMany({
    where: { treeId: ctx.treeId },
    orderBy: { createdAt: "desc" },
    include: {
      owners: {
        include: {
          person: { select: { id: true, firstName: true, lastName: true } },
        },
      },
    },
  });
  return NextResponse.json({ pets });
}

/** POST /api/pets — registra una mascota ligada a sus dueños (DEC-009, rol editor). */
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

  const parsed = petCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const d = parsed.data;

  // Los dueños deben ser personas del mismo árbol.
  const ownerCount = await prisma.person.count({
    where: { treeId: ctx.treeId, id: { in: d.ownerIds } },
  });
  if (ownerCount !== d.ownerIds.length) {
    return NextResponse.json(
      { error: "Algún dueño no pertenece al árbol." },
      { status: 400 }
    );
  }

  const pet = await prisma.pet.create({
    data: {
      treeId: ctx.treeId,
      name: d.name,
      species: d.species ?? null,
      breed: d.breed ?? null,
      birthDate: parseDate(d.birthDate),
      deathDate: parseDate(d.deathDate),
      photoUrl: d.photoUrl ?? null,
      notes: d.notes ?? null,
      owners: { create: d.ownerIds.map((personId) => ({ personId })) },
    },
    include: { owners: true },
  });

  return NextResponse.json({ pet }, { status: 201 });
}
