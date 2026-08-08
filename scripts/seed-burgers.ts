import "dotenv/config";
import { readFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { saveUploadedImage, deleteUploadedImage } from "../src/lib/uploads";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const BURGERS_DIR = path.join(process.cwd(), "burgerbars");

// Nombres, ingredientes (del arte de cada imagen) y precio ficticio de referencia.
// El precio solo se puede editar desde /admin/menu (sesión de administrador).
const BURGERS = [
  {
    file: "Clasica-B.png",
    name: "Clásica",
    description: "Hamburguesa a elección: carne, filete de pollo o pollo deshilachado.",
    price: 16.9,
  },
  {
    file: "Cheese-b.png",
    name: "Cheese Bacon",
    description: "Carne, tocino ahumado y queso dambo.",
    price: 19.9,
  },
  {
    file: "Parrillera-b.png",
    name: "Parrillera",
    description: "Carne y chorizo parrillero.",
    price: 20.9,
  },
  {
    file: "Royal_Barts.png",
    name: "Royal",
    description: "Carne, queso dambo y huevo frito.",
    price: 21.9,
  },
  {
    file: "Pobre_b.png",
    name: "A lo Pobre",
    description: "Carne, plátano frito y huevo frito.",
    price: 22.9,
  },
  {
    file: "fullcheese-b.png",
    name: "Full Cheese",
    description: "Carne, queso dambo, queso fresco y queso cheddar.",
    price: 22.9,
  },
  {
    file: "Americana-b.png",
    name: "Americana",
    description: "Carne, huevo frito, jamón, tocino ahumado y salsa BBQ ahumada.",
    price: 23.9,
  },
  {
    file: "Italiana-b.png",
    name: "Italiana",
    description: "Carne, queso dambo, jamón, salami, peperoni y cabanossi.",
    price: 26.9,
  },
  {
    file: "Barts-b.png",
    name: "La Barts",
    description: "Carne, queso dambo, jamón, chorizo parrillero, tocino ahumado y cabanossi.",
    price: 27.9,
  },
  {
    file: "Triple_b.png",
    name: "La Triple",
    description: "Triple proteína: carne, filete de pollo y chorizo parrillero.",
    price: 32.9,
  },
];

// Placeholders inventados en la tanda de datos de prueba anterior; se
// reemplazan ahora por el line-up real de hamburguesas de Bart's.
const PLACEHOLDER_NAMES = ["Bart's Clásica", "Doble Bacon", "Veggie Deluxe"];

async function main() {
  const placeholders = await prisma.menuItem.findMany({
    where: { name: { in: PLACEHOLDER_NAMES } },
  });
  for (const item of placeholders) {
    if (item.imageUrl) await deleteUploadedImage(item.imageUrl);
    await prisma.menuItem.delete({ where: { id: item.id } });
  }
  if (placeholders.length > 0) {
    console.log(`Placeholders eliminados: ${placeholders.map((p) => p.name).join(", ")}`);
  }

  for (const burger of BURGERS) {
    const filePath = path.join(BURGERS_DIR, burger.file);
    const original = await readFile(filePath);
    const resized = await sharp(original)
      .resize(1000, 1000, { fit: "cover" })
      .jpeg({ quality: 82 })
      .toBuffer();
    const filename = burger.file.replace(/\.png$/i, ".jpg");
    const file = new File([resized], filename, { type: "image/jpeg" });
    const imageUrl = await saveUploadedImage(file);

    const existing = await prisma.menuItem.findFirst({ where: { name: burger.name } });
    const data = {
      name: burger.name,
      description: burger.description,
      price: burger.price,
      category: "Hamburguesas",
      imageUrl,
      available: true,
    };
    if (existing) {
      if (existing.imageUrl) await deleteUploadedImage(existing.imageUrl);
      await prisma.menuItem.update({ where: { id: existing.id }, data });
    } else {
      await prisma.menuItem.create({ data });
    }
    console.log(`Lista: ${burger.name} — S/ ${burger.price.toFixed(2)}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
