import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateDemoTree, parseDate } from "@/lib/tree-service";
import { confirmGraphSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

/**
 * POST /api/ai/confirm — persiste el grafo propuesto por IA DESPUÉS de que el
 * usuario lo revisó y confirmó (DEC-004: nunca se escribe sin revisión humana).
 * Resuelve los tempId a ids reales dentro de una transacción.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = confirmGraphSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const treeId = await getOrCreateDemoTree();
  const { persons, relationships } = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // tempId -> id real
      const idMap = new Map<string, string>();

      for (const p of persons) {
        const created = await tx.person.create({
          data: {
            treeId,
            firstName: p.firstName,
            lastName: p.lastName ?? null,
            gender: p.gender ?? "UNKNOWN",
            birthDate: parseDate(p.birthDate),
            birthPlace: p.birthPlace ?? null,
            isLiving: p.isLiving ?? true,
            notes: p.notes ?? null,
          },
        });
        idMap.set(p.tempId, created.id);
      }

      let createdRels = 0;
      for (const r of relationships) {
        // los refs pueden ser tempId (recién creados) o ids reales existentes
        const aId = idMap.get(r.personARef) ?? r.personARef;
        const bId = idMap.get(r.personBRef) ?? r.personBRef;
        if (aId === bId) continue;

        // validar que ambos existan en el árbol
        const count = await tx.person.count({
          where: { treeId, id: { in: [aId, bId] } },
        });
        if (count !== 2) continue;

        try {
          await tx.relationship.create({
            data: { treeId, type: r.type, personAId: aId, personBId: bId },
          });
          createdRels++;
        } catch {
          // vínculo duplicado: lo ignoramos sin romper la transacción
        }
      }

      return { personsCreated: idMap.size, relationshipsCreated: createdRels };
    });

    return NextResponse.json({ ok: true, ...result }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "No se pudo guardar el grafo." },
      { status: 500 }
    );
  }
}
