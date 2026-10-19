// Entrevista guiada de recuerdos con IA (backlog P2, DEC-003).
// La IA actúa como entrevistador cálido: a partir de lo que ya existe en el árbol y
// de las respuestas previas, propone UNA pregunta a la vez para ayudar a recordar y
// a llenar huecos. No persiste nada; es una guía conversacional.

import { callLlm } from "./llm";

const SYSTEM_PROMPT = `Eres un entrevistador familiar cálido de LoganAG. Tu objetivo
es ayudar a la persona a recordar y documentar su historia familiar. Haces UNA sola
pregunta a la vez, breve, concreta y abierta, en español de México. Priorizas llenar
huecos (personas sin fecha o lugar de nacimiento, parientes mencionados que faltan,
anécdotas no contadas). Nunca inventas datos. No das discursos: solo la siguiente
pregunta, cercana y humana.

Devuelve EXCLUSIVAMENTE un JSON:
{ "question": "la siguiente pregunta", "hint": "pista opcional de qué dato ayudaría a capturar, o null" }`;

export interface InterviewTurn {
  role: "user" | "assistant";
  content: string;
}

export interface InterviewContext {
  personNames: string[];
  gaps: string[]; // descripción breve de huecos detectados
}

export interface InterviewResult {
  ok: true;
  question: string;
  hint: string | null;
}
export interface InterviewError {
  ok: false;
  error: string;
}

export async function nextInterviewQuestion(
  context: InterviewContext,
  history: InterviewTurn[]
): Promise<InterviewResult | InterviewError> {
  const contextBlock = [
    `Personas en el árbol: ${
      context.personNames.length
        ? context.personNames.join(", ")
        : "(ninguna aún)"
    }`,
    `Huecos detectados: ${
      context.gaps.length ? context.gaps.join("; ") : "(ninguno evidente)"
    }`,
  ].join("\n");

  const userMessage =
    history.length === 0
      ? `${contextBlock}\n\nInicia la entrevista con la primera pregunta.`
      : contextBlock;

  try {
    const raw = await callLlm({
      systemPrompt: SYSTEM_PROMPT,
      userMessage,
      history: history.map((h) => ({ role: h.role, content: h.content })),
      temperature: 0.5,
      maxTokens: 400,
    });

    // parseo tolerante
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]) as {
          question?: string;
          hint?: string | null;
        };
        if (parsed.question) {
          return {
            ok: true,
            question: parsed.question.trim(),
            hint: parsed.hint?.trim() || null,
          };
        }
      } catch {
        // cae al fallback de abajo
      }
    }
    // Fallback: usar el texto crudo como pregunta.
    return { ok: true, question: raw.trim(), hint: null };
  } catch {
    return {
      ok: false,
      error: "El entrevistador de IA no está disponible por ahora.",
    };
  }
}

/** Detecta huecos simples en los datos para orientar la entrevista. */
export function detectGaps(
  persons: {
    name: string;
    birthDate: string | null;
    birthPlace: string | null;
  }[]
): string[] {
  const gaps: string[] = [];
  for (const p of persons) {
    if (!p.birthDate) gaps.push(`falta fecha de nacimiento de ${p.name}`);
    if (!p.birthPlace) gaps.push(`falta lugar de nacimiento de ${p.name}`);
  }
  return gaps.slice(0, 8); // acotar para no saturar el prompt
}
