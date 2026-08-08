"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/format";

type MenuItemCardProps = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string | null;
  available: boolean;
};

export default function MenuItemCard({
  id,
  name,
  description,
  price,
  imageUrl,
  available,
}: MenuItemCardProps) {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  function handleAdd() {
    addItem({ menuItemId: id, name, price });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  }

  return (
    <div className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className={`object-cover transition duration-300 group-hover:scale-105 ${
              !available ? "grayscale" : ""
            }`}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">🍔</div>
        )}
        {!available && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50">
            <span className="rounded-full bg-zinc-900/90 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
              Agotado
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-sm font-bold text-zinc-900">{name}</h3>
        <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{description}</p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-lg font-bold text-brand-orange">{formatPrice(price)}</span>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!available}
            className={`rounded-full px-4 py-2 text-sm font-bold text-white shadow-sm transition disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:shadow-none ${
              justAdded
                ? "bg-green-600"
                : "bg-brand-orange hover:-translate-y-0.5 hover:bg-brand-orange-hover hover:shadow-md"
            }`}
          >
            {justAdded ? "✓ Agregado" : "Agregar"}
          </button>
        </div>
      </div>
    </div>
  );
}
