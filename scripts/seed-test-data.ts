import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const MENU_ITEMS = [
  {
    name: "Bart's Clásica",
    description: "Carne, queso cheddar, lechuga, tomate y nuestra salsa especial.",
    price: 18.5,
    category: "Hamburguesas",
    available: true,
  },
  {
    name: "Doble Bacon",
    description: "Doble carne, doble queso, tocino crocante y cebolla caramelizada.",
    price: 25.9,
    category: "Hamburguesas",
    available: true,
  },
  {
    name: "Veggie Deluxe",
    description: "Hamburguesa de vegetales, palta, lechuga y mayonesa de la casa.",
    price: 17.9,
    category: "Hamburguesas",
    available: false,
  },
  {
    name: "Alitas BBQ x8",
    description: "8 alitas bañadas en salsa BBQ ahumada, con palitos de apio.",
    price: 22.0,
    category: "Alitas BBQ",
    available: true,
  },
  {
    name: "Alitas Picantes x8",
    description: "8 alitas con salsa picante buffalo y aderezo ranch.",
    price: 22.0,
    category: "Alitas BBQ",
    available: true,
  },
  {
    name: "Salchipapa Clásica",
    description: "Papas fritas, salchicha, huevo frito y salsas a elección.",
    price: 14.5,
    category: "Salchipapas",
    available: true,
  },
  {
    name: "Salchipapa Especial",
    description: "Papas fritas, salchicha, tocino, queso fundido y huevo frito.",
    price: 19.5,
    category: "Salchipapas",
    available: true,
  },
  {
    name: "Chicha Morada 500ml",
    description: "Refrescante chicha morada preparada en casa.",
    price: 6.0,
    category: "Bebidas",
    available: true,
  },
  {
    name: "Gaseosa 500ml",
    description: "Coca-Cola, Inca Kola o Sprite.",
    price: 5.0,
    category: "Bebidas",
    available: true,
  },
];

async function main() {
  const createdItems: Record<string, { id: string; name: string; price: number }> = {};

  for (const item of MENU_ITEMS) {
    const existing = await prisma.menuItem.findFirst({ where: { name: item.name } });
    const record = existing
      ? await prisma.menuItem.update({ where: { id: existing.id }, data: item })
      : await prisma.menuItem.create({ data: item });
    createdItems[item.name] = { id: record.id, name: record.name, price: record.price };
  }
  console.log(`Productos listos: ${Object.keys(createdItems).length}`);

  const ordersCount = await prisma.order.count();
  if (ordersCount > 0) {
    console.log(`Ya hay ${ordersCount} pedidos, no se crean pedidos de prueba nuevos.`);
  } else {
    const clasica = createdItems["Bart's Clásica"];
    const bacon = createdItems["Doble Bacon"];
    const alitasBbq = createdItems["Alitas BBQ x8"];
    const salchiClasica = createdItems["Salchipapa Clásica"];
    const salchiEspecial = createdItems["Salchipapa Especial"];
    const chicha = createdItems["Chicha Morada 500ml"];
    const gaseosa = createdItems["Gaseosa 500ml"];

    const testOrders = [
      {
        customerName: "Rosa Vargas",
        phone: "987654321",
        deliveryType: "delivery",
        address: "Jr. Los Álamos 245, San Isidro",
        notes: "Sin cebolla en la hamburguesa",
        status: "pendiente",
        items: [
          { item: clasica, quantity: 2 },
          { item: gaseosa, quantity: 2 },
        ],
      },
      {
        customerName: "Miguel Torres",
        phone: "912345678",
        deliveryType: "pickup",
        address: null,
        notes: null,
        status: "preparando",
        items: [
          { item: bacon, quantity: 1 },
          { item: salchiEspecial, quantity: 1 },
          { item: chicha, quantity: 1 },
        ],
      },
      {
        customerName: "Lucía Fernández",
        phone: "998877665",
        deliveryType: "delivery",
        address: "Av. Pardo 890, dpto 402",
        notes: "Tocar timbre, no hay ascensor",
        status: "listo",
        items: [{ item: alitasBbq, quantity: 1 }],
      },
      {
        customerName: "Carlos Mendoza",
        phone: "976543210",
        deliveryType: "pickup",
        address: null,
        notes: null,
        status: "entregado",
        items: [
          { item: salchiClasica, quantity: 2 },
          { item: gaseosa, quantity: 1 },
        ],
      },
      {
        customerName: "Andrea Quispe",
        phone: "965432198",
        deliveryType: "delivery",
        address: "Calle Las Begonias 120",
        notes: null,
        status: "cancelado",
        items: [{ item: clasica, quantity: 1 }],
      },
    ];

    for (const order of testOrders) {
      const total = order.items.reduce((sum, i) => sum + i.item.price * i.quantity, 0);
      await prisma.order.create({
        data: {
          customerName: order.customerName,
          phone: order.phone,
          deliveryType: order.deliveryType,
          address: order.address ?? undefined,
          notes: order.notes ?? undefined,
          status: order.status,
          total,
          items: {
            create: order.items.map((i) => ({
              menuItemId: i.item.id,
              name: i.item.name,
              unitPrice: i.item.price,
              quantity: i.quantity,
            })),
          },
        },
      });
    }
    console.log(`Pedidos de prueba creados: ${testOrders.length}`);
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
