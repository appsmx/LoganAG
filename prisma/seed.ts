// Seed de datos de prueba para LoganAG.
// Crea un usuario de ejemplo con un árbol poblado (personas, vínculos, anécdotas
// y mascotas) para poder probar la app apenas se conecta la BD.
//
// Uso: npm run db:seed   (requiere DATABASE_URL configurado)

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "familia.ejemplo@loganag.local";

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: "Familia Ejemplo" },
  });

  // árbol limpio para el seed
  let tree = await prisma.tree.findFirst({ where: { ownerId: user.id } });
  if (!tree) {
    tree = await prisma.tree.create({
      data: {
        name: "Familia Pérez López",
        ownerId: user.id,
        visibility: "PRIVATE",
      },
    });
    await prisma.membership.create({
      data: { treeId: tree.id, userId: user.id, role: "OWNER" },
    });
  }

  // evitar duplicar si ya se corrió
  const existing = await prisma.person.count({ where: { treeId: tree.id } });
  if (existing > 0) {
    console.info("El árbol de ejemplo ya tiene personas. No se duplica.");
    return;
  }

  const p = async (
    firstName: string,
    lastName: string,
    gender: "MALE" | "FEMALE",
    year: number,
    isLiving = true,
    birthPlace = "Culiacán, Sinaloa"
  ) =>
    prisma.person.create({
      data: {
        treeId: tree!.id,
        firstName,
        lastName,
        gender,
        birthDate: new Date(`${year}-01-01`),
        birthPlace,
        isLiving,
      },
    });

  // 3 generaciones
  const juan = await p("Juan", "Pérez", "MALE", 1940, false);
  const rosa = await p("Rosa", "López", "FEMALE", 1945, false);
  const maria = await p("María", "Pérez", "FEMALE", 1968);
  const jose = await p("José", "Pérez", "MALE", 1970);
  const pedro = await p("Pedro", "Pérez", "MALE", 1973);
  const ana = await p("Ana", "García", "FEMALE", 1972); // pareja de José
  const sofia = await p("Sofía", "Pérez", "FEMALE", 1998); // hija de José y Ana

  const parent = (aId: string, bId: string) =>
    prisma.relationship.create({
      data: {
        treeId: tree!.id,
        type: "PARENT_CHILD",
        personAId: aId,
        personBId: bId,
      },
    });
  const partner = (aId: string, bId: string) =>
    prisma.relationship.create({
      data: {
        treeId: tree!.id,
        type: "PARTNER",
        personAId: aId,
        personBId: bId,
      },
    });

  await partner(juan.id, rosa.id);
  await parent(juan.id, maria.id);
  await parent(rosa.id, maria.id);
  await parent(juan.id, jose.id);
  await parent(rosa.id, jose.id);
  await parent(juan.id, pedro.id);
  await parent(rosa.id, pedro.id);
  await partner(jose.id, ana.id);
  await parent(jose.id, sofia.id);
  await parent(ana.id, sofia.id);

  // anécdotas
  await prisma.anecdote.create({
    data: {
      personId: juan.id,
      title: "Fundó la tienda familiar",
      type: "MILESTONE",
      body: "Abuelo Juan abrió la primera tienda de la familia en 1965, que sostuvo a tres generaciones.",
    },
  });
  await prisma.anecdote.create({
    data: {
      personId: rosa.id,
      title: "Sus tamales de Navidad",
      type: "STORY",
      body: "Cada diciembre reunía a toda la familia para hacer tamales. Nadie se los perdía.",
    },
  });

  // mascotas (DEC-009)
  const firulais = await prisma.pet.create({
    data: {
      treeId: tree.id,
      name: "Firulais",
      species: "Perro",
      breed: "Mestizo",
      notes:
        "El perro de la casa de los abuelos, querido por todos los nietos.",
      owners: { create: [{ personId: juan.id }, { personId: rosa.id }] },
    },
  });

  console.info("Seed completado:");
  console.info(`  Árbol: ${tree.name} (${tree.id})`);
  console.info(`  Usuario: ${email}`);
  console.info("  7 personas, 10 vínculos, 2 anécdotas, 1 mascota.");
  console.info(`  Mascota: ${firulais.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
