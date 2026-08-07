import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DEFAULT_CATEGORIES = [
  { name: "Hamburguesas", icon: "🍔", order: 0 },
  { name: "Alitas BBQ", icon: "🍗", order: 1 },
  { name: "Salchipapas", icon: "🍟", order: 2 },
  { name: "Bebidas", icon: "🥤", order: 3 },
];

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME ?? "Admin";

  if (!email || !password) {
    throw new Error("Faltan SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD en el entorno.");
  }

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    console.log(`Ya existe un admin con el correo ${email}, no se crea de nuevo.`);
  } else {
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.admin.create({ data: { email, passwordHash, name } });
    console.log(`Admin creado: ${email}`);
  }

  for (const category of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }
  console.log(`Categorías por defecto listas: ${DEFAULT_CATEGORIES.map((c) => c.name).join(", ")}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
