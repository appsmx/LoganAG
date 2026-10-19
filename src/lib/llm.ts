// Cliente del proxy LLM centralizado de LOGAN OS.
// DEC-003: LoganAG NO usa llaves de IA propias. Toda la IA pasa por POST /api/llm
// de LOGAN OS, que cascada entre proveedores (Z.ai / GLM primario, Gemini fallback).
//
// Variables de entorno requeridas:
//   LOGAN_LLM_URL     — endpoint del proxy (p.ej. https://logancorp.vercel.app/api/llm)
//   LOGAN_LLM_SECRET  — Bearer que LoganAG envía a LOGAN OS para consumir el proxy

export interface LlmMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LlmOptions {
  temperature?: number;
  maxTokens?: number;
}

export class LlmError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = "LlmError";
  }
}

/**
 * Invoca el proxy LLM de LOGAN OS con una lista de mensajes.
 * Devuelve el texto de la respuesta del modelo.
 */
export async function callLlm(
  messages: LlmMessage[],
  options: LlmOptions = {}
): Promise<string> {
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
        messages,
        temperature: options.temperature ?? 0.2,
        max_tokens: options.maxTokens ?? 2048,
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

  const data = (await res.json()) as {
    content?: string;
    choices?: { message?: { content?: string } }[];
  };

  // Soporta tanto { content } como el formato OpenAI-like { choices[].message.content }.
  const content = data.content ?? data.choices?.[0]?.message?.content;
  if (!content) {
    throw new LlmError("El proxy LLM no devolvió contenido utilizable.");
  }
  return content;
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
