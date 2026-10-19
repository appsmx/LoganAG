// Narración de biografías con IA (backlog P2, DEC-003).
// Toma los datos de una persona + sus anécdotas y genera un relato breve y cálido
// en español. Es contenido GENERADO: se muestra con disclosure de IA y el usuario
// decide si lo guarda en las notas (nunca se persiste automáticamente).

import { callLlm } from "./llm";

const SYSTEM_PROMPT = `Eres un narrador familiar cálido de LoganAG. A partir de datos
y anécdotas de una persona, escribe una biografía breve (120-180 palabras), en
español de México, en tercera persona, respetuosa y emotiva pero sin inventar datos.
Si falta información, no la inventes: trabaja solo con lo dado. No uses encabezados ni
listas; escribe en prosa fluida.`;

export interface BiographyInput {
  firstName: string;
  lastName?: string | null;
  nickname?: string | null;
  birthDate?: string | null;
  birthPlace?: string | null;
  deathDate?: string | null;
  isLiving: boolean;
  notes?: string | null;
  anecdotes: { title: string; body: string; type: string }[];
}

export async function generateBiography(
  input: BiographyInput
): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  const facts: string[] = [];
  facts.push(
    `Nombre: ${[input.firstName, input.lastName].filter(Boolean).join(" ")}`
  );
  if (input.nickname) facts.push(`Apodo: ${input.nickname}`);
  if (input.birthDate)
    facts.push(`Nació: ${new Date(input.birthDate).getFullYear()}`);
  if (input.birthPlace) facts.push(`Lugar de nacimiento: ${input.birthPlace}`);
  if (!input.isLiving && input.deathDate)
    facts.push(`Falleció: ${new Date(input.deathDate).getFullYear()}`);
  if (input.notes) facts.push(`Notas: ${input.notes}`);

  const anecdotes = input.anecdotes
    .map((a) => `- (${a.type}) ${a.title}: ${a.body}`)
    .join("\n");

  const userMessage = `Datos:\n${facts.join("\n")}\n\nAnécdotas:\n${
    anecdotes || "(sin anécdotas registradas)"
  }`;

  try {
    const text = await callLlm({
      systemPrompt: SYSTEM_PROMPT,
      userMessage,
      temperature: 0.6,
      maxTokens: 600,
    });
    return { ok: true, text: text.trim() };
  } catch {
    return {
      ok: false,
      error:
        "El narrador de IA no está disponible por ahora. Intenta más tarde.",
    };
  }
}
