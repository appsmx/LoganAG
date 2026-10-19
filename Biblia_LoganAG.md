# Biblia_LoganAG.md

**Proyecto:** LoganAG — árbol genealógico dinámico impulsado por IA
**Metodología:** LOGAN v1.0
**Versión:** 1.0
**Estado:** En construcción
**Propósito:** Autoridad del producto LoganAG. Contiene toda la información específica del producto: visión, usuarios, decisiones aprobadas, modelo de datos, alcance del MVP y backlog. Es la fuente de verdad del producto (LOGAN §2.2).
**Fecha:** 2026-10-19

---

## Índice rápido de decisiones CRÍTICAS

| ID | Decisión | Nivel |
|---|---|---|
| DEC-001 | Forma del producto: web app responsive | CRÍTICA |
| DEC-002 | Alcance del MVP mínimo (personas + vínculos + ficha básica + visualización limpia) | CRÍTICA |
| DEC-003 | IA vía proxy centralizado de LOGAN OS (sin llaves propias) | CRÍTICA |
| DEC-004 | Primera función de IA estrella: alta de personas por lenguaje natural | CRÍTICA |
| DEC-005 | Privacidad: árbol privado + invitaciones familiares + consentimiento LFPDPPP | CRÍTICA |
| DEC-006 | Modelo de datos como grafo (no árbol estricto) | ESTRUCTURAL |
| DEC-007 | Stack: Next.js 16 + TS + Tailwind + Prisma + Postgres (Neon) + Vercel | ESTRUCTURAL |
| DEC-008 | Idioma principal: español (México) | OPERATIVA |
| DEC-009 | Mascotas como entidad de primera clase ligada a personas | ESTRUCTURAL |
| DEC-010 | Autenticación por enlace mágico (passwordless) | CRÍTICA |
| DEC-011 | Invitaciones familiares con roles (dueño/colaborador/lector) | ESTRUCTURAL |
| DEC-012 | Canal de feedback del usuario (estándar LOGAN) | OPERATIVA |
| DEC-013 | Cimientos de calidad: ESLint + Prettier + Vitest + CI | ESTRUCTURAL |
| DEC-014 | Carga de fotos vía Cloudinary con subida firmada | ESTRUCTURAL |

---

## 1. Visión

LoganAG permite a cualquier familia construir, explorar y transmitir su historia a través de un **árbol genealógico vivo**: visualmente agradable, fácil de hacer crecer, y rico en memoria (anécdotas, hitos, mascotas). La inteligencia artificial elimina la fricción de capturar y vincular personas, y ayuda a convertir datos sueltos en relatos que valen la pena recordar.

El producto no es solo un registro: es una herramienta de **aprendizaje y enseñanza** de la propia historia familiar, para que las nuevas generaciones conozcan de dónde vienen.

---

## 2. Usuarios

| Perfil | Descripción | Necesidad principal |
|---|---|---|
| **El custodio familiar** | La persona (a menudo adulto mayor o entusiasta) que arma y mantiene el árbol | Capturar y vincular parientes sin fricción; que no se vea saturado |
| **El familiar invitado** | Miembros de la familia invitados a ver/colaborar | Explorar el árbol, aportar datos y anécdotas de su rama |
| **El aprendiz** | Niños/jóvenes de la familia | Entender quién es quién y descubrir historias de forma visual y atractiva |

**Idioma:** español (México). **Contexto cultural:** familias mexicanas (relaciones extensas, compadrazgos, apodos, mascotas como miembros de la familia).

---

## 3. Propuesta de valor y diferenciadores

1. **Visualización que escala sin saturar** — enfoque + contexto, expandir/colapsar, navegación por persona.
2. **Alta y vinculación por lenguaje natural (IA)** — describir la familia en texto; la IA crea y conecta nodos.
3. **Fichas con memoria** — anécdotas, hitos y puntos clave además de los datos duros.
4. **Mascotas como familia** — entidad de primera clase.
5. **Privado y respetuoso con los datos** — consentimiento LFPDPPP, invitaciones controladas.

---

## 4. Decisiones (Sistema de Decisiones, LOGAN §5)

