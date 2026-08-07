"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/format";

export default function Navbar() {
  const { totalCount, totalPrice } = useCart();

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5">
        <Link href="/" className="flex items-center gap-2 text-2xl font-extrabold">
          <span aria-hidden="true" className="text-3xl">
            🍔
          </span>
          <span>
            Bart&apos;s<span className="text-red-600">.</span>
          </span>
        </Link>

        <Link
          href="/carrito"
          className="relative flex items-center gap-2 rounded-full bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-md"
        >
          <span aria-hidden="true">🛒</span>
          <span className="hidden sm:inline">
            {totalCount > 0 ? formatPrice(totalPrice) : "Tu pedido"}
          </span>
          {totalCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-xs font-extrabold text-red-900">
              {totalCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
