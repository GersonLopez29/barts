"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { formatPrice } from "@/lib/format";
import MenuItemForm from "@/components/admin/MenuItemForm";

type MenuItemRow = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string | null;
  available: boolean;
};

type CategoryOption = { name: string; icon: string };

export default function MenuItemsList({
  items,
  categories,
}: {
  items: MenuItemRow[];
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function toggleAvailable(item: MenuItemRow) {
    setLoadingId(item.id);
    await fetch(`/api/admin/menu-items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: !item.available }),
    });
    setLoadingId(null);
    router.refresh();
  }

  async function handleDelete(item: MenuItemRow) {
    if (!confirm(`¿Eliminar "${item.name}" del menú?`)) return;
    setLoadingId(item.id);
    const res = await fetch(`/api/admin/menu-items/${item.id}`, { method: "DELETE" });
    setLoadingId(null);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "No se pudo eliminar el producto");
    }
  }

  if (items.length === 0) {
    return <p className="mt-4 text-sm text-zinc-500">Todavía no agregaste productos.</p>;
  }

  return (
    <div className="mt-4 divide-y divide-zinc-100 rounded-2xl border border-zinc-100 bg-white shadow-sm">
      {items.map((item) => (
        <div key={item.id} className="p-4">
          {editingId === item.id ? (
            <div>
              <MenuItemForm
                mode="edit"
                itemId={item.id}
                categories={categories}
                initialName={item.name}
                initialDescription={item.description}
                initialPrice={item.price}
                initialCategory={item.category}
                initialImageUrl={item.imageUrl}
                onDone={() => setEditingId(null)}
              />
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="mt-2 text-xs font-medium text-zinc-500 hover:text-zinc-700"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xl">🍔</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-zinc-900">{item.name}</p>
                  {!item.available && (
                    <span className="shrink-0 rounded bg-zinc-800 px-1.5 py-0.5 text-xs font-medium text-white">
                      Agotado
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400">
                  {item.category} · {formatPrice(item.price)}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={loadingId === item.id}
                  onClick={() => toggleAvailable(item)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition disabled:opacity-60 ${
                    item.available
                      ? "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                      : "border-green-200 text-green-700 hover:bg-green-50"
                  }`}
                >
                  {item.available ? "Marcar agotado" : "Marcar disponible"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(item.id)}
                  className="rounded-full border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-50"
                >
                  Editar
                </button>
                <button
                  type="button"
                  disabled={loadingId === item.id}
                  onClick={() => handleDelete(item)}
                  className="rounded-full border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:opacity-60"
                >
                  Eliminar
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
