// Tipos compartidos del dominio genealógico (DEC-006).

export type RelationshipType = "PARENT_CHILD" | "PARTNER";

export interface PersonDTO {
  id: string;
  firstName: string;
  lastName: string | null;
  nickname: string | null;
  gender: "MALE" | "FEMALE" | "OTHER" | "UNKNOWN";
  birthDate: string | null;
  birthPlace: string | null;
  deathDate: string | null;
  deathPlace: string | null;
  photoUrl: string | null;
  notes: string | null;
  isLiving: boolean;
}

export interface RelationshipDTO {
  id: string;
  type: RelationshipType;
  personAId: string;
  personBId: string;
}

export interface PetDTO {
  id: string;
  name: string;
  species: string | null;
  ownerIds: string[]; // personas a las que pertenece
}

export interface TreeGraph {
  persons: PersonDTO[];
  relationships: RelationshipDTO[];
  pets?: PetDTO[];
}

// ── Alta por lenguaje natural (DEC-004) ──
// Estructura que la IA propone y el usuario confirma antes de persistir.

export interface ProposedPerson {
  tempId: string;
  firstName: string;
  lastName?: string | null;
  gender?: "MALE" | "FEMALE" | "OTHER" | "UNKNOWN";
  birthDate?: string | null;
  birthPlace?: string | null;
  isLiving?: boolean;
  notes?: string | null;
}

export interface ProposedRelationship {
  type: RelationshipType;
  // referencias a tempId de ProposedPerson o a un id real existente
  personARef: string;
  personBRef: string;
}

export interface ProposedGraph {
  persons: ProposedPerson[];
  relationships: ProposedRelationship[];
  summary: string;
}
