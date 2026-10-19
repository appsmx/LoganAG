# SESSION_CONTEXT.md

Proyecto: LoganAG
Metodología: LOGAN v1.0
Estado: MVP construido — abiertos 3 PRs (fundación en main, scaffold #1, MVP #2)
Avance: Biblia con 9 decisiones (DEC-001..009), scaffold técnico y MVP del árbol interactivo construidos y verificados (tsc + next build en verde).

## Objetivo completado en esta sesión
- Fase de exploración (LOGAN Fase 1-2): se comprendió el problema y se confirmaron las decisiones de producto con el usuario.
- Fase de diseño y documentación (LOGAN Fase 3-4): se redactó `Biblia_LoganAG.md`, `README.md` y este `SESSION_CONTEXT.md`.

## Decisiones tomadas
- DEC-001 Web app responsive.
- DEC-002 MVP mínimo (personas + vínculos + ficha básica + visualización limpia); anécdotas/mascotas/IA en backlog pero reservadas en el modelo de datos.
- DEC-003 IA vía proxy LLM centralizado de LOGAN OS (sin llaves propias).
- DEC-004 Primera función de IA: alta de personas por lenguaje natural (con confirmación humana).
- DEC-005 Privado + invitaciones familiares + consentimiento LFPDPPP.
- DEC-006 Modelo de datos como grafo (no árbol estricto).
- DEC-007 Stack: Next.js 16 + TS + Tailwind + shadcn/ui + Prisma + Postgres (Neon) + Vercel.
- DEC-008 Idioma español (México).
- DEC-009 Mascotas como entidad de primera clase.

## Documentos actualizados
- `README.md` (nuevo)
- `Biblia_LoganAG.md` (nuevo — autoridad del producto)
- `SESSION_CONTEXT.md` (nuevo)

## Entregado en PRs
- Fundación (Biblia + README + SESSION_CONTEXT): quedó en la rama default del repo.
- PR #1 `feat/scaffold-tecnico`: Next.js 16 + Prisma (grafo genealógico) + proxy LLM + páginas legales.
- PR #2 `feat/mvp-arbol-interactivo`: visualización no-saturada + CRUD personas/vínculos + alta por lenguaje natural con IA.

## Pendientes (orden de merge)
1. Mergear PR #1 (scaffold) en la rama default.
2. Mergear PR #2 (MVP) después.
3. Nota de infraestructura: el gateway no permitió renombrar el default branch a `main`; GitHub dejó `docs/fundacion-logan` como default. El usuario puede renombrarla a `main` desde Settings de GitHub (no afecta contenido).
4. Antes de desplegar: crear BD Neon, configurar DATABASE_URL + LOGAN_LLM_URL/SECRET, `prisma db push`.

## Próximas iteraciones (backlog Biblia §7)
- P1: UI de anécdotas/hitos, UI de mascotas, autenticación + invitaciones familiares.
- P2: narración de biografías con IA, entrevista guiada, vistas línea de tiempo / fan chart.
- P3: import/export GEDCOM, i18n, canal de feedback (estándar LOGAN).

## Riesgos identificados
- Saturación visual con familias grandes (mitigar con enfoque+contexto y colapso de ramas).
- IA que inventa/vincula mal (mitigar con confirmación humana obligatoria).
- Datos de personas vivas sin base legal (mitigar con consentimiento + privado por defecto).

## Próximo objetivo
Entregar el scaffold técnico (PR #2) y luego el MVP del árbol (PR #3), respetando el stack DEC-007 y el modelo de datos del §5 de la Biblia.

## Observaciones
- La IA del producto NO usa llaves propias: todo pasa por `POST /api/llm` de LOGAN OS (Z.ai GLM primario, Gemini fallback). Fuente de verdad del inventario: `logan/os/ECOSYSTEM.md`.
- Repo vacío al inicio; PRs se abren contra `main`.
