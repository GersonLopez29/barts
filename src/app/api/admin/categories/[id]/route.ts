import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/session";

const updateSchema = z.object({
  name: z.string().trim().min(1, "Ponle un nombre a la categoría").max(40),
  icon: z.string().trim().max(8).optional(),
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
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
  }

  if (parsed.data.name !== existing.name) {
    const nameTaken = await prisma.category.findUnique({ where: { name: parsed.data.name } });
    if (nameTaken) {
      return NextResponse.json({ error: "Ya existe una categoría con ese nombre" }, { status: 400 });
    }
  }

  const category = await prisma.category.update({
    where: { id },
    data: { name: parsed.data.name, icon: parsed.data.icon || existing.icon },
  });

  if (parsed.data.name !== existing.name) {
    await prisma.menuItem.updateMany({
      where: { category: existing.name },
      data: { category: parsed.data.name },
    });
  }

  return NextResponse.json(category);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
  }

  const inUse = await prisma.menuItem.count({ where: { category: existing.name } });
  if (inUse > 0) {
    return NextResponse.json(
      { error: `Hay ${inUse} producto(s) en esta categoría. Muévelos antes de eliminarla.` },
      { status: 400 }
    );
  }

  await prisma.category.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
