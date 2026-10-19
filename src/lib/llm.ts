// Cliente del proxy LLM centralizado de LOGAN OS.
// DEC-003: LoganAG NO usa llaves de IA propias. Toda la IA pasa por POST /api/llm
// de LOGAN OS, que cascada entre proveedores (Z.ai / GLM primario, Gemini fallback).
//
// Contrato real del proxy (verificado en appsmx/logan-app · src/app/api/llm/route.ts):
//   Request:  { task, systemPrompt, userMessage, history?, temperature?, maxTokens?,
//               project?, tenant?, client?, channel? }
//   Auth:     Authorization: Bearer <LOGAN_LLM_SECRET>
//   Response: { text, provider, model, usage? }
//
// Variables de entorno requeridas:
//   LOGAN_LLM_URL     — endpoint del proxy (https://www.loganos.com/api/llm)
//   LOGAN_LLM_SECRET  — Bearer que LoganAG envía a LOGAN OS para consumir el proxy

export interface LlmHistoryMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface LlmRequest {
  systemPrompt: string;
  userMessage: string;
  history?: LlmHistoryMessage[];
  temperature?: number;
  maxTokens?: number;
}

export class LlmError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = "LlmError";
  }
}

// Identificación del producto para el control de gasto del proxy (DEC-003).
const PROJECT_SLUG = "loganag";

/**
 * Invoca el proxy LLM de LOGAN OS y devuelve el texto de la respuesta del modelo.
 */
export async function callLlm(req: LlmRequest): Promise<string> {
  const url = process.env.LOGAN_LLM_URL;
  const secret = process.env.LOGAN_LLM_SECRET;

  if (!url || !secret) {
    throw new LlmError(
      "LOGAN_LLM_URL o LOGAN_LLM_SECRET no están configurados. Ver DEC-003."
    );
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({
        task: "assistant",
        systemPrompt: req.systemPrompt,
        userMessage: req.userMessage,
        history: req.history ?? [],
        temperature: req.temperature ?? 0.2,
        maxTokens: req.maxTokens ?? 2048,
        project: PROJECT_SLUG,
        channel: "web",
      }),
    });
  } catch (err) {
    throw new LlmError(
      `No se pudo contactar al proxy LLM de LOGAN OS: ${(err as Error).message}`
    );
  }

  if (!res.ok) {
    throw new LlmError(
      `El proxy LLM respondió con error ${res.status}.`,
      res.status
    );
  }

  const data = (await res.json()) as { text?: string };
  if (!data.text) {
    throw new LlmError("El proxy LLM no devolvió contenido utilizable.");
  }
  return data.text;
}

/** Extrae el primer bloque JSON de un texto (robusto ante prosa alrededor). */
export function extractJson<T>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const startArr = candidate.indexOf("[");
  const from =
    start === -1 ? startArr : startArr === -1 ? start : Math.min(start, startArr);
  if (from === -1) throw new LlmError("No se encontró JSON en la respuesta.");
  const slice = candidate.slice(from).trim();
  return JSON.parse(slice) as T;
}
