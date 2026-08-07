import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/session";
import { saveUploadedImage, deleteUploadedImage } from "@/lib/uploads";
import { isValidCategory } from "@/lib/categories";

const updateSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres"),
  description: z.string().trim().min(1, "Agrega una descripción"),
  price: z.coerce.number().positive("El precio debe ser mayor a 0"),
  category: z.string().trim().min(1, "Selecciona una categoría"),
  available: z.coerce.boolean().optional(),
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
  const existing = await prisma.menuItem.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  const contentType = request.headers.get("content-type") ?? "";

  // Toggle rápido de disponibilidad (JSON, sin tocar el resto de campos).
  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => null);
    const parsed = z.object({ available: z.boolean() }).safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    const updated = await prisma.menuItem.update({
      where: { id },
      data: { available: parsed.data.available },
    });
    return NextResponse.json(updated);
  }

  const formData = await request.formData();

  const parsed = updateSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    category: formData.get("category"),
    available: formData.get("available") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  if (!(await isValidCategory(parsed.data.category))) {
    return NextResponse.json({ error: "Selecciona una categoría válida" }, { status: 400 });
  }

  let imageUrl = existing.imageUrl;
  const imageFile = formData.get("image");
  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      imageUrl = await saveUploadedImage(imageFile);
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "No se pudo subir la imagen" },
        { status: 400 }
      );
    }
    if (existing.imageUrl) {
      await deleteUploadedImage(existing.imageUrl);
    }
  }

  const menuItem = await prisma.menuItem.update({
    where: { id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      price: parsed.data.price,
      category: parsed.data.category,
      available: parsed.data.available ?? existing.available,
      imageUrl,
    },
  });

  return NextResponse.json(menuItem);
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
  const existing = await prisma.menuItem.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  await prisma.menuItem.delete({ where: { id } });

  if (existing.imageUrl) {
    await deleteUploadedImage(existing.imageUrl);
  }

  return NextResponse.json({ ok: true });
}
