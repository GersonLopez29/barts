import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/session";

const createSchema = z.object({
  name: z.string().trim().min(1, "Ponle un nombre a la categoría").max(40),
  icon: z.string().trim().max(8).optional(),
});

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const existing = await prisma.category.findUnique({ where: { name: parsed.data.name } });
  if (existing) {
    return NextResponse.json({ error: "Ya existe una categoría con ese nombre" }, { status: 400 });
  }

  const count = await prisma.category.count();

  const category = await prisma.category.create({
    data: {
      name: parsed.data.name,
      icon: parsed.data.icon || "🍔",
      order: count,
    },
  });

  return NextResponse.json(category, { status: 201 });
}