### DEC-001 — Forma del producto: web app responsive
- **Nivel:** CRÍTICA
- **Problema:** El usuario describió "aplicación/página/plataforma"; hay que fijar una forma primaria para el MVP.
- **Alternativas:** (a) web app responsive · (b) app móvil nativa · (c) app de escritorio.
- **Decisión:** Web app responsive (navegador, móvil + escritorio, sin instalación).
- **Justificación:** Un solo código base, acceso universal, alineada con el stack estándar del ecosistema (Next.js). Simplicidad (Art. III).
- **Consecuencias:** La visualización del árbol debe funcionar con touch y mouse; diseño responsive desde el día 1.
- **Fecha:** 2026-10-19

### DEC-002 — Alcance del MVP mínimo
- **Nivel:** CRÍTICA
- **Problema:** Definir qué entra en la primera versión para validar la propuesta de valor rápido (LOGAN §4.2).
- **Alternativas:** (a) mínimo · (b) mínimo + anécdotas + mascotas · (c) todo + IA.
- **Decisión:** MVP mínimo = crear personas, vincularlas (padre/madre/pareja/hijo), ficha básica y visualización limpia expandible/colapsable. Anécdotas, mascotas e IA entran como primeras iteraciones post-MVP (backlog priorizado).
- **Justificación:** Validar primero el núcleo (capturar + vincular + visualizar sin saturar), que es el mayor riesgo técnico y de valor. Art. III (simplicidad) y §4.2 (prioridad del MVP).
- **Consecuencias:** Anécdotas, mascotas e IA se diseñan en el modelo de datos desde el inicio aunque la UI llegue después, para no rehacer el esquema.
- **Fecha:** 2026-10-19

### DEC-003 — IA vía proxy centralizado de LOGAN OS
- **Nivel:** CRÍTICA
- **Problema:** Cómo impulsar las funciones de IA del producto.
- **Alternativas:** (a) llaves de IA propias (OpenAI/otros) · (b) proxy LLM centralizado de LOGAN OS.
- **Decisión:** Toda la IA pasa por el proxy LLM de LOGAN OS (`POST /api/llm`), que cascada entre proveedores. Proveedores reales: Z.ai (GLM, primario) y Google/Gemini (fallback). Sin llaves propias ni OpenAI.
- **Justificación:** Estándar oficial del ecosistema LOGAN; centraliza costos, failover y cumplimiento. En avisos de privacidad se declaran Z.ai y Google como subencargados vía LOGAN OS (LFPDPPP).
- **Consecuencias:** LoganAG necesita el secreto Bearer para consumir `/api/llm` (`LOGAN_LLM_SECRET`, copiado del Vercel de LOGAN OS, no se crea nuevo). Endpoint canónico verificado en vivo: `https://www.loganos.com/api/llm` (LOGAN OS está activo en loganos.com; `loganos.com` sin `www` redirige 308 a `www`). Contrato real del proxy: `POST { task, systemPrompt, userMessage, history?, temperature?, maxTokens?, project? }` → `{ text, provider, model }`. La fuente de verdad del inventario de proveedores es `logan/os/ECOSYSTEM.md`.
- **Fecha:** 2026-10-19

### DEC-004 — Primera función de IA estrella: alta por lenguaje natural
- **Nivel:** CRÍTICA
- **Problema:** Qué función de IA priorizar para que el valor se note pronto.
- **Alternativas:** (a) narración de biografías · (b) alta de personas por lenguaje natural · (c) entrevista guiada de recuerdos.
- **Decisión:** Alta de personas por lenguaje natural: el usuario describe su familia en texto y la IA propone personas + vínculos para confirmar.
- **Justificación:** Ataca directamente el dolor principal del usuario ("vincular fácilmente" y "crecer en cadena sin saturar"). Las demás funciones de IA quedan en backlog.
- **Consecuencias:** Necesita un contrato IA que devuelva una estructura (personas + relaciones) validable antes de persistir; el usuario siempre confirma (no se escribe en el árbol sin revisión humana).
- **Fecha:** 2026-10-19

### DEC-005 — Privacidad: privado + invitaciones + LFPDPPP
- **Nivel:** CRÍTICA
- **Problema:** Qué visibilidad y protección de datos tiene un árbol.
- **Alternativas:** (a) privado + invitaciones · (b) colaborativo abierto · (c) público/compartible.
- **Decisión:** Árbol privado por defecto, acceso por invitación familiar, con consentimiento LFPDPPP para datos de personas vivas.
- **Justificación:** Un árbol contiene datos personales de personas vivas; la privacidad es obligatoria (LFPDPPP + STANDARDS §9 de LOGAN). Minimiza riesgo.
- **Consecuencias:** Se requiere modelo de autenticación, roles (dueño/colaborador/lector), invitaciones y marca de "persona viva vs. fallecida" + consentimiento. Páginas `/privacidad` y `/terminos` obligatorias.
- **Fecha:** 2026-10-19

