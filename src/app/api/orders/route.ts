import { NextRequest, NextResponse, after } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { buildBusinessOrderMessage } from "@/lib/whatsapp";
import { sendWhatsAppNotification } from "@/lib/whatsapp-api";

const orderSchema = z.object({
  customerName: z.string().trim().min(2, "Ingresa tu nombre"),
  phone: z.string().trim().min(6, "Ingresa un teléfono válido"),
  deliveryType: z.enum(["delivery", "pickup"]),
  address: z.string().trim().optional(),
  notes: z.string().trim().max(300).optional(),
  items: z
    .array(
      z.object({
        menuItemId: z.string().min(1),
        quantity: z.coerce.number().int().positive().max(50),
      })
    )
    .min(1, "Tu carrito está vacío"),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = orderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { customerName, phone, deliveryType, address, notes, items } = parsed.data;

  if (deliveryType === "delivery" && !address?.trim()) {
    return NextResponse.json(
      { error: "Ingresa la dirección de entrega" },
      { status: 400 }
    );
  }

  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: items.map((i) => i.menuItemId) } },
  });

  const orderItemsData: {
    menuItemId: string;
    name: string;
    unitPrice: number;
    quantity: number;
  }[] = [];
  let total = 0;

  for (const cartItem of items) {
    const menuItem = menuItems.find((m) => m.id === cartItem.menuItemId);
    if (!menuItem) {
      return NextResponse.json(
        { error: "Uno de los productos de tu carrito ya no existe" },
        { status: 400 }
      );
    }
    if (!menuItem.available) {
      return NextResponse.json(
        { error: `"${menuItem.name}" ya no está disponible` },
        { status: 400 }
      );
    }
    total += menuItem.price * cartItem.quantity;
    orderItemsData.push({
      menuItemId: menuItem.id,
      name: menuItem.name,
      unitPrice: menuItem.price,
      quantity: cartItem.quantity,
    });
  }

  const order = await prisma.order.create({
    data: {
      customerName,
      phone,
      deliveryType,
      address: deliveryType === "delivery" ? address : null,
      notes: notes || null,
      total,
      items: { create: orderItemsData },
    },
    include: { items: true },
  });

  after(() => sendWhatsAppNotification(buildBusinessOrderMessage(order)));

  return NextResponse.json(order, { status: 201 });
}
