import { prisma } from "@/lib/db";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export async function isRateLimited(identifier: string): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_MS);

  // Limpieza perezosa: borra intentos vencidos de este identificador para
  // que la tabla no crezca sin límite ante un ataque sostenido.
  await prisma.loginAttempt.deleteMany({
    where: { identifier, createdAt: { lt: since } },
  });

  const count = await prisma.loginAttempt.count({
    where: { identifier, createdAt: { gte: since } },
  });

  return count >= MAX_ATTEMPTS;
}

export async function recordFailedAttempt(identifier: string) {
  await prisma.loginAttempt.create({ data: { identifier } });
}

export async function clearAttempts(identifier: string) {
  await prisma.loginAttempt.deleteMany({ where: { identifier } });
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
