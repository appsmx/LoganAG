// Capa de servicio del árbol. Encapsula el acceso a datos vía Prisma.
//
// NOTA MVP: el MVP opera sobre un "árbol demo" único para validar la propuesta de
// valor (DEC-002). La autenticación de usuarios y la multi-tenencia por invitación
// (DEC-005) ya están reservadas en el esquema (Tree/Membership/Invitation) y se
// activan en la siguiente iteración (backlog P1).

import { prisma } from "./prisma";
import type { TreeGraph } from "./types";

const DEMO_OWNER_EMAIL = "demo@loganag.local";
const DEMO_TREE_NAME = "Mi familia";

/** Obtiene (o crea) el árbol demo y su dueño. Devuelve el treeId. */
export async function getOrCreateDemoTree(): Promise<string> {
  const owner = await prisma.user.upsert({
    where: { email: DEMO_OWNER_EMAIL },
    update: {},
    create: { email: DEMO_OWNER_EMAIL, name: "Demo" },
  });

  const existing = await prisma.tree.findFirst({
    where: { ownerId: owner.id },
    orderBy: { createdAt: "asc" },
  });
  if (existing) return existing.id;

  const tree = await prisma.tree.create({
    data: { name: DEMO_TREE_NAME, ownerId: owner.id, visibility: "PRIVATE" },
  });
  return tree.id;
}

/** Devuelve el grafo completo (personas + relaciones) de un árbol. */
export async function getTreeGraph(treeId: string): Promise<TreeGraph> {
  const [persons, relationships] = await Promise.all([
    prisma.person.findMany({
      where: { treeId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.relationship.findMany({ where: { treeId } }),
  ]);

  return {
    persons: persons.map((p) => ({
      id: p.id,
      firstName: p.firstName,
      lastName: p.lastName,
      nickname: p.nickname,
      gender: p.gender,
      birthDate: p.birthDate?.toISOString() ?? null,
      birthPlace: p.birthPlace,
      deathDate: p.deathDate?.toISOString() ?? null,
      deathPlace: p.deathPlace,
      photoUrl: p.photoUrl,
      notes: p.notes,
      isLiving: p.isLiving,
    })),
    relationships: relationships.map((r) => ({
      id: r.id,
      type: r.type,
      personAId: r.personAId,
      personBId: r.personBId,
    })),
  };
}

/** Convierte una fecha string opcional a Date | null de forma segura. */
export function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}
