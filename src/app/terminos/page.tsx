import Link from "next/link";

export const metadata = {
  title: "Términos y condiciones — LoganAG",
};

export default function TerminosPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-bark-800">
      <Link href="/" className="text-sm text-leaf-600 hover:underline">
        ← Volver al inicio
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-bark-900">
        Términos y condiciones
      </h1>
      <p className="mt-2 text-sm text-bark-600">
        Última actualización: 19 de octubre de 2026
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-bark-900">1. Aceptación</h2>
          <p>
            Al usar LoganAG aceptas estos términos. Si no estás de acuerdo, no
            utilices la plataforma.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-bark-900">
            2. Uso responsable de los datos
          </h2>
          <p>
            Eres responsable de los datos que registras sobre terceros,
            incluyendo contar con su consentimiento cuando corresponda. No debes
            registrar datos de personas sin una base legítima para hacerlo.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-bark-900">
            3. Contenido del usuario
          </h2>
          <p>
            Conservas la titularidad del contenido que subes (fotografías,
            anécdotas, datos). Nos concedes una licencia limitada para
            almacenarlo y mostrarlo únicamente dentro del servicio que
            solicitas.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-bark-900">
            4. Funciones de inteligencia artificial
          </h2>
          <p>
            Las sugerencias generadas por inteligencia artificial son
            orientativas y requieren tu confirmación antes de guardarse. No
            garantizamos su exactitud; tú validas la información antes de
            incorporarla a tu árbol.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-bark-900">
            5. Propiedad intelectual
          </h2>
          <p>
            LoganAG, su marca y su software son propiedad de appsmx. Si
            consideras que algún contenido infringe tus derechos de autor,
            contáctanos para atender tu reclamación.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-bark-900">
            6. Limitación de responsabilidad
          </h2>
          <p>
            El servicio se ofrece &ldquo;tal cual&rdquo;. En la medida permitida
            por la ley, no somos responsables por pérdidas derivadas del uso de
            la plataforma.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-bark-900">
            7. Ley aplicable
          </h2>
          <p>
            Estos términos se rigen por las leyes de los Estados Unidos
            Mexicanos. Cualquier controversia se resolverá conforme a dicha
            legislación.
          </p>
        </section>
      </div>
    </main>
  );
}
