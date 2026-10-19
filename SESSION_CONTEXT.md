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

## Entregado (PR #3 — rama feat/auth-invitaciones-anecdotas)
1. ✅ **Autenticación por enlace mágico** (DEC-010): `/api/auth/request|verify|me|logout`, sesión en cookie firmada, correo vía Brevo con fallback dev. Página `/entrar`.
2. ✅ **Invitaciones familiares + roles** (DEC-011): OWNER/COLLABORATOR/VIEWER, `/api/invitations` (+accept), página `/invitacion/[token]`, panel InvitePanel. Retirado el "árbol demo"; ahora cada usuario tiene árboles reales con control de acceso por rol en TODAS las rutas (`resolveContext`).
3. ✅ **UI de anécdotas e hitos** por persona (AnecdotesPanel + `/api/persons/[id]/anecdotes`, `/api/anecdotes/[id]`).
4. ✅ **UI de mascotas** (DEC-009): PetsPanel + `/api/pets` (+[id]), ligadas a uno o varios dueños.
5. ✅ **Seed** (`prisma/seed.ts`, `npm run db:seed`): familia de ejemplo (7 personas, 10 vínculos, 2 anécdotas, 1 mascota).
6. ✅ **Corrección crítica**: el cliente LLM se alineó al contrato REAL del proxy (`{ task, systemPrompt, userMessage }` → `{ text }`) y a la URL canónica verificada en vivo `https://www.loganos.com/api/llm` (lo anterior, `logancorp.vercel.app` con el formato `messages[]`, habría fallado en producción).

Verificado: `tsc --noEmit` y `next build` en verde (23 rutas).

## Entregado (rama feat/mascotas-visuales-biografia-feedback)
- ✅ Mascotas visibles en el lienzo del árbol: badge 🐾 (con contador) en el nodo de cada dueño. `/api/tree` y `getTreeGraph` ahora incluyen `pets`.
- ✅ Narración de biografías con IA (P2): `src/lib/ai-biography.ts` + `POST /api/persons/[id]/biography`. Genera relato breve desde datos + anécdotas; se muestra con disclosure de IA, no se persiste automáticamente.
- ✅ Canal de feedback (estándar LOGAN, DEC-012): modelo `Feedback`, `POST /api/public/feedback` (rate-limit 3/min por IP + honeypot), botón flotante `FeedbackButton` en toda la app con consentimiento LFPDPPP para PII.
- Verificado: `tsc --noEmit` y `next build` en verde (25 rutas).

## ⚠️ Estado de ramas (importante para retomar)
- Los PRs #1/#2/#3 se mergearon ENCADENADOS a ramas intermedias (efecto del default branch bloqueado), por lo que **el código completo quedó en `feat/mvp-arbol-interactivo`**, NO en el default `docs/fundacion-logan` (que solo tiene el scaffold).
- Esta rama parte de `feat/mvp-arbol-interactivo` (código completo). El PR debe consolidar hacia el default para que `docs/fundacion-logan` quede como fuente única.
- **Pendiente de infraestructura:** el usuario debería renombrar en GitHub Settings la rama default a `main` (el gateway no me deja hacerlo). Al conectar Vercel, apuntar al branch que tenga el código completo.

## Despliegue (plan del usuario)
- NO requiere descargar el proyecto en la PC: el código vive en GitHub; Vercel redespliega solo en cada merge. Neon es solo la BD (no ejecuta la app).
- Pasos: crear BD Neon → `prisma db push` → variables en Vercel (DATABASE_URL, LOGAN_LLM_URL=https://www.loganos.com/api/llm, LOGAN_LLM_SECRET copiado de LOGAN OS, AUTH_SECRET, APP_URL, BREVO_API_KEY/MAIL_FROM opcionales).
- Dominio recomendado: Vercel gratis (loganag.vercel.app) ahora; LoganAG.com propio al validar (NO loganos.com/LoganAG — esa es la marca corporativa, DEC-LOGAN-001).
- Brevo NO requiere web propia; solo cuenta + API key + remitente verificado. Sin Brevo, el enlace mágico se muestra en pantalla (modo dev).

## Próximo objetivo
- Entrevista guiada de recuerdos con IA (P2) · vistas línea de tiempo / fan chart (P2) · mascota como nodo navegable (P2).

## Configuración de entorno (pendiente del usuario)
- **Local (desarrollo):** archivo `.env` en la raíz (copiar de `.env.example`). Nunca se sube (está en `.gitignore`).
- **Producción:** Vercel → Project → Settings → Environment Variables.
- Tres variables: `DATABASE_URL` (de Neon, con `?sslmode=require`), `LOGAN_LLM_URL`, `LOGAN_LLM_SECRET`.
- **Pendientes concretos:**
  - El usuario creará la BD en Neon (próximo día) y correrá `prisma db push` localmente (o aplicará el SQL vía Neon SQL Editor). NO pegar `DATABASE_URL` en el chat (contiene credenciales).
  - `LOGAN_LLM_SECRET`/`LOGAN_LLM_URL` aún por definir — confirmar valor/convención con el usuario o revisar LOGAN OS cuando toque conectar la IA en vivo. El código del cliente (`src/lib/llm.ts`) ya está listo esperando esas variables.

## Observaciones
- La IA del producto NO usa llaves propias: todo pasa por `POST /api/llm` de LOGAN OS (Z.ai GLM primario, Gemini fallback). Fuente de verdad del inventario: `logan/os/ECOSYSTEM.md`.
- Repo vacío al inicio; la rama default quedó como `docs/fundacion-logan` (ver pendiente #3 arriba).