### DEC-006 — Modelo de datos como grafo
- **Nivel:** ESTRUCTURAL
- **Problema:** Cómo representar relaciones familiares reales (segundas parejas, adopciones, familias que se cruzan).
- **Alternativas:** (a) árbol estricto (un padre por nodo) · (b) grafo de personas + relaciones tipadas.
- **Decisión:** Grafo: entidades `Person` conectadas por relaciones tipadas (parentalidad y unión de pareja). El "árbol" es una vista derivada del grafo.
- **Justificación:** Las familias no son árboles; un árbol estricto no soporta la realidad. El grafo es la única representación que no obliga a rehacer el modelo después.
- **Consecuencias:** El layout visual se calcula sobre el grafo; se requieren algoritmos de disposición que eviten saturación. Compatibilidad futura con GEDCOM (import/export) en backlog.
- **Fecha:** 2026-10-19

### DEC-007 — Stack técnico
- **Nivel:** ESTRUCTURAL
- **Problema:** Qué tecnologías usar.
- **Alternativas:** (a) stack estándar LOGAN · (b) otro stack.
- **Decisión:** Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui + Prisma + PostgreSQL (Neon) + Vercel.
- **Justificación:** Es el stack probado del ecosistema (Mr. Trámite, Mariscos Quiroa, LOGAN OS). Reutiliza patrones y reduce riesgo.
- **Consecuencias:** Se usa `prisma db push` (no migraciones versionadas), coherente con el ecosistema. Visualización del árbol con librería de grafos/SVG a decidir en fase de diseño técnico.
- **Fecha:** 2026-10-19

### DEC-008 — Idioma principal
- **Nivel:** OPERATIVA
- **Decisión:** Español (México) como idioma de toda la interfaz y contenido del MVP.
- **Justificación:** Público objetivo mexicano. Internacionalización en backlog.
- **Fecha:** 2026-10-19

### DEC-010 — Autenticación por enlace mágico (passwordless)
- **Nivel:** CRÍTICA
- **Problema:** Cómo inician sesión los usuarios para habilitar árboles reales por usuario e invitaciones (DEC-005).
- **Alternativas:** (a) enlace mágico por correo (sin contraseña) · (b) correo + contraseña · (c) inicio social (Google).
- **Decisión:** Enlace mágico por correo. El usuario introduce su correo, recibe un enlace de un solo uso con expiración, y al abrirlo queda autenticado. La sesión se mantiene con una cookie firmada.
- **Justificación:** Menor fricción para un público familiar (incluye adultos mayores), sin contraseñas que gestionar/filtrar. Reutiliza el proveedor de correo del ecosistema (Brevo). Simplicidad (Art. III).
- **Consecuencias:** Se requiere modelo `MagicLink`/`Session`, envío de correo (Brevo), y un `AUTH_SECRET` para firmar sesiones. El árbol demo (`getOrCreateDemoTree`) se reemplaza por árboles del usuario autenticado. En desarrollo, si no hay Brevo configurado, el enlace se muestra en consola/respuesta para pruebas.
- **Fecha:** 2026-10-19

### DEC-011 — Invitaciones familiares y roles
- **Nivel:** ESTRUCTURAL
- **Problema:** Cómo colaboran varios miembros de la familia en un mismo árbol (DEC-005).
- **Alternativas:** (a) un solo dueño edita, el resto solo lee · (b) roles diferenciados (dueño / colaborador / lector) por invitación.
- **Decisión:** Roles por membresía: `OWNER` (control total), `COLLABORATOR` (edita personas/vínculos/anécdotas), `VIEWER` (solo lectura). El dueño invita por correo; la invitación tiene token único, estado y expiración. Al aceptar, se crea una `Membership`.
- **Justificación:** Una familia necesita que varios aporten sin que todos puedan borrar o reestructurar. Los roles ya están reservados en el esquema (DEC-005). Es la opción que soporta el caso real de uso.
- **Consecuencias:** Toda operación de escritura valida el rol del usuario sobre el árbol. Las invitaciones se envían por Brevo (igual que el enlace mágico).
- **Fecha:** 2026-10-19

