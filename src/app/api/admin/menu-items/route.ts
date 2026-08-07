import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/session";
import { saveUploadedImage } from "@/lib/uploads";
import { isValidCategory } from "@/lib/categories";

const createSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres"),
  description: z.string().trim().min(1, "Agrega una descripción"),
  price: z.coerce.number().positive("El precio debe ser mayor a 0"),
  category: z.string().trim().min(1, "Selecciona una categoría"),
});

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
  }

  const formData = await request.formData();

  const parsed = createSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    category: formData.get("category"),
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

  const imageFile = formData.get("image");
  let imageUrl: string | null = null;
  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      imageUrl = await saveUploadedImage(imageFile);
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "No se pudo subir la imagen" },
        { status: 400 }
      );
    }
  }

  const menuItem = await prisma.menuItem.create({
    data: { ...parsed.data, imageUrl },
  });

  return NextResponse.json(menuItem, { status: 201 });
}
