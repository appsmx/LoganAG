# SESSION_CONTEXT.md

Proyecto: LoganAG
Metodología: LOGAN v1.0
Estado: Producto funcional en `main` — 13 decisiones (DEC-001..013). Cimientos de calidad establecidos.
Avance: árbol genealógico completo con auth, invitaciones, anécdotas, mascotas (ficha + visual), IA (alta por lenguaje natural + biografías), feedback, y ahora tests + CI + lint + health check.

## Estado del repositorio
- Rama default: **`main`** (ya renombrada por el usuario). Contiene TODO el código consolidado (47+ archivos src).
- Ramas residuales eliminadas. Repo limpio.
- Historial de PRs: #1 scaffold · #2 MVP · #3 auth+invitaciones+anécdotas+mascotas · #4 mascotas visuales+biografía+feedback (todos merged).

## Entregado en esta iteración (Grupo A — calidad, rama feat/calidad-tests-ci-lint)
- ✅ **ESLint (flat config) + Prettier**: `npm run lint`, `npm run format`. 0 errores de lint.
- ✅ **Vitest**: 16 tests (motor de layout del árbol, `extractJson`, permisos por rol). `npm test`.
  - Los tests detectaron y corrigieron un **bug real** en `extractJson` (fallaba con prosa después del JSON → ahora recorta en el cierre balanceado).
  - Lógica de permisos extraída a `src/lib/permissions.ts` (función pura testeable).
- ✅ **CI (GitHub Actions)** `.github/workflows/ci.yml`: lint + typecheck + test + build en cada push/PR a `main`.
- ✅ **Health check** `GET /api/health`: BD + config LLM + mailer.
- Verificado: lint, `tsc --noEmit`, 16 tests y `next build` en verde (26 rutas).

## Próximo objetivo (confirmado por el usuario)
**Grupo B** en un nuevo PR tras verificar el Grupo A:
- Carga de fotos (Cloudinary, ya usado en el ecosistema) para personas y mascotas.
- Búsqueda de personas (saltar a cualquiera en árboles grandes).
- Zoom y arrastre del lienzo del árbol.
- Mejores estados de carga/vacío y errores visibles.

## Backlog restante (Biblia §7)
- P2: entrevista guiada con IA, vistas línea de tiempo / fan chart, mascota como nodo navegable.
- P3: import/export GEDCOM, i18n.

## Despliegue (plan del usuario)
- Código en GitHub; Vercel redespliega solo en cada merge. Neon = solo BD (no ejecuta la app).
- Pasos: crear BD Neon → `prisma db push` → variables en Vercel:
  - `DATABASE_URL` (de Neon), `LOGAN_LLM_URL=https://www.loganos.com/api/llm`,
    `LOGAN_LLM_SECRET` (copiado del Vercel de LOGAN OS), `AUTH_SECRET`, `APP_URL`,
    `BREVO_API_KEY`/`MAIL_FROM` (opcionales; sin Brevo el enlace mágico se ve en pantalla).
- Dominio: Vercel gratis (loganag.vercel.app) ahora; `LoganAG.com` propio al validar (NO loganos.com/LoganAG — marca corporativa, DEC-LOGAN-001).

## Riesgos identificados
- Saturación visual con familias grandes → mitigado con enfoque+contexto y colapso de ramas.
- IA que inventa/vincula mal → mitigado con confirmación humana obligatoria.
- Datos de personas vivas sin base legal → mitigado con consentimiento + privado por defecto.

## Observaciones
- La IA del producto NO usa llaves propias: todo pasa por `POST /api/llm` de LOGAN OS (Z.ai GLM primario, Gemini fallback). Fuente de verdad del inventario: `logan/os/ECOSYSTEM.md`.