### DEC-014 — Carga de fotos vía Cloudinary con subida firmada
- **Nivel:** ESTRUCTURAL
- **Problema:** Las personas tenían `photoUrl` pero no había forma de subir fotos; un árbol con caras es mucho más emotivo.
- **Alternativas:** (a) subir el archivo a nuestro servidor y de ahí a storage · (b) subida firmada directa del navegador a Cloudinary.
- **Decisión:** Subida firmada: el servidor genera una firma (`/api/uploads/sign`, requiere rol editor) y el navegador sube directo a Cloudinary. El API secret nunca viaja al cliente ni pasa por nuestro servidor. Fallback: si Cloudinary no está configurado, se puede pegar una URL de imagen.
- **Justificación:** Cloudinary ya se usa en el ecosistema (Mariscos Quiroa, Mr. Trámite). La subida firmada evita exponer secretos y no carga nuestro servidor con archivos.
- **Consecuencias:** Variables `CLOUDINARY_*` opcionales. Las fotos se muestran en el nodo del árbol y en la ficha.
- **Fecha:** 2026-10-19

### DEC-013 — Cimientos de calidad: ESLint + Prettier + Vitest + CI
- **Nivel:** ESTRUCTURAL
- **Problema:** El proyecto creció sin red de seguridad; cada cambio podía romper algo en silencio.
- **Alternativas:** (a) seguir sin tests/CI · (b) establecer herramientas de calidad antes de añadir más features.
- **Decisión:** ESLint (flat config) + Prettier para estilo; Vitest para tests unitarios de la lógica pura (motor de layout del árbol, parseo de IA `extractJson`, permisos por rol); GitHub Actions (`.github/workflows/ci.yml`) que corre lint + typecheck + test + build en cada push/PR a `main`. Health check `GET /api/health` (BD + config LLM + mailer).
- **Justificación:** Art. VI (la calidad se verifica, no se supone) y Art. III (construir sobre terreno firme). Los tests ya detectaron un bug real en `extractJson` (fallaba con prosa después del JSON) — corregido con recorte balanceado.
- **Consecuencias:** Cada PR se valida automáticamente. La lógica de permisos se extrajo a `src/lib/permissions.ts` (función pura testeable).
- **Fecha:** 2026-10-19

### DEC-012 — Canal de feedback del usuario (estándar LOGAN)
- **Nivel:** OPERATIVA
- **Problema:** El ecosistema LOGAN exige que toda app/landing tenga un canal "Enviar comentarios".
- **Decisión:** Modelo `Feedback` (type sugerencia/error/otro, message, name?, email?, status nuevo/atendido) + endpoint público `POST /api/public/feedback` con validación Zod, rate-limit (3/min por IP) y honeypot anti-spam (campo oculto "website"). Botón flotante en toda la app con consentimiento LFPDPPP si se capturan nombre/correo.
- **Justificación:** Estándar obligatorio del ecosistema (patrón Mariscos Quiroa / Hércules Bro). Nada de feedback se pierde.
- **Consecuencias:** PII (name/email) opcional y con consentimiento. React escapa por defecto al mostrar; sin `dangerouslySetInnerHTML`.
- **Fecha:** 2026-10-19

### DEC-009 — Mascotas como entidad de primera clase
- **Nivel:** ESTRUCTURAL
- **Problema:** Cómo representar mascotas, que "también forman parte de la familia".
- **Alternativas:** (a) campo de texto en la persona · (b) entidad propia ligada a una o varias personas.
- **Decisión:** Entidad `Pet` propia, ligada a su(s) dueño(s), con su propia ficha (nombre, especie, fechas, foto, anécdotas).
- **Justificación:** El usuario las describe como miembros de la familia; merecen ficha propia y presencia visual en el árbol. Un simple campo de texto no cumpliría.
- **Consecuencias:** El modelo de datos reserva `Pet` desde el inicio (DEC-002), aunque su UI llegue post-MVP.
- **Fecha:** 2026-10-19

---

## 5. Modelo de datos conceptual (grafo genealógico)

> Diseño conceptual. El esquema Prisma definitivo se registra en la fase de diseño técnico (próximo PR).

**Entidades núcleo:**

- **Tree** — un árbol genealógico. Pertenece a un dueño. Privado por defecto (DEC-005).
- **Person** — una persona del árbol. Datos básicos + estado vital (viva/fallecida) + consentimiento (si viva).
  - Datos básicos: nombre, apellidos, apodo, sexo/género, fecha y lugar de nacimiento, fecha y lugar de defunción, foto, notas.
