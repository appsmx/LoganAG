import { z } from "zod";

export const genderSchema = z.enum(["MALE", "FEMALE", "OTHER", "UNKNOWN"]);

export const personCreateSchema = z.object({
  firstName: z.string().min(1, "El nombre es obligatorio").max(100),
  lastName: z.string().max(100).optional().nullable(),
  nickname: z.string().max(60).optional().nullable(),
  gender: genderSchema.default("UNKNOWN"),
  birthDate: z.string().optional().nullable(),
  birthPlace: z.string().max(160).optional().nullable(),
  deathDate: z.string().optional().nullable(),
  deathPlace: z.string().max(160).optional().nullable(),
  photoUrl: z.string().url().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  isLiving: z.boolean().default(true),
});

export const personUpdateSchema = personCreateSchema.partial();

export const relationshipCreateSchema = z.object({
  type: z.enum(["PARENT_CHILD", "PARTNER"]),
  personAId: z.string().min(1),
  personBId: z.string().min(1),
});

export const intakeSchema = z.object({
  description: z.string().min(3, "Describe a tu familia").max(4000),
});

// Anécdotas / hitos (DEC-002 backlog P1)
export const anecdoteCreateSchema = z.object({
  title: z.string().min(1, "El título es obligatorio").max(160),
  body: z.string().min(1, "Escribe el contenido").max(5000),
  type: z.enum(["STORY", "MILESTONE", "KEY_POINT"]).default("STORY"),
  date: z.string().optional().nullable(),
});
export const anecdoteUpdateSchema = anecdoteCreateSchema.partial();

// Mascotas (DEC-009)
export const petCreateSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(80),
  species: z.string().max(60).optional().nullable(),
  breed: z.string().max(80).optional().nullable(),
  birthDate: z.string().optional().nullable(),
  deathDate: z.string().optional().nullable(),
  photoUrl: z.string().url().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  ownerIds: z.array(z.string()).min(1, "Elige al menos un dueño"),
});
export const petUpdateSchema = petCreateSchema.partial();

// Confirmación del grafo propuesto por IA (DEC-004): el usuario revisa y acepta.
export const confirmGraphSchema = z.object({
  persons: z
    .array(
      z.object({
        tempId: z.string(),
        firstName: z.string().min(1),
        lastName: z.string().optional().nullable(),
        gender: genderSchema.optional(),
        birthDate: z.string().optional().nullable(),
        birthPlace: z.string().optional().nullable(),
        isLiving: z.boolean().optional(),
        notes: z.string().optional().nullable(),
      })
    )
    .min(1),
  relationships: z.array(
    z.object({
      type: z.enum(["PARENT_CHILD", "PARTNER"]),
      personARef: z.string(),
      personBRef: z.string(),
    })
  ),
});

export type PersonCreateInput = z.infer<typeof personCreateSchema>;
export type RelationshipCreateInput = z.infer<typeof relationshipCreateSchema>;
export type ConfirmGraphInput = z.infer<typeof confirmGraphSchema>;
