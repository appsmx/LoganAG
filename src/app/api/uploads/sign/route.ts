import { NextResponse } from "next/server";
import { signUpload, isCloudinaryConfigured } from "@/lib/cloudinary";
import { resolveContext, isResponse } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

/**
 * POST /api/uploads/sign — devuelve una firma para subir una imagen a Cloudinary
 * directamente desde el navegador. Requiere sesión y rol editor.
 */
export async function POST() {
  const ctx = await resolveContext();
  if (isResponse(ctx)) return ctx;
  if (!ctx.access.canEdit) {
    return NextResponse.json({ error: "Solo lectura." }, { status: 403 });
  }

  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      { error: "La carga de imágenes no está configurada." },
      { status: 503 }
    );
  }

  const sig = signUpload(`loganag/${ctx.treeId}`);
  if (!sig) {
    return NextResponse.json({ error: "No se pudo firmar." }, { status: 500 });
  }
  return NextResponse.json(sig);
}