- **Relationship** — relación tipada entre dos personas:
  - `PARENT_CHILD` (parentalidad; soporta biológico/adoptivo).
  - `PARTNER` (unión de pareja; soporta estado: casados, pareja, separados, etc.).
- **Anecdote** — anécdota / hito / punto clave asociado a una `Person` (título, texto, fecha opcional, tipo).
- **Pet** — mascota (DEC-009), ligada a una o varias `Person` (nombre, especie, raza, fechas, foto, anécdotas).
- **Membership / Invitation** — acceso de usuarios a un `Tree` con rol (dueño, colaborador, lector) (DEC-005).
- **Consent** — registro de consentimiento LFPDPPP para datos de personas vivas (DEC-005).

**Reglas clave:**
- El "árbol" visual es una **vista derivada** del grafo de `Person` + `Relationship` (DEC-006).
- Toda persona viva requiere base legal/consentimiento antes de exponer sus datos (DEC-005).

---

## 6. Alcance del MVP (DEC-002)

**Entra en el MVP:**
1. Autenticación del dueño del árbol + creación de un árbol privado.
2. CRUD de personas con ficha básica.
3. Vinculación de personas: padre/madre, pareja, hijo.
4. Visualización interactiva del árbol: limpia, con expandir/colapsar y enfoque en una persona (no se satura).
5. Alta de personas por lenguaje natural con IA (DEC-004), con confirmación humana antes de persistir.
6. Páginas legales `/privacidad` y `/terminos` (LFPDPPP) + disclosure de IA.

**No entra en el MVP (backlog, §7):** anécdotas (UI), mascotas (UI), invitaciones/colaboración multiusuario, narración de biografías con IA, import/export GEDCOM, línea de tiempo, fan chart.

> El modelo de datos **sí** reserva anécdotas, mascotas, invitaciones y consentimiento desde el inicio para no rehacer el esquema (DEC-002, DEC-009).

---

## 7. Backlog priorizado

| Prioridad | Ítem | Depende de |
|---|---|---|
| ✅ Hecho | Autenticación (enlace mágico) + invitaciones familiares + roles | DEC-010, DEC-011 |
| ✅ Hecho | UI de anécdotas/hitos por persona | Modelo `Anecdote` |
| ✅ Hecho | UI de mascotas (ficha + dueños) | Modelo `Pet` (DEC-009) |
| ✅ Hecho | Presencia visual de mascotas en el lienzo (badge 🐾) | TreeCanvas |
| ✅ Hecho | IA: narración automática de biografías | Proxy LLM (DEC-003) |
| ✅ Hecho | Canal de feedback del usuario (estándar LOGAN) | DEC-012 |
| P2 | IA: entrevista guiada de recuerdos | Proxy LLM (DEC-003) |
| P2 | Vistas alternativas: línea de tiempo, fan chart | Grafo (DEC-006) |
| P2 | Mascota como nodo propio navegable (no solo badge) | TreeCanvas |
| P3 | Import/Export GEDCOM | Grafo (DEC-006) |
| P3 | Internacionalización (i18n) | DEC-008 |

> **Nota de estándar LOGAN:** toda app del ecosistema debe incluir un canal de "Enviar comentarios" (modelo Feedback + endpoint público con rate-limit + honeypot). Registrado en backlog P3 para incorporarlo antes del lanzamiento.

---

## 8. Riesgos identificados

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Saturación visual con familias grandes | Alto (es la propuesta central) | Enfoque+contexto, colapso de ramas, prototipo temprano del layout |
| IA inventa o vincula mal personas | Alto (datos erróneos en el árbol) | Confirmación humana obligatoria antes de persistir (DEC-004) |
| Datos de personas vivas sin base legal | Alto (LFPDPPP) | Consentimiento + privado por defecto (DEC-005) |
| Sin créditos en el proveedor LLM | Medio (IA cae) | Fallback Gemini vía proxy; degradar a alta manual |

---

## 9. Estándares de cumplimiento (heredados de LOGAN)

- Páginas `/privacidad` (aviso LFPDPPP + disclosure de IA, declarando Z.ai y Google como subencargados vía LOGAN OS) y `/terminos`.
- Disclosure de IA visible donde la IA actúe.
- Canal de feedback del usuario antes del lanzamiento (backlog P3).
- Escape de HTML y confianza en el escape por defecto de React (nunca `dangerouslySetInnerHTML` con contenido de usuario).

---

*Biblia bajo metodología LOGAN v1.0 · appsmx/LoganAG*
