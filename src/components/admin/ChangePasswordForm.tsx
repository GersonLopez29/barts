"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function ChangePasswordForm({
  mustChangePassword,
}: {
  mustChangePassword: boolean;
}) {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword, confirmPassword }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo cambiar la contraseña");
      return;
    }

    router.push("/admin/pedidos");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-700">Nueva contraseña</label>
        <input
          type="password"
          required
          minLength={8}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none focus:ring-4 focus:ring-brand-orange-soft"
        />
        <p className="mt-1 text-xs text-zinc-400">Mínimo 8 caracteres.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700">Confirma la contraseña</label>
        <input
          type="password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm focus:border-brand-orange focus:outline-none focus:ring-4 focus:ring-brand-orange-soft"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-orange/20 transition hover:-translate-y-0.5 hover:bg-brand-orange-hover hover:shadow-lg disabled:pointer-events-none disabled:opacity-60"
      >
        {loading ? "Guardando..." : "Guardar nueva contraseña"}
      </button>

      {!mustChangePassword && (
        <button
          type="button"
          onClick={() => router.push("/admin/pedidos")}
          className="w-full text-center text-xs font-medium text-zinc-500 hover:text-zinc-700"
        >
          Cancelar
        </button>
      )}
    </form>
  );
}
