# LoganAG 🌳

**El árbol genealógico manejado por LOGAN e impulsado por inteligencia artificial.**

LoganAG es una plataforma web para construir **árboles genealógicos dinámicos, interactivos y estéticos**, pensada tanto para disfrutar la historia familiar como para enseñarla y aprenderla. Cada persona tiene una ficha rica (datos básicos + anécdotas y puntos clave), puede vincularse fácilmente con sus parientes, y hasta sus **mascotas** forman parte del árbol.

> Construido con la metodología **LOGAN** (ver [`appsmx/logan`](https://github.com/appsmx/logan)) e impulsado por el proxy LLM centralizado de **LOGAN OS**.

---

## ✨ Propuesta de valor

- **Árbol que no se satura.** Aunque la familia crezca a cientos de personas, la visualización se mantiene limpia: enfoque + contexto, expandir/colapsar ramas, y navegación por persona.
- **Vincular es fácil.** Conectar padres, parejas, hijos y hermanos de forma intuitiva — incluso a los parientes de los parientes.
- **Alta por lenguaje natural (IA).** En vez de llenar formularios, describes a tu familia en texto plano y la IA crea y vincula a las personas.
- **Fichas con alma.** Datos básicos + anécdotas, hitos y recuerdos que cuentan quién fue cada persona.
- **Mascotas incluidas.** Porque también son familia.
- **Privado por defecto.** Árbol familiar privado + invitaciones, con consentimiento LFPDPPP para datos de personas vivas.

---

## 🧭 Estado del proyecto

**Fase actual:** Fundación y documentación (LOGAN Fase 1-4).
Esta primera entrega establece la **Biblia del Proyecto** y el contexto de sesión antes de escribir código, conforme al Art. II de LOGAN ("la documentación precede al desarrollo").

| Documento | Propósito |
|---|---|
| [`Biblia_LoganAG.md`](./Biblia_LoganAG.md) | Autoridad del producto: visión, usuarios, decisiones, modelo de datos, MVP y backlog |
| [`SESSION_CONTEXT.md`](./SESSION_CONTEXT.md) | Estado temporal de la sesión (continuidad entre sesiones) |

---

## 🛠️ Stack de referencia (planificado)

Alineado con el estándar del ecosistema LOGAN:

- **Runtime:** Next.js 16 + TypeScript
- **Estilos:** Tailwind CSS + shadcn/ui
- **BD:** Prisma + PostgreSQL (Neon en producción)
- **IA:** proxy LLM centralizado de LOGAN OS (`POST /api/llm`) — Z.ai (GLM) primario, Gemini fallback. Sin llaves de IA propias.
- **Deploy:** Vercel
- **Idioma:** Español (México)

---

## 📂 Estructura (en construcción)

```
LoganAG/
├── Biblia_LoganAG.md      ← autoridad del producto (LOGAN)
├── SESSION_CONTEXT.md     ← estado de sesión (LOGAN)
├── README.md
└── (código del MVP — próximos PRs)
```

---

## 📜 Metodología

Este proyecto sigue **LOGAN v1.0**. Toda decisión importante se registra como `DEC-XXX` en la Biblia. Ninguna construcción comienza sin documentación que la justifique.

---

*Impulsado por LOGAN · appsmx*
