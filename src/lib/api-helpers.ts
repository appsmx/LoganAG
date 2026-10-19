// Helpers comunes para las API routes: resolver sesión + árbol activo + acceso.

import { NextResponse } from "next/server";
import { getCurrentUser } from "./auth";
import { getOrCreatePrimaryTree, getAccess, type Access } from "./tree-service";

export interface Resolved {
  userId: string;
  treeId: string;
  access: Access;
}

/**
 * Resuelve el usuario autenticado y su árbol activo.
 * `treeId` opcional: si se omite, usa (o crea) el árbol primario del usuario.
 * Devuelve una NextResponse de error si no hay sesión o no hay acceso.
 */
export async function resolveContext(
  treeId?: string | null
): Promise<Resolved | NextResponse> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const resolvedTreeId = treeId ?? (await getOrCreatePrimaryTree(user.id));
  const access = await getAccess(resolvedTreeId, user.id);
  if (!access?.canView) {
    return NextResponse.json(
      { error: "Sin acceso a este árbol." },
      { status: 403 }
    );
  }

  return { userId: user.id, treeId: resolvedTreeId, access };
}

export function isResponse(x: unknown): x is NextResponse {
  return x instanceof NextResponse;
}
