"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/format";

export default function CarritoPage() {
  const { items, updateQuantity, removeItem, clear, totalPrice } = useCart();
  const router = useRouter();

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("delivery");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError("Tu carrito está vacío");
      return;
    }
    if (deliveryType === "delivery" && !address.trim()) {
      setError("Ingresa la dirección de entrega");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName,
        phone,
        deliveryType,
        address: deliveryType === "delivery" ? address : undefined,
        notes: notes || undefined,
        items: items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Ocurrió un error, intenta de nuevo");
      return;
    }

    const order = await res.json();
    clear();
    router.push(`/pedido/${order.id}`);
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-5xl">🛒</p>
        <h1 className="mt-4 text-xl font-bold text-zinc-900">Tu carrito está vacío</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Agrega algo rico del menú para armar tu pedido.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-red-600/20 transition hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-lg"
        >
          Ver el menú
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-zinc-900">Tu pedido</h1>

      <div className="mt-6 divide-y divide-zinc-100 rounded-2xl border border-zinc-100 bg-white shadow-sm">
        {items.map((item) => (
          <div key={item.menuItemId} className="flex items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-zinc-900">{item.name}</p>
              <p className="text-xs text-zinc-500">{formatPrice(item.price)} c/u</p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-zinc-200">
              <button
                type="button"
                onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-600 transition hover:bg-zinc-50"
                aria-label="Quitar uno"
              >
                −
              </button>
              <span className="w-5 text-center text-sm font-semibold">{item.quantity}</span>
              <button
                type="button"
                onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-600 transition hover:bg-zinc-50"
                aria-label="Agregar uno"
              >
                +
              </button>
            </div>
            <p className="w-20 shrink-0 text-right text-sm font-bold text-zinc-900">
              {formatPrice(item.price * item.quantity)}
            </p>
            <button
              type="button"
              onClick={() => removeItem(item.menuItemId)}
              className="shrink-0 rounded-full p-1.5 text-zinc-400 transition hover:bg-red-50 hover:text-red-600"
              aria-label={`Quitar ${item.name}`}
            >
              ✕
            </button>
          </div>
        ))}
        <div className="flex items-center justify-between p-4">
          <span className="text-sm font-medium text-zinc-600">Total</span>
          <span className="text-xl font-extrabold text-red-600">{formatPrice(totalPrice)}</span>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-5 rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm sm:p-8"
      >
        <h2 className="text-lg font-bold text-zinc-900">Datos de entrega</h2>

        <div>
          <label className="block text-sm font-medium text-zinc-700">Nombre</label>
          <input
            type="text"
            required
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700">
            Teléfono (WhatsApp)
          </label>
          <input
            type="tel"
            required
            placeholder="Ej: 987654321"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700">Entrega</label>
          <div className="mt-1 flex gap-2">
            <button
              type="button"
              onClick={() => setDeliveryType("delivery")}
              className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                deliveryType === "delivery"
                  ? "border-red-500 bg-red-50 text-red-700"
                  : "border-zinc-300 text-zinc-600 hover:border-red-300"
              }`}
            >
              🛵 Delivery
            </button>
            <button
              type="button"
              onClick={() => setDeliveryType("pickup")}
              className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                deliveryType === "pickup"
                  ? "border-red-500 bg-red-50 text-red-700"
                  : "border-zinc-300 text-zinc-600 hover:border-red-300"
              }`}
            >
              🏠 Recojo en tienda
            </button>
          </div>
        </div>

        {deliveryType === "delivery" && (
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Dirección de entrega
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Calle, número, referencia"
              className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-100"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-zinc-700">
            Notas (opcional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej: sin cebolla, tocar timbre, etc."
            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm focus:border-red-500 focus:outline-none focus:ring-4 focus:ring-red-100"
          />
        </div>

        <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800">
          💵 El pago es contra entrega/recojo (efectivo, Yape o Plin). No se cobra nada
          en este sitio.
        </p>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-red-600/20 transition hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-lg disabled:pointer-events-none disabled:opacity-60"
        >
          {loading ? "Enviando..." : `Confirmar pedido — ${formatPrice(totalPrice)}`}
        </button>
      </form>
    </div>
  );
}
