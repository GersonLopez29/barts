import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/session";
import { isValidOrderStatus } from "@/lib/orders";

const updateSchema = z.object({
  status: z.string(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success || !isValidOrderStatus(parsed.data.status)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }

  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  const order = await prisma.order.update({
    where: { id },
    data: { status: parsed.data.status },
    include: { items: true },
  });

  return NextResponse.json(order);
}
