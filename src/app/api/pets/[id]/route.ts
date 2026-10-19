import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveContext, isResponse } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

/** DELETE /api/pets/[id] — elimina una mascota (rol editor). */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ctx = await resolveContext();
  if (isResponse(ctx)) return ctx;
  if (!ctx.access.canEdit) {
    return NextResponse.json({ error: "Solo lectura." }, { status: 403 });
  }

  const pet = await prisma.pet.findFirst({ where: { id, treeId: ctx.treeId } });
  if (!pet) {
    return NextResponse.json({ error: "No encontrada." }, { status: 404 });
  }

  await prisma.pet.delete({ where: { id } }); // PetOwner cae por cascade
  return NextResponse.json({ ok: true });
}
