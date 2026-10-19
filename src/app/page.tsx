import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <section className="text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-leaf-600">
          Metodología LOGAN · impulsado por IA
        </p>
        <h1 className="text-4xl font-bold text-bark-900 sm:text-5xl">
          Tu árbol genealógico, vivo 🌳
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-bark-700">
          Construye un árbol genealógico dinámico, interactivo y lleno de
          memoria. Vincula a tu familia sin esfuerzo, guarda sus anécdotas, e
          incluye a las mascotas que también son familia.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/arbol"
            className="rounded-lg bg-leaf-600 px-6 py-3 font-semibold text-white transition hover:bg-leaf-700"
          >
            Ver demo del árbol
          </Link>
          <Link
            href="/privacidad"
            className="rounded-lg border border-bark-200 px-6 py-3 font-semibold text-bark-700 transition hover:bg-bark-100"
          >
            Cómo cuidamos tus datos
          </Link>
        </div>
      </section>

      <section className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Feature
          title="No se satura"
          body="Aunque la familia crezca a cientos de personas, el árbol se mantiene limpio: enfoque, contexto y ramas que se expanden o colapsan."
        />
        <Feature
          title="Vincular es fácil"
          body="Conecta padres, parejas, hijos y hermanos — incluso a los parientes de tus parientes — de forma intuitiva."
        />
        <Feature
          title="Alta por lenguaje natural"
          body="Describe a tu familia en texto plano y la IA propone a las personas y sus vínculos para que tú confirmes."
        />
        <Feature
          title="Fichas con alma"
          body="Datos básicos más anécdotas, hitos y puntos clave que cuentan quién fue cada persona."
        />
        <Feature
          title="Mascotas incluidas"
          body="Porque también son familia: cada mascota tiene su ficha y su lugar en el árbol."
        />
        <Feature
          title="Privado por defecto"
          body="Tu árbol es privado. Invitas a tu familia cuando quieras, con consentimiento para los datos de personas vivas."
        />
      </section>

      <footer className="mt-24 border-t border-bark-200 pt-8 text-center text-sm text-bark-600">
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <Link href="/privacidad" className="hover:text-bark-900">
            Aviso de privacidad
          </Link>
          <Link href="/terminos" className="hover:text-bark-900">
            Términos y condiciones
          </Link>
        </nav>
        <p className="mt-4">
          🤖 Algunas funciones son atendidas por inteligencia artificial.
        </p>
        <p className="mt-2">LoganAG · appsmx · Metodología LOGAN</p>
      </footer>
    </main>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-bark-200 bg-white/60 p-6">
      <h3 className="text-lg font-semibold text-leaf-700">{title}</h3>
      <p className="mt-2 text-sm text-bark-700">{body}</p>
    </div>
  );
}
