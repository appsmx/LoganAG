# SESSION_CONTEXT.md

Proyecto: LoganAG
Metodología: LOGAN v1.0
Estado: Fundación — documentación aprobada, scaffold técnico en curso
Avance: Biblia del proyecto creada con 9 decisiones (DEC-001 a DEC-009). Arranca la construcción del MVP.

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

## Pendientes
- PR #2: scaffold técnico (Next.js + Prisma + esquema del grafo genealógico + páginas legales).
- PR #3: MVP del árbol interactivo (CRUD personas + vínculos + visualización no-saturada + alta por lenguaje natural con IA).

## Riesgos identificados
- Saturación visual con familias grandes (mitigar con enfoque+contexto y colapso de ramas).
- IA que inventa/vincula mal (mitigar con confirmación humana obligatoria).
- Datos de personas vivas sin base legal (mitigar con consentimiento + privado por defecto).

## Próximo objetivo
Entregar el scaffold técnico (PR #2) y luego el MVP del árbol (PR #3), respetando el stack DEC-007 y el modelo de datos del §5 de la Biblia.

## Observaciones
- La IA del producto NO usa llaves propias: todo pasa por `POST /api/llm` de LOGAN OS (Z.ai GLM primario, Gemini fallback). Fuente de verdad del inventario: `logan/os/ECOSYSTEM.md`.
- Repo vacío al inicio; PRs se abren contra `main`.
