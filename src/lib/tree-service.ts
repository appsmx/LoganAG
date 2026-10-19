// Capa de servicio del árbol. Encapsula el acceso a datos y el control de roles.
//
// Tras DEC-010/DEC-011, los árboles pertenecen a usuarios autenticados y el acceso
// se controla por Membership (OWNER / COLLABORATOR / VIEWER). El "árbol demo" fue
// retirado: cada usuario trabaja sobre árboles reales.

import { prisma } from "./prisma";
import type { TreeGraph } from "./types";
import type { MembershipRole } from "@prisma/client";

/** Garantiza que todo usuario tenga al menos un árbol propio; devuelve su id. */
export async function getOrCreatePrimaryTree(userId: string): Promise<string> {
  const owned = await prisma.tree.findFirst({
    where: { ownerId: userId },
    orderBy: { createdAt: "asc" },
  });
  if (owned) return owned.id;

  const tree = await prisma.$transaction(async (tx) => {
    const created = await tx.tree.create({
      data: { name: "Mi familia", ownerId: userId, visibility: "PRIVATE" },
    });
    // El dueño también es miembro OWNER (unifica el control de acceso por rol).
    await tx.membership.create({
      data: { treeId: created.id, userId, role: "OWNER" },
    });
    return created;
  });
  return tree.id;
}

export interface Access {
  role: MembershipRole;
  canView: boolean;
  canEdit: boolean;
  isOwner: boolean;
}

/** Devuelve el rol del usuario sobre un árbol, o null si no tiene acceso. */
export async function getAccess(
  treeId: string,
  userId: string
): Promise<Access | null> {
  const tree = await prisma.tree.findUnique({ where: { id: treeId } });
  if (!tree) return null;

  // dueño directo
  if (tree.ownerId === userId) {
    return { role: "OWNER", canView: true, canEdit: true, isOwner: true };
  }

  const membership = await prisma.membership.findUnique({
    where: { treeId_userId: { treeId, userId } },
  });
  if (!membership) return null;

  const role = membership.role;
  return {
    role,
    canView: true,
    canEdit: role === "OWNER" || role === "COLLABORATOR",
    isOwner: role === "OWNER",
  };
}

/** Lanza si el usuario no puede ver / editar el árbol. */
export async function assertCanView(treeId: string, userId: string): Promise<Access> {
  const a = await getAccess(treeId, userId);
  if (!a?.canView) throw new TreeAccessError("Sin acceso a este árbol.");
  return a;
}
export async function assertCanEdit(treeId: string, userId: string): Promise<Access> {
  const a = await getAccess(treeId, userId);
  if (!a?.canEdit) throw new TreeAccessError("No tienes permiso para editar este árbol.");
  return a;
}

export class TreeAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TreeAccessError";
  }
}

/** Devuelve el grafo completo (personas + relaciones + mascotas) de un árbol. */
export async function getTreeGraph(treeId: string): Promise<TreeGraph> {
  const [persons, relationships, pets] = await Promise.all([
    prisma.person.findMany({ where: { treeId }, orderBy: { createdAt: "asc" } }),
    prisma.relationship.findMany({ where: { treeId } }),
    prisma.pet.findMany({
      where: { treeId },
      include: { owners: { select: { personId: true } } },
    }),
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
    pets: pets.map((p) => ({
      id: p.id,
      name: p.name,
      species: p.species,
      ownerIds: p.owners.map((o) => o.personId),
    })),
  };
}

/** Convierte una fecha string opcional a Date | null de forma segura. */
export function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}
