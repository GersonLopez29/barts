import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/session";
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";

export const dynamic = "force-dynamic";

export default async function CambiarPasswordPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <div className="relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-brand-orange-light via-white to-brand-cream"
      />
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-md flex-col items-center justify-center px-4 py-12">
        <div className="flex items-center gap-2 text-2xl font-extrabold">
          <span aria-hidden="true" className="text-3xl">
            🍔
          </span>
          <span>
            Bart&apos;s<span className="text-brand-orange">.</span>
          </span>
        </div>

        <div className="mt-6 w-full rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-xl font-bold text-zinc-900">
            {admin.mustChangePassword ? "Cambia tu contraseña" : "Cambiar contraseña"}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {admin.mustChangePassword
              ? "Por seguridad, antes de continuar elige una contraseña nueva."
              : "Elige una nueva contraseña para tu cuenta."}
          </p>

          <ChangePasswordForm mustChangePassword={admin.mustChangePassword} />
        </div>
      </div>
    </div>
  );
}
