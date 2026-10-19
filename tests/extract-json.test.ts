import { describe, it, expect } from "vitest";
import { extractJson } from "@/lib/llm";

describe("extractJson", () => {
  it("extrae JSON plano", () => {
    const out = extractJson<{ a: number }>('{"a": 1}');
    expect(out.a).toBe(1);
  });

  it("extrae JSON dentro de bloque de código ```json", () => {
    const text = 'Aquí tienes:\n```json\n{"persons": [], "summary": "ok"}\n```';
    const out = extractJson<{ persons: unknown[]; summary: string }>(text);
    expect(out.summary).toBe("ok");
    expect(Array.isArray(out.persons)).toBe(true);
  });

  it("extrae JSON cuando hay prosa alrededor", () => {
    const text = 'Claro, el resultado es {"ok": true} y nada más.';
    const out = extractJson<{ ok: boolean }>(text);
    expect(out.ok).toBe(true);
  });

  it("extrae un arreglo JSON", () => {
    const out = extractJson<number[]>("resultado: [1,2,3]");
    expect(out).toEqual([1, 2, 3]);
  });

  it("lanza si no hay JSON", () => {
    expect(() => extractJson("sin json aquí")).toThrow();
  });
});
