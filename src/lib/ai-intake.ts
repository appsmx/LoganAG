// Alta de personas por lenguaje natural (DEC-004).
// El usuario describe a su familia en texto; la IA propone un grafo (personas +
// relaciones) que el usuario CONFIRMA antes de persistir. Nunca se escribe en el
// árbol sin revisión humana (mitigación del riesgo "la IA inventa/vincula mal").

import { callLlm, extractJson } from "./llm";
import type { ProposedGraph } from "./types";

const SYSTEM_PROMPT = `Eres el asistente genealógico de LoganAG. Tu tarea es convertir
una descripción libre de una familia (en español de México) en una estructura de datos.

Devuelve EXCLUSIVAMENTE un objeto JSON válido con esta forma:
{
  "persons": [
    { "tempId": "p1", "firstName": "...", "lastName": "...", "gender": "MALE|FEMALE|OTHER|UNKNOWN", "birthDate": "YYYY-MM-DD o null", "birthPlace": "... o null", "isLiving": true, "notes": "... o null" }
  ],
  "relationships": [
    { "type": "PARENT_CHILD", "personARef": "p1", "personBRef": "p2" }
  ],
  "summary": "frase breve de lo que entendiste"
}

Reglas:
- type "PARENT_CHILD": personARef es el PROGENITOR, personBRef es el HIJO/A.
- type "PARTNER": personARef y personBRef son pareja.
- Usa tempId únicos (p1, p2, ...) para cada persona nueva.
- Si no sabes un dato, usa null. No inventes fechas ni lugares.
- No incluyas texto fuera del JSON.`;

export interface IntakeResult {
  ok: true;
  graph: ProposedGraph;
}

export interface IntakeError {
  ok: false;
  error: string;
}

/**
 * Procesa una descripción en lenguaje natural y devuelve un grafo propuesto
 * para que el usuario lo confirme. No persiste nada.
 */
export async function proposeGraphFromText(
  description: string
): Promise<IntakeResult | IntakeError> {
  if (!description || description.trim().length < 3) {
    return { ok: false, error: "Describe a tu familia con un poco más de detalle." };
  }

  let raw: string;
  try {
    raw = await callLlm({
      systemPrompt: SYSTEM_PROMPT,
      userMessage: description.trim(),
      temperature: 0.1,
      maxTokens: 2048,
    });
  } catch (err) {
    return {
      ok: false,
      error:
        "El asistente de IA no está disponible por ahora. Puedes agregar a las personas manualmente.",
    };
  }

  try {
    const parsed = extractJson<ProposedGraph>(raw);
    // normalización defensiva
    const persons = Array.isArray(parsed.persons) ? parsed.persons : [];
    const relationships = Array.isArray(parsed.relationships)
      ? parsed.relationships
      : [];
    if (persons.length === 0) {
      return { ok: false, error: "No se identificaron personas en la descripción." };
    }
    return {
      ok: true,
      graph: {
        persons,
        relationships,
        summary: parsed.summary ?? "",
      },
    };
  } catch {
    return {
      ok: false,
      error: "No se pudo interpretar la respuesta del asistente. Intenta reformular.",
    };
  }
}
