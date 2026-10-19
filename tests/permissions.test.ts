import { describe, it, expect } from "vitest";
import { accessForRole } from "@/lib/permissions";

describe("accessForRole (DEC-011)", () => {
  it("OWNER puede ver, editar y es dueño", () => {
    const a = accessForRole("OWNER");
    expect(a.canView).toBe(true);
    expect(a.canEdit).toBe(true);
    expect(a.isOwner).toBe(true);
  });

  it("COLLABORATOR puede ver y editar, pero no es dueño", () => {
    const a = accessForRole("COLLABORATOR");
    expect(a.canView).toBe(true);
    expect(a.canEdit).toBe(true);
    expect(a.isOwner).toBe(false);
  });

  it("VIEWER solo puede ver", () => {
    const a = accessForRole("VIEWER");
    expect(a.canView).toBe(true);
    expect(a.canEdit).toBe(false);
    expect(a.isOwner).toBe(false);
  });
});
