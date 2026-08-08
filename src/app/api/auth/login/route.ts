import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/session";
import { getClientIp, isRateLimited, recordFailedAttempt, clearAttempts } from "@/lib/rate-limit";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Correo inválido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

const RATE_LIMIT_MESSAGE = "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;
  const ipKey = `ip:${getClientIp(request)}`;
  const emailKey = `email:${email}`;

  if ((await isRateLimited(ipKey)) || (await isRateLimited(emailKey))) {
    return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 });
  }

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    await Promise.all([recordFailedAttempt(ipKey), recordFailedAttempt(emailKey)]);
    return NextResponse.json(
      { error: "Correo o contraseña incorrectos" },
      { status: 401 }
    );
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    await Promise.all([recordFailedAttempt(ipKey), recordFailedAttempt(emailKey)]);
    return NextResponse.json(
      { error: "Correo o contraseña incorrectos" },
      { status: 401 }
    );
  }

  await Promise.all([clearAttempts(ipKey), clearAttempts(emailKey)]);
  await createSession(admin.id);

  return NextResponse.json({
    id: admin.id,
    name: admin.name,
    email: admin.email,
    mustChangePassword: admin.mustChangePassword,
  });
}
