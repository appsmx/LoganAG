import Link from "next/link";

export const metadata = {
  title: "Aviso de privacidad — LoganAG",
};

export default function PrivacidadPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-bark-800">
      <Link href="/" className="text-sm text-leaf-600 hover:underline">
        ← Volver al inicio
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-bark-900">
        Aviso de privacidad
      </h1>
      <p className="mt-2 text-sm text-bark-600">
        Última actualización: 19 de octubre de 2026
      </p>

      <div className="prose mt-8 space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-bark-900">
            1. Responsable
          </h2>
          <p>
            LoganAG (appsmx) es responsable del tratamiento de los datos
            personales que se registran en la plataforma, conforme a la Ley
            Federal de Protección de Datos Personales en Posesión de los
            Particulares (LFPDPPP) de México.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-bark-900">
            2. Datos que tratamos
          </h2>
          <p>
            Para construir tu árbol genealógico tratamos datos de las personas
            que tú registras: nombre, fechas y lugares de nacimiento o
            defunción, parentescos, fotografías, anécdotas y datos de mascotas.
            Algunos de estos datos pueden corresponder a{" "}
            <strong>personas vivas</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-bark-900">
            3. Consentimiento de personas vivas
          </h2>
          <p>
            Cuando registres datos de una persona viva, eres responsable de
            contar con su consentimiento. LoganAG te permite dejar constancia de
            esa base legal. Tu árbol es <strong>privado por defecto</strong>:
            solo tú y las personas que invites pueden verlo.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-bark-900">
            4. Finalidades
          </h2>
          <p>
            Usamos los datos únicamente para prestar el servicio: crear,
            visualizar y compartir tu árbol genealógico con quienes invites, y
            para las funciones asistidas por inteligencia artificial que tú
            solicites.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-bark-900">
            5. Inteligencia artificial y encargados
          </h2>
          <p>
            Algunas funciones (como el alta de personas por lenguaje natural) se
            procesan con modelos de inteligencia artificial a través de la
            infraestructura de <strong>LOGAN OS</strong>. Como subencargados del
            tratamiento participan <strong>Z.ai</strong> y{" "}
            <strong>Google (Gemini)</strong>, exclusivamente para generar la
            respuesta solicitada. No usamos tus datos para entrenar modelos.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-bark-900">
            6. Derechos ARCO
          </h2>
          <p>
            Puedes acceder, rectificar, cancelar u oponerte al tratamiento de
            tus datos. Para ejercer estos derechos, contáctanos a través de los
            canales de soporte de LoganAG.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-bark-900">
            7. Cambios al aviso
          </h2>
          <p>
            Este aviso puede actualizarse. Publicaremos cualquier cambio en esta
            misma página con su fecha de actualización.
          </p>
        </section>
      </div>
    </main>
  );
}
