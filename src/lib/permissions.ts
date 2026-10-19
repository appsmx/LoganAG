// Lógica de permisos por rol (DEC-011). Función pura, sin BD — testeable.

import type { MembershipRole } from "@prisma/client";

export interface AccessFlags {
  role: MembershipRole;
  canView: boolean;
  canEdit: boolean;
  isOwner: boolean;
}

/** Deriva las banderas de permiso a partir del rol de membresía. */
export function accessForRole(role: MembershipRole): AccessFlags {
  return {
    role,
    canView: true, // cualquier miembro puede ver
    canEdit: role === "OWNER" || role === "COLLABORATOR",
    isOwner: role === "OWNER",
  };
}
