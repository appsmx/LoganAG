# Arquitectura técnica — LoganAG

**Metodología:** LOGAN v1.0 · **Decisiones:** DEC-006 (grafo), DEC-007 (stack), DEC-003 (IA)
**Fecha:** 2026-10-19

Este documento resume la arquitectura técnica. La autoridad del producto es `Biblia_LoganAG.md`.

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| UI | Tailwind CSS + shadcn/ui (progresivo) |
| ORM / BD | Prisma + PostgreSQL (Neon en producción) |
| IA | Proxy LLM de LOGAN OS (`src/lib/llm.ts`) — sin llaves propias |
| Deploy | Vercel |

---

## Modelo de datos (grafo genealógico)

El "árbol" es una **vista derivada** del grafo (DEC-006):

- `Person` — nodo del grafo.
- `Relationship` — arista tipada:
  - `PARENT_CHILD` (personA = progenitor, personB = hijo/a).
  - `PARTNER` (unión de pareja).
- `Anecdote` — memoria asociada a una persona.
- `Pet` + `PetOwner` — mascotas ligadas a una o varias personas (DEC-009).
- `Tree`, `Membership`, `Invitation`, `Consent` — acceso y cumplimiento (DEC-005).

Ver el esquema completo en `prisma/schema.prisma`.

---

## Capa de IA (DEC-003)

Toda llamada a modelos pasa por `callLlm()` en `src/lib/llm.ts`, que invoca el proxy
`POST /api/llm` de LOGAN OS con un Bearer (`LOGAN_LLM_SECRET`). El proxy cascada entre
Z.ai (GLM, primario) y Gemini (fallback). El producto nunca habla directo con un
proveedor de IA.

**Regla de seguridad del dato:** las sugerencias de IA (p. ej. alta por lenguaje
natural, DEC-004) siempre devuelven una estructura validable que el usuario
**confirma** antes de persistir. Nunca se escribe en el árbol sin revisión humana.

---

## Estructura de carpetas

```
src/
├── app/
│   ├── layout.tsx          # layout raíz (es-MX)
│   ├── page.tsx            # landing
│   ├── globals.css
│   ├── privacidad/         # aviso LFPDPPP (DEC-005)
│   └── terminos/           # términos
├── lib/
│   ├── prisma.ts           # singleton Prisma
│   ├── llm.ts              # cliente del proxy LLM de LOGAN OS
│   └── utils.ts            # helpers (cn, escapeHtml, fullName)
prisma/
└── schema.prisma           # grafo genealógico
```

---

## Puesta en marcha (local)

```bash
npm install
cp .env.example .env   # completar DATABASE_URL y LOGAN_LLM_*
npm run db:push        # crea las tablas en Postgres
npm run dev
```
