import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/session";
import { prisma } from "@/lib/db";
import AdminNavTabs from "@/components/admin/AdminNavTabs";
import LogoutButton from "@/components/admin/LogoutButton";

export const dynamic = "force-dynamic";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }
  if (admin.mustChangePassword) {
    redirect("/admin/cambiar-password");
  }

  const pendingOrders = await prisma.order.count({ where: { status: "pendiente" } });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-900">Panel Bart&apos;s</h1>
        <div className="flex items-center gap-3 text-sm text-zinc-500">
          <span>Hola, {admin.name}</span>
          <Link href="/admin/cambiar-password" className="hover:text-zinc-700 hover:underline">
            Cambiar contraseña
          </Link>
          <LogoutButton />
        </div>
      </div>
      <div className="mt-4">
        <AdminNavTabs pendingOrders={pendingOrders} />
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}
